# 🏪 Marketplace Test Plan

## Overview
Comprehensive testing plan for marketplace functionality including listing, searching, filtering, and purchasing agents.

---

## 🧪 Test Suite 1: List Agent for Sale

### Test 1.1: List Agent (Owner)
**Steps:**
1. Go to Agent Profile (owned agent)
2. Click "💰 List for Sale"
3. Enter price: 100 coins
4. Click "List for Sale"

**Expected:**
- ✅ Agent `forSale` set to `true`
- ✅ Agent `price` set to 100
- ✅ Success notification shown
- ✅ Agent appears in marketplace
- ✅ "For Sale" badge visible
- ✅ Price displayed

**API Test:**
```bash
curl -X POST http://localhost:5001/agents/1/list-for-sale \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","price":100}'
```

**Expected Response:**
```json
{
  "success": true,
  "agent": { ... },
  "message": "Agent listed for sale!"
}
```

---

### Test 1.2: List Agent (Non-Owner)
**Steps:**
1. Try to list agent you don't own

**Expected:**
- ✅ 403 Forbidden
- ✅ Error: "You can only list your own agents"

---

### Test 1.3: Invalid Price
**Steps:**
1. Try to list with price = 0
2. Try to list with negative price

**Expected:**
- ✅ 400 Bad Request
- ✅ Error: "Valid price is required"

---

## 🧪 Test Suite 2: Remove from Sale

### Test 2.1: Remove from Sale (Owner)
**Steps:**
1. Go to Agent Profile (listed agent)
2. Click "❌ Remove from Sale"
3. Confirm

**Expected:**
- ✅ Agent `forSale` set to `false`
- ✅ Agent `price` set to 0
- ✅ Success notification
- ✅ Agent removed from marketplace "For Sale" filter
- ✅ "For Sale" badge removed

**API Test:**
```bash
curl -X POST http://localhost:5001/agents/1/remove-from-sale \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser"}'
```

---

### Test 2.2: Remove from Sale (Non-Owner)
**Steps:**
1. Try to remove agent you don't own

**Expected:**
- ✅ 403 Forbidden
- ✅ Error: "You can only remove your own agents from sale"

---

## 🧪 Test Suite 3: Marketplace Display

### Test 3.1: View All Agents
**Steps:**
1. Go to `/marketplace`
2. Verify all agents displayed

**Expected:**
- ✅ All agents visible
- ✅ Cards styled correctly
- ✅ Stats displayed
- ✅ "For Sale" badges on listed agents

---

### Test 3.2: View For Sale Only
**Steps:**
1. Go to Marketplace
2. Select filter: "For Sale"
3. Verify only listed agents shown

**Expected:**
- ✅ Only agents with `forSale: true` shown
- ✅ Prices displayed
- ✅ Buy buttons visible

---

### Test 3.3: View Available Only
**Steps:**
1. Select filter: "Available"
2. Verify only unowned agents shown

**Expected:**
- ✅ Only agents with no owner shown
- ✅ Can claim these agents

---

## 🧪 Test Suite 4: Search Functionality

### Test 4.1: Search by Name
**Steps:**
1. Enter agent name in search box
2. Verify results filtered

**Expected:**
- ✅ Only matching agents shown
- ✅ Case-insensitive search
- ✅ Partial matches work

---

### Test 4.2: Search by Owner
**Steps:**
1. Enter owner username in search box
2. Verify results filtered

**Expected:**
- ✅ Only agents owned by that user shown
- ✅ Case-insensitive search

---

### Test 4.3: Clear Search
**Steps:**
1. Enter search term
2. Clear search box
3. Verify all agents shown

**Expected:**
- ✅ All agents visible again
- ✅ Filters still applied

---

## 🧪 Test Suite 5: Sorting

### Test 5.1: Sort by Power
**Steps:**
1. Select "Sort by Power"
2. Verify agents sorted

**Expected:**
- ✅ Highest power first
- ✅ Descending order

---

### Test 5.2: Sort by Rarity
**Steps:**
1. Select "Sort by Rarity"
2. Verify agents sorted

**Expected:**
- ✅ Highest rarity first
- ✅ Rarity calculated correctly

---

### Test 5.3: Sort by Price
**Steps:**
1. Select "Sort by Price"
2. Verify agents sorted

**Expected:**
- ✅ Highest price first
- ✅ Only listed agents have prices

---

### Test 5.4: Sort by Name
**Steps:**
1. Select "Sort by Name"
2. Verify agents sorted

**Expected:**
- ✅ Alphabetical order
- ✅ A-Z sorting

---

## 🧪 Test Suite 6: Purchase Flow

### Test 6.1: Purchase Agent (Sufficient Coins)
**Prerequisites:**
- User has enough coins
- Agent listed for sale
- Agent not owned by buyer

**Steps:**
1. Go to Marketplace
2. Find agent for sale
3. Click "Buy for X Coins"
4. Confirm purchase

**Expected:**
- ✅ Ownership transferred to buyer
- ✅ Buyer coins deducted
- ✅ Seller coins increased
- ✅ Agent removed from sale
- ✅ Success notification
- ✅ Balance updated

**API Test:**
```bash
curl -X POST http://localhost:5001/agents/1/purchase \
  -H "Content-Type: application/json" \
  -d '{"buyerId":"buyeruser"}'
```

**Expected Response:**
```json
{
  "success": true,
  "agent": { ... },
  "coins": 50,
  "message": "Successfully purchased AgentName for 100 coins!"
}
```

---

### Test 6.2: Purchase Agent (Insufficient Coins)
**Steps:**
1. Ensure user has less coins than price
2. Try to purchase

**Expected:**
- ✅ Error notification
- ✅ "Insufficient coins. Need X coins."
- ✅ No purchase made
- ✅ Balance unchanged

---

### Test 6.3: Purchase Own Agent
**Steps:**
1. Try to purchase agent you own

**Expected:**
- ✅ Error notification
- ✅ "You cannot purchase your own agent"
- ✅ No purchase made

---

### Test 6.4: Purchase Agent Not for Sale
**Steps:**
1. Try to purchase agent not listed

**Expected:**
- ✅ 400 Bad Request
- ✅ Error: "Agent is not for sale"
- ✅ No purchase made

---

### Test 6.5: Purchase Non-Existent Agent
**Steps:**
1. Try to purchase agent ID 99999

**Expected:**
- ✅ 404 Not Found
- ✅ Error: "Agent not found"

---

## 🧪 Test Suite 7: Error Handling

### Test 7.1: Network Errors
**Steps:**
1. Stop backend server
2. Try to list agent
3. Try to purchase agent

**Expected:**
- ✅ Error notifications shown
- ✅ No crashes
- ✅ App recovers when backend restarts

---

### Test 7.2: Invalid Data
**Steps:**
1. Try to list with missing userId
2. Try to purchase with missing buyerId

**Expected:**
- ✅ 400 Bad Request
- ✅ Clear error messages

---

### Test 7.3: Concurrent Purchases
**Steps:**
1. Two users try to purchase same agent simultaneously

**Expected:**
- ✅ Only one purchase succeeds
- ✅ Other purchase fails gracefully
- ✅ Error message shown

---

## 🧪 Test Suite 8: UI/UX

### Test 8.1: Marketplace Page
- [ ] Page loads without errors
- [ ] All agents displayed
- [ ] Cards styled correctly
- [ ] Responsive design works
- [ ] Loading states show
- [ ] Empty states show when no results

### Test 8.2: Search & Filter UI
- [ ] Search box visible
- [ ] Filter dropdown works
- [ ] Sort dropdown works
- [ ] Results count displayed
- [ ] Clear search works

### Test 8.3: Purchase Flow UI
- [ ] Buy button visible on listed agents
- [ ] Price displayed correctly
- [ ] Confirmation dialog works
- [ ] Loading state during purchase
- [ ] Success notification
- [ ] Error notification

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: Development / Production

List for Sale:
  [ ] Test 1.1: List Agent (Owner) - PASS / FAIL
  [ ] Test 1.2: List Agent (Non-Owner) - PASS / FAIL
  [ ] Test 1.3: Invalid Price - PASS / FAIL

Remove from Sale:
  [ ] Test 2.1: Remove (Owner) - PASS / FAIL
  [ ] Test 2.2: Remove (Non-Owner) - PASS / FAIL

Display:
  [ ] Test 3.1: View All - PASS / FAIL
  [ ] Test 3.2: View For Sale - PASS / FAIL
  [ ] Test 3.3: View Available - PASS / FAIL

Search:
  [ ] Test 4.1: Search by Name - PASS / FAIL
  [ ] Test 4.2: Search by Owner - PASS / FAIL
  [ ] Test 4.3: Clear Search - PASS / FAIL

Sorting:
  [ ] Test 5.1: Sort by Power - PASS / FAIL
  [ ] Test 5.2: Sort by Rarity - PASS / FAIL
  [ ] Test 5.3: Sort by Price - PASS / FAIL
  [ ] Test 5.4: Sort by Name - PASS / FAIL

Purchase:
  [ ] Test 6.1: Purchase (Sufficient) - PASS / FAIL
  [ ] Test 6.2: Purchase (Insufficient) - PASS / FAIL
  [ ] Test 6.3: Purchase Own - PASS / FAIL
  [ ] Test 6.4: Purchase Not for Sale - PASS / FAIL
  [ ] Test 6.5: Purchase Non-Existent - PASS / FAIL

Error Handling:
  [ ] Test 7.1: Network Errors - PASS / FAIL
  [ ] Test 7.2: Invalid Data - PASS / FAIL
  [ ] Test 7.3: Concurrent Purchases - PASS / FAIL

UI/UX:
  [ ] Test 8.1: Marketplace Page - PASS / FAIL
  [ ] Test 8.2: Search & Filter UI - PASS / FAIL
  [ ] Test 8.3: Purchase Flow UI - PASS / FAIL

Issues Found:
1. ___________
2. ___________

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🚨 Critical Tests (Must Pass)

1. ✅ List agent for sale works
2. ✅ Remove from sale works
3. ✅ Purchase transfers ownership
4. ✅ Purchase transfers coins correctly
5. ✅ Search and filter work
6. ✅ Sorting works
7. ✅ Error handling works
8. ✅ UI displays correctly

---

**Run all tests before deploying marketplace to production!**

