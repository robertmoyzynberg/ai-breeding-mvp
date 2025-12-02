# 🧪 Quick Testing Guide

**10-minute testing script to validate your MVP before deployment.**

---

## ⚡ Quick Test (5 minutes)

### Step 1: Start Services
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Step 2: Basic Flow Test
1. **Open:** http://localhost:3000
2. **Create Account:** Enter username "testuser"
3. **Create Agent:** Name it "TestAgent1"
4. **Check Dashboard:** Should show "Total Agents: 1"
5. **Go to Marketplace:** Should see "TestAgent1"
6. **View Agent Profile:** Click on agent card
7. **Battle:** Create second agent, battle them
8. **Check Coins:** Should see +5 or +1 coins in navbar
9. **Go to Store:** Should see coin balance
10. **Test Search:** Search for "Test" in Marketplace

**✅ If all 10 steps work, core functionality is solid!**

---

## 🔍 Detailed Test (10 minutes)

### Test 1: Agent Creation & Display (2 min)
```
1. Create account
2. Create 3 agents with different names
3. Check "My Agents" - should show all 3
4. Check Marketplace - should show all 3
5. Check Dashboard - should show "Total Agents: 3"
```
**Expected:** All agents appear everywhere

### Test 2: Marketplace Features (2 min)
```
1. Go to Marketplace
2. Search for agent name - should filter
3. Filter "For Sale" - should show only listed agents
4. Sort by Power - should reorder
5. Click agent card - should open profile
```
**Expected:** All filters/sorts work, navigation works

### Test 3: Battle System (2 min)
```
1. Select 2 agents
2. Start battle
3. Watch animation
4. Check results:
   - Winner gets +5 coins
   - Loser gets +1 coin
   - XP updated (+10 winner, +2 loser)
   - Energy deducted (-10 each)
5. Check navbar - coins updated
```
**Expected:** Battle works, rewards given, stats update

### Test 4: Breeding (2 min)
```
1. Select Parent A
2. Select Parent B
3. View breeding result
4. Check baby agent:
   - Has combined traits
   - Appears in "My Agents"
   - Appears in Marketplace
```
**Expected:** Baby created with valid stats

### Test 5: Store & Redemption (2 min)
```
1. Go to Store
2. "Purchase" 100 coins (mock)
3. Check balance updated
4. Select an agent
5. Refill energy (50 coins)
6. Check energy = 100, coins deducted
```
**Expected:** Purchase works, redemption works

---

## 🐛 Common Issues & Fixes

### Issue: "No agents in Marketplace"
**Fix:** Create at least 1 agent first

### Issue: "CORS errors"
**Fix:** Check backend allows `http://localhost:3000` in CORS config

### Issue: "404 on payment routes"
**Fix:** Restart backend server

### Issue: "Coins not updating"
**Fix:** Check `REACT_APP_API_URL` in frontend `.env`

### Issue: "Agents not persisting"
**Fix:** Check database file exists in `backend/db.sqlite`

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All 5 detailed tests pass
- [ ] No console errors (red)
- [ ] All API endpoints respond (check Network tab)
- [ ] Marketplace shows agents
- [ ] Battle rewards coins correctly
- [ ] Store purchases work
- [ ] Responsive on mobile (resize browser)

**If all pass → Ready to deploy! 🚀**

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Quick Test: [ ] Pass [ ] Fail
Detailed Tests:
  - Agent Creation: [ ] Pass [ ] Fail
  - Marketplace: [ ] Pass [ ] Fail
  - Battle: [ ] Pass [ ] Fail
  - Breeding: [ ] Pass [ ] Fail
  - Store: [ ] Pass [ ] Fail

Issues Found:
1. 
2. 
3. 

Ready to Deploy: [ ] Yes [ ] No
```

---

**Time to complete:** ~10 minutes
**When to run:** Before every deployment
**What to do if fails:** Fix issues, re-test, then deploy

