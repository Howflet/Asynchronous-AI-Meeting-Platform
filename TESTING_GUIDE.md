# A²MP Testing Guide - Bug Discovery Test Cases

## Overview
This guide provides comprehensive test cases to systematically test the Asynchronous AI Meeting Platform and identify potential bugs. Tests are organized by priority and functional area.

---

## 🚀 Quick Start - Critical Path Tests

Run these first to verify core functionality:

### Test 1: Basic 3-Participant Meeting Flow
**Priority:** CRITICAL  
**Time:** 10-15 minutes  
**Objective:** End-to-end happy path

**Steps:**
1. Clear database: `node clear-all-data.js`
2. Open http://localhost:5173
3. Host a meeting:
   - Password: `12345`
   - Subject: "Q4 Budget Allocation"
   - Details: "Decide how to allocate remaining $50K budget across departments"
4. Add 3 participants:
   - `alice@test.com`: "Marketing needs $25K for campaign"
   - `bob@test.com`: "Engineering needs $30K for infrastructure"
   - `carol@test.com`: "HR needs $20K for training programs"
5. Click "Start Meeting"
6. Monitor conversation: `node check-conversation.js <meeting-id>`
7. Wait for completion (up to 25 turns)
8. Check report: `node check-report.js <meeting-id>`

**Expected:**
- ✅ 3 personas generated
- ✅ Conversation progresses smoothly
- ✅ Meeting concludes (max 25 turns)
- ✅ Final report generated
- ✅ No errors in backend

**Common Bugs:**
- Persona generation fails
- Meeting stuck in "waiting" or "running"
- No report generated
- Rate limit errors

---

### Test 2: Host Human Interjection
**Priority:** CRITICAL  
**Time:** 5 minutes  
**Objective:** Verify host can guide conversation

**Steps:**
1. Create meeting (same as Test 1)
2. Wait for 5-7 conversation turns
3. As host, inject message: "New constraint: Budget cut by 20%"
4. Verify personas acknowledge the change

**Expected:**
- ✅ Message labeled "Human:Host"
- ✅ Meeting auto-resumes if paused
- ✅ All personas adapt to new constraint
- ✅ Conversation continues

**Common Bugs:**
- Message attributed to AI persona
- Meeting doesn't resume
- Personas ignore human input
- Stale email state issue

---

### Test 3: 25-Turn Auto-Conclusion
**Priority:** HIGH  
**Time:** 15-20 minutes  
**Objective:** Verify max turns limit works

**Steps:**
1. Create meeting with complex, debatable topic:
   - Subject: "Best Programming Language for Microservices"
   - 3 participants advocating different languages
2. Do NOT inject any human input
3. Let conversation run naturally
4. Monitor turn count

**Expected:**
- ✅ Meeting runs exactly 25 turns
- ✅ Auto-concludes at turn 25
- ✅ Status changes to "completed"
- ✅ Report generated even if no consensus

**Common Bugs:**
- Meeting exceeds 25 turns
- Gets stuck before 25 turns
- Conclusion logic fails
- Report not generated

---

## 🎯 Feature-Specific Tests

### Human Interjection System

#### Test 4: Participant Injection via Link
**Priority:** HIGH  
**Objective:** Test participant input mechanism

**Steps:**
1. Create meeting, get participant token from email logs
2. Open participant link: `http://localhost:5173/p?token=<token>`
3. Wait for meeting to auto-pause (moderator triggers)
4. Enter participant name and message
5. Submit input

**Expected:**
- ✅ Message labeled "Human:[Name]"
- ✅ Email captured correctly
- ✅ Meeting resumes automatically

**Bugs to Watch:**
- Email not saved
- Attribution fails
- Meeting doesn't resume
- Participant name not displayed

---

#### Test 5: Rapid Concurrent Injections
**Priority:** MEDIUM  
**Objective:** Test race condition handling

**Steps:**
1. Have meeting running
2. Open 2 browser windows (host + participant)
3. Inject messages from both within 1 second
4. Check if both recorded

**Expected:**
- ✅ Both messages saved
- ✅ No duplicate turns
- ✅ Meeting lock prevents conflicts

**Bugs to Watch:**
- Lost messages
- Database errors
- Duplicate processing
- Meeting lock failure

---

### Conversation Quality

#### Test 6: Repetition Detection
**Priority:** HIGH  
**Objective:** Verify auto-pause on circular discussion

**Steps:**
1. Create meeting with inherently circular topic:
   - "Should we prioritize speed or quality?"
2. Monitor for repetition

**Expected:**
- ✅ System detects repeated arguments
- ✅ Auto-pauses for human input
- ✅ Moderator explains why paused

**Bugs to Watch:**
- False positives (pauses too early)
- False negatives (allows endless repetition)
- Threshold misconfigured

---

#### Test 7: Adversarial Persona Behavior
**Priority:** MEDIUM  
**Objective:** Test conflict resolution

**Steps:**
1. Create 3 participants with opposing views:
   - "Cost is the only priority"
   - "Quality is the only priority"  
   - "Speed is the only priority"
2. Monitor if they find common ground

**Expected:**
- ✅ Moderator facilitates compromise
- ✅ Personas acknowledge trade-offs
- ✅ Reaches conclusion or documents disagreement

**Bugs to Watch:**
- Personas too adversarial
- Circular arguing
- Moderator can't break deadlock

---

### Rate Limiting & Quota

#### Test 8: Burst Prevention
**Priority:** HIGH  
**Objective:** Verify 4-second spacing works

**Steps:**
1. Monitor backend logs
2. Create meeting and watch for "Burst prevention" messages
3. Verify requests spaced appropriately

**Expected:**
- ✅ Min 4 seconds between API calls
- ✅ No 429 errors from Gemini
- ✅ Rate limiter queue processes smoothly

**Bugs to Watch:**
- Burst limits exceeded
- Queue deadlock
- Timing drift

---

#### Test 9: Quota Exhaustion Handling
**Priority:** MEDIUM  
**Objective:** Test graceful degradation

**Steps:**
1. (Only if safe) Run until quota exhausted
2. Verify error handling

**Expected:**
- ✅ Clear error messages
- ✅ Meetings pause gracefully
- ✅ System recovers after quota reset

**Bugs to Watch:**
- System crashes
- Infinite retries
- Meetings stuck in "running"

---

### Edge Cases

#### Test 10: Empty/Invalid Input
**Priority:** MEDIUM  
**Objective:** Test input validation

**Steps:**
1. Try submitting blank participant input
2. Try only whitespace
3. Try extremely long input (10,000+ chars)

**Expected:**
- ✅ Validation prevents submission OR
- ✅ Backend rejects gracefully

**Bugs to Watch:**
- Empty persona created
- System crash
- Database errors

---

#### Test 11: Special Characters & Injection
**Priority:** HIGH (Security)  
**Objective:** Test SQL/XSS protection

**Steps:**
1. Submit input with SQL: `'; DROP TABLE meetings; --`
2. Submit XSS: `<script>alert('XSS')</script>`
3. Submit Unicode: 🚀 ñ 中文 مرحبا

**Expected:**
- ✅ All stored safely
- ✅ No SQL execution
- ✅ No script execution
- ✅ Unicode displays correctly

**Bugs to Watch:**
- SQL injection vulnerability
- XSS vulnerability
- Unicode corruption

---

#### Test 12: Browser Refresh Mid-Meeting
**Priority:** MEDIUM  
**Objective:** Test state recovery

**Steps:**
1. Open meeting as host
2. Let conversation progress
3. Hard refresh (Ctrl+Shift+R)

**Expected:**
- ✅ Full history loads
- ✅ Status correct
- ✅ Can continue interacting

**Bugs to Watch:**
- State loss
- Stale data
- SSE not reconnecting

---

#### Test 13: Network Interruption
**Priority:** LOW  
**Objective:** Test connectivity resilience

**Steps:**
1. Start meeting
2. Disconnect internet for 30 seconds
3. Reconnect

**Expected:**
- ✅ Frontend shows error
- ✅ Auto-reconnects
- ✅ Meeting resumes

**Bugs to Watch:**
- Stuck loading
- Lost data
- SSE dead

---

### Performance & Scale

#### Test 14: Large Meeting (6+ Participants)
**Priority:** MEDIUM  
**Objective:** Test scalability

**Steps:**
1. Create meeting with 6-7 participants
2. Monitor performance

**Expected:**
- ✅ All personas generate
- ✅ Conversation manageable
- ✅ Completes within reasonable time

**Bugs to Watch:**
- Slow persona generation
- Chaotic conversation
- Token limits exceeded
- Never concludes

---

#### Test 15: Concurrent Meetings
**Priority:** MEDIUM  
**Objective:** Test parallel processing

**Steps:**
1. Create 3 meetings quickly
2. Let all run simultaneously

**Expected:**
- ✅ All progress independently
- ✅ No interference
- ✅ Rate limiter handles queue

**Bugs to Watch:**
- Meeting locks conflict
- Rate limiter bottleneck
- Memory leaks

---

### Report Generation

#### Test 16: Report Accuracy
**Priority:** HIGH  
**Objective:** Verify report quality

**Steps:**
1. Complete meeting with clear decisions
2. Review report
3. Compare with conversation

**Expected:**
- ✅ Accurate summary
- ✅ All decisions captured
- ✅ Actionable action items
- ✅ Sensible visual map

**Bugs to Watch:**
- Missing decisions
- Hallucinated info
- Poor summarization
- JSON parsing errors

---

#### Test 17: Duplicate Report Prevention
**Priority:** MEDIUM  
**Objective:** Ensure single report per meeting

**Steps:**
1. Monitor database after conclusion
2. Check for duplicate reports

**Expected:**
- ✅ Exactly one report
- ✅ Generated within 30 seconds

**Bugs to Watch:**
- Multiple reports
- No report
- Race condition

---

### Authentication & Security

#### Test 18: Invalid Host Password
**Priority:** HIGH  
**Objective:** Test auth

**Steps:**
1. Try wrong password

**Expected:**
- ✅ Access denied
- ✅ Clear error

**Bugs to Watch:**
- Weak validation
- Bypass possible

---

#### Test 19: Invalid Participant Token
**Priority:** HIGH  
**Objective:** Test token security

**Steps:**
1. Try invalid token in URL
2. Try injecting with wrong token

**Expected:**
- ✅ Access denied
- ✅ No data leakage

**Bugs to Watch:**
- Token not validated
- Unauthorized access

---

## 📊 Automated Testing Scripts

### Quick Check Script
```javascript
// quick-test.js - Run basic health check
const tests = [
  'database-connection',
  'api-keys-valid',
  'frontend-backend-connection',
  'rate-limiter-status'
];
// Implement checks for each
```

### Stress Test Script
```javascript
// stress-test.js - Create multiple meetings
// Monitor for errors, quota, performance
```

---

## 🐛 Bug Reporting Template

When you find a bug, document:

```markdown
### Bug: [Short Description]
**Severity:** Critical / High / Medium / Low
**Test Case:** Test #X
**Date:** YYYY-MM-DD

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Evidence:**
- Meeting ID: mtg_xxxxx
- Backend logs: [paste relevant logs]
- Browser console: [paste errors]
- Screenshots: [if applicable]

**Database State:**
```sql
SELECT * FROM meetings WHERE id = 'mtg_xxxxx';
```

**Workaround:**
If known

**Fix Ideas:**
Potential solutions
```

---

## 📝 Testing Checklist

### Before Starting
- [ ] Database cleared: `node clear-all-data.js`
- [ ] Backend running: `npm run dev` in `/backend`
- [ ] Frontend running: `npm run dev` in `/frontend`
- [ ] Check quota: Verify both API keys have headroom

### Critical Path (Run First)
- [ ] Test 1: Basic 3-participant flow
- [ ] Test 2: Host interjection
- [ ] Test 3: 25-turn limit

### Core Features
- [ ] Test 4: Participant injection
- [ ] Test 6: Repetition detection
- [ ] Test 16: Report accuracy

### Edge Cases
- [ ] Test 11: Special characters
- [ ] Test 12: Browser refresh
- [ ] Test 18-19: Security tests

### Performance
- [ ] Test 14: Large meeting
- [ ] Test 15: Concurrent meetings

---

## 🎯 Known Issues to Watch

Based on development history:
- ⚠️ **Race conditions** with concurrent injections
- ⚠️ **Rate limiting** false positives (now fixed with 15 RPM)
- ⚠️ **Attribution** issues (AI vs Human labels)
- ⚠️ **Auto-resume** after pause
- ⚠️ **Repetition detection** sensitivity
- ⚠️ **Quota exhaustion** on moderator key (now using shared key)
- ⚠️ **Meeting locks** potentially stuck

---

## 🔧 Useful Commands

```bash
# Database operations
node clear-all-data.js           # Clear everything
node list-meetings.js            # List all meetings
node check-conversation.js <id>  # View conversation
node check-report.js <id>        # View report
node view-personas.js <id>       # View personas
node view-inputs.js <id>         # View inputs

# API checks
node check-quota.js              # Check quota status

# Create test meeting
node create-test-meeting.js      # Auto-create with test data
```

---

## 📈 Success Metrics

Good testing session if you:
- ✅ Complete all critical path tests
- ✅ Find and document at least 3 bugs
- ✅ Verify all major features work
- ✅ Test at least 2 edge cases
- ✅ Run one performance test

---

**Happy bug hunting! 🐛🔍**
