// Top-down (rule-based) intake triage engine.
//
// Order of evaluation:
//   1. Escalation guard (safety, misconduct, wellbeing): zero automation.
//   2. Privacy rules: routed to an authorized human, no disclosure.
//   3. Academic and administrative rules: assisted guidance with explanation.
//   4. Anything else: the agent asks a clarifying question.

const { checkEscalation } = require("./guard");
const { normalize, matchAll } = require("./text");
const { RESOURCES } = require("./resources");
const { extractDays } = require("./extension/features");

const ENGINE_VERSION = "topdown-intake-2.0";

const ESCALATION_RESPONSES = {
  safety: {
    principles: ["Safety", "Care", "Human oversight"],
    response:
      "I'm really glad you said something. This is too important for an automated assistant, so please talk to someone who can help right now. If you're in danger, call 10111 or get to the nearest hospital.",
    explanation:
      "Anything that might affect your safety goes straight to people. I won't try to handle it myself.",
    resources: RESOURCES.crisis
  },
  misconduct: {
    principles: ["Justice", "Safety", "Accountability", "Human oversight"],
    response:
      "Thanks for telling me. This needs a trained person at NUST to look at it, not me. Here's who you can contact.",
    explanation:
      "Harassment, discrimination and misconduct reports are always handled by people. I don't assess them.",
    resources: RESOURCES.misconduct
  },
  wellbeing: {
    principles: ["Care", "Dignity", "Human oversight"],
    response:
      "It sounds like things are hard right now. You deserve to talk this through with a real person. Here's who you can reach out to, whenever you're ready.",
    explanation:
      "When something touches on how you're doing, I hand it over to people instead of giving advice.",
    resources: RESOURCES.wellbeing
  }
};

const PRIVACY_PATTERNS = [
  /\bpassword\w*/,
  /\b(another|other) (student|person)'?s?\b/,
  /\b(friend|classmate|roommate|boyfriend|girlfriend|brother|sister)'?s (marks|results|records|details|password|grades|information|account|transcript)\b/,
  /\bsomeone else'?s\b/,
  /\bdata (leak|breach)\b/,
  /\bconfidential\b/,
  /\bprivacy\b/,
  /\bprivate (information|details)\b/,
  /\bpersonal (information|details|data)\b/,
  /\bstudent records?\b/
];

const SCENARIOS = [
  {
    category: "academic",
    priority: 5,
    zone: "assisted",
    patterns: [
      /\bfail(ed|ing)?\b/,
      /\bexams?\b/,
      /\btests?\b/,
      /\bassessments?\b/,
      /\bassignments?\b/,
      /\bgrades?\b/,
      /\bmarks?\b/,
      /\blecturers?\b/,
      /\bappeal\w*/,
      /\bresults?\b/,
      /\bextension\w*/,
      /\bextend\w*/,
      /\bdeadlines?\b/,
      /\bmore time\b/,
      /\blate submission\b/,
      /\bsupplementary\b/,
      /\bmodules?\b/,
      /\bproject\b/,
      /\bstudy(ing)?\b/
    ],
    principles: ["Fairness", "Autonomy", "Transparency"],
    response:
      "Your lecturer is usually the best first stop. You can also check the assessment rules in the NUST prospectus, or ask your faculty for academic support.",
    options: [
      "Ask about an assignment extension",
      "Contact your lecturer",
      "Request academic support"
    ]
  },
  {
    category: "administrative",
    priority: 6,
    zone: "assisted",
    patterns: [
      /\bregist(er|ration|ered)\b/,
      /\bfees?\b/,
      /\bpayments?\b/,
      /\bstatement\b/,
      /\bstudent (card|number)\b/,
      /\btranscripts?\b/,
      /\btimetables?\b/,
      /\bresidence\b/,
      /\bhostel\b/,
      /\baccommodation\b/,
      /\bnsfaf\b/,
      /\bbursar\w*/,
      /\bloan\b/,
      /\blibrary\b/,
      /\bproof of registration\b/,
      /\badmin\w*/,
      /\bgraduation\b/,
      /\bcertificate of attendance\b/
    ],
    principles: ["Transparency", "Efficiency", "Autonomy"],
    response:
      "Sounds like an admin question. The Registrar, Finance or Student Services office can sort it out, and most records and fees are on the student portal.",
    options: [
      "Find the right office",
      "Explain your concern in more detail",
      "Request human support"
    ]
  }
];

const EXTENSION_PATTERNS = [
  /\bextension\w*/,
  /\bextend\w*/,
  /\bmore time\b/,
  /\bextra (time|days?)\b/,
  /\blate submission\b/,
  /\bsubmit (it )?late\b/,
  /\bmissed the deadline\b/,
  /\bdeadline\b/
];

// A request is also treated as an extension request when it asks for a
// number of days in connection with a piece of work, even without the word
// "extension". Added after the first fairness run showed that informal and
// code-switched requests were missed.
const WORK_CONTEXT = /\b(assignment|due|submit\w*|deadline|report|project|essay|homework|task|opdrag)\b/;

function isExtensionRequest(text) {
  const t = normalize(text);
  if (matchAll(t, EXTENSION_PATTERNS).length > 0) return true;
  return extractDays(t) !== null && WORK_CONTEXT.test(t);
}

function evaluateMessage(message) {
  const normalized = normalize(message);

  // 1. Escalation guard always runs first.
  const guard = checkEscalation(normalized);
  if (guard.escalate) {
    const template = ESCALATION_RESPONSES[guard.category];
    return {
      engine: ENGINE_VERSION,
      category: guard.category,
      zone: guard.zone,
      response: template.response,
      principles: template.principles,
      options: ["Talk to a person now"],
      resources: template.resources,
      escalate: true,
      ethicalConflict: guard.matchedCategories.length > 1,
      matchedCategories: guard.matchedCategories,
      priority: guard.category === "safety" ? 1 : guard.category === "misconduct" ? 2 : 3,
      explanation: template.explanation,
      auditTerms: guard.matchedTerms
    };
  }

  // 2. Privacy: never disclose, always route to an authorized person.
  const privacyTerms = matchAll(normalized, PRIVACY_PATTERNS);

  // 3. Assisted categories.
  const matches = SCENARIOS
    .map(s => ({ scenario: s, terms: matchAll(normalized, s.patterns) }))
    .filter(m => m.terms.length);

  const matchedCategories = [
    ...(privacyTerms.length ? ["privacy"] : []),
    ...matches.map(m => m.scenario.category)
  ];

  if (privacyTerms.length) {
    const conflict = matchedCategories.length > 1;
    return {
      engine: ENGINE_VERSION,
      category: "privacy",
      zone: "human-review",
      response:
        "I can't look up or share anyone's records here, not even your own. The Registrar's office can help with that.",
      principles: ["Privacy", "Consent", "Accountability"],
      options: ["Contact the Registrar's office", "Report a possible privacy violation"],
      resources: RESOURCES.privacy,
      escalate: true,
      ethicalConflict: conflict,
      matchedCategories,
      priority: 4,
      explanation:
        `You mentioned ${quote(privacyTerms)}. Records and personal details can only be handled by someone authorized.` +
        (conflict ? ` You also mentioned ${matchedCategories.slice(1).join(" and ")} stuff, but privacy comes first.` : ""),
      auditTerms: privacyTerms
    };
  }

  if (!matches.length && isExtensionRequest(normalized)) {
    matches.push({ scenario: SCENARIOS[0], terms: ["asking for more days"] });
    matchedCategories.push("academic");
  }

  if (!matches.length) {
    return {
      engine: ENGINE_VERSION,
      category: "general",
      zone: "clarify",
      response:
        "I can help with academic and admin stuff, and I can point you to a person for anything else. What's going on?",
      principles: ["Autonomy", "Transparency"],
      options: ["An academic matter", "An administrative matter", "Talk to a person"],
      escalate: false,
      ethicalConflict: false,
      matchedCategories: [],
      priority: null,
      explanation: "I wasn't sure what this was about, so I'm asking before I do anything."
    };
  }

  matches.sort((a, b) => a.scenario.priority - b.scenario.priority);
  const selected = matches[0];
  const conflict = matches.length > 1;
  const extension = selected.scenario.category === "academic" && isExtensionRequest(normalized);

  return {
    engine: ENGINE_VERSION,
    category: selected.scenario.category,
    intent: extension ? "extension" : null,
    zone: selected.scenario.zone,
    response: selected.scenario.response,
    principles: selected.scenario.principles,
    options: selected.scenario.options,
    escalate: false,
    ethicalConflict: conflict,
    matchedCategories,
    priority: selected.scenario.priority,
    explanation:
      `This looks ${selected.scenario.category === "administrative" ? "like admin" : selected.scenario.category} because you mentioned ${quote(selected.terms)}.` +
      (conflict
        ? ` It also touched on ${matches.slice(1).map(m => m.scenario.category).join(", ")}, so I went with the closest match.`
        : "") +
      " What happens next is up to you."
  };
}

function quote(terms) {
  const unique = [...new Set(terms)].slice(0, 3);
  return unique.map(t => `"${t}"`).join(", ");
}

module.exports = { evaluateMessage, isExtensionRequest, ENGINE_VERSION, ESCALATION_RESPONSES };
