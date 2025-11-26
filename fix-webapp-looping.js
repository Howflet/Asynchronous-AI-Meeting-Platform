#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-webapp.azurewebsites.net';
const HOST_PASSWORD = '12345';

async function createFreshMeetingWithInputs() {
  try {
    console.log('🆕 Creating fresh meeting and submitting proper participant inputs...');
    
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
    
    // Create new meeting
    console.log('\n1. 🚀 Creating new meeting...');
    const meetingResponse = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Fixed Web App Test Meeting',
        details: 'Testing proper participant input flow to resolve looping issue.',
        participants: ['alice@example.com', 'bob@example.com'],
        participantBaseUrl: `${API_BASE}/participate`
      })
    });
    
    if (!meetingResponse.ok) {
      throw new Error('Failed to create meeting');
    }
    
    const meeting = await meetingResponse.json();
    console.log('✅ Meeting created:', meeting.id);
    console.log('📧 Invitation links generated:', meeting.invitationLinks?.length || 0);
    
    if (!meeting.invitationLinks || meeting.invitationLinks.length < 2) {
      throw new Error('No invitation links generated');
    }
    
    // Extract participant tokens
    const tokens = meeting.invitationLinks.map(link => {
      const url = new URL(link.link);
      return url.pathname.split('/').pop(); // Get token from URL
    });
    
    console.log('🎫 Participant tokens extracted:', tokens.length);
    
    // Submit participant inputs using proper tokens
    console.log('\n2. 📝 Submitting participant inputs...');
    
    const inputs = [
      "I'm excited to discuss our Q1 roadmap and share insights from recent user feedback analysis.",
      "Looking forward to this discussion! I have some technical considerations and timeline suggestions to contribute."
    ];
    
    for (let i = 0; i < tokens.length && i < inputs.length; i++) {
      const token = tokens[i];
      const input = inputs[i];
      
      console.log(`  Submitting input ${i + 1} with token: ${token.substring(0, 15)}...`);
      
      const inputResponse = await fetch(`${API_BASE}/api/participant/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          content: input
        })
      });
      
      if (inputResponse.ok) {
        console.log(`  ✅ Input ${i + 1} submitted successfully`);
      } else {
        const errorText = await inputResponse.text();
        console.log(`  ❌ Input ${i + 1} failed:`, inputResponse.status, errorText);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Now try to start the meeting
    console.log('\n3. 🚀 Starting the meeting...');
    const startResponse = await fetch(`${API_BASE}/api/meetings/${meeting.id}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (startResponse.ok) {
      console.log('✅ Meeting started successfully!');
      
      // Wait for AI processing
      console.log('⏳ Waiting 10 seconds for Gemini AI to generate personas and responses...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check final status
      const statusResponse = await fetch(`${API_BASE}/api/meetings/${meeting.id}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        console.log('\n4. 🎉 FINAL RESULTS:');
        console.log('  Meeting Status:', statusData.meeting.status);
        console.log('  AI Personas:', statusData.personas?.length || 0);
        console.log('  Conversation Messages:', statusData.conversation?.length || 0);
        
        if (statusData.personas && statusData.personas.length > 0) {
          console.log('\n🤖 AI Personas Successfully Created:');
          statusData.personas.forEach((persona, i) => {
            console.log(`   ${i + 1}. ${persona.name} - ${persona.role}`);
          });
          
          console.log('\n🎊 SUCCESS! The Web App should now work properly!');
          console.log('   The looping issue was caused by missing AI personas.');
          console.log('   Gemini API is working correctly.');
          
        } else {
          console.log('\n⚠️ No AI personas created - there may still be a Gemini API configuration issue');
        }
        
        if (statusData.conversation && statusData.conversation.length > 0) {
          console.log('\n💬 Active Conversation:');
          statusData.conversation.slice(-3).forEach((msg, i) => {
            const content = msg.content || msg.message || 'No content';
            console.log(`   [${msg.author}]: ${content.substring(0, 70)}...`);
          });
        }
        
        console.log(`\n🔗 Live Meeting View: ${API_BASE}/m/${meeting.id}`);
        console.log(`👥 Participant Links:`);
        meeting.invitationLinks.forEach((link, i) => {
          console.log(`   ${i + 1}. ${link.email}: ${link.link}`);
        });
        
      } else {
        console.log('❌ Failed to get final status');
      }
      
    } else {
      const errorText = await startResponse.text();
      console.log('❌ Failed to start meeting:', startResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createFreshMeetingWithInputs();