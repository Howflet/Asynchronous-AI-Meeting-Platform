#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:4000';
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
        participantBaseUrl: 'http://localhost:3000/participate'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create meeting: ${response.statusText}`);
    }
    
    const meeting = await response.json();
    console.log('✅ Meeting created successfully!');
    console.log('📋 Meeting ID:', meeting.id);
    console.log('🌐 Live View URL:', `http://localhost:3000/m/${meeting.id}`);
    console.log('🎯 Host Dashboard:', 'http://localhost:3000/host');
    
    return meeting;
  } catch (error) {
    console.error('❌ Error creating meeting:', error.message);
    process.exit(1);
  }
}

createMeeting();