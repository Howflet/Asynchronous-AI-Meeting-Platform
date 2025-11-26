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

async function createMeeting() {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Test Meeting - End Button Demo',
        details: 'This is a test meeting to demonstrate the new End Meeting button functionality.',
        participants: ['test@example.com', 'demo@example.com'],
        participantBaseUrl: 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io/participate'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create meeting: ${response.statusText}`);
    }
    
    const meeting = await response.json();
    console.log('✅ Meeting created successfully!');
    console.log('📋 Meeting ID:', meeting.id);
    console.log('🌐 Live View URL:', `https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io/m/${meeting.id}`);
    console.log('🎯 Host Dashboard:', 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io/host');
    
    return meeting;
  } catch (error) {
    console.error('❌ Error creating meeting:', error.message);
    process.exit(1);
  }
}

createMeeting();