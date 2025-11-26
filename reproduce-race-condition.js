const Database = require('./backend/node_modules/better-sqlite3');
const path = require('path');
const fs = require('fs');

// Setup DB connection
const dbPath = path.join(__dirname, 'backend', 'data', 'a2mp.db');
const db = new Database(dbPath);

// Mock environment
process.env.MAX_TURNS_PER_MEETING = '50';
process.env.ENGINE_TICK_MS = '1000';

// Import service functions (using dynamic import or mocking if needed)
// Since we can't easily import TS files directly in this JS script without compilation,
// we will simulate the logic or use a child process to run the actual backend code if possible.
// But for reproduction, we want to verify the LOGIC flaw.

// Let's create a test meeting
const meetingId = 'test_race_condition_' + Date.now();
const now = Date.now();

console.log('Creating test meeting:', meetingId);

db.prepare(`
  INSERT INTO meetings (id, subject, details, createdAt, status, whiteboard)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(meetingId, 'Race Condition Test', 'Testing injection during pause', now, 'running', JSON.stringify({ keyFacts: [], decisions: [], actionItems: [] }));

// Create moderator
const modId = 'mod_' + Date.now();
const modConfig = {
  identity: "Moderator",
  objectives: ["Guide"],
  rules: ["Be concise"],
  outputFormat: "Text",
  tools: ["check_for_conclusion"]
};
db.prepare(`
  INSERT INTO personas (id, meetingId, participantId, role, name, config, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(modId, meetingId, null, 'moderator', 'Moderator', JSON.stringify(modConfig), now);

// Create AI persona
const aiId = 'ai_' + Date.now();
db.prepare(`
  INSERT INTO personas (id, meetingId, participantId, role, name, config, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(aiId, meetingId, null, 'persona', 'AI Participant', JSON.stringify(modConfig), now);

// Insert repetitive history
console.log('Inserting repetitive history...');
const phrases = ['however', 'but', 'on the other hand'];
for (let i = 0; i < 10; i++) {
  const speaker = i % 2 === 0 ? 'AI:AI Participant' : 'AI:Other AI';
  const message = `I think we should consider this, ${phrases[i % 3]} there are risks.`;
  db.prepare(`
    INSERT INTO conversation_turns (id, meetingId, speaker, message, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(`turn_${i}_${Date.now()}`, meetingId, speaker, message, now - 10000 + i * 1000);
}

// Now we want to simulate the race condition.
// We will run a script that calls runOneTurn, and concurrently inject a message.

const { fork } = require('child_process');

// Create a worker script that runs runOneTurn
const workerScript = `
  const { runOneTurn } = require('./backend/dist/services/conversationService.js');
  const { db } = require('./backend/dist/db.js');
  
  // Mock getMeeting to return our test meeting
  const meetingId = '${meetingId}';
  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);
  meeting.whiteboard = JSON.parse(meeting.whiteboard);
  
  console.log('Worker: Starting runOneTurn...');
  runOneTurn(meeting, []).then(result => {
    console.log('Worker: runOneTurn result:', result);
    process.exit(0);
  }).catch(err => {
    console.error('Worker error:', err);
    process.exit(1);
  });
`;

// Write worker script to temp file
fs.writeFileSync('temp_worker.js', workerScript);

// We need to compile backend first? Assuming backend/dist exists.
// If not, we might need to use ts-node.
// Let's assume we can run it with node if we point to the right place.
// The user has 'backend/src', so likely 'backend/dist' exists if they ran 'npm run dev'.
// Let's check if 'backend/dist' exists.

if (!fs.existsSync('./backend/dist')) {
  console.error('backend/dist does not exist. Please build the backend first.');
  process.exit(1);
}

// Start the worker
console.log('Starting worker...');
const worker = fork('temp_worker.js');

// Wait a tiny bit (simulating the time it takes for runOneTurn to fetch history)
// Then inject the message
setTimeout(() => {
  console.log('Injecting human message...');
  db.prepare(`
    INSERT INTO conversation_turns (id, meetingId, speaker, message, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(`turn_human_${Date.now()}`, meetingId, 'Human:User', 'Wait, I have a question about Bitcoin!', Date.now());
  console.log('Message injected.');
}, 50); // 50ms delay - hopefully hits the window between fetch and pause

worker.on('exit', (code) => {
  console.log('Worker exited with code', code);

  // Check meeting status
  const finalMeeting = db.prepare('SELECT status, pauseReason FROM meetings WHERE id = ?').get(meetingId);
  console.log('Final Meeting Status:', finalMeeting.status);
  console.log('Pause Reason:', finalMeeting.pauseReason);

  if (finalMeeting.status === 'paused' && finalMeeting.pauseReason === 'ai') {
    console.log('FAIL: Meeting was paused despite human injection!');
  } else {
    console.log('SUCCESS: Meeting continued or was resumed.');
  }

  // Cleanup
  fs.unlinkSync('temp_worker.js');
});
