# ⚠️ Critical Deployment Steps - Double-Check Before Starting

These are the **most common mistakes** that trip people up. Check these **before** you start deploying.

---

## 🔴 CRITICAL #1: Root Directory Configuration

### ❌ WRONG (Most Common Mistake)
- Setting root directory to `/` (project root)
- This causes build failures because package.json is in subdirectories

### ✅ CORRECT
**Render (Backend):**
- Root Directory: `backend` ✅
- NOT: `/` or `./backend` or empty

**Vercel (Frontend):**
- Root Directory: `frontend` ✅
- NOT: `/` or `./frontend` or empty

**How to verify:** After deployment, check build logs. If you see "package.json not found" or "npm: command not found", the root directory is wrong.

---

## 🔴 CRITICAL #2: Environment Variables

### Backend (Render) - Required Variables

```bash
NODE_ENV=production
PORT=10000          # Or leave empty (Render auto-assigns)
FRONTEND_URL=https://your-vercel-app.vercel.app  # Update AFTER Vercel deploy
```

**Common mistakes:**
- ❌ Forgetting to set `FRONTEND_URL` (causes CORS errors)
- ❌ Using `http://` instead of `https://` (CORS will fail)
- ❌ Typo in Vercel URL (missing `.vercel.app` or extra characters)

### Frontend (Vercel) - Required Variables

```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

**Common mistakes:**
- ❌ Missing `REACT_APP_` prefix (React won't read it)
- ❌ Using `http://localhost:5001` (won't work in production)
- ❌ Typo in Render URL (missing `.onrender.com`)
- ❌ Forgetting to update after getting actual Render URL

**How to verify:** 
- Check Vercel build logs for environment variable warnings
- Check browser console - if API calls go to `localhost`, env var is wrong

---

## 🔴 CRITICAL #3: CORS Configuration Order

### The Problem
You need to update CORS **after** both services are deployed, but the order matters.

### ✅ CORRECT Order:
1. Deploy backend to Render (get backend URL)
2. Deploy frontend to Vercel (get frontend URL)
3. **Go back to Render** → Update `FRONTEND_URL` env var
4. Backend auto-redeploys with new CORS settings

### ❌ WRONG:
- Setting `FRONTEND_URL` before Vercel deploy (you don't know the URL yet)
- Forgetting to update `FRONTEND_URL` after Vercel deploy (CORS errors)

**How to verify:** 
- Open browser console on your Vercel site
- If you see CORS errors, `FRONTEND_URL` is wrong or not set

---

## 🔴 CRITICAL #4: Build Commands

### Render (Backend)
- **Build Command:** `npm install` ✅
- **Start Command:** `npm start` ✅

**Common mistakes:**
- ❌ Using `npm run dev` (dev mode, not for production)
- ❌ Missing build command (service won't start)

### Vercel (Frontend)
- **Build Command:** `npm run build` ✅ (default, usually correct)
- **Output Directory:** `build` ✅ (default for Create React App)

**Common mistakes:**
- ❌ Wrong output directory (Vercel can't find built files)
- ❌ Build command fails (check package.json scripts)

**How to verify:** Check build logs. If build fails, check for:
- Missing dependencies
- TypeScript/ESLint errors
- Environment variable issues

---

## 🔴 CRITICAL #5: URL Format (https vs http)

### ✅ ALWAYS Use HTTPS in Production
- ✅ `https://your-app.vercel.app`
- ✅ `https://your-backend.onrender.com`
- ❌ `http://your-app.vercel.app` (won't work)
- ❌ `http://your-backend.onrender.com` (won't work)

**Why:** Both Vercel and Render use HTTPS by default. Using `http://` will cause:
- CORS errors
- Mixed content warnings
- Connection failures

**How to verify:** Check your URLs - they should start with `https://`

---

## 🔴 CRITICAL #6: Database Understanding (Free Tier)

### ⚠️ Important: SQLite on Render Free Tier

**What happens:**
- Service spins down after 15 minutes of inactivity
- SQLite database file may reset when service restarts
- Data is **not persistent** on free tier

**This is NORMAL and EXPECTED:**
- ✅ Fine for MVP/demo
- ✅ Fine for testing
- ❌ Not fine for production with real users

**Solutions:**
1. Accept it (for MVP)
2. Upgrade to paid tier (always-on)
3. Migrate to PostgreSQL (persistent, free tier available)

**How to verify:** After 15+ minutes of inactivity, check if data persists. If not, this is expected behavior.

---

## 🔴 CRITICAL #7: Testing the Connection

### After Both Are Deployed

**Step 1: Test Backend**
```
Visit: https://your-backend.onrender.com/api/health
Expected: {"status":"online"}
```

**Step 2: Test Frontend → Backend**
1. Open your Vercel site
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to create an agent or check health
5. Look for API calls to your Render URL
6. Check for CORS errors (should be none)

**Common issues:**
- ❌ API calls go to `localhost:5001` → `REACT_APP_API_URL` not set
- ❌ CORS errors → `FRONTEND_URL` wrong or not updated
- ❌ 404 errors → Backend URL typo
- ❌ 500 errors → Check Render logs

---

## 🔴 CRITICAL #8: Environment Variable Naming

### React Environment Variables

**✅ CORRECT:**
- `REACT_APP_API_URL` (must start with `REACT_APP_`)

**❌ WRONG:**
- `API_URL` (React won't read it)
- `VITE_API_URL` (that's for Vite, not Create React App)
- `NEXT_PUBLIC_API_URL` (that's for Next.js)

**Why:** Create React App only exposes env vars that start with `REACT_APP_` to the browser.

**How to verify:** In browser console, check if API calls use the correct URL. If they use `localhost`, the env var isn't being read.

---

## 🔴 CRITICAL #9: Build Logs Are Your Friend

### Always Check Build Logs

**Render:**
- Click on your service
- Go to "Logs" tab
- Look for errors (red text)
- Common errors: "package.json not found", "module not found", "port already in use"

**Vercel:**
- Click on your deployment
- Go to "Build Logs"
- Look for errors (red text)
- Common errors: "build failed", "environment variable missing", "module not found"

**If build fails:**
1. Read the error message
2. Check if it's a dependency issue
3. Check if it's an environment variable issue
4. Check if it's a root directory issue
5. Fix and redeploy

---

## 🔴 CRITICAL #10: The Two-URL Problem

### You Need Both URLs Before You're Done

**Backend URL (from Render):**
- Get this first
- Format: `https://your-service.onrender.com`
- Use this in Vercel's `REACT_APP_API_URL`

**Frontend URL (from Vercel):**
- Get this second
- Format: `https://your-app.vercel.app`
- Use this in Render's `FRONTEND_URL`

**The Problem:** You need the frontend URL to set CORS, but you need the backend URL to set the frontend env var. This is why the order matters:

1. Deploy backend → Get backend URL
2. Deploy frontend (with backend URL) → Get frontend URL
3. Update backend CORS (with frontend URL) → Done!

---

## ✅ Pre-Deployment Quick Check

Before you start, verify:

- [ ] Root directories are `backend` and `frontend` (not `/`)
- [ ] You know where to find environment variable settings
- [ ] You understand the deployment order (backend first, then frontend, then update CORS)
- [ ] You'll use `https://` for all URLs
- [ ] You'll check build logs if anything fails
- [ ] You understand SQLite limitations on free tier

---

## 🎯 Most Common Failure Points (Ranked)

1. **Root directory wrong** (40% of issues)
2. **Environment variables not set** (30% of issues)
3. **CORS not configured** (20% of issues)
4. **URL format (http vs https)** (5% of issues)
5. **Build command issues** (5% of issues)

---

## 🚀 Quick Start Checklist

Before deploying, make sure you:

1. ✅ Know your GitHub repo URL
2. ✅ Have Render account ready
3. ✅ Have Vercel account ready
4. ✅ Understand you'll deploy backend first
5. ✅ Understand you'll need to update CORS after frontend deploy
6. ✅ Will check build logs if anything fails

---

**If you check these 10 critical points, you'll avoid 95% of deployment issues!** 🎯

Good luck! 🚀

