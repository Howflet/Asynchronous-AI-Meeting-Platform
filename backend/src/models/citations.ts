import { db } from "../db.js";
import { generateId } from "../util.js";

export type Citation = {
  id: string;
  meeting_id: string;
  persona_id: string;
  message_id: string;
  title?: string | null;
  url: string;
  snippet?: string | null;
  created_at?: number;
};

export function insertCitations(rows: Omit<Citation, "id" | "created_at">[]) {
  if (!rows || rows.length === 0) return;
  const stmt = db.prepare(`
    INSERT INTO citations (id, meeting_id, persona_id, message_id, title, url, snippet)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((items: typeof rows) => {
    for (const r of items) {
      stmt.run(
        generateId("cit"),
        r.meeting_id,
        r.persona_id,
        r.message_id,
        r.title ?? null,
        r.url,
        r.snippet ?? null
      );
    }
  });
  tx(rows);
}

export function getCitationsForMeeting(meetingId: string): Citation[] {
  return db
    .prepare(
      `SELECT * FROM citations WHERE meeting_id = ? ORDER BY created_at ASC`
    )
    .all(meetingId) as Citation[];
}
