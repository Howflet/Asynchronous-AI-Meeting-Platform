#!/usr/bin/env node

// Use built-in fetch for Node 18+
const fetch = globalThis.fetch;

const API_BASE = 'https://a2mp-app.ambitioussand-7984042f.eastus.azurecontainerapps.io';

// Test tokens from the created meeting
const PARTICIPANT_TOKENS = {
  'Alice': 'tok_1322e1e4-9e07-4ae9-b73c-3fb19c5b41cc',
  'Bob': 'tok_56a8bb1e-80bc-42e3-a88c-cfc97a626b62'
};

const MEETING_ID = 'mtg_e186f808-7663-4321-bacc-1635dd1f4acb';

// Test participant inputs
const participantInputs = [
  {
    token: PARTICIPANT_TOKENS.Alice,
    name: 'Alice',
    content: "I'm excited to discuss our project roadmap. I think we should prioritize user feedback integration."
  },
  {
    token: PARTICIPANT_TOKENS.Bob,
    name: 'Bob', 
    content: "Great suggestion Alice! I've been analyzing user data and have some insights to share about pain points."
  },
  {
    token: PARTICIPANT_TOKENS.Alice,
    name: 'Alice',
    content: "Bob, what are the main issues users are reporting? I'd love to hear your analysis."
  },
  {
    token: PARTICIPANT_TOKENS.Bob,
    name: 'Bob',
    content: "The top 3 issues are: 1) Navigation confusion, 2) Slow loading times, 3) Missing mobile features."
  }
];

async function submitParticipantInput(token, content, participantName) {
  try {
    const response = await fetch(`${API_BASE}/api/participant/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        content: content
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit input: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ ${participantName} submitted: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    return result;
  } catch (error) {
    console.error(`❌ Error submitting input from ${participantName}:`, error.message);
  }
}

async function injectParticipantMessage(token, message, participantName) {
  try {
    const response = await fetch(`${API_BASE}/api/participant/inject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to inject message: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`💬 ${participantName} sent message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    return result;
  } catch (error) {
    console.error(`❌ Error injecting message from ${participantName}:`, error.message);
  }
}

async function runParticipantTests() {
  console.log('🚀 Starting participant input tests...');
  console.log(`📋 Meeting ID: ${MEETING_ID}`);
  console.log(`🔗 Live View: ${API_BASE}/m/${MEETING_ID}`);
  console.log('');

  console.log('📝 Phase 1: Submitting participant inputs (formal responses)');
  for (let i = 0; i < participantInputs.length; i++) {
    const { token, name, content } = participantInputs[i];
    
    console.log(`\n${i + 1}. Submitting input from ${name}:`);
    await submitParticipantInput(token, content, name);
    
    // Wait 2 seconds between submissions
    if (i < participantInputs.length - 1) {
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n💬 Phase 2: Injecting real-time messages (chat-like interaction)');
  
  // Test real-time message injection
  const chatMessages = [
    { token: PARTICIPANT_TOKENS.Alice, name: 'Alice', message: "Should we schedule a follow-up meeting to dive deeper into these issues?" },
    { token: PARTICIPANT_TOKENS.Bob, name: 'Bob', message: "Yes, I can prepare a detailed report with user feedback examples." }
  ];

  for (let i = 0; i < chatMessages.length; i++) {
    const { token, name, message } = chatMessages[i];
    
    console.log(`\n${i + 1}. ${name} sending real-time message:`);
    await injectParticipantMessage(token, message, name);
    
    if (i < chatMessages.length - 1) {
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n✅ All participant tests completed!');
  console.log('🎯 Check the live view and participant pages to see real-time updates');
  console.log('\n📱 Participant Pages:');
  Object.entries(PARTICIPANT_TOKENS).forEach(([name, token]) => {
    console.log(`  ${name}: ${API_BASE}/participate/${token}`);
  });
  console.log(`\n🌐 Live View: ${API_BASE}/m/${MEETING_ID}`);
}

runParticipantTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});