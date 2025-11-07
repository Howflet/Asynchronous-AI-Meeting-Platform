const Database = require('./backend/node_modules/better-sqlite3');const Database = require('./backend/node_modules/better-sqlite3');const Database = require('./backend/node_modules/better-sqlite3');

const crypto = require('crypto');

const crypto = require('crypto');const crypto = require('crypto');

const db = new Database('./backend/backend/data/a2mp.db');



// Generate IDs

const meetingId = 'mtg_' + crypto.randomUUID();const db = new Database('./backend/backend/data/a2mp.db');const db = new Database('./backend/backend/data/a2mp.db');

const now = Date.now();



console.log('Creating CRM vendor decision test meeting...');

// Generate IDs// Generate IDs

// Initialize whiteboard

const whiteboard = {const meetingId = 'mtg_' + crypto.randomUUID();const meetingId = 'mtg_' + crypto.randomUUID();

  keyFacts: [],

  decisions: [],const now = Date.now();const now = Date.now();

  actionItems: []

};



// Create meeting with CRM vendor decision scenarioconsole.log('Creating CRM vendor decision test meeting...');console.log('Creating test meeting...');

db.prepare(`

  INSERT INTO meetings (id, subject, details, createdAt, status, whiteboard)

  VALUES (?, ?, ?, ?, ?, ?)

`).run(// Initialize whiteboard// Initialize whiteboard

  meetingId,

  'Final Decision: New CRM Vendor (Project Titan)',const whiteboard = {const whiteboard = {

  `Team, our legacy CRM contract expires in 60 days. We MUST select its replacement this week. After the last round of demos, we have narrowed it down to two finalists:

"OmniCloud": Expensive, amazing features, but complex integration.  keyFacts: [],  keyFacts: [],

"SalesBase": Cheaper, very secure, but lacks many of the advanced AI features.

I need each of you to bring your final, decisive input. Samir, I need the final security and integration analysis. Tina, I need the hard TCO (Total Cost of Ownership) numbers. Frank, I need the usability and feature feedback from your sales team. Liam, I need the final legal/compliance redlines.  decisions: [],  decisions: [],

The goal of this meeting is to pick one of these two. We are not re-opening the search.`,

  now,  actionItems: []  actionItems: []

  'running',

  JSON.stringify(whiteboard)};};

);



console.log(`Meeting created: ${meetingId}`);

// Create meeting with CRM vendor decision scenario// Create meeting

// Add participants with conflicting CRM vendor preferences

const participants = [db.prepare(`db.prepare(`

  {

    name: 'Samir I. (IT & Security)',  INSERT INTO meetings (id, subject, details, createdAt, status, whiteboard)  INSERT INTO meetings (id, subject, details, createdAt, status, whiteboard)

    email: 'samir.i@test.com',

    input: 'My team recommendation is **SalesBase**. The security architecture is superior, and it integrates directly with our existing single sign-on (SSO) and data warehousing. "OmniCloud" is a black box; their integration relies on a third-party API we would have to pay for and maintain, and their security compliance documents are vague. SalesBase is the safe, stable, and supportable choice from an IT perspective.'  VALUES (?, ?, ?, ?, ?, ?)  VALUES (?, ?, ?, ?, ?, ?)

  },

  {`).run(`).run(

    name: 'Tina F. (Finance)',

    email: 'tina.f@test.com',  meetingId,  meetingId,

    input: 'I have run the 5-year Total Cost of Ownership models. **SalesBase** is the clear winner. It is 40% cheaper on licensing alone. Furthermore, "OmniCloud" has a complex, per-seat pricing model and requires a $50k "Integration Fee" that Samir mentioned. "SalesBase" has a simple, flat-rate enterprise license. From a purely fiscal standpoint, SalesBase is the responsible choice. OmniCloud high cost will require me to find cuts in other departmental budgets.'

  },  'Final Decision: New CRM Vendor (Project Titan)',  'Product Roadmap Priorities for Q1 2026',

  {

    name: 'Frank U. (Head of Sales)',  `Team, our legacy CRM contract expires in 60 days. We MUST select its replacement this week. After the last round of demos, we have narrowed it down to two finalists:  'We need to decide which features to prioritize given limited engineering resources. Consider user feedback, market trends, technical feasibility, and business impact.',

    email: 'frank.u@test.com',

    input: 'My entire team is demanding **OmniCloud**. It is the only tool that can actually help us sell more. Its AI-driven "Lead Scoring" and "Next Best Action" features are what our competitors are already using. "SalesBase" is just a digital rolodex; it is the same old tech we have now. Choosing SalesBase will kill my team morale and put us at a competitive disadvantage. The extra cost of OmniCloud will be paid for by the first major deal its AI helps us close. We need the best tool, not the cheapest one.'"OmniCloud": Expensive, amazing features, but complex integration.  now,

  },

  {"SalesBase": Cheaper, very secure, but lacks many of the advanced AI features.  'running',

    name: 'Liam L. (Legal & Compliance)',

    email: 'liam.l@test.com',I need each of you to bring your final, decisive input. Samir, I need the final security and integration analysis. Tina, I need the hard TCO (Total Cost of Ownership) numbers. Frank, I need the usability and feature feedback from your sales team. Liam, I need the final legal/compliance redlines.  JSON.stringify(whiteboard)

    input: 'Both vendors are problematic, but one is a clear "no-go." **OmniCloud** stores all customer data on US-based servers, which violates GDPR for our European clients. Their contract also has an "auto-renew" clause with a 30% price hike that is unacceptable. **SalesBase** has agreed to data residency in our EU data center and their contract terms are clean. I cannot approve OmniCloud as-is, and the required contract changes would take months of negotiation we do not have.'

  }The goal of this meeting is to pick one of these two. We are not re-opening the search.`,);

];

  now,

participants.forEach(p => {

  const participantId = 'prt_' + crypto.randomUUID();  'running',console.log(`✓ Meeting created: ${meetingId}`);

  const token = crypto.randomUUID();

    JSON.stringify(whiteboard)

  // Add participant

  db.prepare(`);// Add participants with diverse inputs

    INSERT INTO participants (id, meetingId, email, token, hasSubmitted, createdAt)

    VALUES (?, ?, ?, ?, ?, ?)const participants = [

  `).run(participantId, meetingId, p.email, token, 1, now);

  console.log(`✓ Meeting created: ${meetingId}`);  {

  // Add participant input

  db.prepare(`    name: 'Alice Chen',

    INSERT INTO participant_inputs (id, participantId, content, createdAt)

    VALUES (?, ?, ?, ?)// Add participants with conflicting CRM vendor preferences    email: 'alice@example.com',

  `).run('inp_' + crypto.randomUUID(), participantId, p.input, now);

  const participants = [    input: 'I think we should prioritize the mobile app redesign. Our mobile users make up 65% of our traffic but have the lowest engagement rates. User feedback consistently mentions the app feels outdated and clunky.'

  console.log(`Added participant: ${p.name} (${p.email})`);

});  {  },



console.log('\nCRM vendor decision test meeting created!');    name: 'Samir I. (IT & Security)',  {

console.log(`Meeting ID: ${meetingId}`);

console.log('Subject: Final Decision: New CRM Vendor (Project Titan)');    email: 'samir.i@test.com',    name: 'Bob Martinez',

console.log('Participants: 4 with conflicting vendor preferences');

console.log('Status: running');    input: 'My team\'s recommendation is **SalesBase**. The security architecture is superior, and it integrates directly with our existing single sign-on (SSO) and data warehousing. "OmniCloud" is a black box; their integration relies on a third-party API we would have to pay for and maintain, and their security compliance documents are vague. SalesBase is the safe, stable, and supportable choice from an IT perspective.'    email: 'bob@example.com',

console.log('\nVendor Preferences:');

console.log('  - Samir (IT): **SalesBase** (security & integration)');  },    input: 'From an engineering perspective, I believe we need to focus on API performance improvements. Our backend is struggling with scale, and fixing this foundation will enable all future features. Plus, it\'s blocking the mobile team.'

console.log('  - Tina (Finance): **SalesBase** (40% cheaper)');

console.log('  - Frank (Sales): **OmniCloud** (AI features)');    {  },

console.log('  - Liam (Legal): **SalesBase** (GDPR compliance)');

console.log('\nConflict: 3 for SalesBase, 1 for OmniCloud');    name: 'Tina F. (Finance)',  {

console.log('\nThe meeting should now run longer than 3 turns with the updated repetition detection.');

console.log('\nMonitor progress with:');    email: 'tina.f@test.com',    name: 'Carol Johnson',

console.log(`  node check-conversation.js ${meetingId}`);

    input: 'I have run the 5-year Total Cost of Ownership models. **SalesBase** is the clear winner. It\'s 40% cheaper on licensing alone. Furthermore, "OmniCloud" has a complex, per-seat pricing model and requires a $50k "Integration Fee" that Samir mentioned. "SalesBase" has a simple, flat-rate enterprise license. From a purely fiscal standstand, SalesBase is the responsible choice. OmniCloud\'s high cost will require me to find cuts in other departmental budgets.'    email: 'carol@example.com',

db.close();
  },    input: 'The customer success team is overwhelmed with requests for better analytics and reporting tools. Enterprise clients are threatening to churn without this. It\'s a revenue retention issue that needs immediate attention.'

  {  }

    name: 'Frank U. (Head of Sales)',];

    email: 'frank.u@test.com',

    input: 'My entire team is demanding **OmniCloud**. It is the only tool that can actually help us sell more. Its AI-driven "Lead Scoring" and "Next Best Action" features are what our competitors are already using. "SalesBase" is just a digital rolodex; it\'s the same old tech we have now. Choosing SalesBase will kill my team\'s morale and put us at a competitive disadvantage. The extra cost of OmniCloud will be paid for by the first major deal its AI helps us close. We need the best tool, not the cheapest one.'participants.forEach(p => {

  },  const participantId = 'prt_' + crypto.randomUUID();

  {  const token = crypto.randomUUID();

    name: 'Liam L. (Legal & Compliance)',  

    email: 'liam.l@test.com',  // Add participant

    input: 'Both vendors are problematic, but one is a clear "no-go." **OmniCloud** stores all customer data on US-based servers, which violates GDPR for our European clients. Their contract also has an "auto-renew" clause with a 30% price hike that is unacceptable. **SalesBase** has agreed to data residency in our EU data center and their contract terms are clean. I cannot approve OmniCloud as-is, and the required contract changes would take months of negotiation we don\'t have.'  db.prepare(`

  }    INSERT INTO participants (id, meetingId, email, token, hasSubmitted, createdAt)

];    VALUES (?, ?, ?, ?, ?, ?)

  `).run(participantId, meetingId, p.email, token, 1, now);

participants.forEach(p => {  

  const participantId = 'prt_' + crypto.randomUUID();  // Add participant input

  const token = crypto.randomUUID();  db.prepare(`

      INSERT INTO participant_inputs (id, participantId, content, createdAt)

  // Add participant    VALUES (?, ?, ?, ?)

  db.prepare(`  `).run('inp_' + crypto.randomUUID(), participantId, p.input, now);

    INSERT INTO participants (id, meetingId, email, token, hasSubmitted, createdAt)  

    VALUES (?, ?, ?, ?, ?, ?)  console.log(`✓ Added participant: ${p.name} (${p.email})`);

  `).run(participantId, meetingId, p.email, token, 1, now);});

  

  // Add participant input// Add personas (moderator + 3 participant personas)

  db.prepare(`console.log('\nGenerating personas...');

    INSERT INTO participant_inputs (id, participantId, content, createdAt)

    VALUES (?, ?, ?, ?)// Moderator

  `).run('inp_' + crypto.randomUUID(), participantId, p.input, now);const moderatorId = 'per_' + crypto.randomUUID();

  const moderatorMCP = {

  console.log(`✓ Added participant: ${p.name} (${p.email})`);  goal: 'Facilitate a productive discussion about Q1 2026 product roadmap priorities',

});  context: 'Engineering resources are limited. Need to balance user feedback, market trends, and technical feasibility.',

  constraints: ['Ensure all perspectives are heard', 'Drive toward actionable decisions', 'Identify conflicts and areas of agreement']

console.log('\n✅ CRM vendor decision test meeting created!');};

console.log(`\nMeeting ID: ${meetingId}`);

console.log('Subject: Final Decision: New CRM Vendor (Project Titan)');db.prepare(`

console.log('Participants: 4 with conflicting vendor preferences');  INSERT INTO personas (id, meetingId, participantId, role, name, mcp, createdAt)

console.log('Status: running');  VALUES (?, ?, ?, ?, ?, ?, ?)

console.log('\nVendor Preferences:');`).run(moderatorId, meetingId, null, 'moderator', 'Moderator', JSON.stringify(moderatorMCP), now);

console.log('  - Samir (IT): **SalesBase** (security & integration)');

console.log('  - Tina (Finance): **SalesBase** (40% cheaper)');console.log('✓ Added Moderator');

console.log('  - Frank (Sales): **OmniCloud** (AI features)');  

console.log('  - Liam (Legal): **SalesBase** (GDPR compliance)');// Participant personas

console.log('\nConflict: 3 for SalesBase, 1 for OmniCloud');const personaData = [

console.log('\nThe meeting should now run longer than 3 turns with the updated repetition detection.');  {

console.log('\nMonitor progress with:');    participantId: participants[0].email,  // Alice

console.log(`  node check-conversation.js ${meetingId}`);    name: 'Alex Rivera',

    mcp: {

db.close();      goal: 'Advocate for mobile app redesign to improve engagement',
      context: 'Mobile users are 65% of traffic but have lowest engagement. App feedback is consistently negative.',
      constraints: ['Must show ROI', 'Need to address user pain points', 'Consider development timeline']
    }
  },
  {
    participantId: participants[1].email,  // Bob
    name: 'Morgan Chen',
    mcp: {
      goal: 'Push for API performance improvements as foundation',
      context: 'Backend scalability issues blocking multiple teams. Technical debt accumulating.',
      constraints: ['Engineering capacity is limited', 'Must consider long-term impact', 'Need to unblock other features']
    }
  },
  {
    participantId: participants[2].email,  // Carol
    name: 'Jordan Lee',
    mcp: {
      goal: 'Prioritize analytics and reporting for enterprise retention',
      context: 'Enterprise clients threatening to churn. Customer success team overwhelmed with requests.',
      constraints: ['Revenue retention is critical', 'Must deliver quickly', 'Enterprise requirements are complex']
    }
  }
];

// Find participant IDs
const participantIds = participants.map(p => {
  const participant = db.prepare('SELECT id FROM participants WHERE meetingId = ? AND email = ?')
    .get(meetingId, p.email);
  return participant;
});

personaData.forEach((pd, i) => {
  const personaId = 'per_' + crypto.randomUUID();
  db.prepare(`
    INSERT INTO personas (id, meetingId, participantId, role, name, mcp, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(personaId, meetingId, participantIds[i].id, 'persona', pd.name, JSON.stringify(pd.mcp), now);
  console.log(`✓ Added persona: ${pd.name}`);
});

console.log('\n✅ Test meeting created successfully!');
console.log(`\nMeeting ID: ${meetingId}`);
console.log('Subject: Product Roadmap Priorities for Q1 2026');
console.log('Participants: 3');
console.log('Status: waiting (personas will be generated)');
console.log('\nThe backend will automatically:');
console.log('1. Generate 3 AI personas based on participant inputs');
console.log('2. Start the meeting when all personas are ready');
console.log('3. Run up to 25 conversation turns');
console.log('\nMonitor progress with:');
console.log(`  node check-conversation.js ${meetingId}`);

db.close();
