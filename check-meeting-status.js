#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io';
const MEETING_ID = 'mtg_190d3781-78d1-4c93-823d-e2101a32744d';

async function checkMeetingStatus() {
  try {
    console.log('🔍 Checking meeting status...');
    const response = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get meeting status: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📋 Meeting Status:');
    console.log('  ID:', data.meeting.id);
    console.log('  Subject:', data.meeting.subject);
    console.log('  Status:', data.meeting.status);
    console.log('  Created:', new Date(data.meeting.createdAt).toLocaleString());
    
    if (data.meeting.startedAt) {
      console.log('  Started:', new Date(data.meeting.startedAt).toLocaleString());
    }
    
    console.log('');
    console.log('💬 Conversation Messages:', data.conversation.length);
    
    if (data.conversation.length > 0) {
      console.log('  Recent messages:');
      data.conversation.slice(-3).forEach((msg, i) => {
        const content = msg.content || msg.message || 'No content';
        console.log(`    ${i + 1}. [${msg.author}]: ${content.substring(0, 60)}${content.length > 60 ? '...' : ''}`);
      });
    }
    
    console.log('');
    console.log('🤖 AI Personas:', data.personas.length);
    data.personas.forEach((persona, i) => {
      console.log(`  ${i + 1}. ${persona.name} (${persona.role})`);
    });
    
    console.log('');
    console.log(`🔗 Live View: ${API_BASE}/m/${MEETING_ID}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error checking meeting status:', error.message);
    process.exit(1);
  }
}

checkMeetingStatus();