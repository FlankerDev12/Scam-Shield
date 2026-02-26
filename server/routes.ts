import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { analyzeMessage } from "./analyzer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "AIzaSyC9z8N8cYHKNmiztXR9KN2ihLV4GaZnkzA";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.analyze.path, async (req, res) => {
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

  app.post(api.chat.createConversation.path, async (req, res) => {
    try {
      const { title } = req.body;
      const conv = await storage.createConversation(title || "Scan Analysis Follow-up");
      res.status(201).json(conv);
    } catch (err) {
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get(api.chat.getHistory.path, async (req, res) => {
    try {
      const history = await storage.getMessages(Number(req.params.id));
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.post(api.chat.sendMessage.path, async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const { content } = req.body;

      // Save user message
      await storage.createMessage(conversationId, "user", content);

      // Get history for context
      const history = await storage.getMessages(conversationId);
      const contents = history.map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      }));

      // Generate response
      if (geminiKey) {
        const ai = new GoogleGenerativeAI(geminiKey);
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent({ contents });
        const response = result.response;
        const aiText = response.text();

        // Save AI response
        const aiMsg = await storage.createMessage(conversationId, "model", aiText);
        res.json(aiMsg);
      } else {
        res.status(500).json({ message: "AI API key not configured" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "AI response failed" });
    }
  });

  return httpServer;
}
