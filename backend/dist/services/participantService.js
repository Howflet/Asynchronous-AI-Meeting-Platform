import { db } from "../db.js";
import { generateId, now } from "../util.js";
export function getParticipantByToken(token) {
    const row = db.prepare(`SELECT p.*, m.subject as meetingSubject, m.details as meetingDetails FROM participants p JOIN meetings m ON m.id = p.meetingId WHERE token = ?`).get(token);
    if (!row)
        return null;
    return {
        id: row.id,
        meetingId: row.meetingId,
        email: row.email,
        token: row.token,
        hasSubmitted: !!row.hasSubmitted,
        createdAt: row.createdAt,
        meetingSubject: row.meetingSubject,
        meetingDetails: row.meetingDetails
    };
}
export function submitParticipantInput(participantId, content) {
    const input = {
        id: generateId("inp"),
        participantId,
        content,
        createdAt: now()
    };
    db.prepare("INSERT INTO participant_inputs (id, participantId, content, createdAt) VALUES (?, ?, ?, ?)").run(input.id, input.participantId, input.content, input.createdAt);
    db.prepare("UPDATE participants SET hasSubmitted = 1 WHERE id = ?").run(participantId);
    return input;
}
export function haveAllSubmitted(meetingId) {
    const row = db.prepare("SELECT COUNT(*) as total, SUM(hasSubmitted) as submitted FROM participants WHERE meetingId = ?").get(meetingId);
    return row.total > 0 && row.submitted === row.total;
}
export function getInputsForMeeting(meetingId) {
    const rows = db.prepare(`SELECT pi.participantId as participantId, pi.content as content FROM participant_inputs pi JOIN participants p ON p.id = pi.participantId WHERE p.meetingId = ? ORDER BY pi.createdAt`).all(meetingId);
    return rows;
}
