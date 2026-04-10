import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_API_KEY",
});

app.post("/ai-tasks", async (req, res) => {
  const { input } = req.body;

  try {
    const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
You are a task generator.
Return ONLY JSON like this:
[
  { "title": "Task 1", "priority": "High" },
  { "title": "Task 2", "priority": "Medium" }
]
      `,
    },
    {
      role: "user",
      content: input,
    },
  ],
});

    const text = response.choices[0].message.content;

let tasks;
try {
  tasks = JSON.parse(text);
} catch (e) {
  return res.status(500).json({ error: "Invalid JSON from AI" });
}

res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});