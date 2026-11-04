// Single place for the backend address. Override with VITE_API_URL in a .env file.
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  agent: body => request("/api/agent", { method: "POST", body: JSON.stringify(body) }),
  resetAgent: sessionId => request("/api/agent/reset", { method: "POST", body: JSON.stringify({ sessionId }) }),
  assessExtension: body => request("/api/extension/assess", { method: "POST", body: JSON.stringify(body) }),
  myRequests: studentRef => request(`/api/requests?studentRef=${encodeURIComponent(studentRef)}`),
  contest: (id, reason, studentRef) => request(`/api/requests/${id}/contest`, { method: "POST", body: JSON.stringify({ reason, studentRef }) }),
  requestReview: id => request(`/api/requests/${id}/review`, { method: "POST", body: "{}" }),
  staffRequests: () => request("/api/staff/requests"),
  staffDecision: (id, body) => request(`/api/staff/requests/${id}/decision`, { method: "POST", body: JSON.stringify(body) }),
  audit: () => request("/api/staff/audit?limit=100"),
  health: () => request("/api/health")
};

// An anonymous reference so a student can find their own requests again on
// this device without giving a name or student number to the prototype.
export function getStudentRef() {
  try {
    let ref = localStorage.getItem("moralmate-student-ref");
    if (!ref) {
      ref = `anon-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("moralmate-student-ref", ref);
    }
    return ref;
  } catch {
    if (!window.__moralmateRef) window.__moralmateRef = `anon-${Math.random().toString(36).slice(2, 10)}`;
    return window.__moralmateRef;
  }
}

export const OUTCOME_LABELS = {
  PROVISIONAL: "Looks good for now",
  REFER: "Goes to your lecturer"
};
