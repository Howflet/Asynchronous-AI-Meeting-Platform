#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-webapp.azurewebsites.net';
const HOST_PASSWORD = '12345';
const MEETING_ID = 'mtg_7c12de67-d116-4b88-9f67-c27184805fc3';

async function startMeetingTest() {
  try {
    console.log('🚀 Testing meeting start to trigger AI personas...');
    
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
    
    // Start the meeting
    console.log(`📋 Starting meeting: ${MEETING_ID}`);
    const startResponse = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (startResponse.ok) {
      console.log('✅ Meeting started successfully');
      
      // Wait a few seconds for AI processing
      console.log('⏳ Waiting 5 seconds for AI persona generation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check status again
      const statusResponse = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('\n📊 Meeting Status After Start:');
        console.log('  Status:', statusData.meeting.status);
        console.log('  AI Personas:', statusData.personas?.length || 0);
        
        if (statusData.personas && statusData.personas.length > 0) {
          console.log('🎉 SUCCESS! AI Personas created:');
          statusData.personas.forEach((persona, i) => {
            console.log(`   ${i + 1}. ${persona.name} (${persona.role})`);
          });
        } else {
          console.log('❌ Still no AI personas - Gemini API issue confirmed');
          console.log('   This explains the looping behavior in the frontend');
        }
        
        console.log('\n💬 Conversation messages:', statusData.conversation?.length || 0);
        
      } else {
        console.log('❌ Failed to get updated status');
      }
      
    } else {
      const errorText = await startResponse.text();
      console.log('❌ Failed to start meeting:', startResponse.status, errorText);
    }
    
    console.log(`\n🔗 Test the live view: ${API_BASE}/m/${MEETING_ID}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

startMeetingTest();