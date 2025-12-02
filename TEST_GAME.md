# 🧪 Complete Game Testing Guide

## 🚀 Quick Test Checklist

Run through these tests to verify everything works:

---

## ✅ Test 1: Account & Agent Creation

### Steps:
1. [ ] Go to `/create-account`
2. [ ] Enter username (e.g., "testuser")
3. [ ] Click "Create Account"
4. [ ] Verify redirect to Dashboard
5. [ ] Go to `/create-agent`
6. [ ] Enter agent name (e.g., "Alpha")
7. [ ] Click "Create Agent"
8. [ ] Verify agent appears in "My Agents"

### Expected Results:
- ✅ Account created successfully
- ✅ Agent created with stats (STR, SPD, INT between 1-10)
- ✅ Agent has 100 energy, 0 XP, 0 GENE
- ✅ Agent appears in "My Agents" page

---

## ✅ Test 2: Battle System

### Steps:
1. [ ] Create 2 agents (Agent A and Agent B)
2. [ ] Go to `/battle`
3. [ ] Select Agent A as "Your Agent"
4. [ ] Select Agent B as "Opponent"
5. [ ] Click "⚔️ Start Battle"
6. [ ] Wait for battle result
7. [ ] Check winner/loser
8. [ ] Verify coin rewards (Winner +5, Loser +1)
9. [ ] Check agent profiles for XP and Energy changes

### Expected Results:
- ✅ Battle completes successfully
- ✅ Winner determined (based on power)
- ✅ Winner gets +5 coins
- ✅ Loser gets +1 coin
- ✅ Both agents gain XP
- ✅ Both agents lose 10 energy
- ✅ Coin balance updates in navigation bar

---

## ✅ Test 3: Breeding System

### Steps:
1. [ ] Go to `/breed/select` (or click "Breed" from dashboard)
2. [ ] Select Parent A
3. [ ] Verify redirect to Parent B selection
4. [ ] Verify Parent A displayed at top
5. [ ] Select Parent B (different agent)
6. [ ] Click "🧬 Select & Breed"
7. [ ] Wait for breeding result
8. [ ] Verify baby agent created
9. [ ] Check baby's traits (should be combination of parents)
10. [ ] Verify baby appears in "My Agents"

### Expected Results:
- ✅ Parent selection works
- ✅ Baby agent created
- ✅ Baby has combined traits from parents
- ✅ Possible mutations or rare traits
- ✅ Parents' GENE tokens increased
- ✅ Baby appears in agent list

---

## ✅ Test 4: Marketplace

### Steps:
1. [ ] Go to Agent Profile (click "View Profile" on an agent)
2. [ ] Click "💰 List for Sale"
3. [ ] Enter price (e.g., 100 coins)
4. [ ] Click "List for Sale"
5. [ ] Go to `/marketplace`
6. [ ] Verify agent appears with "For Sale" badge
7. [ ] Use search/filter to find agent
8. [ ] Click "View Profile" on listed agent
9. [ ] Verify "Buy" button appears (if not owner)
10. [ ] Go back to agent profile (as owner)
11. [ ] Click "❌ Remove from Sale"
12. [ ] Verify agent removed from sale

### Expected Results:
- ✅ Agent listed successfully
- ✅ Agent appears in marketplace
- ✅ Price displayed correctly
- ✅ Search/filter works
- ✅ Remove from sale works

---

## ✅ Test 5: Store & Payments

### Steps:
1. [ ] Go to `/store`
2. [ ] Check current coin balance (should be visible)
3. [ ] Click "Purchase" on a coin package (e.g., 100 coins for $9.99)
4. [ ] Wait for payment processing
5. [ ] Verify redirect to success page
6. [ ] Check coin balance updated
7. [ ] Go back to Store
8. [ ] Select an agent from dropdown
9. [ ] Click "Redeem" on "Energy Refill" (50 coins)
10. [ ] Verify energy restored to 100
11. [ ] Verify coins deducted
12. [ ] Try "XP Boost" (100 coins)
13. [ ] Try "Rare Trait Roll" (200 coins)

### Expected Results:
- ✅ Payment processes (mock or real)
- ✅ Coins added to balance
- ✅ Balance updates in navigation
- ✅ Energy refill works
- ✅ XP boost applied
- ✅ Rare trait roll works
- ✅ Coins deducted correctly

---

## ✅ Test 6: Chat System

### Steps:
1. [ ] Go to Agent Profile
2. [ ] Click "💬 Chat" button
3. [ ] Verify chat interface opens
4. [ ] Type a message: "Hello!"
5. [ ] Click "Send"
6. [ ] Wait for AI response
7. [ ] Send another message
8. [ ] Refresh page
9. [ ] Reopen chat
10. [ ] Verify previous messages still visible

### Expected Results:
- ✅ Chat interface opens
- ✅ Messages send successfully
- ✅ AI responds (or mock response if OpenAI not configured)
- ✅ Chat history persists
- ✅ Messages scrollable

---

## ✅ Test 7: Agent Profile & Actions

### Steps:
1. [ ] Go to "My Agents"
2. [ ] Click "View Profile" on an agent
3. [ ] Verify all stats displayed:
   - Power
   - Strength, Speed, Intelligence
   - Energy, XP
   - GENE tokens
   - Rarity
4. [ ] Test action buttons:
   - Chat (opens chat)
   - Battle (navigates to battle with agent pre-selected)
   - Breed (navigates to breed selection)
   - Delete (removes agent)

### Expected Results:
- ✅ All stats displayed correctly
- ✅ Action buttons work
- ✅ Navigation works correctly

---

## ✅ Test 8: API Endpoints (Backend)

### Test Health Check:
```bash
curl http://localhost:5001/api/health
```
**Expected:** `{"status":"online"}`

### Test Get Agents:
```bash
curl http://localhost:5001/agents
```
**Expected:** Array of agents

### Test Create Agent:
```bash
curl -X POST http://localhost:5001/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"TestAgent","owner":"testuser","traits":{"strength":5,"speed":5,"intelligence":5}}'
```
**Expected:** Created agent object

### Test Battle:
```bash
curl -X POST http://localhost:5001/api/battle \
  -H "Content-Type: application/json" \
  -d '{"agentAId":1,"agentBId":2}'
```
**Expected:** Battle result with winner

### Test Payment:
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","amount":9.99}'
```
**Expected:** Checkout session or mock payment response

---

## ✅ Test 9: Database Integrity

### Steps:
1. [ ] Create several agents
2. [ ] Battle them multiple times
3. [ ] Breed agents
4. [ ] Purchase coins
5. [ ] Check database file: `backend/db.sqlite`
6. [ ] Verify data persists after server restart

### Expected Results:
- ✅ All data saved to database
- ✅ Data persists after restart
- ✅ No duplicate records
- ✅ Relationships maintained (owner, etc.)

---

## ✅ Test 10: Error Handling

### Steps:
1. [ ] Try to battle same agent against itself
2. [ ] Try to breed agent with itself
3. [ ] Try to purchase with insufficient coins
4. [ ] Try to access non-existent agent (`/agent/99999`)
5. [ ] Stop backend server, try to create agent
6. [ ] Check error messages are user-friendly

### Expected Results:
- ✅ Errors caught gracefully
- ✅ User-friendly error messages
- ✅ No crashes or white screens
- ✅ App recovers when backend restarts

---

## ✅ Test 11: UI/UX

### Steps:
1. [ ] Check all pages load without errors
2. [ ] Verify navigation works
3. [ ] Check responsive design (resize browser)
4. [ ] Verify loading states show during API calls
5. [ ] Check notifications appear for success/error
6. [ ] Verify empty states show when no data

### Expected Results:
- ✅ No console errors
- ✅ Smooth navigation
- ✅ Responsive layout
- ✅ Loading indicators work
- ✅ Notifications display correctly

---

## ✅ Test 12: State Management

### Steps:
1. [ ] Create agent on Dashboard
2. [ ] Navigate to "My Agents"
3. [ ] Verify agent appears immediately
4. [ ] Battle agents
5. [ ] Check balance updates in navigation
6. [ ] Verify agents update after battle

### Expected Results:
- ✅ State syncs across pages
- ✅ Auto-refresh works (every 5-10 seconds)
- ✅ Balance updates in real-time
- ✅ No stale data

---

## 🐛 Common Issues to Check

### Issue 1: Coins Not Adding
- [ ] Check backend server is running
- [ ] Check database migration ran (look for console log)
- [ ] Verify payment confirmation endpoint works
- [ ] Check browser console for errors

### Issue 2: Agents Not Appearing
- [ ] Check backend API returns agents
- [ ] Verify auto-refresh is working
- [ ] Check browser console for errors
- [ ] Verify database has records

### Issue 3: Battle Not Working
- [ ] Check both agents have energy > 0
- [ ] Verify battle endpoint returns result
- [ ] Check coin rewards are added
- [ ] Verify XP/Energy updates

### Issue 4: Payment Errors
- [ ] Check Stripe keys (if using real payments)
- [ ] Verify mock payment flow works
- [ ] Check database has `coins` column
- [ ] Verify payment confirmation works

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: Local / Production

Test 1: Account & Agent Creation
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 2: Battle System
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 3: Breeding System
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 4: Marketplace
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 5: Store & Payments
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 6: Chat System
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 7: Agent Profile
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 8: API Endpoints
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 9: Database Integrity
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 10: Error Handling
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 11: UI/UX
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Test 12: State Management
  Status: ✅ PASS / ❌ FAIL
  Notes: ___________

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: ✅ READY / ❌ NEEDS FIXES
```

---

## 🚀 Quick Test Script

Run this in browser console to test API endpoints:

```javascript
// Test health check
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(console.log);

// Test get agents
fetch('http://localhost:5001/agents')
  .then(r => r.json())
  .then(console.log);

// Test get balance
fetch('http://localhost:5001/api/payment/balance/testuser')
  .then(r => r.json())
  .then(console.log);
```

---

**Run all tests and check off each item. Report any failures!**

