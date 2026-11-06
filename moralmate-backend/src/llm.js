// Gemini language model integration (see gemini.js).
//
// Disabled unless GEMINI_API_KEY is set. When enabled it is used for two
// things only:
//   1. replyWithLLM: a conversational reply to a ROUTINE academic or
//      administrative question, after MoralMate's own rules have classified it.
//   2. clarifyWithLLM: one short clarifying question for an unclear message.
// Safeguards:
//   * The escalation guard runs before either is called, so Gemini never
//     answers a sensitive message, and earlier turns are re-checked too.
//   * Gemini can only ADD escalation (clarify returning a sensitive
//     category escalates). It can never remove it.
//   * Everything Gemini writes is re-checked by the guard and length-capped;
//     anything that fails falls back to MoralMate's scripted reply.
//   * Any error or timeout falls back to the scripted reply.

const { checkEscalation } = require("./guard");

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ALLOWED = ["academic", "extension", "administrative", "wellbeing", "misconduct", "safety", "privacy", "other"];
const MAX_REPLY_CHARS = 1500;

const CLARIFY_INSTRUCTION = `You help a university student-support triage assistant at NUST in Namibia understand an unclear student message.
Return ONLY a JSON object: {"category": one of ${JSON.stringify(ALLOWED)}, "question": "one short, friendly clarifying question"}.
Rules: never give advice, never answer the request, never ask for personal or medical details, keep the question under 30 words.
If the message could involve harm, distress, harassment or misconduct, use the matching category.`;

function isEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function defaultClarifyGenerate(message) {
  const { GoogleGenAI } = require("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: message.slice(0, 2000) }] }],
    config: { systemInstruction: CLARIFY_INSTRUCTION, temperature: 0.2, maxOutputTokens: 150 }
  });
  return response.text || "";
}

function defaultReplyGenerate(message, history) {
  const { generateMoralMateReply } = require("./gemini");
  return generateMoralMateReply(message, history);
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))
  ]);
}

async function clarifyWithLLM(message, { generate = defaultClarifyGenerate, timeoutMs = 8000 } = {}) {
  if (!isEnabled()) return null;
  try {
    const raw = await withTimeout(generate(message), timeoutMs);
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const category = ALLOWED.includes(json.category) ? json.category : "other";
    let question = typeof json.question === "string" ? json.question.trim() : "";
    if (!question || question.length > 220 || checkEscalation(question).escalate) question = null;
    return { category, question, model: MODEL };
  } catch {
    return null;
  }
}

// history: [{ role: "user" | "assistant", text }]
async function replyWithLLM(message, history = [], { generate = defaultReplyGenerate, timeoutMs = 20000 } = {}) {
  if (!isEnabled()) return null;
  if (history.some(h => h.role === "user" && checkEscalation(h.text).escalate)) return null;
  try {
    const reply = String(await withTimeout(generate(message, history.slice(-8)), timeoutMs) || "").trim();
    if (!reply || reply.length > MAX_REPLY_CHARS || checkEscalation(reply).escalate) return null;
    return { text: reply, model: MODEL };
  } catch {
    return null;
  }
}

module.exports = { clarifyWithLLM, replyWithLLM, isEnabled, MODEL };
