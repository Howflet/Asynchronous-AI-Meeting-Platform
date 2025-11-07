const Database = require('./backend/node_modules/better-sqlite3');
const db = new Database('./backend/backend/data/a2mp.db');

const meetingId = 'mtg_712fb5e5-aa75-4169-867a-f35a32adeedd';

console.log('\n=== MEETING TIMELINE ANALYSIS ===\n');

// Get meeting
const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);
console.log('Meeting:', {
  id: meeting.id,
  subject: meeting.subject,
  status: meeting.status,
  createdAt: new Date(meeting.createdAt).toLocaleString()
});

// Get ALL participants (including those who didn't submit)
const allParticipants = db.prepare('SELECT * FROM participants WHERE meetingId = ?').all(meetingId);
console.log('\n=== All Participants ===');
allParticipants.forEach(p => {
  console.log(`- ${p.email} (hasSubmitted: ${p.hasSubmitted})`);
  console.log(`  Created: ${new Date(p.createdAt).toLocaleString()}`);
});

// Get inputs
const inputs = db.prepare(`
  SELECT pi.*, p.email, p.hasSubmitted
  FROM participant_inputs pi
  JOIN participants p ON p.id = pi.participantId
  WHERE p.meetingId = ?
`).all(meetingId);

console.log('\n=== Participant Inputs Timeline ===');
inputs.forEach(input => {
  console.log(`\n${input.email}:`);
  console.log(`  Submitted: ${new Date(input.createdAt).toLocaleString()}`);
  console.log(`  Content: "${input.content.substring(0, 50)}${input.content.length > 50 ? '...' : ''}"`);
  console.log(`  hasSubmitted flag: ${input.hasSubmitted}`);
});

// Check if ALL participants submitted
const submittedCount = allParticipants.filter(p => p.hasSubmitted === 1).length;
console.log(`\n=== Submission Status ===`);
console.log(`Participants who submitted: ${submittedCount}/${allParticipants.length}`);
console.log(`Meeting should start when: All ${allParticipants.length} submit`);

if (submittedCount < allParticipants.length) {
  console.log(`\n⚠️ WARNING: Meeting started with only ${submittedCount}/${allParticipants.length} submissions!`);
  console.log(`This explains why there were no participant options for the moderator!`);
}

db.close();
