// Top-down decision logic for the routine decision.
//
// Outcomes are deliberately NOT final approvals:
//   PROVISIONAL  "Provisionally eligible, pending documentation and lecturer confirmation"
//   REFER        "Referred to the lecturer for a decision"
// A lecturer always makes the final decision (high automation of the
// pre-assessment, high human control over the outcome).

const RULES_VERSION = "topdown-extension-1.0";
const MAX_AUTO_DAYS = 7;

const REASON_LABELS = {
  medical: "a medical reason",
  bereavement: "a bereavement",
  technical: "a technical problem",
  personal: "a personal or work reason",
  university: "an official university activity",
  unknown: "no clear reason"
};

function assessByRules(features) {
  const { reason, documentation, days, timing } = features;
  const trace = [];

  const decide = (outcome, ruleId, reasonText) => ({
    engine: RULES_VERSION,
    outcome,
    ruleId,
    explanation: reasonText,
    trace,
    features
  });

  trace.push(`Reason identified: ${REASON_LABELS[reason] || reason}.`);
  trace.push(`Documentation: ${documentation}.`);
  trace.push(`Days requested: ${days ?? "not stated"}.`);
  trace.push(`Timing: ${timing === "after" ? "after the deadline" : timing === "before" ? "before the deadline" : "not stated"}.`);

  if (reason === "unknown") {
    return decide("REFER", "R1", "You didn't say why you need more time, so this one goes to your lecturer.");
  }
  if (timing === "after") {
    return decide("REFER", "R2", "The deadline's already passed, so your lecturer needs to decide this one.");
  }
  if (days === null || days === undefined) {
    return decide("REFER", "R3", "You didn't say how many days you need, so your lecturer will decide.");
  }
  if (days > MAX_AUTO_DAYS) {
    return decide("REFER", "R4", `${days} days is more than ${MAX_AUTO_DAYS}, so your lecturer will decide this one.`);
  }
  if (documentation === "no") {
    return decide("REFER", "R5", "Without a supporting document, your lecturer needs to look at this one personally.");
  }
  if (reason === "medical" || reason === "bereavement") {
    return decide(
      "PROVISIONAL",
      "R6",
      `You gave ${REASON_LABELS[reason]} and ${documentation === "yes" ? "have a document" : "can send a document later"}, for ${days} day(s). That fits the criteria, so it looks good for now. Your lecturer still has the final say.`
    );
  }
  if (reason === "technical" && days <= 3 && documentation === "yes") {
    return decide(
      "PROVISIONAL",
      "R7",
      `A short extension (${days} day(s)) for a tech problem you can prove fits the criteria. Your lecturer still has the final say.`
    );
  }
  return decide(
    "REFER",
    "R8",
    `Requests for ${REASON_LABELS[reason]} fall outside the criteria, so your lecturer will decide.`
  );
}

module.exports = { assessByRules, RULES_VERSION, MAX_AUTO_DAYS, REASON_LABELS };
