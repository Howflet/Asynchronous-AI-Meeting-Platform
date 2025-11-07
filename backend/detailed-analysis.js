import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'backend', 'data', 'a2mp.db');
const db = new Database(dbPath);

try {
    const meetingId = 'mtg_8bf0dab9-268d-4cbe-a6f5-b4c4ebcdc486';
    
    console.log('=== Detailed Analysis ===');
    
    // Get the meeting
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);
    console.log('Meeting status:', meeting.status);
    console.log('Meeting details:', meeting.details.substring(0, 200) + '...');
    
    // Get conversation turns with full details
    const turns = db.prepare(`
        SELECT * FROM conversation_turns 
        WHERE meetingId = ? 
        ORDER BY createdAt ASC
    `).all(meetingId);
    
    console.log(`\n=== Full Conversation (${turns.length} turns) ===`);
    turns.forEach((turn, i) => {
        console.log(`\n--- Turn ${i + 1} ---`);
        console.log(`Speaker: ${turn.speaker}`);
        console.log(`Time: ${new Date(turn.createdAt).toLocaleString()}`);
        console.log(`Message: ${turn.message}`);
        if (turn.metadata) {
            console.log(`Metadata: ${turn.metadata}`);
        }
    });
    
    // Get the report
    const report = db.prepare('SELECT * FROM reports WHERE meetingId = ?').get(meetingId);
    if (report) {
        console.log('\n=== Report Summary ===');
        console.log('Summary:', report.summary.substring(0, 300) + '...');
        console.log('Decisions:', report.decisions.substring(0, 200) + '...');
    }
    
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}