const fs = require("fs");
const path = require("path");
const { evaluateMessage } = require("../src/engine");
const { extractFeatures } = require("../src/extension/features");
const { assessByRules } = require("../src/extension/rules");
const { assessByLearned, loadDataset } = require("../src/extension/learned");

const OUT = path.join(__dirname, "..", "evaluation");
fs.mkdirSync(OUT, { recursive: true });

const set = loadDataset("fairness-set.json");
const STYLES = ["formal", "informal", "short", "verbose", "codeswitch", "nonstandard"];

const rows = [];
for (const c of set.cases) {
  for (const style of STYLES) {
    const text = c.variants[style];
    const intake = evaluateMessage(text);
    const features = extractFeatures(text);
    const rules = assessByRules(features);
    const learned = assessByLearned(text);
    const combined = rules.outcome === learned.outcome ? rules.outcome : "REFER";
    rows.push({
      case: c.id, style, expected: c.expected, length: text.length,
      intakeCategory: intake.category, intakeIntent: intake.intent || null, escalated: intake.escalate,
      features, rules: rules.outcome, ruleId: rules.ruleId,
      learned: learned.outcome, confidence: learned.confidence, combined
    });
  }
}

const byStyle = STYLES.map(style => {
  const r = rows.filter(x => x.style === style);
  const ok = k => r.filter(x => x[k] === x.expected).length;
  return {
    style,
    n: r.length,
    avgLength: Math.round(r.reduce((s, x) => s + x.length, 0) / r.length),
    routedToExtension: r.filter(x => x.intakeIntent === "extension").length,
    rulesCorrect: ok("rules"),
    learnedCorrect: ok("learned"),
    combinedCorrect: ok("combined"),
    meanLearnedConfidence: Number((r.reduce((s, x) => s + x.confidence, 0) / r.length).toFixed(3))
  };
});

const consistency = set.cases.map(c => {
  const r = rows.filter(x => x.case === c.id);
  const uniq = k => [...new Set(r.map(x => x[k]))];
  return {
    case: c.id,
    expected: c.expected,
    rulesConsistent: uniq("rules").length === 1,
    learnedConsistent: uniq("learned").length === 1,
    intakeConsistent: uniq("intakeIntent").length === 1,
    rulesOutcomes: Object.fromEntries(r.map(x => [x.style, x.rules])),
    learnedOutcomes: Object.fromEntries(r.map(x => [x.style, x.learned]))
  };
});

const tone = set.toneVariants.map(v => {
  const intake = evaluateMessage(v.text);
  return { case: v.id, text: v.text, category: intake.category, escalated: intake.escalate, zone: intake.zone };
});

const summary = {
  totalVariants: rows.length,
  rulesAccuracy: rows.filter(r => r.rules === r.expected).length / rows.length,
  learnedAccuracy: rows.filter(r => r.learned === r.expected).length / rows.length,
  combinedAccuracy: rows.filter(r => r.combined === r.expected).length / rows.length,
  casesConsistentRules: consistency.filter(c => c.rulesConsistent).length,
  casesConsistentLearned: consistency.filter(c => c.learnedConsistent).length,
  casesConsistentIntake: consistency.filter(c => c.intakeConsistent).length,
  cases: consistency.length
};

const report = { generatedAt: new Date().toISOString(), summary, byStyle, consistency, tone, rows };
fs.writeFileSync(path.join(OUT, "fairness-report.json"), JSON.stringify(report, null, 2));

const pct = x => `${(x * 100).toFixed(1)}%`;
const md = `# Fairness check: does writing style change the outcome?

Generated ${report.generatedAt}. ${set.cases.length} substantive requests, each in ${STYLES.length} styles (${rows.length} variants).
These are one-shot assessments of the raw text, with no clarifying questions.

## Overall

| | Top-down rules | Bottom-up learned | Combined policy |
|---|---|---|---|
| Correct outcome across all variants | ${pct(summary.rulesAccuracy)} | ${pct(summary.learnedAccuracy)} | ${pct(summary.combinedAccuracy)} |
| Cases with the same outcome in every style | ${summary.casesConsistentRules} of ${summary.cases} | ${summary.casesConsistentLearned} of ${summary.cases} | |

Intake routing to the extension flow was consistent across styles for ${summary.casesConsistentIntake} of ${summary.cases} cases.

## By writing style

| Style | Avg. length (chars) | Routed to extension flow | Rules correct | Learned correct | Combined correct | Mean learned confidence |
|---|---|---|---|---|---|---|
${byStyle.map(s => `| ${s.style} | ${s.avgLength} | ${s.routedToExtension}/${s.n} | ${s.rulesCorrect}/${s.n} | ${s.learnedCorrect}/${s.n} | ${s.combinedCorrect}/${s.n} | ${s.meanLearnedConfidence} |`).join("\n")}

## By case

| Case | Expected | Rules by style (formal, informal, short, verbose, codeswitch, nonstandard) | Learned by style |
|---|---|---|---|
${consistency.map(c => `| ${c.case} | ${c.expected} | ${STYLES.map(s => short(c.rulesOutcomes[s])).join(" ")} | ${STYLES.map(s => short(c.learnedOutcomes[s])).join(" ")} |`).join("\n")}

P = provisional, R = refer.

## Emotional wording

Adding emotional language to an otherwise identical request:

| Case | Routed to | Escalated to human-only |
|---|---|---|
${tone.map(t => `| ${t.case} | ${t.category} | ${t.escalated ? "yes" : "no"} |`).join("\n")}

## Feature extraction misses (rules)

| Case | Style | Extracted features | Rules outcome | Expected |
|---|---|---|---|---|
${rows.filter(r => r.rules !== r.expected).map(r => `| ${r.case} | ${r.style} | reason=${r.features.reason}, doc=${r.features.documentation}, days=${r.features.days}, timing=${r.features.timing} | ${r.rules} (${r.ruleId}) | ${r.expected} |`).join("\n") || "| none | | | | |"}
`;

function short(o) { return o === "PROVISIONAL" ? "P" : "R"; }

fs.writeFileSync(path.join(OUT, "fairness-report.md"), md);
console.log(md);
