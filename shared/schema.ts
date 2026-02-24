import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Scan statistics table
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  riskScore: integer("risk_score").notNull(),
  riskCategory: text("risk_category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat tables for AI follow-up
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'model'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
