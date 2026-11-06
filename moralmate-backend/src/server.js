
require("dotenv").config();


const express = require("express");
const cors = require("cors");
const { evaluateMessage } = require("./engine");
const { generateMoralMateReply } = require("./gemini");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({
    name: "MoralMate",
    message: "Ethical Student Support API"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MoralMate API"
  });
});

 
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body || {};

  // 1. Validate the student message
  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 2000
  ) {
    return res.status(400).json({
      success: false,
      error: "Please enter a message of up to 2000 characters."
    });
  }

  // 2. Validate conversation history
  if (
    !Array.isArray(history) ||
    history.length > 8 ||
    history.some(item =>
      !item ||
      !["user", "assistant"].includes(item.role) ||
      typeof item.text !== "string" ||
      item.text.length > 2000
    )
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid conversation history."
    });
  }

  try {
    // 3. Use MoralMate's existing ethical reasoning engine
    const evaluation = evaluateMessage(message.trim());

    // 4. Preserve human escalation
    const sensitiveCategories = new Set([
      "safety",
      "privacy",
      "wellbeing",
      "harassment",
      "misconduct",
      "discrimination"
    ]);

    const requiresHuman =
      evaluation.escalate === true ||
      sensitiveCategories.has(
        String(evaluation.category || "").toLowerCase()
      );

    if (requiresHuman) {
      return res.json({
        success: true,
        ...evaluation,
        escalate: true,
        response:
          "This request needs human support. " +
          "MoralMate cannot make a decision about this matter. " +
          "Please contact the appropriate university support office " +
          "through official channels. " +
          "No request has been forwarded automatically.",
        source: "human_escalation"
      });
    }

    // 5. Only routine academic and administrative requests
    // are eligible for AI-generated replies
    const routineCategories = new Set([
      "academic",
      "administrative"
    ]);

    const category = String(
      evaluation.category || ""
    ).toLowerCase();

    if (!routineCategories.has(category)) {
      return res.json({
        success: true,
        ...evaluation,
        escalate: true,
        response:
          "I can't confidently classify this request as routine. " +
          "Please request human review. " +
          "No message has been forwarded automatically.",
        source: "human_escalation"
      });
    }

    // 6. Recheck the conversation history
    // before sharing it with the AI service
    for (const item of history) {
      const previous = evaluateMessage(item.text);

      const previousCategory = String(
        previous.category || ""
      ).toLowerCase();

      if (
        previous.escalate === true ||
        sensitiveCategories.has(previousCategory) ||
        !routineCategories.has(previousCategory)
      ) {
        return res.json({
          success: true,
          ...evaluation,
          escalate: true,
          response:
            "This conversation needs human review. " +
            "No request has been forwarded automatically.",
          source: "human_escalation"
        });
      }
    }

    // 7. Generate the conversational AI reply
    const reply = await generateMoralMateReply(
      message.trim(),
      history
    );

    // 8. Preserve the response structure used by React
    return res.json({
      success: true,
      ...evaluation,
      response: reply,
      escalate: false,
      source: "gemini"
    });

  } catch (error) {
    console.error("MoralMate chat error:", error.message);

    return res.status(503).json({
      success: false,
      error:
        "MoralMate AI is temporarily unavailable. " +
        "Please try again later."
    });
  }
});


app.listen(PORT, () => {
  console.log(
    `MoralMate API running on http://localhost:${PORT}`);
});
