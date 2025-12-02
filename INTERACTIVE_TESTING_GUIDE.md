# Interactive Testing Guide - Step-by-Step Feature Testing

## 🎯 Prerequisites

**Before starting, ensure:**

- ✅ Backend running: `http://localhost:5001`
- ✅ Frontend running: `http://localhost:3000`
- ✅ Browser open and ready

---

## 📋 Feature 1: Account Creation

### Steps:

1. **Open browser** → Go to `http://localhost:3000`
2. **You should be redirected** to `/create-account` (if not logged in)
3. **Enter a username** (e.g., "testuser1")
4. **Click "Create" button**
5. **Expected Result:**
   - ✅ Success message appears
   - ✅ Redirected to `/dashboard`
   - ✅ Dashboard shows "Welcome, [your username]"
   - ✅ Balance shows (default 0 or initial amount)

### What to Check:

- [ ] Account created successfully
- [ ] Redirected to dashboard
- [ ] Username displayed correctly
- [ ] Balance visible

---

## 📋 Feature 2: Create Your First Agent

### Steps:

1. **On Dashboard**, click **"Create New Agent"** button
2. **You'll be redirected** to `/create-agent`
3. **Enter agent name** (e.g., "AlphaWarrior")
4. **Click "Create Agent" button**
5. **Expected Result:**
   - ✅ Agent created successfully
   - ✅ Redirected back to dashboard
   - ✅ Balance decreased by 10 coins
   - ✅ Agent now exists in system

### What to Check:

- [ ] Agent name accepted
- [ ] Coins deducted (10 coins)
- [ ] Redirected to dashboard
- [ ] No error messages

### Next:

- **Navigate to** `/agents` page
- **Verify** your new agent appears in the list
- **Check** agent stats (strength, speed, intelligence)

---

## 📋 Feature 3: Create Second Agent (for Breeding/Battling)

### Steps:

1. **Go back to Dashboard** → Click "Create New Agent"
2. **Enter second agent name** (e.g., "BetaFighter")
3. **Click "Create Agent"**
4. **Expected Result:**
   - ✅ Second agent created
   - ✅ Both agents now in system

### What to Check:

- [ ] Second agent created
- [ ] Both agents visible in `/agents` page
- [ ] Each agent has unique stats

---

## 📋 Feature 4: Battle System

### Steps:

1. **Navigate to main game page** (or stay on `/agents`)
2. **Select Agent 1** (click on it or use selection mechanism)
3. **Select Agent 2** (click on it)
4. **Click "Battle Selected Parents"** button
5. **Expected Result:**
   - ✅ Battle executes
   - ✅ Winner determined
   - ✅ Battle results displayed
   - ✅ XP awarded (10 for winner, 2 for loser)
   - ✅ Energy decreased (10 each)

### What to Check:

- [ ] Battle executes without errors
- [ ] Winner is displayed
- [ ] XP increased for both agents
- [ ] Energy decreased for both agents
- [ ] Power recalculated (if applicable)

### Try Also:

- **Random Battle** button → Should battle two random agents
- **Auto Battle** → Should continuously battle (remember to stop it!)

---

## 📋 Feature 5: Breeding System

### Steps:

1. **Navigate to Dashboard** → Click "Start Breeding"
2. **You'll be on** `/breed/select` page
3. **Select Parent A:**
   - Click on your first agent
   - Click "Select Parent A" button
4. **You'll be redirected** to `/breed/parentB/:parentAId`
5. **Select Parent B:**
   - Click on your second agent
   - Click "Select Parent B & Breed" button
6. **Breeding executes:**
   - Loading animation shows
   - Breeding completes
7. **Expected Result:**
   - ✅ New baby agent created
   - ✅ Baby stats displayed
   - ✅ Parents received +1 GENE each
   - ✅ Rarity calculated (common/uncommon/rare)
   - ✅ Coins rewarded (if rare/uncommon)

### What to Check:

- [ ] Baby agent created successfully
- [ ] Baby has combined traits from parents
- [ ] Parents' GENE increased
- [ ] Rarity displayed correctly
- [ ] Coins rewarded (if applicable)

### Next:

- **Click "View My Agents"** → Verify baby appears in list
- **Check baby stats** → Should be mix of parent stats

---

## 📋 Feature 6: AI Chat System

### Steps:

1. **Navigate to** `/marketplace` page
2. **If you have an NFT:**
   - Click on an NFT card
   - Chat interface should appear
3. **If you don't have an NFT yet:**
   - First create and mint an agent (see Feature 7)
4. **In chat interface:**
   - Type a message: "Hello, who are you?"
   - Click "Send" or press Enter
5. **Expected Result:**
   - ✅ "Agent is typing..." appears
   - ✅ AI response received
   - ✅ Response reflects agent's personality/stats
   - ✅ Message appears in chat history

### What to Check:

- [ ] Chat interface opens
- [ ] Messages send successfully
- [ ] AI responds (may take 2-5 seconds)
- [ ] Response is relevant
- [ ] Personality visible in response

### Test Different Stats:

- **High Intelligence (15+):** Ask complex questions → Should show sophisticated language
- **High Strength (15+):** Ask for advice → Should be confident/bold
- **High Energy (15+):** Ask "How are you?" → Should be enthusiastic

---

## 📋 Feature 7: Personality Badges

### Steps:

1. **Navigate to** `/marketplace` page
2. **Select an NFT** (or create one)
3. **Look at the NFT card:**
   - Personality badges should be visible
   - Stats displayed (Intelligence, Strength, Energy)
4. **Expected Result:**
   - ✅ Personality badges show
   - ✅ Badges match agent stats
   - ✅ Color-coded badges
   - ✅ Icons for each trait

### What to Check:

- [ ] Badges visible on NFT card
- [ ] Badges match stats:
  - High Intelligence → "Analytical", "Thoughtful"
  - High Strength → "Confident", "Bold"
  - High Energy → "Energetic", "Enthusiastic"
- [ ] Badges update when stats change

---

## 📋 Feature 8: Chat History Persistence

### Steps:

1. **Open chat** for an agent (see Feature 6)
2. **Send 3-4 messages:**
   - "Hello"
   - "What's your name?"
   - "Tell me about yourself"
3. **Verify messages appear** in chat
4. **Refresh the page** (F5 or Cmd+R)
5. **Reopen chat** for the same agent
6. **Expected Result:**
   - ✅ Previous messages still visible
   - ✅ Chat history preserved
   - ✅ Both user and agent messages saved

### What to Check:

- [ ] Messages saved after refresh
- [ ] Full conversation history visible
- [ ] User messages preserved
- [ ] Agent messages preserved
- [ ] Timestamps correct (if displayed)

---

## 📋 Feature 9: Stat Upgrades (NFT Owners Only)

### Steps:

1. **Navigate to** `/marketplace` page
2. **Connect MetaMask wallet** (if not connected)
3. **Find an NFT you own** (must be minted and owned by you)
4. **On the NFT card**, you should see upgrade buttons:
   - "+1 Intelligence"
   - "+1 Strength"
   - "+1 Energy"
5. **Click an upgrade button** (e.g., "+1 Intelligence")
6. **Approve transaction** in MetaMask (if on blockchain)
7. **Expected Result:**
   - ✅ Transaction processes
   - ✅ Stat increases by 1
   - ✅ Personality badges update
   - ✅ Chat responses reflect new stats

### What to Check:

- [ ] Upgrade buttons visible (only for owned NFTs)
- [ ] Stats increase after upgrade
- [ ] Badges update to reflect new stats
- [ ] Chat responses change with new stats
- [ ] Changes persist after refresh

**Note:** If MetaMask not installed, this will show an error (expected behavior)

---

## 📋 Feature 10: NFT Minting

### Steps:

1. **Navigate to** `/mint` page
2. **Connect MetaMask wallet:**
   - Click "Connect Wallet" button
   - Approve connection in MetaMask
3. **Select an agent** to mint:
   - Click on an agent card
   - Agent should be highlighted
4. **Click "Mint Selected Agent as NFT"** button
5. **Approve transaction** in MetaMask
6. **Expected Result:**
   - ✅ Transaction processes
   - ✅ Success message with transaction hash
   - ✅ Agent marked as minted
   - ✅ NFT appears in marketplace

### What to Check:

- [ ] Wallet connects successfully
- [ ] Agent selection works
- [ ] Minting transaction processes
- [ ] Success message shows
- [ ] NFT appears in marketplace after refresh

**Note:** Requires MetaMask and test ETH for gas fees

---

## 📋 Feature 11: Marketplace Display

### Steps:

1. **Navigate to** `/marketplace` page
2. **View Minted NFTs section:**
   - Should show all minted NFTs
   - Each NFT card displays:
     - Image (or placeholder)
     - Name
     - Token ID
     - Owner address
     - Stats (Intelligence, Strength, Energy)
     - Personality badges
3. **Click on an NFT:**
   - Should highlight/select
   - Chat interface should appear
4. **Expected Result:**
   - ✅ NFTs displayed correctly
   - ✅ All information visible
   - ✅ Clicking opens chat
   - ✅ Stats and badges accurate

### What to Check:

- [ ] NFTs load from blockchain
- [ ] All NFT data displayed
- [ ] Images load (or placeholders show)
- [ ] Stats accurate
- [ ] Personality badges correct
- [ ] Clicking NFT opens chat

---

## 📋 Feature 12: Full User Journey Test

### Complete Flow:

1. **Create Account** → `/create-account`
2. **Create Agent 1** → `/create-agent` → Name: "Warrior"
3. **Create Agent 2** → `/create-agent` → Name: "Mage"
4. **Battle Agents** → Select both → Click "Battle"
5. **Breed Agents** → `/breed/select` → Select parents → Breed
6. **View Baby** → `/agents` → Verify baby exists
7. **Mint Baby as NFT** → `/mint` → Select baby → Mint
8. **View in Marketplace** → `/marketplace` → Find your NFT
9. **Chat with NFT** → Click NFT → Send messages
10. **Upgrade Stats** → Click upgrade buttons
11. **Chat Again** → Verify personality changed

### Expected Result:

- ✅ Complete flow works end-to-end
- ✅ No errors or crashes
- ✅ All features functional
- ✅ Data persists correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"

**Solution:**

- Check backend is running: `curl http://localhost:5001/api/health`
- Restart backend if needed

### Issue: "404 errors in console"

**Solution:**

- This is expected for local-only agents
- System falls back to local logic automatically

### Issue: "MetaMask not detected"

**Solution:**

- Install MetaMask extension
- Or skip NFT features (they're optional)

### Issue: "Chat not responding"

**Solution:**

- Check OpenAI API key is set (or fallback works)
- Wait 2-5 seconds for response
- Check browser console for errors

### Issue: "Agents not saving"

**Solution:**

- Check backend is running
- Verify agents endpoint: `curl http://localhost:5001/agents`
- Check browser console for errors

---

## ✅ Testing Checklist Summary

After testing all features, verify:

- [ ] Account creation works
- [ ] Agent creation works
- [ ] Battle system works
- [ ] Breeding system works
- [ ] AI chat responds
- [ ] Personality badges display
- [ ] Chat history persists
- [ ] Stat upgrades work (if MetaMask available)
- [ ] NFT minting works (if MetaMask available)
- [ ] Marketplace displays NFTs
- [ ] Full user journey works

---

## 📊 Test Results Template

**Date:** ******\_\_\_******  
**Tester:** ******\_\_\_******

**Features Tested:**

- [ ] Feature 1: Account Creation
- [ ] Feature 2: Create Agent
- [ ] Feature 3: Create Second Agent
- [ ] Feature 4: Battle System
- [ ] Feature 5: Breeding System
- [ ] Feature 6: AI Chat
- [ ] Feature 7: Personality Badges
- [ ] Feature 8: Chat History
- [ ] Feature 9: Stat Upgrades
- [ ] Feature 10: NFT Minting
- [ ] Feature 11: Marketplace
- [ ] Feature 12: Full Journey

**Issues Found:**

1. ***
2. ***
3. ***

**Notes:**

---

---

---

## 🚀 Ready to Test!

**Start here:**

1. Open `http://localhost:3000` in your browser
2. Follow Feature 1 (Account Creation)
3. Work through each feature sequentially
4. Check off items as you complete them

**Happy Testing!** 🎉
