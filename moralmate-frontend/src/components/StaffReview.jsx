import { useEffect, useState } from "react";
import { api, OUTCOME_LABELS } from "../api";

// Lecturer and staff view: every saved request with both engine outputs, and
// the append-only audit log. PROTOTYPE ONLY: no authentication.
export default function StaffReview() {
  const [requests, setRequests] = useState([]);
  const [audit, setAudit] = useState([]);
  const [reviewer, setReviewer] = useState("");
  const [notes, setNotes] = useState({});
  const [error, setError] = useState("");
  const [tab, setTab] = useState("queue");

  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey(k => k + 1);

  useEffect(() => {
    let active = true;
    Promise.all([api.staffRequests(), api.audit()])
      .then(([r, a]) => { if (active) { setRequests(r.requests); setAudit(a.entries); setError(""); } })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [reloadKey]);

  async function decide(id, decision) {
    if (!reviewer.trim()) {
      setError("Add your name first so the decision is on record.");
      return;
    }
    try {
      await api.staffDecision(id, { decision, reviewer, note: notes[id] || "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const pending = requests.filter(r => !r.humanDecision);
  const priority = r => (r.contested ? 0 : r.agree === false ? 1 : r.finalRecommendation === "REFER" ? 2 : 3);

  return (
    <section className="page-content">
      <h1>Staff review</h1>
      <div className="info-box warning-box">
        <p><strong>Heads up:</strong> this is a prototype, so anyone can open this page. In real life only lecturers and staff would get in.</p>
      </div>

      <div className="tabs">
        <button className={tab === "queue" ? "active" : ""} onClick={() => setTab("queue")}>To review ({pending.length})</button>
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All requests ({requests.length})</button>
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>Audit log ({audit.length})</button>
        <button onClick={load}>Refresh</button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {tab !== "audit" && (
        <>
          <label className="reviewer-label">
            Your name
            <input value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="e.g. Lecturer, Module coordinator" />
          </label>
          <div className="requests-list">
            {(tab === "queue" ? pending : requests)
              .slice()
              .sort((a, b) => priority(a) - priority(b))
              .map(r => (
                <article className="request-item" key={r.id}>
                  <div className="request-item-header">
                    <h3>{r.id}</h3>
                    <span className="request-status">{r.status}</span>
                  </div>
                  <div className="flags">
                    {r.contested && <span className="flag red">Student contested</span>}
                    {r.agree === false && <span className="flag gold">Checks disagree</span>}
                    <span className="flag">{OUTCOME_LABELS[r.finalRecommendation]}</span>
                  </div>
                  <p><strong>What they wrote:</strong> {r.description}</p>
                  <p><strong>Picked up:</strong> reason {r.features?.reason}, documentation {r.features?.documentation}, {r.features?.days ?? "?"} days, deadline {r.features?.timing}</p>
                  <p><strong>Rules ({r.topDown?.ruleId}):</strong> {OUTCOME_LABELS[r.topDown?.outcome]}. {r.topDown?.explanation}</p>
                  <p><strong>Learned ({Math.round((r.bottomUp?.confidence || 0) * 100)}%):</strong> {OUTCOME_LABELS[r.bottomUp?.outcome]}. {r.bottomUp?.explanation}</p>
                  {r.contested && <p><strong>Student says:</strong> {r.contestReason}</p>}
                  {r.humanDecision ? (
                    <p className="review-notice">
                      {r.humanDecision.decision} by {r.humanDecision.reviewer} on {new Date(r.humanDecision.at).toLocaleString()}
                      {r.overrodeRecommendation ? " (went against MoralMate's suggestion)" : ""}
                    </p>
                  ) : (
                    <div className="decision-row">
                      <input placeholder="Note to the student (optional)" value={notes[r.id] || ""} onChange={e => setNotes({ ...notes, [r.id]: e.target.value })} />
                      <button className="btn-primary" onClick={() => decide(r.id, "approved")}>Approve</button>
                      <button className="review-button" onClick={() => decide(r.id, "declined")}>Decline</button>
                    </div>
                  )}
                </article>
              ))}
            {(tab === "queue" ? pending : requests).length === 0 && <div className="info-box"><p>Nothing here yet.</p></div>}
          </div>
        </>
      )}

      {tab === "audit" && (
        <div className="audit-wrap">
          <p className="muted">Every automatic and human decision gets logged here. Messages are only stored as a fingerprint, never the actual text.</p>
          <table className="audit-table">
            <thead>
              <tr><th>Time</th><th>Event</th><th>Category / outcome</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {audit.map(e => (
                <tr key={e.auditId}>
                  <td>{new Date(e.timestamp).toLocaleString()}</td>
                  <td>{e.type}</td>
                  <td>{e.category || e.finalRecommendation || e.decision || e.outcome || e.replyKind || ""}</td>
                  <td className="mono">
                    {e.topDown ? `rules ${e.topDown.outcome} (${e.topDown.ruleId}), learned ${e.bottomUp.outcome}` : ""}
                    {e.requestId ? ` ${e.requestId}` : ""}
                    {e.reviewer ? ` by ${e.reviewer}` : ""}
                    {e.messageFingerprint ? ` #${e.messageFingerprint}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
