#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io';
const HOST_PASSWORD = '12345';
const MEETING_ID = 'mtg_190d3781-78d1-4c93-823d-e2101a32744d';

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

async function startMeeting() {
  try {
    const token = await getAuthToken();
    
    console.log('🚀 Starting the meeting...');
    const response = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start meeting: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Meeting started successfully!');
    console.log('🤖 AI personas should now be active and generating responses');
    console.log(`🔗 Live View URL: ${API_BASE}/m/${MEETING_ID}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error starting meeting:', error.message);
    process.exit(1);
  }
}

startMeeting();