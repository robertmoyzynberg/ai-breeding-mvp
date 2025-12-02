# ✅ Pre-Deployment Validation Checklist

**Run through this checklist before deploying to production. Estimated time: 10-15 minutes.**

---

## 🎯 Quick Start

1. **Start Backend:** `cd backend && npm start` (should run on port 5001)
2. **Start Frontend:** `cd frontend && npm start` (should run on port 3000)
3. **Open Browser:** http://localhost:3000
4. **Follow this checklist** - Check off each item as you test it

---

## 1️⃣ Core Functional Features

### Account & Navigation
- [ ] **Create Account / Login**
  - [ ] Can create account with username
  - [ ] Username saved to localStorage
  - [ ] Auto-redirects to dashboard after account creation
  - [ ] Can't access other pages without account (redirects to create-account)

- [ ] **Navigation Bar**
  - [ ] All links work: Dashboard, Agents, Breed, Marketplace, Store
  - [ ] Active route is highlighted
  - [ ] Coin balance displays in navbar
  - [ ] Responsive on mobile (hamburger menu if needed)

### Dashboard
- [ ] **Dashboard Page**
  - [ ] Shows welcome message with username
  - [ ] Displays correct agent count
  - [ ] All buttons work (Create Agent, View Agents, Breed, Marketplace, Store)
  - [ ] Data fetches from backend (check Network tab)

### Agent Management
- [ ] **Create Agent**
  - [ ] Can create new agent with name
  - [ ] Agent appears in backend (check `/agents` API)
  - [ ] Agent appears in "My Agents" page
  - [ ] Agent appears in Marketplace
  - [ ] Navigates correctly after creation

- [ ] **My Agents Page**
  - [ ] Lists all user's agents
  - [ ] Shows agent stats (power, energy, traits)
  - [ ] "View Profile" button works
  - [ ] "Delete" button works (with confirmation)
  - [ ] Empty state shows when no agents

- [ ] **Agent Profile Page**
  - [ ] Displays all agent information
  - [ ] Shows avatar, traits, stats, XP, energy
  - [ ] Action buttons work (Chat, Battle, Breed, Delete)
  - [ ] Can list agent for sale (if implemented)
  - [ ] Can purchase agent (if for sale and not owned)

### Breeding Flow
- [ ] **Select Parent A**
  - [ ] Shows list of available agents
  - [ ] Can select an agent
  - [ ] Navigates to Parent B selection

- [ ] **Select Parent B**
  - [ ] Shows list of available agents (excluding Parent A)
  - [ ] Can select second agent
  - [ ] Navigates to breeding result

- [ ] **Breeding Result**
  - [ ] Shows both parents
  - [ ] Displays baby agent with combined traits
  - [ ] Baby agent has valid stats
  - [ ] Baby agent appears in "My Agents" after breeding
  - [ ] Baby agent appears in Marketplace

### Battle System
- [ ] **Battle Arena**
  - [ ] Can select two agents to battle
  - [ ] Battle animation plays
  - [ ] Shows health/power/energy bars
  - [ ] Displays winner and loser
  - [ ] Shows XP gain (+10 winner, +2 loser)
  - [ ] Shows coin rewards (+5 winner, +1 loser)
  - [ ] Energy deducted correctly (-10 each)
  - [ ] Stats update in real-time
  - [ ] Coin balance updates in navbar

### Chat System
- [ ] **Chat Interface**
  - [ ] Can open chat from agent profile
  - [ ] Shows agent avatar and name
  - [ ] Can send messages
  - [ ] AI responds (or shows mock response)
  - [ ] Chat history persists
  - [ ] Messages scrollable
  - [ ] Typing indicator works (if implemented)
  - [ ] Chat saved to backend

### Store & Payments
- [ ] **Store Page**
  - [ ] Displays coin packages
  - [ ] Shows current balance
  - [ ] Can "purchase" coins (mock payment)
  - [ ] Payment success page works
  - [ ] Payment cancel page works
  - [ ] Balance updates after purchase

- [ ] **Redeem Coins Section**
  - [ ] Can select agent from dropdown
  - [ ] Energy Refill works (50 coins)
  - [ ] XP Boost works (100 coins)
  - [ ] Rare Trait Roll works (200 coins)
  - [ ] Balance deducts correctly
  - [ ] Agent stats update after redemption

---

## 2️⃣ Marketplace Specific

### Basic Functionality
- [ ] **Agents Display**
  - [ ] At least 1 agent appears in Marketplace
  - [ ] Agent cards show all information (name, stats, owner, rarity)
  - [ ] "For Sale" badge appears on listed agents
  - [ ] Price displays correctly

- [ ] **Search & Filters**
  - [ ] Search by name works
  - [ ] Search by owner works
  - [ ] Filter "All Agents" shows all
  - [ ] Filter "For Sale" shows only listed agents
  - [ ] Filter "Available" shows unclaimed agents
  - [ ] Empty state shows when no matches

- [ ] **Sorting**
  - [ ] Sort by Power works
  - [ ] Sort by Rarity works
  - [ ] Sort by Price works (if implemented)
  - [ ] Sort by Name works

- [ ] **Navigation**
  - [ ] Clicking agent card opens profile
  - [ ] "View Profile" button works
  - [ ] Back button returns to dashboard

### Buy/Trade Functionality (If Implemented)
- [ ] **List for Sale**
  - [ ] "List for Sale" button appears on owned agents
  - [ ] Modal opens with price input
  - [ ] Can set price and list agent
  - [ ] Agent appears with "For Sale" badge in Marketplace
  - [ ] Price displays correctly

- [ ] **Purchase Agent**
  - [ ] "Buy" button appears on agents for sale (not owned)
  - [ ] Purchase confirmation works
  - [ ] Balance checks work (can't buy with insufficient coins)
  - [ ] Purchase transfers ownership
  - [ ] Coins transfer from buyer to seller
  - [ ] Agent removed from sale after purchase
  - [ ] Balance updates correctly

- [ ] **Remove from Sale**
  - [ ] "Remove from Sale" button works
  - [ ] Agent removed from sale
  - [ ] Badge disappears from Marketplace

---

## 3️⃣ Global Features

### State Management
- [ ] **Auto-Refresh**
  - [ ] Agents list updates every 5 seconds
  - [ ] Coin balance updates every 10 seconds
  - [ ] Changes reflect across all pages

- [ ] **Global State Sync**
  - [ ] Creating agent updates Dashboard count
  - [ ] Deleting agent removes from all pages
  - [ ] Battle updates agent stats everywhere
  - [ ] Purchase updates balance in navbar

### UI/UX
- [ ] **Loading States**
  - [ ] Loader appears when fetching data
  - [ ] No blank screens during API calls
  - [ ] Smooth transitions

- [ ] **Notifications**
  - [ ] Success notifications appear
  - [ ] Error notifications appear
  - [ ] Notifications auto-dismiss
  - [ ] Notifications don't block UI

- [ ] **Empty States**
  - [ ] "No agents" message appears when empty
  - [ ] "No matches" message for search/filters
  - [ ] Helpful action buttons in empty states

### Responsive Design
- [ ] **Desktop (1920x1080)**
  - [ ] All pages look good
  - [ ] Grid layouts work
  - [ ] Navigation accessible

- [ ] **Tablet (768px)**
  - [ ] Layout adapts correctly
  - [ ] Cards stack properly
  - [ ] Navigation still usable

- [ ] **Mobile (375px)**
  - [ ] Single column layout
  - [ ] Buttons large enough to tap
  - [ ] Text readable
  - [ ] Navigation works

---

## 4️⃣ Backend / API

### Endpoints
- [ ] **Health Check**
  - [ ] `GET /api/health` returns `{"status":"online"}`

- [ ] **Agents API**
  - [ ] `GET /agents` returns all agents
  - [ ] `GET /agents/:id` returns single agent
  - [ ] `POST /agents` creates agent
  - [ ] `PUT /agents/:id` updates agent
  - [ ] `DELETE /agents/:id` deletes agent

- [ ] **Battle API**
  - [ ] `POST /api/battle` battles two agents
  - [ ] Returns winner/loser with coin rewards
  - [ ] Updates agent stats in database

- [ ] **Breeding API**
  - [ ] `POST /api/breed` breeds two agents
  - [ ] Returns baby agent
  - [ ] Saves baby to database

- [ ] **Chat API**
  - [ ] `GET /api/chat/:agentId` returns chat history
  - [ ] `POST /api/chat` sends message and gets response

- [ ] **Payment API**
  - [ ] `GET /api/payment/balance/:userId` returns balance
  - [ ] `GET /api/payment/history/:userId` returns history
  - [ ] `POST /api/payment/create` creates payment intent
  - [ ] `POST /api/payment/confirm` confirms payment

- [ ] **Agent Actions API**
  - [ ] `POST /agents/:id/refill-energy` works
  - [ ] `POST /agents/:id/xp-boost` works
  - [ ] `POST /agents/:id/rare-trait-roll` works
  - [ ] `POST /agents/:id/list-for-sale` works (if implemented)
  - [ ] `POST /agents/:id/purchase` works (if implemented)

### Database
- [ ] **Tables Exist**
  - [ ] `agents` table created
  - [ ] `user_balance` table created
  - [ ] `payments` table created
  - [ ] `chat_messages` table created

- [ ] **Data Persistence**
  - [ ] Agents persist after server restart
  - [ ] Chat messages persist
  - [ ] Coin balance persists

### Configuration
- [ ] **CORS**
  - [ ] Backend allows requests from `http://localhost:3000`
  - [ ] No CORS errors in console

- [ ] **Environment Variables**
  - [ ] `PORT` set correctly (5001)
  - [ ] `FRONTEND_URL` set (for production)
  - [ ] `OPENAI_API_KEY` set (optional)

---

## 5️⃣ Frontend Checks

### Console
- [ ] **No Errors**
  - [ ] Open browser DevTools (F12)
  - [ ] Check Console tab
  - [ ] No red errors
  - [ ] Only expected warnings (React Router future flags OK)

- [ ] **Network Requests**
  - [ ] All API calls succeed (200 status)
  - [ ] No 404 errors
  - [ ] No CORS errors
  - [ ] Requests go to correct backend URL

### Performance
- [ ] **Page Load**
  - [ ] Pages load in < 3 seconds
  - [ ] No long blank screens
  - [ ] Smooth scrolling

- [ ] **Animations**
  - [ ] Battle animations smooth
  - [ ] No jank or stuttering
  - [ ] Animations don't block interactions

### State Management
- [ ] **AppContext**
  - [ ] Agents state syncs across pages
  - [ ] Coin balance syncs
  - [ ] Updates propagate correctly

---

## 6️⃣ End-to-End Flow Tests

### Test Flow 1: Complete Agent Lifecycle
1. [ ] Create account
2. [ ] Create agent
3. [ ] View agent in "My Agents"
4. [ ] View agent profile
5. [ ] List agent for sale (if implemented)
6. [ ] Verify agent appears in Marketplace with price
7. [ ] Remove from sale (if implemented)
8. [ ] Delete agent
9. [ ] Verify agent removed from all pages

### Test Flow 2: Battle & Rewards
1. [ ] Create 2 agents
2. [ ] Battle them
3. [ ] Verify winner gets +5 coins
4. [ ] Verify loser gets +1 coin
5. [ ] Check coin balance updated in navbar
6. [ ] Verify XP and energy updated
7. [ ] Check stats updated in agent profile

### Test Flow 3: Breeding
1. [ ] Create 2 agents
2. [ ] Breed them
3. [ ] Verify baby agent created
4. [ ] Check baby has combined traits
5. [ ] Verify baby appears in "My Agents"
6. [ ] Verify baby appears in Marketplace

### Test Flow 4: Store & Redemption
1. [ ] Purchase coins (mock payment)
2. [ ] Verify balance updates
3. [ ] Select agent
4. [ ] Refill energy (50 coins)
5. [ ] Verify energy restored to 100
6. [ ] Verify coins deducted
7. [ ] Apply XP boost (100 coins)
8. [ ] Verify coins deducted
9. [ ] Roll rare trait (200 coins)
10. [ ] Verify trait updated and coins deducted

### Test Flow 5: Marketplace Purchase (If Implemented)
1. [ ] User A: Create agent and list for sale (100 coins)
2. [ ] User B: Purchase coins (enough for purchase)
3. [ ] User B: Go to Marketplace
4. [ ] User B: Find agent for sale
5. [ ] User B: Purchase agent
6. [ ] Verify ownership transferred
7. [ ] Verify coins transferred (User B -100, User A +100)
8. [ ] Verify agent removed from sale
9. [ ] Verify agent appears in User B's "My Agents"

---

## 7️⃣ Final Checks

### Code Quality
- [ ] **Console Logs**
  - [ ] Removed excessive debug logs
  - [ ] Kept important error logs
  - [ ] No sensitive data in logs

- [ ] **Error Handling**
  - [ ] All API calls have try/catch
  - [ ] User-friendly error messages
  - [ ] No unhandled promise rejections

### Documentation
- [ ] **README.md** updated
- [ ] **DEPLOYMENT.md** complete
- [ ] **Environment variables** documented

### Security
- [ ] **No Hardcoded Secrets**
  - [ ] API keys in environment variables
  - [ ] No passwords in code
  - [ ] No sensitive data exposed

- [ ] **Input Validation**
  - [ ] User inputs validated
  - [ ] SQL injection prevention (parameterized queries)
  - [ ] XSS prevention (React escapes by default)

---

## 🚨 Critical Issues (Must Fix Before Deploy)

If any of these fail, **DO NOT DEPLOY**:

- [ ] Backend health check fails
- [ ] Can't create agents
- [ ] Can't view agents
- [ ] CORS errors in console
- [ ] Database not persisting data
- [ ] Critical console errors
- [ ] Payment flow completely broken

---

## ✅ Ready to Deploy?

If all critical items pass and most optional items work, you're ready to deploy!

**Next Steps:**
1. Review `DEPLOYMENT.md`
2. Follow `QUICK_START.md`
3. Deploy backend to Render
4. Deploy frontend to Vercel
5. Update CORS with production URLs
6. Test production deployment

---

## 📝 Notes

**Date Tested:** _______________

**Tester:** _______________

**Issues Found:**
- 
- 
- 

**Fixed Issues:**
- 
- 
- 

---

**Good luck with your deployment! 🚀**

