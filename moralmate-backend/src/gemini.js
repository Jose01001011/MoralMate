
const { GoogleGenAI } = require("@google/genai");

const SYSTEM_INSTRUCTION = `
You are MoralMate, a friendly AI student-support assistant
for a university prototype developed in Namibia.

Your responsibilities:
- Help students with routine academic and administrative questions.
- Explain concepts clearly and conversationally.
- Ask follow-up questions when necessary.
- Respect student privacy and autonomy.
- Never invent official university policies, deadlines or fees.
- Never claim to be an official university representative.
- Never claim that a request was submitted or forwarded.
- Do not make final decisions about student cases.
- Refer safety, harassment, misconduct, discrimination,
  mental-health crises and sensitive personal matters
  to appropriate human support.
- Do not request passwords or confidential student records.

Keep answers helpful, concise and supportive.
`;

async function generateMoralMateReply(message, history = []) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  const contents = [
    ...history
      .filter(item =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.text === "string"
      )
      .slice(-8)
      .map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.text.slice(0, 2000) }]
      })),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

 let response;

for (let attempt = 0; attempt < 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 400
      }
    });

    break;
  } catch (error) {
    const errorText = String(error.message || "");
    const temporaryError =
      error.status === 503 ||
      error.code === 503 ||
      /"code"\s*:\s*503|UNAVAILABLE|high demand/i.test(errorText);

    if (!temporaryError || attempt === 2) {
      throw error;
    }

    const delay = 1000 * Math.pow(2, attempt);

    console.log(
      `Gemini temporarily unavailable. Retrying in ${delay}ms...`
    );

    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

  const reply = response.text?.trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response");
  }

  return reply;
}

module.exports = { generateMoralMateReply };
