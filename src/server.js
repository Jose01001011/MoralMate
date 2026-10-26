
const express = require("express");
const cors = require("cors");
const { evaluateMessage } = require("./engine");

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

app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 2000
  ) {
    return res.status(400).json({
      error: "Message must be a non-empty string of at most 2000 characters."
    });
  }

  const result = evaluateMessage(message);

  res.json({
    success: true,
    ...result
  });
});

app.listen(PORT, () => {
  console.log(
    `MoralMate API running on http://localhost:${PORT}`);
});
