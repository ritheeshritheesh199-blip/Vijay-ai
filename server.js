import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

app.get("/api/health", (req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY), model });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is missing. Add it to .env." });
    const { messages = [], system = "" } = req.body;
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "Message is required." });

    const input = messages.slice(-20).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "")
    }));

    const response = await client.responses.create({
      model,
      instructions: system || "You are Vijay AI, a helpful multilingual AI assistant. Answer clearly. Support English, Tamil, and Tanglish. Be concise unless the user asks for detail.",
      input
    });

    res.json({ reply: response.output_text || "I couldn't generate a response.", responseId: response.id });
  } catch (err) {
    console.error(err);
    res.status(err?.status || 500).json({ error: err?.message || "AI request failed." });
  }
});

app.post("/api/analyze-file", upload.single("file"), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const mime = req.file.mimetype || "";
    if (!mime.startsWith("text/") && mime !== "application/pdf" && !mime.startsWith("image/")) {
      return res.status(400).json({ error: "Supported demo types: text, PDF, and images." });
    }

    if (mime.startsWith("image/")) {
      const dataUrl = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
      const response = await client.responses.create({
        model,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Analyze this image and explain the important details clearly." },
            { type: "input_image", image_url: dataUrl }
          ]
        }]
      });
      return res.json({ reply: response.output_text || "I couldn't analyze the image." });
    }

    const text = req.file.buffer.toString("utf8").slice(0, 50000);
    const response = await client.responses.create({
      model,
      instructions: "Analyze the supplied file content and answer clearly. Mention if the content is incomplete.",
      input: `File name: ${req.file.originalname}\n\n${text}`
    });
    res.json({ reply: response.output_text || "I couldn't analyze the file." });
  } catch (err) {
    console.error(err);
    res.status(err?.status || 500).json({ error: err?.message || "File analysis failed." });
  }
});

app.listen(port, () => console.log(`Vijay AI running at http://localhost:${port}`));
