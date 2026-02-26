import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";

// Use persistent disk path on Render, fallback to local for dev
const dbPath = process.env.NODE_ENV === "production"
  ? path.join("/data", "scamshield.db")
  : "scamshield.db";

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
