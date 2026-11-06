// Shared text normalization so every engine reads a message the same way.

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Tokens for the learned model: letters, digits and apostrophes only.
function tokenize(text) {
  return normalize(text)
    .replace(/[^a-z0-9' ]/g, " ")
    .split(" ")
    .map(t => t.replace(/^'+|'+$/g, ""))
    .filter(t => t.length > 1);
}

// Returns every pattern in the list that matches, as readable labels.
function matchAll(text, patterns) {
  const hits = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) hits.push(m[0]);
  }
  return hits;
}

module.exports = { normalize, tokenize, matchAll };
