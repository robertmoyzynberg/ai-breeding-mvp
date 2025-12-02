# 👤 vs 🤖 Human vs. Cursor Pre-Deploy Script

**One-page reference: What you do vs. what Cursor handles automatically**

---

## Phase 1 — Local Setup & Verification

| Step | 👤 Human Action | 🤖 Cursor Action |
|------|----------------|------------------|
| 1 | Ensure all code is committed and pushed to GitHub | — |
| 2 | Verify .env files locally and set FRONTEND_URL | — |
| 3 | Check backend root directory, server scripts, ports | — |
| 4 | Start backend (`cd backend && npm start`) | Listens for API calls, logs hits |
| 5 | Start frontend (`cd frontend && npm start`) | Auto-refreshes state, fetches backend data |
| 6 | Open app in browser, verify console shows no errors | Logs API calls and errors |
| 7 | Confirm AppContext auto-refresh is working | Auto-fetches agents and updates UI every 5–10s |

---

## Phase 2 — Core Feature Testing

| Step | 👤 Human Action | 🤖 Cursor Action |
|------|----------------|------------------|
| 1 | Create account | Updates backend DB |
| 2 | Create agent via Dashboard | Saves agent, updates global state |
| 3 | Open MyAgents | Displays all user agents |
| 4 | Open Marketplace | Fetches all agents, updates grid |
| 5 | Search/filter/sort agents | Filters in real-time |
| 6 | Select parents, breed | Handles API call, displays baby |
| 7 | Battle two agents | Animates battle, updates health, energy, XP, coins |
| 8 | Check notifications & loading spinners | Displays automatically |
| 9 | Verify empty states (if applicable) | Handles UI display |

---

## Phase 3 — Store & Coin Economy

| Step | 👤 Human Action | 🤖 Cursor Action |
|------|----------------|------------------|
| 1 | Open Store page | Fetches balance and packages |
| 2 | Buy coin packages (mock) | Processes purchase, updates balance |
| 3 | Redeem coins for: energy, XP, rare traits | Updates agent stats via API |
| 4 | Verify updated agent stats | Refreshes UI and global state |
| 5 | Visit /payment/success and /payment/cancel pages | Fetches updated balance, shows notifications |

---

## Phase 4 — Pre-Deployment Validation

| Step | 👤 Human Action | 🤖 Cursor Action |
|------|----------------|------------------|
| 1 | Read CRITICAL_STEPS.md and DEPLOYMENT_CHECKLIST.md | — |
| 2 | Fill in deployment URLs in checklist | — |
| 3 | Verify env vars in Vercel (frontend) and Render (backend) | — |
| 4 | Deploy backend to Render | Server build, route availability |
| 5 | Deploy frontend to Vercel | Build, fetch backend API |
| 6 | Update backend CORS to Vercel URL | — |
| 7 | Run full end-to-end test on live deployment | Updates state/UI, auto-refresh works |
| 8 | Monitor console logs for errors | Logs API calls and errors |

---

## Phase 5 — Optional / Post-Deployment

| Step | 👤 Human Action | 🤖 Cursor Action |
|------|----------------|------------------|
| 1 | Test Marketplace filters, search, sorting | Updates grid automatically |
| 2 | Test BattleArena with multiple agents | Handles animations, coin rewards |
| 3 | Stress test Store (multiple purchases/redeems) | Processes payments and updates balance |
| 4 | Switch from mock payments → real Stripe/Coinbase | Calls real payment APIs |
| 5 | Observe logs, fix any UI or backend errors | Auto-refreshes and updates UI |

---

## ✅ Quick Reference — Top Human Actions

1. **Push code & verify .env**
2. **Start backend and frontend locally**
3. **Click to create accounts, agents, breed, battle**
4. **Navigate Marketplace & Store pages**
5. **Check console for errors & UI feedback**
6. **Deploy backend/frontend**
7. **Update CORS, verify URLs**
8. **Perform live end-to-end tests**
9. **Trigger purchases and coin redemptions**
10. **Stress test features if desired**

---

## 💡 Key Insight

**Cursor handles:**
- All API communication
- Auto-refresh (every 5-10 seconds)
- State synchronization across pages
- Animations and UI updates
- Coin updates and balance sync
- Notifications and error handling

**You handle:**
- Configuration and setup
- Clicking buttons and navigation
- Deployment triggers
- Monitoring and validation
- Environment variables
- CORS updates

---

## 🎯 Tip

**Cursor handles all API communication, auto-refresh, state sync, animations, coin updates, and notifications. You mainly click, verify, deploy, and configure.**

---

**Ready to deploy?** Follow `QUICK_START.md` next! 🚀

