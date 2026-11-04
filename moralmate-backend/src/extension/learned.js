// Bottom-up (learned) decision logic for the same routine decision.
//
// A multinomial naive Bayes text classifier trained on labelled example
// requests (data/extension-training.json). It learns only from wording and
// past outcomes: it has no explicit rules about days, deadlines or documents.
// This is intentional, so the two approaches can be compared honestly.

const fs = require("fs");
const path = require("path");
const { tokenize } = require("../text");

const MODEL_VERSION = "bottomup-nb-1.0";
const LABELS = ["PROVISIONAL", "REFER"];

// Very common words carry no signal and are removed.
const STOPWORDS = new Set(
  "the and for can get have has had was were are you your his her its our their this that with from about into some any just will would could should please kindly dear sir madam hi hello good morning day lecturer".split(" ")
);

function features(text) {
  const tokens = tokenize(text).filter(t => !STOPWORDS.has(t));
  const grams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) grams.push(`${tokens[i]}_${tokens[i + 1]}`);
  return grams;
}

function train(examples) {
  const model = {
    version: MODEL_VERSION,
    docCounts: { PROVISIONAL: 0, REFER: 0 },
    tokenCounts: { PROVISIONAL: {}, REFER: {} },
    totalTokens: { PROVISIONAL: 0, REFER: 0 },
    vocab: new Set()
  };

  for (const ex of examples) {
    const label = ex.label;
    model.docCounts[label] += 1;
    for (const f of features(ex.text)) {
      model.tokenCounts[label][f] = (model.tokenCounts[label][f] || 0) + 1;
      model.totalTokens[label] += 1;
      model.vocab.add(f);
    }
  }
  model.trainingSize = examples.length;
  return model;
}

function logLikelihood(model, label, f) {
  const count = model.tokenCounts[label][f] || 0;
  return Math.log((count + 1) / (model.totalTokens[label] + model.vocab.size));
}

function predict(model, text) {
  const feats = features(text).filter(f => model.vocab.has(f));
  const total = model.docCounts.PROVISIONAL + model.docCounts.REFER;
  const scores = {};

  for (const label of LABELS) {
    let s = Math.log(model.docCounts[label] / total);
    for (const f of feats) s += logLikelihood(model, label, f);
    scores[label] = s;
  }

  const max = Math.max(...Object.values(scores));
  const exp = Object.fromEntries(LABELS.map(l => [l, Math.exp(scores[l] - max)]));
  const sum = exp.PROVISIONAL + exp.REFER;
  const probability = { PROVISIONAL: exp.PROVISIONAL / sum, REFER: exp.REFER / sum };
  const outcome = probability.PROVISIONAL >= 0.5 ? "PROVISIONAL" : "REFER";

  // Explanation: which words pushed the model towards its answer.
  const other = outcome === "PROVISIONAL" ? "REFER" : "PROVISIONAL";
  const influence = [...new Set(feats)]
    .map(f => ({ term: f.replace("_", " "), weight: logLikelihood(model, outcome, f) - logLikelihood(model, other, f) }))
    .filter(x => x.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return {
    engine: MODEL_VERSION,
    outcome,
    confidence: Number(probability[outcome].toFixed(3)),
    probability,
    knownTerms: feats.length,
    influentialTerms: influence.map(i => i.term),
    explanation: feats.length === 0
      ? "None of these words showed up in the examples the model learned from, so its answer is basically a guess."
      : `Going by similar past requests, the model leans towards "${outcome === "PROVISIONAL" ? "looks good" : "send to lecturer"}" (${Math.round(probability[outcome] * 100)}% sure). The words that swayed it most: ${influence.map(i => `"${i.term}"`).join(", ") || "nothing in particular"}.`
  };
}

function loadDataset(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "data", file), "utf8"));
}

let defaultModel = null;
function getModel() {
  if (!defaultModel) defaultModel = train(loadDataset("extension-training.json"));
  return defaultModel;
}

function assessByLearned(text) {
  return predict(getModel(), text);
}

module.exports = { train, predict, assessByLearned, loadDataset, getModel, MODEL_VERSION, features };
