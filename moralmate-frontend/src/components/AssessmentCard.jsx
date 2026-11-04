import { Scale, Brain, CheckCircle2, AlertTriangle } from "lucide-react";
import { OUTCOME_LABELS } from "../api";

// Shows both decision approaches side by side so the student (or a reviewer)
// can see how the recommendation was reached and whether the approaches agree.
export default function AssessmentCard({ assessment, compact = false }) {
  if (!assessment) return null;
  const { topDown, bottomUp, agree, finalRecommendation, summary, features } = assessment;

  return (
    <div className={`assessment-card ${compact ? "compact" : ""}`}>
      <div className={`assessment-verdict ${finalRecommendation === "PROVISIONAL" ? "ok" : "refer"}`}>
        {agree ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        <strong>{OUTCOME_LABELS[finalRecommendation]}</strong>
        {!agree && <span className="disagree-tag">Checks disagree</span>}
      </div>
      <p className="assessment-summary">{summary}</p>

      <div className="engine-grid">
        <div className="engine">
          <h4><Scale size={16} /> Rule check</h4>
          <p className="engine-outcome">{OUTCOME_LABELS[topDown.outcome]} <span>rule {topDown.ruleId}</span></p>
          <p>{topDown.explanation}</p>
        </div>
        <div className="engine">
          <h4><Brain size={16} /> Learned model</h4>
          <p className="engine-outcome">{OUTCOME_LABELS[bottomUp.outcome]} <span>{Math.round((bottomUp.confidence || 0) * 100)}% sure</span></p>
          <p>{bottomUp.explanation}</p>
        </div>
      </div>

      {!compact && features && (
        <p className="assessment-features">
          What I picked up: reason <b>{features.reason}</b>, documentation <b>{features.documentation}</b>, days <b>{features.days ?? "not stated"}</b>, deadline <b>{features.timing === "after" ? "passed" : features.timing === "before" ? "not yet passed" : "not stated"}</b>.
        </p>
      )}
      <p className="assessment-note">This is just a pre-check. Your lecturer decides, and you can contest it.</p>
    </div>
  );
}
