// Runs both decision approaches on the same request and reconciles them.
//
// Reconciliation policy (human-centred):
//   both PROVISIONAL      -> provisional, lecturer confirms
//   both REFER            -> refer to lecturer
//   engines disagree      -> refer to lecturer, flagged as a disagreement
// The learned model can never upgrade a request on its own: disagreement
// always resolves towards more human control.

const { extractFeatures } = require("./features");
const { assessByRules } = require("./rules");
const { assessByLearned } = require("./learned");

function assessExtension({ text, features: declared }) {
  const extracted = extractFeatures(text || "");
  const features = { ...extracted };
  if (declared) {
    for (const [k, v] of Object.entries(declared)) {
      if (v !== undefined && v !== null && v !== "" && v !== "unknown") features[k] = k === "days" ? Number(v) : v;
    }
  }

  const topDown = assessByRules(features);
  const bottomUp = assessByLearned(text || "");
  const agree = topDown.outcome === bottomUp.outcome;
  const finalRecommendation = agree ? topDown.outcome : "REFER";

  let summary;
  if (agree && finalRecommendation === "PROVISIONAL") {
    summary = "Both checks say this looks okay. Your lecturer will confirm once they've seen your document.";
  } else if (agree) {
    summary = "Both checks say this should go to your lecturer.";
  } else {
    summary = "The two checks don't agree on this one, so I'm not deciding. It goes to your lecturer and gets flagged for a closer look.";
  }

  return {
    features,
    extractedFeatures: extracted,
    topDown,
    bottomUp,
    agree,
    finalRecommendation,
    needsHumanReview: !agree || finalRecommendation === "REFER",
    summary
  };
}

module.exports = { assessExtension };
