const Database = require('./backend/node_modules/better-sqlite3');
const db = new Database('./backend/backend/data/a2mp.db');

const meetingId = 'mtg_144f3854-8487-4aa4-9445-765802949d5e';

console.log('\n=== Meeting Conversation ===');
const turns = db.prepare(`
  SELECT speaker, message, createdAt 
  FROM conversation_turns 
  WHERE meetingId = ? 
  ORDER BY createdAt ASC
`).all(meetingId);

console.log(`Total turns: ${turns.length}\n`);

turns.forEach((t, i) => {
  const time = new Date(t.createdAt).toLocaleTimeString();
  console.log(`[${i + 1}] ${time} - ${t.speaker}:`);
  console.log(`    ${t.message.substring(0, 150)}${t.message.length > 150 ? '...' : ''}`);
  console.log();
});

// Check personas
console.log('=== Personas ===');
const personas = db.prepare('SELECT name, role FROM personas WHERE meetingId = ?').all(meetingId);
personas.forEach(p => console.log(`- ${p.name} (${p.role})`));

db.close();
