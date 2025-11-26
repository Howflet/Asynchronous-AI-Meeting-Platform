import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'backend', 'data', 'a2mp.db');
const db = new Database(dbPath);

const meeting = db.prepare("SELECT * FROM meetings ORDER BY createdAt DESC LIMIT 1").get() as any;
if (!meeting) {
    console.log("No meetings found");
    process.exit(1);
}

const participants = db.prepare("SELECT * FROM participants WHERE meetingId = ?").all(meeting.id) as any[];

console.log(`Meeting: ${meeting.subject} (${meeting.id})`);
participants.forEach(p => {
    console.log(`${p.email}: ${p.token}`);
});
