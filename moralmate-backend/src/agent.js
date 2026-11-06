// MoralMate conversational triage agent.
//
// A stateful dialogue manager that holds a short back-and-forth with the
// student to clarify a request before triaging it. On EVERY turn the
// escalation guard runs first; once a conversation enters a human-only zone
// it stays locked there and the agent gives no further automated replies.

const crypto = require("crypto");
const { checkEscalation } = require("./guard");
const { evaluateMessage, ESCALATION_RESPONSES } = require("./engine");
const { extractFeatures, extractDays, missingSlots } = require("./extension/features");
const { assessExtension } = require("./extension/assess");
const { RESOURCES } = require("./resources");
const { t, ESCALATION_AF, OPTIONS } = require("./i18n");
const store = require("./store");
const llm = require("./llm");

const MAX_CLARIFICATIONS = 2;
const SLOT_ORDER = ["reason", "documentation", "days", "timing"];
const SLOT_NAMES = { reason: "the reason", documentation: "whether you have a document", days: "how many days you need", timing: "whether the deadline has passed" };
const sessions = new Map();

function newSession(language = "en", studentRef = null) {
  const s = {
    id: crypto.randomUUID(),
    studentRef: studentRef || null,
    language: language === "af" ? "af" : "en",
    stage: "intake",
    clarifications: 0,
    slots: { reason: "unknown", documentation: "unknown", days: null, timing: "unknown" },
    asked: [],
    awaiting: null,
    extensionText: [],
    lastAssessment: null,
    turns: 0,
    history: []
  };
  sessions.set(s.id, s);
  return s;
}

function getSession(id, language, studentRef) {
  let s = id && sessions.get(id);
  if (!s) s = newSession(language, studentRef);
  if (language) s.language = language === "af" ? "af" : "en";
  if (studentRef) s.studentRef = studentRef;
  return s;
}

function opts(lang, key) {
  return (OPTIONS[lang] || OPTIONS.en)[key];
}

// ---------- intent helpers for quick replies (English and Afrikaans) ----------

const WANTS_HUMAN = /\b(talk|speak|praat) (to|with|met) (a|an|'n)? ?(person|human|persoon|someone)|human support|real person|^talk to a person|praat nou met\b/;
const WANTS_RESTART = /^(start again|start over|restart|begin weer)\b/;
const WANTS_SAVE = /^(save this request|save|stoor( hierdie versoek)?)\b/;
const ACADEMIC_CHOICE = /^(an academic matter|academic|akademies)/;
const ADMIN_CHOICE = /^(an administrative matter|administrative|admin|administratief)/;
const EXTENSION_CHOICE = /\b(extension|verlenging|more time|meer tyd)\b/;
const NOT_SURE = /\b(not sure|don'?t know|skip|nie seker nie|weet nie)\b/;

function parseSlotAnswer(slot, text) {
  const x = text.toLowerCase().trim();
  if (NOT_SURE.test(x)) return { value: null, unsure: true };

  if (slot === "reason") {
    if (/^(medical|medies)/.test(x)) return { value: "medical" };
    if (/^(bereavement|sterfgeval)/.test(x)) return { value: "bereavement" };
    if (/^(technical|tegnies)/.test(x)) return { value: "technical" };
    if (/^(personal|persoonlik)/.test(x)) return { value: "personal" };
    if (/^(university activity|universiteitsaktiwiteit)/.test(x)) return { value: "university" };
    const r = extractFeatures(x).reason;
    return { value: r === "unknown" ? null : r };
  }
  if (slot === "documentation") {
    if (/^(no|nee|geen)\b|no document|don'?t have|do not have/.test(x)) return { value: "no" };
    if (/^(yes|ja|i do|i have)\b|ek het/.test(x)) return { value: "yes" };
    const d = extractFeatures(x).documentation;
    return { value: d === "unknown" ? null : d };
  }
  if (slot === "days") {
    if (/more than 7|meer as 7/.test(x)) return { value: 8 };
    const m = x.match(/^(\d{1,3})\b/);
    if (m) return { value: Number(m[1]) };
    const d = extractDays(x) ?? extractDays(`${x} days`);
    return { value: d };
  }
  if (slot === "timing") {
    if (/^(no|nee|not yet|nog nie)\b/.test(x)) return { value: "before" };
    if (/^(yes|ja)\b|passed|verby/.test(x)) return { value: "after" };
    const tm = extractFeatures(x).timing;
    return { value: tm === "unknown" ? null : tm };
  }
  return { value: null };
}

// ---------- reply builders ----------

function escalationReply(session, guardOrEval) {
  const category = guardOrEval.category;
  const base = ESCALATION_RESPONSES[category];
  const af = session.language === "af" ? ESCALATION_AF[category] : null;
  return {
    kind: "escalation",
    category,
    zone: guardOrEval.zone,
    text: af ? af.response : base.response,
    explanation: af ? af.explanation : base.explanation,
    principles: base.principles,
    resources: base.resources,
    options: [],
    escalate: true
  };
}

function lockedReply(session) {
  return {
    kind: "escalation",
    category: session.escalatedCategory,
    zone: "human-only",
    text: t(session.language).lockedEscalation,
    explanation: "Once a chat gets handed to people, it stays that way. That keeps a person in charge.",
    resources: RESOURCES[session.escalatedCategory === "safety" ? "crisis" : session.escalatedCategory] || RESOURCES.wellbeing,
    options: [],
    escalate: true
  };
}

function nextSlotQuestion(session) {
  const missing = missingSlots(session.slots).filter(s => !session.asked.includes(s));
  const slot = SLOT_ORDER.find(s => missing.includes(s));
  if (!slot) return null;
  session.awaiting = slot;
  session.asked.push(slot);
  const L = t(session.language);
  const textByslot = { reason: L.askReason, documentation: L.askDocumentation, days: L.askDays, timing: L.askTiming };
  return {
    kind: "question",
    slot,
    text: textByslot[slot],
    options: opts(session.language, slot),
    explanation: `I'm asking because I couldn't tell ${SLOT_NAMES[slot]} from what you wrote, and the rule check needs it.`
  };
}

// Quick-reply labels carry no wording of their own, so for the learned model
// they are rendered as plain phrases. Free-text answers are kept verbatim.
const SLOT_PHRASES = {
  reason: { medical: "medical reason, I was sick", bereavement: "bereavement, a funeral", technical: "a technical problem", personal: "personal reasons", university: "an official university activity" },
  documentation: { yes: "I have proof and a supporting document", no: "I do not have proof" },
  timing: { before: "before the deadline", after: "the deadline has already passed" }
};
const ALL_OPTION_LABELS = new Set(
  Object.values(OPTIONS).flatMap(group => Object.values(group).flat()).map(s => s.toLowerCase())
);

function ownWords(session) {
  return session.extensionText.filter(m => !ALL_OPTION_LABELS.has(m.toLowerCase().trim()) && !/^ask about an assignment extension$/i.test(m.trim()));
}

function learnedText(session) {
  const own = ownWords(session);
  const s = session.slots;
  const rendered = [
    SLOT_PHRASES.reason[s.reason],
    SLOT_PHRASES.documentation[s.documentation],
    s.days ? `I need ${s.days} days` : null,
    SLOT_PHRASES.timing[s.timing]
  ].filter(Boolean);
  return [...own, ...rendered].join(". ");
}

function runAssessment(session) {
  const text = learnedText(session);
  const result = assessExtension({ text, features: session.slots });
  const words = ownWords(session).join(" ");
  session.lastAssessment = { ...result, text, studentWords: words || "Submitted through the assistant using quick-reply answers." };
  session.stage = "assessed";
  session.awaiting = null;

  store.audit({
    type: "EXTENSION_ASSESSMENT",
    sessionId: session.id,
    studentRef: session.studentRef,
    messageFingerprint: store.fingerprint(text),
    features: result.features,
    topDown: { outcome: result.topDown.outcome, ruleId: result.topDown.ruleId, engine: result.topDown.engine },
    bottomUp: { outcome: result.bottomUp.outcome, confidence: result.bottomUp.confidence, engine: result.bottomUp.engine },
    agree: result.agree,
    finalRecommendation: result.finalRecommendation
  });

  return {
    kind: "assessment",
    text: `${t(session.language).assessed} ${result.summary}`,
    explanation: result.topDown.explanation,
    principles: ["Fairness", "Transparency", "Human oversight"],
    assessment: result,
    options: opts(session.language, "afterAssessment")
  };
}

function startExtension(session, message) {
  session.stage = "extension";
  session.slots = { reason: "unknown", documentation: "unknown", days: null, timing: "unknown" };
  session.asked = [];
  session.extensionText = [message];
  const f = extractFeatures(message);
  session.slots = { ...session.slots, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "unknown" && v !== null)) };
  const q = nextSlotQuestion(session);
  if (!q) return runAssessment(session);
  return { ...q, text: `${t(session.language).extStart} ${q.text}` };
}

function handoffReply(session) {
  return {
    kind: "handoff",
    text: t(session.language).handoff,
    explanation: "You can always ask for a person. That option never goes away.",
    resources: [RESOURCES.wellbeing[0], RESOURCES.privacy[0]],
    options: opts(session.language, "afterAssessment").slice(2)
  };
}

// ---------- main turn handler ----------

async function handleTurn({ sessionId, message, language, studentRef }) {
  const session = getSession(sessionId, language, studentRef);
  session.turns += 1;
  const L = t(session.language);
  const lower = message.toLowerCase().trim();
  let llmUsed = false;

  const finish = reply => {
    session.history.push({ role: "user", text: message.slice(0, 2000) }, { role: "assistant", text: String(reply.text || "").slice(0, 2000) });
    session.history = session.history.slice(-8);
    store.audit({
      type: reply.kind === "escalation" ? "ESCALATION" : "AGENT_TURN",
      sessionId: session.id,
      studentRef: session.studentRef,
      turn: session.turns,
      stage: session.stage,
      replyKind: reply.kind,
      category: reply.category || null,
      zone: reply.zone || null,
      messageFingerprint: store.fingerprint(message),
      llmUsed
    });
    return { sessionId: session.id, stage: session.stage, llmEnabled: llm.isEnabled(), llmUsed, reply };
  };

  // 0. A locked conversation never returns to automation.
  if (session.stage === "escalated") return finish(lockedReply(session));

  // 1. Escalation guard on every turn, before anything else.
  const guard = checkEscalation(message);
  if (guard.escalate) {
    session.stage = "escalated";
    session.escalatedCategory = guard.category;
    return finish(escalationReply(session, guard));
  }

  // 2. Controls available at any point.
  if (WANTS_RESTART.test(lower)) {
    const fresh = newSession(session.language, session.studentRef);
    sessions.delete(session.id);
    return { sessionId: fresh.id, stage: fresh.stage, llmEnabled: llm.isEnabled(), llmUsed, reply: { kind: "info", text: L.restart, options: [] } };
  }
  if (WANTS_HUMAN.test(lower)) {
    return finish(handoffReply(session));
  }
  if (WANTS_SAVE.test(lower)) {
    if (!session.lastAssessment) return finish({ kind: "info", text: L.nothingToSave, options: [] });
    const request = saveAssessment(session);
    return finish({ kind: "saved", text: L.saved(request.id), requestId: request.id, options: [] });
  }

  // 3. Slot filling for an extension request.
  if (session.stage === "extension" && session.awaiting) {
    session.extensionText.push(message);
    const parsed = parseSlotAnswer(session.awaiting, message);
    if (parsed.value !== null && parsed.value !== undefined) session.slots[session.awaiting] = parsed.value;
    // Pick up anything else the student volunteered in the same answer.
    const extra = extractFeatures(message);
    for (const k of SLOT_ORDER) {
      if (k === session.awaiting) continue;
      const v = extra[k];
      if (v !== "unknown" && v !== null && (session.slots[k] === "unknown" || session.slots[k] === null)) session.slots[k] = v;
    }
    const q = nextSlotQuestion(session);
    return finish(q || runAssessment(session));
  }

  // 4. Quick-reply choices after a clarifying question.
  if (session.stage === "clarify") {
    if (ACADEMIC_CHOICE.test(lower)) {
      session.clarifications += 1;
      return finish({ kind: "clarify", text: L.clarifyAcademic, options: ["Ask about an assignment extension", "A test or exam result", "Talk to a person"] });
    }
    if (ADMIN_CHOICE.test(lower)) {
      session.clarifications += 1;
      return finish({ kind: "clarify", text: L.clarifyAdmin, options: ["Registration or fees", "Records or transcripts", "Talk to a person"] });
    }
  }

  // 5. Intake triage with the top-down engine.
  if (EXTENSION_CHOICE.test(lower) && !/\b(no|not)\b.*\bextension\b/.test(lower)) {
    return finish(startExtension(session, message));
  }

  const result = evaluateMessage(message);

  if (result.escalate) {
    // Privacy: route to an authorized person, but do not lock the chat.
    session.stage = "intake";
    return finish({
      kind: "human-review",
      category: result.category,
      zone: result.zone,
      text: result.response,
      explanation: result.explanation,
      principles: result.principles,
      resources: result.resources,
      options: result.options
    });
  }

  if (result.intent === "extension") return finish(startExtension(session, message));

  if (result.category === "general" && session.lastRoutineCategory && llm.isEnabled()) {
    // A follow-up to a routine question: Gemini answers using the chat history.
    const follow = await llm.replyWithLLM(message, session.history);
    if (follow) {
      llmUsed = true;
      session.stage = "intake";
      return finish({
        kind: "info",
        category: session.lastRoutineCategory,
        text: follow.text,
        explanation: `This looks like a follow-up to your ${session.lastRoutineCategory} question, so Gemini (${follow.model}) answered using the chat so far. It can't make decisions or submit anything for you.`,
        principles: ["Transparency", "Autonomy"],
        options: ["Talk to a person"],
        source: "gemini"
      });
    }
  }

  if (result.category === "general") {
    if (session.clarifications >= MAX_CLARIFICATIONS) {
      session.stage = "intake";
      return finish({ kind: "handoff", text: L.clarifyGiveUp, explanation: "I asked twice and still wasn't sure, so I'm handing over instead of guessing.", options: opts(session.language, "human") });
    }
    session.stage = "clarify";
    session.clarifications += 1;

    // Optional language model for unclear messages.
    const ai = await llm.clarifyWithLLM(message);
    if (ai) {
      llmUsed = true;
      if (["safety", "wellbeing", "misconduct"].includes(ai.category)) {
        session.stage = "escalated";
        session.escalatedCategory = ai.category;
        return finish({ ...escalationReply(session, { category: ai.category, zone: ai.category === "safety" ? "crisis" : "human-only" }), explanation: "Gemini thought this might be sensitive, so it's going to a person to be safe." });
      }
      if (ai.category === "extension") return finish(startExtension(session, message));
      if (ai.question) {
        return finish({ kind: "clarify", text: ai.question, explanation: `Gemini (${ai.model}) helped word this question. It can't make any decisions.`, options: ["An academic matter", "An administrative matter", "Talk to a person"] });
      }
    }

    const first = session.clarifications === 1;
    return finish({
      kind: "clarify",
      text: first ? (session.language === "af" ? "Ek kan help met akademiese en administratiewe vrae, en ek kan jou met 'n persoon in verbinding bring vir enigiets anders. Kan jy my 'n bietjie meer vertel?" : result.response) : L.clarifyAgain,
      explanation: result.explanation,
      principles: result.principles,
      options: result.options
    });
  }

  session.stage = "intake";
  session.lastRoutineCategory = result.category;

  // Routine academic or administrative question: Gemini may write the reply.
  // MoralMate's rules have already classified it; Gemini only words the answer.
  const ai = await llm.replyWithLLM(message, session.history);
  if (ai) llmUsed = true;
  return finish({
    kind: "info",
    category: result.category,
    text: ai ? ai.text : result.response,
    explanation: ai
      ? `${result.explanation} This reply was written by Gemini (${ai.model}). It can't make decisions or submit anything for you.`
      : result.explanation,
    principles: result.principles,
    options: result.options,
    ethicalConflict: result.ethicalConflict,
    source: ai ? "gemini" : "rules"
  });
}

function saveAssessment(session) {
  const a = session.lastAssessment;
  return store.createRequest({
    studentRef: session.studentRef,
    sessionId: session.id,
    category: "academic",
    type: "extension",
    description: a.studentWords,
    learnedModelInput: a.text,
    channel: "assistant",
    features: a.features,
    topDown: { outcome: a.topDown.outcome, ruleId: a.topDown.ruleId, explanation: a.topDown.explanation },
    bottomUp: { outcome: a.bottomUp.outcome, confidence: a.bottomUp.confidence, explanation: a.bottomUp.explanation },
    agree: a.agree,
    finalRecommendation: a.finalRecommendation,
    needsHumanReview: a.needsHumanReview,
    summary: a.summary,
    principles: ["Fairness", "Transparency", "Human oversight"]
  });
}

function resetSession(id) {
  sessions.delete(id);
}

module.exports = { handleTurn, resetSession, parseSlotAnswer, sessions };
