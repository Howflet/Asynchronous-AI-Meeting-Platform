#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-webapp.azurewebsites.net';
const HOST_PASSWORD = '12345';
const MEETING_ID = 'mtg_7c12de67-d116-4b88-9f67-c27184805fc3';

async function completeTestFlow() {
  try {
    console.log('🔄 Complete test flow: Add participant inputs → Start meeting → Check AI personas');
    console.log(`📋 Meeting ID: ${MEETING_ID}`);
    
    // Get auth token
    const authResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: HOST_PASSWORD })
    });
    
    if (!authResponse.ok) {
      throw new Error('Authentication failed');
    }
    
    const { token } = await authResponse.json();
    
    // Get meeting details to find participant tokens
    console.log('\n1. 📋 Getting meeting details...');
    const meetingResponse = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!meetingResponse.ok) {
      throw new Error('Failed to get meeting details');
    }
    
    const meeting = await meetingResponse.json();
    console.log('✅ Meeting found:', meeting.subject);
    console.log('👥 Participants:', meeting.participants?.length || 0);
    
    // Simulate participant inputs using the injection method
    console.log('\n2. 💬 Adding participant inputs via injection...');
    
    const participantMessages = [
      "I'm looking forward to discussing our project roadmap and priorities for this quarter.",
      "Great to be here! I have some ideas about improving our development workflow that I'd like to share."
    ];
    
    for (let i = 0; i < participantMessages.length; i++) {
      const response = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: participantMessages[i],
          author: `Participant ${i + 1}`
        })
      });
      
      if (response.ok) {
        console.log(`✅ Added input ${i + 1}: "${participantMessages[i].substring(0, 50)}..."`);
      } else {
        console.log(`❌ Failed to add input ${i + 1}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Now try to start the meeting
    console.log('\n3. 🚀 Starting the meeting...');
    const startResponse = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (startResponse.ok) {
      console.log('✅ Meeting started successfully!');
      
      // Wait for AI processing
      console.log('⏳ Waiting 8 seconds for AI persona generation...');
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Check status
      const statusResponse = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        console.log('\n4. 📊 Final Results:');
        console.log('  Meeting Status:', statusData.meeting.status);
        console.log('  AI Personas:', statusData.personas?.length || 0);
        console.log('  Conversation Messages:', statusData.conversation?.length || 0);
        
        if (statusData.personas && statusData.personas.length > 0) {
          console.log('\n🎉 SUCCESS! AI Personas created:');
          statusData.personas.forEach((persona, i) => {
            console.log(`   ${i + 1}. ${persona.name} (${persona.role})`);
          });
          console.log('\n✅ The looping issue should now be RESOLVED!');
          console.log('   The frontend was waiting for AI personas to be created.');
        } else {
          console.log('\n❌ No AI personas created - Gemini API may have issues');
        }
        
        if (statusData.conversation && statusData.conversation.length > 0) {
          console.log('\n💬 Recent conversation:');
          statusData.conversation.slice(-3).forEach((msg, i) => {
            const content = msg.content || msg.message || 'No content';
            console.log(`   [${msg.author}]: ${content.substring(0, 60)}...`);
          });
        }
      }
      
    } else {
      const errorText = await startResponse.text();
      console.log('❌ Failed to start meeting:', startResponse.status, errorText);
    }
    
    console.log(`\n🔗 Test the meeting: ${API_BASE}/m/${MEETING_ID}`);
    console.log(`🏠 Web App Home: ${API_BASE}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

completeTestFlow();