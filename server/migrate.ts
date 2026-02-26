import "dotenv/config";
import { db } from "./db";
import { scans, conversations, messages } from "@shared/schema";
import { sql } from "drizzle-orm";

console.log("Creating database tables...");

// Create tables
db.run(sql`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    risk_score INTEGER NOT NULL,
    risk_category TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  )
`);

db.run(sql`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

db.run(sql`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  )
`);

console.log("✓ Database tables created successfully!");
process.exit(0);
