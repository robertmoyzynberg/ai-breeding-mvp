# 🧪 Full Flow Testing Guide

## Overview
This document provides comprehensive test routines to validate all features of the AI Breeding MVP.

---

## 🚀 Pre-Testing Setup

1. **Start Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   - Verify: `http://localhost:5001/api/health` returns `{status: "online"}`

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   - Verify: `http://localhost:3000` loads

3. **Clear Database (Optional)**
   - Delete `backend/db.sqlite` to start fresh

---

## ✅ Test Suite 1: Agent Creation & Management

### Test 1.1: Create Account
- [ ] Navigate to `/create-account`
- [ ] Enter username (e.g., "testuser")
- [ ] Click "Create Account"
- [ ] Verify redirect to Dashboard
- [ ] Verify username appears in navigation

**Expected Result:** Account created, user logged in

---

### Test 1.2: Create Agent
- [ ] Navigate to `/create-agent`
- [ ] Enter agent name (e.g., "Alpha")
- [ ] Click "Create Agent"
- [ ] Verify agent appears in "My Agents"
- [ ] Verify agent has default stats:
  - Energy: 100
  - XP: 0
  - Power: Calculated from traits
  - Traits: Strength, Speed, Intelligence (1-10)

**Expected Result:** Agent created with valid stats

---

### Test 1.3: View Agent Profile
- [ ] Go to "My Agents"
- [ ] Click "View Profile" on an agent
- [ ] Verify profile page shows:
  - Agent name
  - Avatar
  - All stats (Power, STR, SPD, INT, Energy, XP)
  - GENE tokens
  - Rarity
  - Action buttons (Chat, Battle, Breed, Delete)

**Expected Result:** Profile displays all agent information

---

### Test 1.4: Delete Agent
- [ ] From Agent Profile, click "Delete"
- [ ] Confirm deletion
- [ ] Verify agent removed from "My Agents"
- [ ] Verify agent removed from Marketplace

**Expected Result:** Agent deleted successfully

---

## ✅ Test Suite 2: Battle System

### Test 2.1: Create Two Agents
- [ ] Create Agent A (e.g., "Warrior")
- [ ] Create Agent B (e.g., "Mage")
- [ ] Verify both appear in "My Agents"

**Expected Result:** Two agents created

---

### Test 2.2: Initiate Battle
- [ ] Navigate to `/battle`
- [ ] Select Agent A as "Your Agent"
- [ ] Select Agent B as "Opponent"
- [ ] Click "⚔️ Start Battle"
- [ ] Verify battle animation/display
- [ ] Verify winner determined
- [ ] Verify results show:
  - Winner
  - Loser
  - XP gained
  - Energy lost
  - Coin rewards (Winner +5, Loser +1)

**Expected Result:** Battle completes, rewards distributed

---

### Test 2.3: Verify Battle Updates
- [ ] Check Agent A profile
- [ ] Verify XP increased
- [ ] Verify Energy decreased (by 10)
- [ ] Check Agent B profile
- [ ] Verify XP increased
- [ ] Verify Energy decreased (by 10)
- [ ] Check coin balance in navigation
- [ ] Verify coins updated (Winner +5, Loser +1)

**Expected Result:** All stats updated correctly

---

### Test 2.4: Battle with Low Energy
- [ ] Battle an agent until energy < 10
- [ ] Try to battle again
- [ ] Verify error message or prevention

**Expected Result:** Low energy agents cannot battle

---

## ✅ Test Suite 3: Breeding System

### Test 3.1: Select Parent A
- [ ] Navigate to `/breed/select`
- [ ] Verify all agents displayed
- [ ] Click "Select as Parent A" on an agent
- [ ] Verify redirect to Parent B selection

**Expected Result:** Parent A selected

---

### Test 3.2: Select Parent B
- [ ] Verify Parent A displayed at top
- [ ] Verify Parent A not in selection list
- [ ] Select different agent as Parent B
- [ ] Click "🧬 Select & Breed"
- [ ] Verify redirect to Breeding Result

**Expected Result:** Parent B selected, breeding initiated

---

### Test 3.3: Verify Breeding Result
- [ ] Verify new baby agent created
- [ ] Verify baby shows:
  - Combined traits from parents
  - Possible mutations
  - Possible rare traits
  - Name generated
- [ ] Verify baby appears in "My Agents"
- [ ] Verify parents' GENE tokens increased

**Expected Result:** Baby agent created with combined traits

---

### Test 3.4: Breed Same Agent (Should Fail)
- [ ] Try to select same agent as both parents
- [ ] Verify error or prevention

**Expected Result:** Cannot breed agent with itself

---

## ✅ Test Suite 4: Marketplace

### Test 4.1: List Agent for Sale
- [ ] Go to Agent Profile
- [ ] Click "💰 List for Sale"
- [ ] Enter price (e.g., 100 coins)
- [ ] Click "List for Sale"
- [ ] Verify agent shows "FOR SALE" badge
- [ ] Verify price displayed

**Expected Result:** Agent listed for sale

---

### Test 4.2: View in Marketplace
- [ ] Navigate to `/marketplace`
- [ ] Verify agent appears in list
- [ ] Verify "For Sale" badge visible
- [ ] Verify price displayed
- [ ] Use search/filter to find agent

**Expected Result:** Agent visible in marketplace

---

### Test 4.3: Purchase Agent (Two Users)
- [ ] Create User A, create agent, list for sale (100 coins)
- [ ] Create User B, purchase coins (enough for purchase)
- [ ] User B: Go to Marketplace
- [ ] User B: Find agent for sale
- [ ] User B: Click "Buy for 100 Coins"
- [ ] Confirm purchase
- [ ] Verify:
  - Ownership transferred to User B
  - User B coins deducted (100)
  - User A coins increased (100)
  - Agent removed from sale
  - Agent appears in User B's "My Agents"

**Expected Result:** Purchase successful, ownership and coins transferred

---

### Test 4.4: Remove from Sale
- [ ] From Agent Profile (owner)
- [ ] Click "❌ Remove from Sale"
- [ ] Confirm
- [ ] Verify agent no longer for sale
- [ ] Verify agent removed from Marketplace "For Sale" filter

**Expected Result:** Agent removed from sale

---

## ✅ Test Suite 5: Store & Payments

### Test 5.1: View Store
- [ ] Navigate to `/store`
- [ ] Verify coin packages displayed
- [ ] Verify current balance shown
- [ ] Verify "Redeem Coins" section visible

**Expected Result:** Store page loads correctly

---

### Test 5.2: Mock Purchase (Development)
- [ ] Click "Purchase" on a coin package
- [ ] Complete mock payment flow
- [ ] Verify redirect to success page
- [ ] Verify coins added to balance
- [ ] Verify balance updated in navigation
- [ ] Check payment history

**Expected Result:** Coins purchased and added

---

### Test 5.3: Real Stripe Purchase (Production)
- [ ] Configure Stripe keys
- [ ] Click "Purchase" on coin package
- [ ] Redirected to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify redirect to success page
- [ ] Verify coins added
- [ ] Check Stripe Dashboard for payment

**Expected Result:** Real payment processed, coins added

---

### Test 5.4: Redeem Coins - Energy Refill
- [ ] Select an agent with low energy
- [ ] Go to Store
- [ ] Select agent from dropdown
- [ ] Click "Redeem" on "Energy Refill" (50 coins)
- [ ] Verify:
  - Coins deducted (50)
  - Agent energy restored to 100
  - Success notification

**Expected Result:** Energy refilled, coins deducted

---

### Test 5.5: Redeem Coins - XP Boost
- [ ] Select an agent
- [ ] Note current XP
- [ ] Go to Store
- [ ] Select agent
- [ ] Click "Redeem" on "XP Boost" (100 coins)
- [ ] Verify:
  - Coins deducted (100)
  - XP boost applied (next battle +20%)
  - Success notification

**Expected Result:** XP boost applied, coins deducted

---

### Test 5.6: Redeem Coins - Rare Trait Roll
- [ ] Select an agent
- [ ] Note current traits
- [ ] Go to Store
- [ ] Select agent
- [ ] Click "Redeem" on "Rare Trait Roll" (200 coins)
- [ ] Verify:
  - Coins deducted (200)
  - One random stat re-rolled to 8-10
  - Success notification

**Expected Result:** Trait rolled, coins deducted

---

### Test 5.7: Insufficient Coins
- [ ] Ensure balance < 50 coins
- [ ] Try to redeem Energy Refill
- [ ] Verify error message
- [ ] Verify no coins deducted
- [ ] Verify energy not changed

**Expected Result:** Error shown, no action taken

---

## ✅ Test Suite 6: Chat System

### Test 6.1: Open Chat
- [ ] Go to Agent Profile
- [ ] Click "💬 Chat" button
- [ ] Verify chat interface opens
- [ ] Verify agent avatar displayed
- [ ] Verify input box and send button

**Expected Result:** Chat interface loads

---

### Test 6.2: Send Message
- [ ] Type message: "Hello!"
- [ ] Click "Send"
- [ ] Verify message appears in chat
- [ ] Verify message on right side (user)
- [ ] Wait for AI response
- [ ] Verify AI response appears
- [ ] Verify response on left side (agent)

**Expected Result:** Messages sent and received

---

### Test 6.3: Chat History
- [ ] Send multiple messages
- [ ] Refresh page
- [ ] Reopen chat
- [ ] Verify previous messages still visible
- [ ] Verify scrollable history

**Expected Result:** Chat history persists

---

### Test 6.4: OpenAI Integration (If Configured)
- [ ] Set `OPENAI_API_KEY` in backend `.env`
- [ ] Send message
- [ ] Verify real AI response (not mock)
- [ ] Verify response is relevant

**Expected Result:** Real AI responses received

---

## ✅ Test Suite 7: API Endpoints

### Test 7.1: Health Check
```bash
curl http://localhost:5001/api/health
```
- [ ] Returns: `{status: "online"}`

---

### Test 7.2: Get Agents
```bash
curl http://localhost:5001/agents
```
- [ ] Returns: Array of agents
- [ ] All agents have required fields

---

### Test 7.3: Create Agent
```bash
curl -X POST http://localhost:5001/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"TestAgent","owner":"testuser","traits":{"strength":5,"speed":5,"intelligence":5}}'
```
- [ ] Returns: Created agent object
- [ ] Agent appears in database

---

### Test 7.4: Battle Agents
```bash
curl -X POST http://localhost:5001/api/battle \
  -H "Content-Type: application/json" \
  -d '{"agentAId":1,"agentBId":2}'
```
- [ ] Returns: Battle result with winner
- [ ] Agents updated (XP, Energy)
- [ ] Coins awarded

---

### Test 7.5: Breed Agents
```bash
curl -X POST http://localhost:5001/api/breed \
  -H "Content-Type: application/json" \
  -d '{"parentAId":1,"parentBId":2}'
```
- [ ] Returns: Baby agent object
- [ ] Baby has combined traits
- [ ] Baby appears in database

---

### Test 7.6: Payment Endpoints
```bash
# Create checkout session
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","amount":9.99}'

# Get balance
curl http://localhost:5001/api/payment/balance/testuser

# Get history
curl http://localhost:5001/api/payment/history/testuser
```
- [ ] All endpoints return correct JSON
- [ ] No errors in responses

---

## ✅ Test Suite 8: Database Integrity

### Test 8.1: Verify Tables
- [ ] Check `agents` table has all records
- [ ] Check `user_balance` table has balances
- [ ] Check `payments` table has transactions
- [ ] Check `chat_messages` table has messages

**Expected Result:** All tables populated correctly

---

### Test 8.2: Data Consistency
- [ ] Verify agent owners match user IDs
- [ ] Verify payment user_ids match users
- [ ] Verify chat agent_ids match agents
- [ ] Verify coin balances match payment history

**Expected Result:** Data consistent across tables

---

## ✅ Test Suite 9: Error Handling

### Test 9.1: Invalid Agent ID
- [ ] Try to access `/agent/99999`
- [ ] Verify error message or 404

**Expected Result:** Graceful error handling

---

### Test 9.2: Invalid Battle
- [ ] Try to battle same agent twice
- [ ] Try to battle with invalid IDs
- [ ] Verify error messages

**Expected Result:** Errors caught and displayed

---

### Test 9.3: Network Errors
- [ ] Stop backend server
- [ ] Try to create agent
- [ ] Verify error message
- [ ] Restart backend
- [ ] Verify recovery

**Expected Result:** Network errors handled gracefully

---

## ✅ Test Suite 10: Performance

### Test 10.1: Load Time
- [ ] Measure page load times
- [ ] Dashboard: < 2s
- [ ] My Agents: < 2s
- [ ] Marketplace: < 3s

**Expected Result:** Acceptable load times

---

### Test 10.2: API Response Times
- [ ] Measure API endpoint response times
- [ ] All endpoints: < 500ms

**Expected Result:** Fast API responses

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: Development / Production

Test Suite 1: Agent Creation & Management
  [ ] Test 1.1: Create Account - PASS / FAIL
  [ ] Test 1.2: Create Agent - PASS / FAIL
  [ ] Test 1.3: View Agent Profile - PASS / FAIL
  [ ] Test 1.4: Delete Agent - PASS / FAIL

Test Suite 2: Battle System
  [ ] Test 2.1: Create Two Agents - PASS / FAIL
  [ ] Test 2.2: Initiate Battle - PASS / FAIL
  [ ] Test 2.3: Verify Battle Updates - PASS / FAIL
  [ ] Test 2.4: Battle with Low Energy - PASS / FAIL

... (continue for all test suites)

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🚨 Critical Tests (Must Pass)

These tests MUST pass before deployment:

1. ✅ Agent creation works
2. ✅ Battle system awards coins correctly
3. ✅ Breeding creates valid baby agents
4. ✅ Marketplace buy/sell works
5. ✅ Payment processing (mock or real) works
6. ✅ Coin redemption works
7. ✅ Database persists data
8. ✅ All API endpoints return valid JSON
9. ✅ Error handling works
10. ✅ No console errors in browser

---

**Run all tests before deploying to production!**

