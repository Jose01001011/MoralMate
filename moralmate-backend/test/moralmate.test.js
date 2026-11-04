// Run with: npm test
const { test } = require("node:test");
const assert = require("node:assert");
const os = require("os");
const fs = require("fs");
const path = require("path");

process.env.MORALMATE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "moralmate-test-"));
delete process.env.LLM_API_KEY;

const { checkEscalation } = require("../src/guard");
const { evaluateMessage } = require("../src/engine");
const { assessByRules } = require("../src/extension/rules");
const { extractFeatures } = require("../src/extension/features");
const { handleTurn } = require("../src/agent");
const { app } = require("../src/server");

// ---------- escalation guard ----------

const MUST_ESCALATE = [
  "I want to end my life",
  "I want to kill myself",
  "I have been thinking about suicide",
  "I don't want to live anymore",
  "I've been hurting myself",
  "my lecturer keeps making sexual comments",
  "a classmate is harassing me",
  "I'm being bullied in residence",
  "I feel depressed and hopeless",
  "I can't cope with anything",
  "someone threatened me on campus",
  "Ek dink aan selfmoord"
];

for (const msg of MUST_ESCALATE) {
  test(`guard escalates: "${msg}"`, () => {
    assert.strictEqual(checkEscalation(msg).escalate, true);
    assert.strictEqual(evaluateMessage(msg).escalate, true);
  });
}

test("guard does not escalate a routine extension request", () => {
  assert.strictEqual(checkEscalation("I was sick and need 3 more days for my assignment").escalate, false);
});

test("safety outranks academic when both appear", () => {
  const r = evaluateMessage("I failed my exam and my lecturer is threatening me");
  assert.strictEqual(r.category, "safety");
  assert.strictEqual(r.ethicalConflict, false); // academic is not a guard category
});

test("escalated responses never echo the student's distress terms", () => {
  const r = evaluateMessage("I want to kill myself");
  assert.ok(!/kill/i.test(r.response + r.explanation));
});

// ---------- top-down extension rules ----------

test("documented medical request within 7 days is provisional", () => {
  assert.strictEqual(assessByRules({ reason: "medical", documentation: "yes", days: 3, timing: "before" }).outcome, "PROVISIONAL");
});

test("late request is always referred", () => {
  assert.strictEqual(assessByRules({ reason: "medical", documentation: "yes", days: 3, timing: "after" }).ruleId, "R2");
});

test("long request is referred", () => {
  assert.strictEqual(assessByRules({ reason: "medical", documentation: "yes", days: 10, timing: "before" }).ruleId, "R4");
});

test("feature extraction handles negated documentation", () => {
  assert.strictEqual(extractFeatures("I was sick but I don't have a certificate").documentation, "no");
  assert.strictEqual(extractFeatures("i was sick, i dont have sertificate").documentation, "no");
});

// ---------- conversational agent ----------

test("agent asks clarifying questions, then pre-assesses", async () => {
  let sid;
  const say = async m => { const o = await handleTurn({ sessionId: sid, message: m, studentRef: "T1" }); sid = o.sessionId; return o; };
  assert.strictEqual((await say("hi")).reply.kind, "clarify");
  assert.strictEqual((await say("Ask about an assignment extension")).reply.slot, "reason");
  await say("Medical");
  await say("Yes, I have a document");
  await say("3 days");
  const done = await say("No, not yet");
  assert.strictEqual(done.reply.kind, "assessment");
  assert.strictEqual(done.reply.assessment.topDown.outcome, "PROVISIONAL");
  const saved = await say("Save this request");
  assert.strictEqual(saved.reply.kind, "saved");
});

test("escalation applies mid-conversation and locks the session", async () => {
  let sid;
  const say = async m => { const o = await handleTurn({ sessionId: sid, message: m }); sid = o.sessionId; return o; };
  await say("I need an extension for my assignment");
  const esc = await say("honestly I feel hopeless");
  assert.strictEqual(esc.reply.kind, "escalation");
  const after = await say("3 days");
  assert.strictEqual(after.reply.kind, "escalation");
  assert.strictEqual(after.stage, "escalated");
});

test("student can always ask for a person", async () => {
  const o = await handleTurn({ message: "can I talk to a person" });
  assert.strictEqual(o.reply.kind, "handoff");
});

test("language model can add escalation but never remove it", async () => {
  process.env.LLM_API_KEY = "test";
  const llm = require("../src/llm");
  const fakeFetch = async () => ({ ok: true, json: async () => ({ content: [{ text: '{"category":"wellbeing","question":"How are you?"}' }] }) });
  const r = await llm.clarifyWithLLM("things are bad lately", { fetchImpl: fakeFetch });
  assert.strictEqual(r.category, "wellbeing");
  const bad = async () => ({ ok: true, json: async () => ({ content: [{ text: '{"category":"other","question":"Do you want to kill yourself?"}' }] }) });
  const r2 = await llm.clarifyWithLLM("hmm", { fetchImpl: bad });
  assert.strictEqual(r2.question, null); // unsafe model text is discarded
  delete process.env.LLM_API_KEY;
});

// ---------- API: accountability and contest ----------

test("API: assess, save, contest and staff decision are recorded", async () => {
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;
  const post = (p, body) => fetch(base + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());

  const a = await post("/api/extension/assess", { description: "I was sick and have a medical certificate, need 3 days", reason: "medical", documentation: "yes", days: 3, timing: "before", studentRef: "T2", save: true });
  assert.ok(a.request.id);
  const c = await post(`/api/requests/${a.request.id}/contest`, { reason: "I think this is wrong", studentRef: "T2" });
  assert.strictEqual(c.request.contested, true);
  const d = await post(`/api/staff/requests/${a.request.id}/decision`, { decision: "approved", reviewer: "Lecturer A" });
  assert.strictEqual(d.request.status, "Approved by lecturer");

  const audit = await fetch(base + "/api/staff/audit").then(r => r.json());
  const types = audit.entries.map(e => e.type);
  for (const t of ["EXTENSION_ASSESSMENT", "REQUEST_SAVED", "CONTEST", "STAFF_DECISION"]) assert.ok(types.includes(t), t);
  assert.ok(!JSON.stringify(audit).includes("medical certificate, need 3 days"), "audit log must not store raw text");

  const esc = await post("/api/extension/assess", { description: "I am being harassed by my lecturer" });
  assert.strictEqual(esc.escalate, true);
  server.close();
});
