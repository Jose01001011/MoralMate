import { useState } from "react";
import { api, getStudentRef } from "../api";
import AssessmentCard from "./AssessmentCard";

// Structured extension request: the student states each fact explicitly, so
// the rule-based check does not depend on how well the free text is phrased.
export default function SubmitRequestForm({ onSaved }) {
  const [form, setForm] = useState({ reason: "medical", documentation: "yes", days: 3, timing: "before", description: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(null);

  const update = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setResult(null);
    setSavedId(null);
  };

  async function submit(save) {
    setError("");
    const description = form.description.trim();
    if (!description || description.length > 2000) {
      setError("Please write something (2000 characters max).");
      return;
    }
    setLoading(true);
    try {
      const data = await api.assessExtension({ ...form, days: Number(form.days), description, studentRef: getStudentRef(), save });
      setResult(data);
      if (save && data.request) {
        setSavedId(data.request.id);
        onSaved?.(data.request.id);
      }
    } catch (err) {
      setError(err.message || "Can't reach the backend right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="request-form-container">
      <h2>Extension request</h2>
      <p>
        MoralMate checks your request two different ways and shows you both. Your lecturer
        makes the final call. It's a prototype, so please use made-up examples.
      </p>

      <form className="request-form" onSubmit={e => { e.preventDefault(); submit(false); }}>
        <div className="form-row">
          <div>
            <label htmlFor="reason">Main reason</label>
            <select id="reason" value={form.reason} onChange={e => update("reason", e.target.value)}>
              <option value="medical">Medical</option>
              <option value="bereavement">Bereavement</option>
              <option value="technical">Technical problem</option>
              <option value="university">Official university activity</option>
              <option value="personal">Personal or work</option>
            </select>
          </div>
          <div>
            <label htmlFor="documentation">Do you have a document?</label>
            <select id="documentation" value={form.documentation} onChange={e => update("documentation", e.target.value)}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unknown">Not sure yet</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div>
            <label htmlFor="days">How many extra days?</label>
            <input id="days" type="number" min={1} max={60} value={form.days} onChange={e => update("days", e.target.value)} />
          </div>
          <div>
            <label htmlFor="timing">Has the deadline passed?</label>
            <select id="timing" value={form.timing} onChange={e => update("timing", e.target.value)}>
              <option value="before">No, not yet</option>
              <option value="after">Yes, it has passed</option>
            </select>
          </div>
        </div>

        <label htmlFor="request-description">Tell us what happened</label>
        <textarea
          id="request-description"
          value={form.description}
          onChange={e => update("description", e.target.value)}
          rows={5}
          maxLength={2000}
          required
          placeholder="e.g. I had flu this week and the doctor gave me a sick note..."
        />

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check my request"}
        </button>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}

      {result && result.escalate && (
        <div className="info-box escalation-box" aria-live="polite">
          <h3>This needs a real person</h3>
          <p>{result.response}</p>
          <p className="muted">{result.explanation}</p>
          {result.resources?.map(r => <p key={r.name}><b>{r.name}</b>: {r.contact}</p>)}
          <p><strong>Nothing was saved or sent.</strong></p>
        </div>
      )}

      {result && !result.escalate && (
        <div aria-live="polite">
          <AssessmentCard assessment={result} />
          <button className="btn-primary save-button" type="button" onClick={() => submit(true)} disabled={loading || Boolean(savedId)}>
            {savedId ? `Saved as ${savedId}` : "Save and send to lecturer"}
          </button>
        </div>
      )}
    </div>
  );
}
