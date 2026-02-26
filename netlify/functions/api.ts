import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { createServer } from "http";
import { storage } from "../../server/storage";
import { api } from "../../shared/routes";
import { z } from "zod";
import { analyzeMessage } from "../../server/analyzer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runMigrations } from "../../server/db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Allow CORS from same origin (Netlify serves both)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Register all API routes
app.post("/api/analyze", async (req, res) => {
  try {
    const input = api.analyze.input.parse(req.body);
    const result = await analyzeMessage(input.message);
    await storage.logScan(result.riskScore, result.riskCategory);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const { title } = req.body;
    const conv = await storage.createConversation(title || "Scan Analysis Follow-up");
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
});

app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const history = await storage.getMessages(Number(req.params.id));
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

app.post("/api/conversations/:id/messages", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { content } = req.body;

    await storage.createMessage(conversationId, "user", content);

    const history = await storage.getMessages(conversationId);
    const geminiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contents = history.map(h => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({ history: contents.slice(0, -1) });
    const result = await chat.sendMessage(content);
    const aiText = result.response.text();

    const aiMsg = await storage.createMessage(conversationId, "model", aiText);
    res.json(aiMsg);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

let migrationsRan = false;
const wrappedHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  if (!migrationsRan) {
    await runMigrations();
    migrationsRan = true;
  }
  return wrappedHandler(event, context);
};
