
const categories = [
  {
    name: "safety",
    keywords: [
      "hurt myself", "kill myself", "suicide",
      "self harm", "unsafe", "threatened",
      "violence", "assault"
    ],
    principles: ["Safety", "Human oversight", "Care"],
    response:
      "Your safety matters. Please contact a trusted person or an appropriate emergency or campus support service if you are in immediate danger. MoralMate cannot provide emergency assistance.",
    options: [
      "Seek immediate human assistance",
      "Contact a trusted person",
      "Request information about support services"
    ],
    escalate: true
  },
  {
    name: "privacy",
    keywords: [
      "privacy", "private", "personal information",
      "password", "data leak", "confidential",
      "student records"
    ],
    principles: ["Privacy", "Consent", "Transparency"],
    response:
      "Protecting personal information is important. Avoid sharing passwords or confidential student records. You can report a privacy concern through an appropriate university channel.",
    options: [
      "Avoid sharing sensitive information",
      "Report the concern",
      "Request guidance from an authorized staff member"
    ],
    escalate: true
  },
  {
    name: "academic",
    keywords: [
      "failed", "fail", "assessment", "exam",
      "grade", "marks", "lecturer", "assignment",
      "appeal", "results"
    ],
    principles: ["Fairness", "Autonomy", "Transparency"],
    response:
      "Academic difficulties can be stressful. You could discuss your results with your lecturer, review the applicable assessment procedures, or seek academic guidance.",
    options: [
      "Contact your lecturer",
      "Review assessment procedures",
      "Request academic support"
    ],
    escalate: false
  }
];

function evaluateMessage(message) {
  const normalized = message.toLowerCase().trim();

  const category = categories.find(item =>
    item.keywords.some(keyword =>
      normalized.includes(keyword)
    )
  );

  if (!category) {
    return {
      category: "general",
      response:
        "I'm MoralMate. I can help you explore academic, privacy, and student support concerns. Could you tell me more about your situation?",
      principles: ["Autonomy", "Transparency"],
      options: ["Explain your concern", "Request human support"],
      escalate: false,
      explanation:
        "The request did not match a predefined scenario."
    };
  }

  return {
    category: category.name,
    response: category.response,
    principles: category.principles,
    options: category.options,
    escalate: category.escalate,
    explanation: category.escalate
      ? "Human support is recommended because this request may involve sensitive information or safety concerns."
      : "General guidance can be provided while the student remains responsible for their decisions."
  };
}

module.exports = { evaluateMessage };
