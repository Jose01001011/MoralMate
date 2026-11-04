
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = process.env.MORALMATE_DATA_DIR || path.join(__dirname, "..", "runtime");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit-log.jsonl");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REQUESTS_FILE)) fs.writeFileSync(REQUESTS_FILE, "[]");
  if (!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, "");
}

function fingerprint(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex").slice(0, 16);
}

function audit(event) {
  ensure();
  const entry = {
    auditId: `AU-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    timestamp: new Date().toISOString(),
    ...event
  };
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + "\n");
  return entry;
}

function readAudit(limit = 200) {
  ensure();
  const lines = fs.readFileSync(AUDIT_FILE, "utf8").split("\n").filter(Boolean);
  return lines.slice(-limit).map(l => JSON.parse(l)).reverse();
}

function readRequests() {
  ensure();
  return JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"));
}

function writeRequests(list) {
  ensure();
  const tmp = REQUESTS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, REQUESTS_FILE);
}

function createRequest(data) {
  const list = readRequests();
  const request = {
    id: `MM-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: data.needsHumanReview ? "Waiting for your lecturer" : "Looks good, waiting for your lecturer to confirm",
    history: [],
    ...data
  };
  request.history.push({ at: request.createdAt, action: "created", by: "MoralMate", note: request.status });
  list.unshift(request);
  writeRequests(list);
  audit({ type: "REQUEST_SAVED", requestId: request.id, studentRef: request.studentRef, outcome: request.finalRecommendation });
  return request;
}

function updateRequest(id, updater) {
  const list = readRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return null;
  list[idx] = updater(list[idx]);
  writeRequests(list);
  return list[idx];
}

module.exports = { audit, readAudit, readRequests, createRequest, updateRequest, fingerprint, DATA_DIR };
