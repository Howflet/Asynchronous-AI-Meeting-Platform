#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-webapp.azurewebsites.net';
const HOST_PASSWORD = '12345';

async function testWebApp() {
  try {
    console.log('🌐 Testing Azure Web App deployment...');
    console.log(`🔗 URL: ${API_BASE}`);
    console.log('');

    // Test health endpoint
    console.log('1. 🏥 Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status, healthResponse.statusText);
    }

    // Test authentication
    console.log('\n2. 🔐 Testing authentication...');
    const authResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: HOST_PASSWORD })
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authentication successful');
      
      // Test meeting creation with Gemini API
      console.log('\n3. 🤖 Testing meeting creation (requires Gemini API)...');
      const meetingResponse = await fetch(`${API_BASE}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          subject: 'Web App Test Meeting',
          details: 'Testing the Azure Web App deployment with Gemini API integration.',
          participants: ['test1@example.com', 'test2@example.com'],
          participantBaseUrl: `${API_BASE}/participate`
        })
      });
      
      if (meetingResponse.ok) {
        const meeting = await meetingResponse.json();
        console.log('✅ Meeting creation successful!');
        console.log('📋 Meeting ID:', meeting.id);
        console.log('🌐 Live View:', `${API_BASE}/m/${meeting.id}`);
        
        // Test meeting status to verify Gemini API is working
        console.log('\n4. 📊 Testing meeting status (AI personas should be created)...');
        const statusResponse = await fetch(`${API_BASE}/api/meetings/${meeting.id}/status`);
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('✅ Meeting status retrieved');
          console.log('🤖 AI Personas created:', statusData.personas?.length || 0);
          
          if (statusData.personas && statusData.personas.length > 0) {
            console.log('🎉 GEMINI API IS WORKING! Personas created:');
            statusData.personas.forEach((persona, i) => {
              console.log(`   ${i + 1}. ${persona.name} (${persona.role})`);
            });
          } else {
            console.log('⚠️ No personas created - Gemini API might not be working');
          }
        } else {
          console.log('❌ Failed to get meeting status:', statusResponse.status);
        }
        
      } else {
        const errorText = await meetingResponse.text();
        console.log('❌ Meeting creation failed:', meetingResponse.status, errorText);
      }
      
    } else {
      console.log('❌ Authentication failed:', authResponse.status, authResponse.statusText);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('Web App URL:', API_BASE);
    console.log('Test the app in your browser to see if the looping issue is resolved!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebApp();