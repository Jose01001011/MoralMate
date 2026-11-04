import { useEffect, useState } from "react";
import { api, getStudentRef, OUTCOME_LABELS } from "../api";

export default function MyRequests({ onNavigate, refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [contesting, setContesting] = useState(null);
  const [reason, setReason] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey(k => k + 1);

  useEffect(() => {
    let active = true;
    api.myRequests(getStudentRef())
      .then(data => { if (active) { setRequests(data.requests); setError(""); } })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [refreshKey, reloadKey]);

  async function contest(id) {
    if (!reason.trim()) return;
    try {
      await api.contest(id, reason.trim(), getStudentRef());
      setContesting(null);
      setReason("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function review(id) {
    try {
      await api.requestReview(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-content">
      <h1>My requests</h1>
      <p>
        Made-up test requests saved on this device. You can see how each one was decided, ask for a
        review, or contest it.
      </p>
      {error && <p className="form-error">{error}</p>}

      {requests.length === 0 ? (
        <div className="info-box">
          <p>Nothing saved yet.</p>
          <button className="btn-primary" onClick={() => onNavigate("Submit Request")}>Make an extension request</button>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(r => (
            <article className="request-item" key={r.id}>
              <div className="request-item-header">
                <h3>{r.id}</h3>
                <span className="request-status">{r.status}</span>
              </div>
              <p><strong>Created:</strong> {new Date(r.createdAt).toLocaleString()}</p>
              <p><strong>What you wrote:</strong> {r.description}</p>
              <p><strong>Result:</strong> {OUTCOME_LABELS[r.finalRecommendation]} {r.agree === false && <em>(the two checks disagreed)</em>}</p>
              <p><strong>Rule check:</strong> {r.topDown?.explanation}</p>
              <p><strong>Learned model:</strong> {r.bottomUp?.explanation}</p>
              <p><strong>Principles:</strong> {(r.principles || []).join(", ")}</p>
              {r.humanDecision && (
                <p className="review-notice">
                  {r.humanDecision.reviewer} {r.humanDecision.decision} this
                  {r.humanDecision.note ? `. "${r.humanDecision.note}"` : ""}
                </p>
              )}

              <div className="request-actions">
                {!r.reviewRequested && !r.humanDecision && (
                  <button className="review-button" onClick={() => review(r.id)}>Ask for a review</button>
                )}
                {!r.contested && (
                  <button className="review-button outline" onClick={() => setContesting(contesting === r.id ? null : r.id)}>
                    Contest this
                  </button>
                )}
              </div>

              {contesting === r.id && (
                <div className="contest-box">
                  <label htmlFor={`contest-${r.id}`}>What do you think is wrong?</label>
                  <textarea id={`contest-${r.id}`} rows={3} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} />
                  <button className="btn-primary" onClick={() => contest(r.id)} disabled={!reason.trim()}>Send</button>
                </div>
              )}
              {r.contested && <p className="review-notice">You contested this: "{r.contestReason}". Someone will look at it.</p>}

              <details className="history">
                <summary>What's happened so far ({(r.history || []).length})</summary>
                <ul>
                  {(r.history || []).map((h, i) => (
                    <li key={i}>{new Date(h.at).toLocaleString()}: {h.action} by {h.by}{h.note ? `: ${h.note}` : ""}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
