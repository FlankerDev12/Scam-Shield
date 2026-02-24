import { z } from "zod";
import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";

// Table to store scan statistics without storing PII/message content
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  riskScore: integer("risk_score").notNull(),
  riskCategory: text("risk_category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Schemas
export const analyzeRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export const analyzeResponseSchema = z.object({
  riskScore: z.number(),
  riskCategory: z.string(),
  reasoning: z.string(),
  confidence: z.string(),
  scamType: z.string(),
  extracted: z.object({
    urls: z.array(z.string()),
    amounts: z.array(z.string()),
    upiIds: z.array(z.string()),
    phones: z.array(z.string()),
    brands: z.array(z.string()),
  }),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
