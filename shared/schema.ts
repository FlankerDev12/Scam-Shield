import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Scan statistics table
export const scans = sqliteTable("scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  riskScore: integer("risk_score").notNull(),
  riskCategory: text("risk_category").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Chat tables for AI follow-up
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'model'
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
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
