import { db } from "./db";
import { scans, conversations, messages, type Conversation, type Message } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  logScan(riskScore: number, riskCategory: string): Promise<void>;
  createConversation(title: string): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async logScan(riskScore: number, riskCategory: string): Promise<void> {
    await db.insert(scans).values({ riskScore, riskCategory });
  }

  async createConversation(title: string): Promise<Conversation> {
    const [conv] = await db.insert(conversations).values({ title }).returning();
    return conv;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const [msg] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return msg;
  }
}

export const storage = new DatabaseStorage();
