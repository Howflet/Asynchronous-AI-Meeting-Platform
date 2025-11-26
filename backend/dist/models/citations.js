import { db } from "../db.js";
import { generateId } from "../util.js";
export function insertCitations(rows) {
    if (!rows || rows.length === 0)
        return;
    const stmt = db.prepare(`
    INSERT INTO citations (id, meeting_id, persona_id, message_id, title, url, snippet)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
    const tx = db.transaction((items) => {
        for (const r of items) {
            stmt.run(generateId("cit"), r.meeting_id, r.persona_id, r.message_id, r.title ?? null, r.url, r.snippet ?? null);
        }
    });
    tx(rows);
}
export function getCitationsForMeeting(meetingId) {
    return db
        .prepare(`SELECT * FROM citations WHERE meeting_id = ? ORDER BY created_at ASC`)
        .all(meetingId);
}
