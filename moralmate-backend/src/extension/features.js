// Feature extraction for the routine decision:
// "Is this assignment extension request provisionally eligible, pending
//  documentation and lecturer confirmation?"
//
// Extracts four slots from free text. A slot the text does not answer is
// returned as "unknown" so the conversational agent can ask for it.

const { normalize } = require("../text");

const REASON_PATTERNS = {
  medical: [
    /\b(sick|ill|illness|hospital\w*|doctor'?s?|clinic|medical|flu|fever|surgery|operation|malaria|covid|injur\w*|accident|migraine|pneumonia|appendicitis|food poisoning|booked (me )?off)\b/
  ],
  bereavement: [
    /\b(passed away|passed on|died|death|funeral|bereave\w*|memorial|burial)\b/,
    /\blost my (grand)?(mother|father|mom|mum|dad|parent|brother|sister|uncle|aunt|cousin|child|son|daughter)\b/
  ],
  technical: [
    /\b(laptop|computer|pc|internet|network|wifi|wi-fi|power (cut|outage|failure)|load ?shedding|electricity|moodle|e-?learning|system (was )?down|crash\w*|virus|stolen|nampower)\b/,
    /\b(power|lights|electricity) (went|was|were|got) (out|off|cut)\b/
  ],
  personal: [
    /\b(work|job|shift\w*|travel\w*|wedding|family (matter|emergency|obligations?|responsibilit\w*)|visitors|transport|party|personal reasons?|busy|forgot|started late)\b/
  ]
};

// "[cs]ertificate" accepts a common spelling variant so that non-standard
// spelling is not penalized (found in the first fairness run).
const DOC_YES = /\b(medical [cs]ertificate|sick note|doc(tor)?'?s? (note|letter)|[cs]ertificate|death [cs]ertificate|funeral (notice|programme|program)|proof|letter|screenshots?|evidence|documentation|documents?|receipt|report|case number|notice|records)\b/;
const DOC_NO = /\b(no|don'?t have (a|any)?|do not have (a|any)?|without (a|any)?|haven'?t got|can'?t (get|prove)|cannot (get|prove)|couldn'?t get|not able to get)\b[^.]{0,30}\b([cs]ertificate|note|proof|letter|evidence|documents?|documentation|it)\b/;
const DOC_NO_SHORT = /\b(no (proof|note|[cs]ertificate|evidence|documents?)|can'?t prove)\b/;

const WORD_NUMBERS = {
  one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fourteen: 14, fifteen: 15, twenty: 20, thirty: 30
};

const AFTER_DEADLINE = /\b(already passed|deadline (has |had )?passed|past the deadline|missed the deadline|overdue|was due (yesterday|last|on)|due (\w+ )?days? ago|it'?s now|did not submit|didn'?t submit|still submit)\b/;
const BEFORE_DEADLINE = /\b(due (tomorrow|today|on|next|this|in)|before the deadline|deadline is|will be due|upcoming deadline)\b/;

function extractDays(t) {
  let m = t.match(/\b(\d{1,3})\s*(more |extra |additional )?(working )?days?\b/);
  if (m) return Number(m[1]);
  m = t.match(/\b(\d{1,2})\s*(more |extra )?weeks?\b/);
  if (m) return Number(m[1]) * 7;
  m = t.match(/\b(one|a|an|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen|fifteen|twenty|thirty)\s*(more |extra |additional )?(working )?(day|days)\b/);
  if (m) return WORD_NUMBERS[m[1]];
  m = t.match(/\b(a|one|two|three|four)\s*(more |extra )?(week|weeks)\b/);
  if (m) return WORD_NUMBERS[m[1]] * 7;
  if (/\b(a|one) month\b/.test(t)) return 30;
  if (/\btomorrow\b/.test(t) && /\bsubmit\b/.test(t)) return 1;
  return null;
}

function extractFeatures(text) {
  const t = normalize(text);

  let reason = "unknown";
  for (const key of ["medical", "bereavement", "technical", "personal"]) {
    if (REASON_PATTERNS[key].some(p => p.test(t))) {
      reason = key;
      break;
    }
  }
  // Some explicit university activities (sport, debate, official trip).
  if (reason === "unknown" || reason === "personal") {
    if (/\b(university|faculty|official|nust) (sports?|trip|tournament|event|activity|debate)\b|\b(sports office|debate tournament)\b/.test(t)) {
      reason = "university";
    }
  }

  let documentation = "unknown";
  if (DOC_NO.test(t) || DOC_NO_SHORT.test(t)) documentation = "no";
  else if (DOC_YES.test(t)) documentation = "yes";

  let timing = "unknown";
  if (AFTER_DEADLINE.test(t)) timing = "after";
  else if (BEFORE_DEADLINE.test(t)) timing = "before";

  return { reason, documentation, days: extractDays(t), timing };
}

function missingSlots(features) {
  const missing = [];
  if (features.reason === "unknown") missing.push("reason");
  if (features.documentation === "unknown") missing.push("documentation");
  if (features.days === null || features.days === undefined) missing.push("days");
  if (features.timing === "unknown") missing.push("timing");
  return missing;
}

module.exports = { extractFeatures, extractDays, missingSlots };
