require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { evaluateMessage, ENGINE_VERSION } = require("./engine");
const { handleTurn, resetSession } = require("./agent");
const { assessExtension } = require("./extension/assess");
const { RULES_VERSION } = require("./extension/rules");
const { MODEL_VERSION } = require("./extension/learned");
const { checkEscalation } = require("./guard");
const store = require("./store");
const llm = require("./llm");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "16kb" }));

function validMessage(message) {
  return typeof message === "string" && message.trim() && message.length <= 2000;
}

app.get("/", (req, res) => {
  res.json({ name: "MoralMate", message: "Ethical Student Support API" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MoralMate API",
    engines: { intake: ENGINE_VERSION, rules: RULES_VERSION, learned: MODEL_VERSION },
    llmEnabled: llm.isEnabled()
  });
});

// Stateless chat with optional history (Gemini integration by Jose).
// The rules classify first; only routine academic and administrative
// questions may get a Gemini reply. Everything else goes to people.
const ROUTINE = new Set(["academic", "administrative"]);

function validHistory(history) {
  return Array.isArray(history) && history.length <= 8 && history.every(item =>
    item && ["user", "assistant"].includes(item.role) && typeof item.text === "string" && item.text.length <= 2000
  );
}

app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!validMessage(message)) {
    return res.status(400).json({ success: false, error: "Please type a message (2000 characters max)." });
  }
  if (!validHistory(history)) {
    return res.status(400).json({ success: false, error: "Invalid conversation history." });
  }

  const result = evaluateMessage(message.trim());
  const { auditTerms, ...publicResult } = result;
  const logChat = (source) => store.audit({
    type: result.escalate ? "ESCALATION" : "TRIAGE",
    channel: "chat",
    category: result.category,
    zone: result.zone,
    matchedCategories: result.matchedCategories,
    messageFingerprint: store.fingerprint(message),
    engine: ENGINE_VERSION,
    source
  });

  if (result.escalate) {
    logChat("human_escalation");
    return res.json({ success: true, ...publicResult, source: "human_escalation" });
  }

  if (!ROUTINE.has(result.category)) {
    logChat("rules");
    return res.json({ success: true, ...publicResult, source: "rules" });
  }

  // Earlier turns are re-checked before anything is shared with Gemini.
  const historyFlagged = history.some(item => item.role === "user" && evaluateMessage(item.text).escalate);
  if (historyFlagged) {
    logChat("human_escalation");
    return res.json({
      success: true,
      ...publicResult,
      escalate: true,
      response: "Something earlier in this chat needs a real person, so I won't reply automatically. Please reach out to NUST Student Services through the official channels.",
      source: "human_escalation"
    });
  }

  const ai = await llm.replyWithLLM(message.trim(), history);
  logChat(ai ? "gemini" : "rules");
  if (!ai) return res.json({ success: true, ...publicResult, source: "rules" });
  res.json({ success: true, ...publicResult, response: ai.text, escalate: false, source: "gemini" });
});

// Conversational agent: one turn of a multi-turn conversation.
app.post("/api/agent", async (req, res) => {
  const { sessionId, message, language, studentRef } = req.body || {};
  if (!validMessage(message)) {
    return res.status(400).json({ error: "Please type a message (2000 characters max)." });
  }
  try {
    const out = await handleTurn({ sessionId, message: message.trim(), language, studentRef });
    res.json({ success: true, ...out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side. Please try again." });
  }
});

app.post("/api/agent/reset", (req, res) => {
  resetSession((req.body || {}).sessionId);
  res.json({ success: true });
});

// Structured extension pre-assessment (used by the request form).
app.post("/api/extension/assess", (req, res) => {
  const { description, reason, documentation, days, timing, studentRef, save } = req.body || {};
  if (!validMessage(description)) {
    return res.status(400).json({ error: "Please write a description (2000 characters max)." });
  }

  // The guard applies to the form too.
  const guard = checkEscalation(description);
  if (guard.escalate) {
    const triage = evaluateMessage(description);
    store.audit({ type: "ESCALATION", channel: "form", category: guard.category, zone: guard.zone, messageFingerprint: store.fingerprint(description) });
    return res.json({ success: true, escalate: true, category: triage.category, response: triage.response, explanation: triage.explanation, resources: triage.resources });
  }

  const result = assessExtension({ text: description, features: { reason, documentation, days, timing } });
  store.audit({
    type: "EXTENSION_ASSESSMENT",
    channel: "form",
    studentRef: studentRef || null,
    messageFingerprint: store.fingerprint(description),
    features: result.features,
    topDown: { outcome: result.topDown.outcome, ruleId: result.topDown.ruleId },
    bottomUp: { outcome: result.bottomUp.outcome, confidence: result.bottomUp.confidence },
    agree: result.agree,
    finalRecommendation: result.finalRecommendation
  });

  let request = null;
  if (save) {
    request = store.createRequest({
      studentRef: studentRef || null,
      category: "academic",
      type: "extension",
      description: description.trim(),
      features: result.features,
      topDown: { outcome: result.topDown.outcome, ruleId: result.topDown.ruleId, explanation: result.topDown.explanation },
      bottomUp: { outcome: result.bottomUp.outcome, confidence: result.bottomUp.confidence, explanation: result.bottomUp.explanation },
      agree: result.agree,
      finalRecommendation: result.finalRecommendation,
      needsHumanReview: result.needsHumanReview,
      summary: result.summary,
      principles: ["Fairness", "Transparency", "Human oversight"]
    });
  }
  res.json({ success: true, escalate: false, ...result, request });
});

// ---------- requests, contest and staff review (accountability) ----------

app.get("/api/requests", (req, res) => {
  const { studentRef } = req.query;
  const all = store.readRequests();
  res.json({ success: true, requests: studentRef ? all.filter(r => r.studentRef === studentRef) : [] });
});

app.post("/api/requests/:id/contest", (req, res) => {
  const { reason, studentRef } = req.body || {};
  if (typeof reason !== "string" || !reason.trim() || reason.length > 1000) {
    return res.status(400).json({ error: "Please say why (1000 characters max)." });
  }
  const updated = store.updateRequest(req.params.id, r => {
    if (studentRef && r.studentRef && r.studentRef !== studentRef) return r;
    const at = new Date().toISOString();
    return {
      ...r,
      status: "Contested, waiting for review",
      contested: true,
      contestReason: reason.trim(),
      history: [...(r.history || []), { at, action: "contested", by: "student", note: reason.trim() }]
    };
  });
  if (!updated) return res.status(404).json({ error: "Couldn't find that request." });
  store.audit({ type: "CONTEST", requestId: updated.id, studentRef: updated.studentRef });
  res.json({ success: true, request: updated });
});

app.post("/api/requests/:id/review", (req, res) => {
  const updated = store.updateRequest(req.params.id, r => {
    const at = new Date().toISOString();
    return {
      ...r,
      status: "Review requested",
      reviewRequested: true,
      history: [...(r.history || []), { at, action: "review requested", by: "student" }]
    };
  });
  if (!updated) return res.status(404).json({ error: "Couldn't find that request." });
  store.audit({ type: "REVIEW_REQUESTED", requestId: updated.id });
  res.json({ success: true, request: updated });
});

// Staff endpoints. PROTOTYPE ONLY: there is no authentication. A real
// deployment must restrict these to authorized lecturers and staff.
app.get("/api/staff/requests", (req, res) => {
  res.json({ success: true, requests: store.readRequests() });
});

app.post("/api/staff/requests/:id/decision", (req, res) => {
  const { decision, reviewer, note } = req.body || {};
  if (!["approved", "declined"].includes(decision) || typeof reviewer !== "string" || !reviewer.trim()) {
    return res.status(400).json({ error: "Pick approve or decline, and add your name." });
  }
  const updated = store.updateRequest(req.params.id, r => {
    const at = new Date().toISOString();
    return {
      ...r,
      status: decision === "approved" ? "Approved by lecturer" : "Declined by lecturer",
      humanDecision: { decision, reviewer: reviewer.trim(), note: (note || "").trim(), at },
      overrodeRecommendation:
        (decision === "approved" && r.finalRecommendation === "REFER") ||
        (decision === "declined" && r.finalRecommendation === "PROVISIONAL"),
      history: [...(r.history || []), { at, action: `decision: ${decision}`, by: reviewer.trim(), note: (note || "").trim() }]
    };
  });
  if (!updated) return res.status(404).json({ error: "Couldn't find that request." });
  store.audit({ type: "STAFF_DECISION", requestId: updated.id, decision, reviewer: reviewer.trim(), overrodeRecommendation: updated.overrodeRecommendation });
  res.json({ success: true, request: updated });
});

app.get("/api/staff/audit", (req, res) => {
  res.json({ success: true, entries: store.readAudit(Number(req.query.limit) || 200) });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MoralMate API running on http://localhost:${PORT}`);
    console.log(`Gemini: ${llm.isEnabled() ? `enabled (${llm.MODEL})` : "disabled (set GEMINI_API_KEY in .env to enable)"}`);
  });
}

module.exports = { app };
