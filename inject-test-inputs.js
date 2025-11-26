#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io';
const MEETING_ID = 'mtg_190d3781-78d1-4c93-823d-e2101a32744d';

// Test inputs to inject
const testInputs = [
  {
    message: "Hello everyone! I'm excited to be part of this meeting.",
    sender: "Alice Johnson"
  },
  {
    message: "Great to see everyone here. I have some ideas to share about our project.",
    sender: "Bob Smith"
  },
  {
    message: "I think we should focus on the user experience improvements first.",
    sender: "Carol Davis"
  },
  {
    message: "That's a good point, Carol. What specific areas do you think need attention?",
    sender: "David Wilson"
  },
  {
    message: "The navigation flow could be more intuitive, and we need better error handling.",
    sender: "Carol Davis"
  }
];

async function injectMessage(message, sender) {
  try {
    const response = await fetch(`${API_BASE}/api/meetings/${MEETING_ID}/inject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        author: sender
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to inject message: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Injected message from ${sender}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    return result;
  } catch (error) {
    console.error(`❌ Error injecting message from ${sender}:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting test input injection...');
  console.log(`📋 Meeting ID: ${MEETING_ID}`);
  console.log(`🌐 Live View: ${API_BASE}/m/${MEETING_ID}`);
  console.log('');

  for (let i = 0; i < testInputs.length; i++) {
    const { message, sender } = testInputs[i];
    
    console.log(`📝 Injecting message ${i + 1}/${testInputs.length}:`);
    await injectMessage(message, sender);
    
    // Wait 2 seconds between messages to see real-time updates
    if (i < testInputs.length - 1) {
      console.log('⏳ Waiting 3 seconds before next message...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('');
  console.log('✅ All test inputs injected successfully!');
  console.log('💡 Check the live view to see real-time updates via WebSocket');
  console.log(`🔗 Live View URL: ${API_BASE}/m/${MEETING_ID}`);
}

runTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});