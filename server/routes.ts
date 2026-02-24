import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { analyzeMessage } from "./analyzer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.analyze.path, async (req, res) => {
    try {
      const input = api.analyze.input.parse(req.body);
      const result = await analyzeMessage(input.message);
      
      // Log the scan without storing PII/message
      await storage.logScan(result.riskScore, result.riskCategory);
      
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
