#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io';
const HOST_PASSWORD = '12345';

async function getAuthToken() {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: HOST_PASSWORD })
  });
  
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  
  const data = await response.json();
  return data.token;
}

async function createAndTestMeeting() {
  try {
    const token = await getAuthToken();
    console.log('🔐 Authenticated successfully');
    
    // Create meeting with actual participant emails
    console.log('🚀 Creating new test meeting...');
    const response = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'WebSocket Test Meeting',
        details: 'Testing real-time functionality with WebSocket connections and participant interactions.',
        participants: ['alice@example.com', 'bob@example.com'],
        participantBaseUrl: `${API_BASE}/participate`
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create meeting: ${errorText}`);
    }
    
    const meeting = await response.json();
    console.log('✅ Meeting created successfully!');
    console.log('📋 Meeting ID:', meeting.id);
    console.log('');
    
    // Display invitation links
    console.log('📧 Participant Invitation Links:');
    if (meeting.invitationLinks) {
      meeting.invitationLinks.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.email}: ${link.link}`);
      });
    }
    
    console.log('');
    console.log('🌐 URLs for Testing:');
    console.log('  Live View:', `${API_BASE}/m/${meeting.id}`);
    console.log('  Host Dashboard:', `${API_BASE}/host`);
    
    // Start the meeting
    console.log('');
    console.log('🚀 Starting the meeting...');
    const startResponse = await fetch(`${API_BASE}/api/meetings/${meeting.id}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (startResponse.ok) {
      console.log('✅ Meeting started successfully! AI personas are now active.');
    } else {
      console.log('⚠️ Meeting created but failed to start. You can start it manually from the host dashboard.');
    }
    
    return meeting;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAndTestMeeting();