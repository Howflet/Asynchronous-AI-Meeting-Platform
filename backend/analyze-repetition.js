import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'backend', 'data', 'a2mp.db');
const db = new Database(dbPath);

try {
    const meetingId = 'mtg_8bf0dab9-268d-4cbe-a6f5-b4c4ebcdc486';
    
    // Get conversation turns with timing
    const turns = db.prepare(`
        SELECT * FROM conversation_turns 
        WHERE meetingId = ? 
        ORDER BY createdAt ASC
    `).all(meetingId);
    
    console.log('=== Meeting Flow Analysis ===\n');
    
    // Analyze timing between turns
    console.log('Turn Timing:');
    turns.forEach((turn, i) => {
        const time = new Date(turn.createdAt);
        const prevTime = i > 0 ? new Date(turns[i-1].createdAt) : null;
        const gap = prevTime ? Math.round((time.getTime() - prevTime.getTime()) / 1000) : 0;
        
        console.log(`${i + 1}. ${time.toLocaleTimeString()} (+${gap}s) - ${turn.speaker}`);
        console.log(`   Message: ${turn.message.substring(0, 120)}...`);
    });
    
    console.log('\n=== Repetition Analysis ===');
    
    // Analyze for repetitive patterns
    if (turns.length >= 3) {
        const aiTurns = turns.filter(t => t.speaker.startsWith('AI:'));
        console.log(`AI Turns: ${aiTurns.length}`);
        
        // Check for keyword repetition
        const keyPhrases = [
            'however', 'but', 'on the other hand', 'alternatively', 'conversely',
            'i disagree', 'i agree', 'consider', 'we should', 'perhaps',
            'suggest', 'recommend', 'propose', 'think about', 'what if',
            'concern', 'worry', 'risk', 'issue', 'problem'
        ];
        
        const messages = aiTurns.map(t => t.message.toLowerCase());
        const phraseOccurrences = {};
        
        for (const phrase of keyPhrases) {
            const count = messages.filter(msg => msg.includes(phrase)).length;
            if (count > 0) {
                phraseOccurrences[phrase] = count;
            }
        }
        
        console.log('Phrase Occurrences:', phraseOccurrences);
        
        const highFrequencyPhrases = Object.entries(phraseOccurrences).filter(([_, count]) => count >= 2);
        console.log('High Frequency Phrases (>=2):', highFrequencyPhrases);
        
        // Check alternating pattern
        if (aiTurns.length >= 3) {
            const speakers = aiTurns.slice(-3).map(t => t.speaker);
            const uniqueSpeakers = [...new Set(speakers)];
            console.log('Recent speakers:', speakers);
            console.log('Unique speakers in last 3:', uniqueSpeakers.length);
            
            if (uniqueSpeakers.length === 2) {
                // Check if it's alternating A-B-A or B-A-B
                const isAlternating = speakers[0] !== speakers[1] && 
                                      speakers[1] !== speakers[2] && 
                                      speakers[0] === speakers[2];
                console.log('Alternating pattern detected:', isAlternating);
            }
        }
        
        // Check message lengths
        const recentLengths = messages.slice(-3).map(m => m.length);
        const avgLength = recentLengths.reduce((a, b) => a + b, 0) / recentLengths.length;
        console.log('Recent message lengths:', recentLengths);
        console.log('Average length:', avgLength);
        
        const lengthVariance = recentLengths.map(len => Math.abs(len - avgLength));
        const lowVariance = lengthVariance.every(v => v < avgLength * 0.3);
        console.log('Low length variance (similar lengths):', lowVariance);
    }
    
    // Check what happened after turn 3
    console.log('\n=== Conclusion Analysis ===');
    
    // Check if meeting was paused or concluded immediately after turn 3
    const meeting = db.prepare('SELECT status FROM meetings WHERE id = ?').get(meetingId);
    console.log('Final meeting status:', meeting.status);
    
    // Check if there are any moderator turns after the AI conversation
    const moderatorTurns = turns.filter(t => t.speaker === 'Moderator');
    console.log('Moderator turns:', moderatorTurns.length);
    if (moderatorTurns.length > 0) {
        console.log('Moderator messages:');
        moderatorTurns.forEach(t => {
            console.log(`- ${new Date(t.createdAt).toLocaleTimeString()}: ${t.message}`);
        });
    }
    
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}