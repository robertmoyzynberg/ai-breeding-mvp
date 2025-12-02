# 🚀 15-Minute Deployment Quick Start

**One-page reference for deploying AI Breeding MVP to production.**

---

## 📦 Pre-Flight (2 min)

```bash
# 1. Push to GitHub (if not already done)
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Verify:** Code is on GitHub ✅

---

## 🔧 Backend → Render (5 min)

### Step 1: Create Service
1. Go to [render.com](https://render.com) → Sign up/Login
2. **New +** → **Web Service**
3. Connect GitHub repo

### Step 2: Configure
- **Name:** `ai-breeding-backend`
- **Root Directory:** `backend` ⚠️ CRITICAL
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free

### Step 3: Environment Variables
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://PLACEHOLDER.vercel.app  ← Update after Vercel deploy
```

### Step 4: Deploy
- Click **Create Web Service**
- Wait for build (2-3 min)
- **Copy Backend URL:** `https://________________.onrender.com` ✅

### Step 5: Verify
Visit: `https://your-backend.onrender.com/api/health`  
Should return: `{"status":"online"}`

---

## 🎨 Frontend → Vercel (5 min)

### Step 1: Create Project
1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. **Add New Project**
3. Import GitHub repo

### Step 2: Configure
- **Framework Preset:** React
- **Root Directory:** `frontend` ⚠️ CRITICAL
- **Build Command:** `npm run build` (default)
- **Output Directory:** `build` (default)

### Step 3: Environment Variables
```
REACT_APP_API_URL=https://your-backend.onrender.com  ← Use Render URL from above
```

### Step 4: Deploy
- Click **Deploy**
- Wait for build (1-2 min)
- **Copy Frontend URL:** `https://________________.vercel.app` ✅

---

## 🔄 Update CORS (2 min)

### Step 1: Update Backend
1. Go back to **Render Dashboard**
2. Click your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` with your Vercel URL
5. Service auto-redeploys

### Step 2: Verify Connection
1. Open your Vercel site
2. Open browser DevTools (F12)
3. Check **Console** tab
4. Should see **no CORS errors** ✅

---

## ✅ Quick Test (1 min)

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Backend health: `https://your-backend.onrender.com/api/health`
- [ ] Create account works
- [ ] No CORS errors in console

---

## 🎯 Critical Checklist

Before starting, verify:
- [ ] Root directory: `backend` (Render) and `frontend` (Vercel)
- [ ] Environment variables set correctly
- [ ] Both URLs use `https://` (not `http://`)
- [ ] CORS updated after frontend deploy

---

## 🔑 Environment Variables Reference

### Render (Backend)
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

**⚠️ Remember:** `REACT_APP_` prefix is required for React!

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check root directory is `backend`/`frontend` |
| CORS errors | Update `FRONTEND_URL` in Render with Vercel URL |
| API calls to localhost | Check `REACT_APP_API_URL` is set in Vercel |
| 404 errors | Verify backend URL is correct |
| Service won't start | Check Render logs for errors |

---

## 📞 URLs to Save

- **Frontend:** `https://________________.vercel.app`
- **Backend:** `https://________________.onrender.com`
- **Health Check:** `https://your-backend.onrender.com/api/health`

---

## ⚡ Deployment Order (Critical!)

1. **Deploy Backend** → Get backend URL
2. **Deploy Frontend** (with backend URL) → Get frontend URL  
3. **Update Backend CORS** (with frontend URL) → Done!

**Don't skip step 3!** CORS must be updated after frontend deploy.

---

## 💡 Pro Tips

- **Free Tier Note:** Render spins down after 15 min inactivity. SQLite may reset. This is normal for MVP.
- **Build Logs:** Always check build logs if something fails
- **HTTPS Only:** Both services use HTTPS by default
- **Auto-Redeploy:** Render auto-redeploys when env vars change

---

## 🎉 You're Live!

Once all steps are complete:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ No errors in console
- ✅ Full app works end-to-end

**Time to share your MVP! 🚀**

---

**Need more detail?** See `DEPLOYMENT.md` for full guide.  
**Troubleshooting?** See `CRITICAL_STEPS.md` for common issues.  
**Step-by-step?** See `DEPLOYMENT_CHECKLIST.md` for detailed checklist.

