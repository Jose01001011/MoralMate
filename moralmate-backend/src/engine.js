
const scenarios = [
  {
    category: "safety",
    keywords: [
      "kill myself", "suicide", "hurt myself",
      "self harm", "self-harm", "threatened",
      "threatening me", "assault", "violence",
      "not safe", "unsafe"
    ],
    principles: ["Safety", "Care", "Human oversight"],
    response:
      "I'm concerned about your safety. If you're in immediate danger, contact local emergency services or seek help from a trusted person immediately. MoralMate cannot provide emergency assistance.",
    options: [
      "Contact an appropriate emergency service",
      "Speak to a trusted person",
      "Seek qualified campus support"
    ],
    escalate: true,
    priority: 1,
    explanation:
      "Safety takes priority because the situation may involve immediate harm. Human intervention is recommended."
  },
  {
    category: "privacy",
    keywords: [
      "password", "private information",
      "personal information", "confidential",
      "student records", "data leak",
      "privacy", "private details"
    ],
    principles: ["Privacy", "Consent", "Fairness"],
    response:
      "Personal information should only be accessed or shared with appropriate authorization. MoralMate cannot disclose another student's confidential records.",
    options: [
      "Request consent where appropriate",
      "Contact an authorized university office",
      "Report a possible privacy violation"
    ],
    escalate: true,
    priority: 2,
    explanation:
      "Privacy and consent restrict disclosure of personal information. A human authority may need to review the request."
  },
  {
    category: "academic",
    keywords: [
      "failed", "fail", "exam", "assessment",
      "assignment", "grade", "marks",
      "lecturer", "appeal", "results"
    ],
    principles: ["Fairness", "Autonomy", "Transparency"],
    response:
      "You can discuss your assessment with your lecturer, review the applicable assessment procedures, or seek guidance from your faculty.",
    options: [
      "Contact your lecturer",
      "Review assessment procedures",
      "Request academic support"
    ],
    escalate: false,
    priority: 3,
    explanation:
      "The student can explore available academic options while retaining control over the final decision."
  }
];

function evaluateMessage(message) {
  const normalized = message.toLowerCase().trim();

  const matches = scenarios.filter(scenario =>
    scenario.keywords.some(keyword =>
      normalized.includes(keyword)
    )
  );

  if (matches.length === 0) {
    return {
      category: "general",
      response:
        "I can help you explore academic, privacy, and safety concerns. Could you tell me more?",
      principles: ["Autonomy", "Transparency"],
      options: [
        "Explain your concern",
        "Request human support"
      ],
      escalate: false,
      ethicalConflict: false,
      priority: null,
      explanation:
        "No predefined category matched this message."
    };
  }

  matches.sort((a, b) => a.priority - b.priority);

  const selected = matches[0];

  const ethicalConflict = matches.length > 1;

  return {
    category: selected.category,
    response: selected.response,
    principles: selected.principles,
    options: selected.options,
    escalate: selected.escalate,
    ethicalConflict,
    matchedCategories: matches.map(item => item.category),
    priority: selected.priority,
    explanation: ethicalConflict
      ? `Multiple categories were identified: ${matches.map(item => item.category).join(", ")}. ${selected.category} was prioritized according to the predefined rules. ${selected.explanation}`
      : selected.explanation
  };
}

module.exports = { evaluateMessage };
