// Escalation guard: the zero-automation, full-human-control zone.
//
// This module runs BEFORE any other engine, on every message and every
// conversation turn, and also on any text produced by an optional language
// model. If it fires, nothing else in the system may generate advice.
// It deliberately prefers false positives (sending a student to a human
// unnecessarily) over false negatives (missing a student at risk).

const { normalize, matchAll } = require("./text");

const GUARD_RULES = [
  {
    category: "safety",
    zone: "crisis",
    priority: 1,
    patterns: [
      /\bkill(ing)? ?(my|your|him|her|them) ?sel(f|ves)\b/,
      /\bsuicid\w*/,
      /\bend(ing)? (it all|my life|my own life)\b/,
      /\btak(e|ing) my (own )?life\b/,
      /\bself[- ]?harm\w*/,
      /\bhurt(ing)? ?(my|your) ?self\b/,
      /\bcut(ting)? ?(my|your) ?self\b/,
      /\bwant(ed)? to die\b/,
      /\bwish i (was|were) dead\b/,
      /\bbetter off dead\b/,
      /\b(do ?n'?t|do not|no longer) want to (live|be alive|be here|exist)\b/,
      /\bno reason to live\b/,
      /\boverdos\w*/,
      /\bthreaten\w*/,
      /\bassault\w*/,
      /\bnot safe\b/,
      /\bunsafe\b/,
      /\bin danger\b/,
      /\bviolen\w*/,
      /\bweapon\w*/,
      // Afrikaans phrases (to be verified by a first-language speaker)
      /\bselfmoord\w*/,
      /\bmy(self)? dood ?maak\b/,
      /\bwil nie meer lewe\b/
    ]
  },
  {
    category: "misconduct",
    zone: "human-only",
    priority: 2,
    patterns: [
      /\bharass\w*/,
      /\bbull(y|ied|ies|ying)\b/,
      /\bsexual\w*/,
      /\binappropriate\w*/,
      /\btouch(ed|ing) me\b/,
      /\bstalk\w*/,
      /\bdiscriminat\w*/,
      /\babus\w*/,
      /\bmisconduct\b/,
      /\baccused of\b/,
      /\bcheat(ing|ed)?\b/,
      /\bbrib\w*/,
      /\bcorrupt\w*/,
      /\bracis\w*/,
      /\bsexis\w*/,
      /\btribalis\w*/,
      /\bxenophob\w*/,
      /\bintimidat\w*/,
      /\bvictimi[sz]\w*/
    ]
  },
  {
    category: "wellbeing",
    zone: "human-only",
    priority: 3,
    patterns: [
      /\bdepress\w*/,
      /\banxi\w*/,
      /\bpanic attack\w*/,
      /\bmental(ly)? (health|ill\w*)\b/,
      /\bcounsel(l)?(ing|or|lor)\b/,
      /\bstress(ed|ful)?\b/,
      /\bcan'?t cope\b/,
      /\bcannot cope\b/,
      /\bnot coping\b/,
      /\boverwhelm\w*/,
      /\bhopeless\w*/,
      /\blonely\b/,
      /\btrauma\w*/,
      /\bburn(ed|t)? ?out\b/,
      /\bnot okay\b/,
      /\bstruggling (emotionally|mentally)\b/,
      /\bcrying\b/,
      /\btherap\w*/,
      // Afrikaans (to be verified)
      /\bdepressief\b/,
      /\bangstig\b/
    ]
  }
];

function checkEscalation(text) {
  const normalized = normalize(text);
  const hits = [];

  for (const rule of GUARD_RULES) {
    const terms = matchAll(normalized, rule.patterns);
    if (terms.length) {
      hits.push({
        category: rule.category,
        zone: rule.zone,
        priority: rule.priority,
        terms
      });
    }
  }

  if (!hits.length) return { escalate: false };

  hits.sort((a, b) => a.priority - b.priority);
  return {
    escalate: true,
    category: hits[0].category,
    zone: hits[0].zone,
    matchedCategories: hits.map(h => h.category),
    // Kept for the audit record only. Never echoed back to the student,
    // because repeating distress language back can be harmful.
    matchedTerms: hits.flatMap(h => h.terms)
  };
}

module.exports = { checkEscalation, GUARD_RULES };
