const Database = require('./backend/node_modules/better-sqlite3');
const crypto = require('crypto');

const db = new Database('./backend/backend/data/a2mp.db');

// Generate unique IDs
const meetingId = `mtg_${crypto.randomUUID()}`;
const now = Date.now();

console.log('Creating CRM vendor decision test meeting...');
console.log('Meeting ID:', meetingId);

// Create meeting
db.prepare(`
  INSERT INTO meetings (id, subject, details, createdAt, status, whiteboard)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  meetingId,
  'Final Decision: New CRM Vendor (Project Titan)',
  'Team, our legacy CRM contract expires in 60 days. We MUST select its replacement this week. After the last round of demos, we have narrowed it down to two finalists: "OmniCloud": Expensive, amazing features, but complex integration. "SalesBase": Cheaper, very secure, but lacks many of the advanced AI features. I need each of you to bring your final, decisive input. Samir, I need the final security and integration analysis. Tina, I need the hard TCO (Total Cost of Ownership) numbers. Frank, I need the usability and feature feedback from your sales team. Liam, I need the final legal/compliance redlines. The goal of this meeting is to pick one of these two. We are not re-opening the search.',
  now,
  'running',
  JSON.stringify({
    keyFacts: [],
    decisions: [],
    actionItems: []
  })
);

// Create participants with conflicting inputs
const participants = [
  { 
    email: 'samir.i@test.com', 
    input: 'My team recommendation is **SalesBase**. The security architecture is superior, and it integrates directly with our existing single sign-on (SSO) and data warehousing. "OmniCloud" is a black box; their integration relies on a third-party API we would have to pay for and maintain, and their security compliance documents are vague. SalesBase is the safe, stable, and supportable choice from an IT perspective.' 
  },
  { 
    email: 'tina.f@test.com', 
    input: 'I have run the 5-year Total Cost of Ownership models. **SalesBase** is the clear winner. It is 40% cheaper on licensing alone. Furthermore, "OmniCloud" has a complex, per-seat pricing model and requires a $50k "Integration Fee" that Samir mentioned. "SalesBase" has a simple, flat-rate enterprise license. From a purely fiscal standpoint, SalesBase is the responsible choice. OmniCloud high cost will require me to find cuts in other departmental budgets.' 
  },
  { 
    email: 'frank.u@test.com', 
    input: 'My entire team is demanding **OmniCloud**. It is the only tool that can actually help us sell more. Its AI-driven "Lead Scoring" and "Next Best Action" features are what our competitors are already using. "SalesBase" is just a digital rolodex; it is the same old tech we have now. Choosing SalesBase will kill my team morale and put us at a competitive disadvantage. The extra cost of OmniCloud will be paid for by the first major deal its AI helps us close. We need the best tool, not the cheapest one.' 
  },
  { 
    email: 'liam.l@test.com', 
    input: 'Both vendors are problematic, but one is a clear "no-go." **OmniCloud** stores all customer data on US-based servers, which violates GDPR for our European clients. Their contract also has an "auto-renew" clause with a 30% price hike that is unacceptable. **SalesBase** has agreed to data residency in our EU data center and their contract terms are clean. I cannot approve OmniCloud as-is, and the required contract changes would take months of negotiation we do not have.' 
  }
];

participants.forEach(p => {
  const participantId = `prt_${crypto.randomUUID()}`;
  const token = `tkn_${crypto.randomUUID()}`;
  
  // Create participant
  db.prepare(`
    INSERT INTO participants (id, meetingId, email, token, hasSubmitted, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(participantId, meetingId, p.email, token, 1, now);
  
  // Create participant input
  db.prepare(`
    INSERT INTO participant_inputs (id, participantId, content, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(`inp_${crypto.randomUUID()}`, participantId, p.input, now);
  
  console.log(`Added participant: ${p.email}`);
});

console.log('\n=== Test Meeting Created ===');
console.log('Meeting ID:', meetingId);
console.log('Subject: Final Decision: New CRM Vendor (Project Titan)');
console.log('Participants: 4 (all with conflicting inputs submitted)');
console.log('Status: running');
console.log('\nVendor Preferences:');
console.log('  - Samir (IT): SalesBase (security)');
console.log('  - Tina (Finance): SalesBase (cost)');
console.log('  - Frank (Sales): OmniCloud (features)');  
console.log('  - Liam (Legal): SalesBase (GDPR)');
console.log('\n3 favor SalesBase, 1 favors OmniCloud - should create good debate!');
console.log('\nWith the updated repetition detection, this should run 10+ turns.');
console.log('\nMonitor progress:');
console.log(`  node check-conversation.js ${meetingId}`);

db.close();