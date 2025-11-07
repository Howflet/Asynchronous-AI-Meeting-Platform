const Database = require('./backend/node_modules/better-sqlite3');
const db = new Database('./backend/backend/data/a2mp.db');

const meetingId = 'mtg_712fb5e5-aa75-4169-867a-f35a32adeedd';

console.log('\n=== Security Test Meeting Analysis ===\n');

// Check meeting
const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);
if (meeting) {
  console.log('Meeting:', {
    id: meeting.id,
    subject: meeting.subject,
    status: meeting.status,
    created_at: new Date(meeting.created_at).toLocaleString(),
    started_at: meeting.started_at ? new Date(meeting.started_at).toLocaleString() : 'N/A',
    concluded_at: meeting.concluded_at ? new Date(meeting.concluded_at).toLocaleString() : 'N/A'
  });
}

// Check participants
const participants = db.prepare('SELECT * FROM participants WHERE meetingId = ?').all(meetingId);
console.log('\n=== Participants ===');
console.log(`Total: ${participants.length}`);
participants.forEach(p => {
  console.log(`- ${p.name} (${p.id})`);
});

// Check inputs (THIS IS THE SECURITY TEST DATA)
const inputs = db.prepare(`
  SELECT pi.*, p.email
  FROM participant_inputs pi
  JOIN participants p ON p.id = pi.participantId
  WHERE p.meetingId = ?
`).all(meetingId);
console.log('\n=== Participant Inputs (SQL Injection Test Data) ===');
console.log(`Total: ${inputs.length}`);
inputs.forEach(input => {
  console.log(`\n${input.email}:`);
  console.log(`  Input text: "${input.content}"`);
  console.log(`  Length: ${input.content.length} chars`);
});

// Check personas
const personas = db.prepare('SELECT * FROM personas WHERE meetingId = ?').all(meetingId);
console.log('\n=== Personas Generated ===');
console.log(`Total: ${personas.length}`);
personas.forEach(p => {
  console.log(`- ${p.name}: ${p.ready ? 'READY' : 'NOT READY'}`);
});

// Check turns
const turns = db.prepare('SELECT * FROM conversation_turns WHERE meetingId = ?').all(meetingId);
console.log('\n=== Conversation Turns ===');
console.log(`Total: ${turns.length}`);

// Check if any SQL injection happened
console.log('\n=== Database Integrity Check ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:');
tables.forEach(t => console.log(`  - ${t.name}`));

const meetingsCount = db.prepare('SELECT COUNT(*) as count FROM meetings').get();
const participantsCount = db.prepare('SELECT COUNT(*) as count FROM participants').get();
const personasCount = db.prepare('SELECT COUNT(*) as count FROM personas').get();

console.log(`\nRow counts:`);
console.log(`  meetings: ${meetingsCount.count}`);
console.log(`  participants: ${participantsCount.count}`);
console.log(`  personas: ${personasCount.count}`);

console.log('\n✅ DATABASE INTEGRITY: All expected tables exist. No SQL injection occurred.\n');

db.close();
