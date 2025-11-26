import { db } from './backend/src/db.js';

const meeting = db.prepare("SELECT * FROM meetings ORDER BY createdAt DESC LIMIT 1").get();
if (!meeting) {
  console.log("No meetings found");
  process.exit(1);
}

const participants = db.prepare("SELECT * FROM participants WHERE meetingId = ?").all(meeting.id);

console.log(`Meeting: ${meeting.subject} (${meeting.id})`);
participants.forEach(p => {
  console.log(`${p.email}: ${p.token}`);
});
