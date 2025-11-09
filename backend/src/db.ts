import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "backend", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "a2mp.db"));

// Setup tables if not exist
export function initDb() {
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      details TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      status TEXT NOT NULL,
      whiteboard TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      meetingId TEXT NOT NULL,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      hasSubmitted INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(meetingId) REFERENCES meetings(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS participant_inputs (
      id TEXT PRIMARY KEY,
      participantId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(participantId) REFERENCES participants(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      meetingId TEXT NOT NULL,
      participantId TEXT,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      config TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(meetingId) REFERENCES meetings(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS conversation_turns (
      id TEXT PRIMARY KEY,
      meetingId TEXT NOT NULL,
      speaker TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      metadata TEXT,
      FOREIGN KEY(meetingId) REFERENCES meetings(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      meetingId TEXT NOT NULL,
      summary TEXT NOT NULL,
      highlights TEXT NOT NULL,
      decisions TEXT NOT NULL,
      actionItems TEXT NOT NULL,
      visualMap TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(meetingId) REFERENCES meetings(id) ON DELETE CASCADE
    );
  `);

  // Migration: Rename 'mcp' column to 'config' if it exists
  try {
    const columns = db.pragma("table_info(personas)") as Array<{ name: string }>;
    const hasMcpColumn = columns.some((col) => col.name === 'mcp');
    const hasConfigColumn = columns.some((col) => col.name === 'config');
    
    if (hasMcpColumn && !hasConfigColumn) {
      console.log("[DB] Migrating personas table: renaming 'mcp' column to 'config'");
      db.exec(`ALTER TABLE personas RENAME COLUMN mcp TO config;`);
      console.log("[DB] Migration completed successfully");
    }
  } catch (error) {
    console.warn("[DB] Migration warning:", error);
  }

  // Migration: Add pauseReason column to meetings table if it doesn't exist
  try {
    const meetingsColumns = db.pragma("table_info(meetings)") as Array<{ name: string }>;
    const hasPauseReasonColumn = meetingsColumns.some((col) => col.name === 'pauseReason');
    
    if (!hasPauseReasonColumn) {
      console.log("[DB] Adding pauseReason column to meetings table");
      db.exec(`ALTER TABLE meetings ADD COLUMN pauseReason TEXT;`);
      console.log("[DB] pauseReason column added successfully");
    }
  } catch (error) {
    console.warn("[DB] pauseReason migration warning:", error);
  }
}
