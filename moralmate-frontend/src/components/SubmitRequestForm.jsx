
import { useState } from "react";

export default function SubmitRequestForm({ onSaveRequest }) {
  const [category, setCategory] = useState("academic");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSaved(false);

    const message = description.trim();

    if (!message || message.length > 2000) {
      setError("Enter a request between 1 and 2000 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Evaluation failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!result || saved || result.escalate) return;

    if (typeof onSaveRequest !== "function") {
      setError("Request tracking is not connected yet.");
      return;
    }

    onSaveRequest({
      id: `MM-${Date.now()}`,
      category: result.category,
      selectedCategory: category,
      description: description.trim(),
      explanation: result.explanation,
      principles: result.principles || [],
      status: "Pending",
      createdAt: new Date().toLocaleString(),
      reviewRequested: false
    });

    setSaved(true);
  }

  return (
    <div className="request-form-container">
      <h2>Student Support Request</h2>
      <p>
        Prototype only. Use fictional examples, not real
        personal or sensitive information.
      </p>

      <form className="request-form" onSubmit={handleSubmit}>
        <label htmlFor="request-category">Support category</label>
        <select
          id="request-category"
          value={category}
          onChange={e => {
            setCategory(e.target.value);
            setResult(null);
            setSaved(false);
          }}
        >
          <option value="academic">Academic Support</option>
          <option value="administrative">Administrative Support</option>
        </select>

        <label htmlFor="request-description">Describe your request</label>
        <textarea
          id="request-description"
          value={description}
          onChange={e => {
            setDescription(e.target.value);
            setResult(null);
            setSaved(false);
          }}
          rows={6}
          maxLength={2000}
          required
          placeholder="Example: I need an assignment extension..."
        />

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Evaluating..." : "Evaluate Request"}
        </button>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}

      {result && (
        <div className="info-box" aria-live="polite">
          <h3>Evaluation Result</h3>

          {result.escalate ? (
            <>
              <strong>Human review required</strong>
              <p>
                MoralMate cannot make an automated decision.
                This prototype has not forwarded your request.
                Please use official university support channels.
              </p>
            </>
          ) : (
            <>
              <p><strong>Category:</strong> {result.category}</p>
              <p><strong>Explanation:</strong> {result.explanation}</p>
              <p><strong>Response:</strong> {result.response}</p>
              <p>
                <strong>Ethical principles:</strong>{" "}
                {(result.principles || []).join(", ")}
              </p>

              <button
                className="btn-primary"
                type="button"
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? "Saved to My Requests" : "Save Test Request"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
