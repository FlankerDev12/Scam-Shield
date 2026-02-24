import { db } from "./db";
import { scans } from "@shared/schema";

export interface IStorage {
  logScan(riskScore: number, riskCategory: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async logScan(riskScore: number, riskCategory: string): Promise<void> {
    await db.insert(scans).values({ riskScore, riskCategory });
  }
}

export const storage = new DatabaseStorage();
