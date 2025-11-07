import Database from 'better-sqlite3';
import path from 'node:path';

// Connect to the database
const dbPath = path.join(process.cwd(), 'backend', 'data', 'a2mp.db');
console.log('Connecting to database at:', dbPath);

const db = new Database(dbPath);

try {
    // Get the most recent meeting
    console.log('\n=== Recent Meeting ===');
    const meeting = db.prepare(`
        SELECT * FROM meetings 
        ORDER BY createdAt DESC 
        LIMIT 1
    `).get();
    
    if (!meeting) {
        console.log('No meetings found');
        process.exit(0);
    }
    
    console.log('Meeting:', {
        id: meeting.id,
        subject: meeting.subject,
        status: meeting.status,
        created: new Date(meeting.createdAt).toLocaleString()
    });
    
    // Check participants
    console.log('\n=== Participants ===');
    const participants = db.prepare(`
        SELECT * FROM participants 
        WHERE meetingId = ?
    `).all(meeting.id);
    
    console.log(`Found ${participants.length} participants`);
    participants.forEach(p => {
        console.log(`- ${p.email} (submitted: ${p.hasSubmitted ? 'yes' : 'no'})`);
    });
    
    // Check personas
    console.log('\n=== Personas ===');
    const personas = db.prepare(`
        SELECT * FROM personas 
        WHERE meetingId = ?
    `).all(meeting.id);
    
    console.log(`Found ${personas.length} personas`);
    personas.forEach(p => {
        console.log(`- ${p.name} (${p.role})`);
    });
    
    // Check conversation turns
    console.log('\n=== Conversation Turns ===');
    const turns = db.prepare(`
        SELECT * FROM conversation_turns 
        WHERE meetingId = ? 
        ORDER BY createdAt ASC
    `).all(meeting.id);
    
    console.log(`Found ${turns.length} conversation turns`);
    turns.forEach((turn, i) => {
        console.log(`${i + 1}. ${turn.speaker}: ${turn.message.substring(0, 100)}...`);
        console.log(`   Created: ${new Date(turn.createdAt).toLocaleString()}`);
    });
    
    // Check for any reports
    console.log('\n=== Reports ===');
    const reports = db.prepare(`
        SELECT * FROM reports 
        WHERE meetingId = ?
    `).all(meeting.id);
    
    console.log(`Found ${reports.length} reports`);
    
    // Check participant inputs
    console.log('\n=== Participant Inputs ===');
    const inputs = db.prepare(`
        SELECT pi.*, p.email 
        FROM participant_inputs pi
        JOIN participants p ON pi.participantId = p.id
        WHERE p.meetingId = ?
    `).all(meeting.id);
    
    console.log(`Found ${inputs.length} participant inputs`);
    inputs.forEach(input => {
        console.log(`- ${input.email}: ${input.content.substring(0, 100)}...`);
    });
    
} catch (error) {
    console.error('Database error:', error);
} finally {
    db.close();
}