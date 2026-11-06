
const fs = require("fs");
const path = require("path");
const { extractFeatures } = require("../src/extension/features");
const { assessByRules } = require("../src/extension/rules");
const { train, predict, loadDataset } = require("../src/extension/learned");

const OUT = path.join(__dirname, "..", "evaluation");
fs.mkdirSync(OUT, { recursive: true });

const trainSet = loadDataset("extension-training.json");
const testSet = loadDataset("extension-test.json");
const model = train(trainSet);

function evaluate(set, predictLearned) {
  const rows = set.map((ex, i) => {
    const features = extractFeatures(ex.text);
    const rules = assessByRules(features);
    const learned = predictLearned(ex, i);
    return {
      text: ex.text,
      expected: ex.label,
      features,
      rules: rules.outcome,
      ruleId: rules.ruleId,
      learned: learned.outcome,
      confidence: learned.confidence,
      influentialTerms: learned.influentialTerms
    };
  });
  const n = rows.length;
  const acc = k => rows.filter(r => r[k] === r.expected).length / n;
  const agree = rows.filter(r => r.rules === r.learned);
  const matrix = {
    bothCorrect: rows.filter(r => r.rules === r.expected && r.learned === r.expected).length,
    onlyRulesCorrect: rows.filter(r => r.rules === r.expected && r.learned !== r.expected).length,
    onlyLearnedCorrect: rows.filter(r => r.rules !== r.expected && r.learned === r.expected).length,
    bothWrong: rows.filter(r => r.rules !== r.expected && r.learned !== r.expected).length
  };

  const combined = rows.map(r => (r.rules === r.learned ? r.rules : "REFER"));
  const combinedAcc = combined.filter((c, i) => c === rows[i].expected).length / n;
  const unsafeProvisional = {
    rules: rows.filter(r => r.rules === "PROVISIONAL" && r.expected === "REFER").length,
    learned: rows.filter(r => r.learned === "PROVISIONAL" && r.expected === "REFER").length,
    combined: combined.filter((c, i) => c === "PROVISIONAL" && rows[i].expected === "REFER").length
  };
  return {
    n,
    accuracy: { rules: acc("rules"), learned: acc("learned"), combined: combinedAcc },
    agreementRate: agree.length / n,
    matrix,
    falseProvisional: unsafeProvisional,
    disagreements: rows.filter(r => r.rules !== r.learned),
    rows
  };
}

const heldOut = evaluate(testSet, ex => predict(model, ex.text));
const loo = evaluate(trainSet, (ex, i) => predict(train(trainSet.filter((_, j) => j !== i)), ex.text));

const pct = x => `${(x * 100).toFixed(1)}%`;
const report = { generatedAt: new Date().toISOString(), trainingSize: trainSet.length, heldOut, leaveOneOut: { ...loo, rows: undefined } };
fs.writeFileSync(path.join(OUT, "engine-comparison.json"), JSON.stringify(report, null, 2));

const section = (title, r) => `## ${title} (n = ${r.n})

| Measure | Top-down rules | Bottom-up learned | Combined policy |
|---|---|---|---|
| Accuracy against labelled outcome | ${pct(r.accuracy.rules)} | ${pct(r.accuracy.learned)} | ${pct(r.accuracy.combined)} |
| False "provisional" (should have been referred) | ${r.falseProvisional.rules} | ${r.falseProvisional.learned} | ${r.falseProvisional.combined} |

Agreement between the two approaches: **${pct(r.agreementRate)}**.

| | Count |
|---|---|
| Both correct | ${r.matrix.bothCorrect} |
| Only rules correct | ${r.matrix.onlyRulesCorrect} |
| Only learned model correct | ${r.matrix.onlyLearnedCorrect} |
| Both wrong | ${r.matrix.bothWrong} |

### Where they disagree

| Request | Expected | Rules (rule) | Learned (confidence) | Learned model's main terms |
|---|---|---|---|---|
${r.disagreements.map(d => `| ${d.text.replace(/\|/g, "/")} | ${d.expected} | ${d.rules} (${d.ruleId}) | ${d.learned} (${d.confidence}) | ${d.influentialTerms.join(", ")} |`).join("\n") || "| none | | | | |"}
`;

const md = `# Top-down versus bottom-up: extension pre-assessment

Generated ${report.generatedAt}. Training set: ${trainSet.length} synthetic labelled requests.
"Combined policy" is what MoralMate actually does: provisional only when both approaches agree, otherwise refer to the lecturer.

${section("Held-out test set", heldOut)}
${section("Leave-one-out cross-validation on the training set", loo)}
`;
fs.writeFileSync(path.join(OUT, "engine-comparison.md"), md);
console.log(md);
