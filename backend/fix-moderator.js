import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'backend', 'data', 'a2mp.db');
const db = new Database(dbPath);

// Meeting ID from our test
const meetingId = 'mtg_1120f8af-8de2-4fd3-af00-b85fa389d7b9';

console.log('Creating moderator persona for test meeting...');

// Create moderator persona
const moderatorId = `mod_${crypto.randomUUID()}`;
const now = Date.now();

const moderatorConfig = {
  identity: "Meeting Moderator - Efficient Decision Engine",
  objectives: [
    "Guide conversation toward meeting objectives",
    "Maintain and update shared whiteboard",
    "Select next speaker each turn",
    "Determine when objectives are met using check_for_conclusion"
  ],
  rules: [
    "Protocol Rule: Do not use conversational pleasantries, greetings, or verifications (e.g., 'Hello,' 'Thank you,' 'That's a great point'). Your response must be direct, task-focused, and contain only your core argument or data.",
    "Be fair and concise",
    "Incorporate human injected messages respectfully",
    "Always include whiteboard references",
    "Return JSON when using tools"
  ],
  outputFormat: "Plain text message to the group - direct and concise, no fluff",
  tools: ["update_whiteboard", "select_next_speaker", "check_for_conclusion"]
};

try {
  // Check if moderator already exists
  const existing = db.prepare('SELECT id FROM personas WHERE meetingId = ? AND role = ?').get(meetingId, 'moderator');
  
  if (existing) {
    console.log('Moderator already exists!');
  } else {
    // Create moderator
    db.prepare(`
      INSERT INTO personas (id, meetingId, participantId, role, name, config, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      moderatorId,
      meetingId,
      null, // participantId is null for moderator
      'moderator',
      'Moderator',
      JSON.stringify(moderatorConfig),
      now
    );
    
    console.log(`✓ Created moderator persona: ${moderatorId}`);
  }
  
  // Show current persona count
  const personas = db.prepare('SELECT * FROM personas WHERE meetingId = ?').all(meetingId);
  console.log(`\nMeeting now has ${personas.length} persona(s):`);
  personas.forEach(p => {
    console.log(`- ${p.name} (${p.role})`);
  });
  
  console.log('\nThe meeting should now start processing turns!');
  
} catch (error) {
  console.error('Error creating moderator:', error);
} finally {
  db.close();
}