// Optional language model adapter for the intake conversation.
//
// Disabled unless LLM_API_KEY is set. When enabled it is used ONLY for
// unclear messages, to (a) suggest a category and (b) word one short
// clarifying question. Safeguards:
//   * The escalation guard has already run before this is called, so the
//     model never answers a sensitive message.
//   * The model can only ADD escalation (if it labels a message as safety,
//     wellbeing or misconduct, the agent escalates). It can never remove it.
//   * Its question is length-capped and re-checked by the guard; anything
//     odd falls back to the scripted question.
//   * Any error or timeout falls back to the scripted agent.

const { checkEscalation } = require("./guard");

const API_URL = process.env.LLM_API_URL || "https://api.anthropic.com/v1/messages";
const MODEL = process.env.LLM_MODEL || "claude-haiku-5-5";
const ALLOWED = ["academic", "extension", "administrative", "wellbeing", "misconduct", "safety", "privacy", "other"];

const SYSTEM_PROMPT = `You help a university student-support triage assistant at NUST in Namibia understand an unclear student message.
Return ONLY a JSON object: {"category": one of ${JSON.stringify(ALLOWED)}, "question": "one short, friendly clarifying question"}.
Rules: never give advice, never answer the request, never ask for personal or medical details, keep the question under 30 words.
If the message could involve harm, distress, harassment or misconduct, use the matching category.`;

function isEnabled() {
  return Boolean(process.env.LLM_API_KEY);
}

async function clarifyWithLLM(message, { fetchImpl = globalThis.fetch, timeoutMs = 6000 } = {}) {
  if (!isEnabled()) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.LLM_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message.slice(0, 2000) }]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = (data.content || []).map(c => c.text || "").join("");
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));

    const category = ALLOWED.includes(json.category) ? json.category : "other";
    let question = typeof json.question === "string" ? json.question.trim() : "";
    if (!question || question.length > 220 || checkEscalation(question).escalate) question = null;

    return { category, question, model: MODEL };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { clarifyWithLLM, isEnabled, MODEL };
