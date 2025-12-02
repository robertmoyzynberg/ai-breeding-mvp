# 🚀 Deployment Guide: AI Breeding MVP

This guide will help you deploy your full-stack AI Breeding game to production.

## 📋 Prerequisites

- GitHub account (for code repository)
- Vercel account (free tier works)
- Render account (free tier works)
- Node.js installed locally (for testing)

---

## 🎯 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /Users/robertmoyzynberg/Desktop/ai-breeding-mvp
git init
git add .
git commit -m "Initial commit: Full-stack AI Breeding MVP"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `ai-breeding-mvp`)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-breeding-mvp.git
git branch -M main
git push -u origin main
```

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Connect your GitHub account

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`ai-breeding-mvp`)
3. Configure the service:

   **Name:** `ai-breeding-backend` (or your choice)
   
   **Root Directory:** `backend`
   
   **Environment:** `Node`
   
   **Build Command:** `npm install`
   
   **Start Command:** `npm start`
   
   **Plan:** Free (or paid if you need more resources)

### 2.3 Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENAI_API_KEY=your_openai_key_here (optional, has mock fallback)
```

**Note:** You'll get the `FRONTEND_URL` after deploying the frontend. Update it later.

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your backend
3. Wait for deployment to complete (2-5 minutes)
4. Copy your backend URL (e.g., `https://ai-breeding-backend.onrender.com`)

### 2.5 Update CORS in Backend

Your backend already has CORS configured, but make sure `server.js` includes your Vercel URL:

```javascript
// In backend/src/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    'https://your-vercel-app.vercel.app' // Add your Vercel URL here
  ].filter(Boolean),
  credentials: true
}));
```

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Import your GitHub repository

### 3.2 Configure Project

1. **Framework Preset:** React
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build` (or leave default)
4. **Output Directory:** `build` (default for Create React App)
5. **Install Command:** `npm install`

### 3.3 Environment Variables

Add these in Vercel dashboard:

```
REACT_APP_API_URL=https://ai-breeding-backend.onrender.com
```

**Important:** Replace with your actual Render backend URL from Step 2.4.

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (1-3 minutes)
3. Vercel will provide you with a URL (e.g., `https://ai-breeding-mvp.vercel.app`)

### 3.5 Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend (or it will auto-redeploy)

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Frontend

1. Visit your Vercel URL
2. Create an account
3. Create an agent
4. Test battle, breed, chat, store

### 4.2 Test Backend API

Visit: `https://your-backend-url.onrender.com/api/health`

Should return: `{"status":"online"}`

### 4.3 Check Console

- Open browser DevTools
- Check Network tab for API calls
- Verify all requests go to Render backend
- Check for CORS errors (should be none)

---

## 🔒 Step 5: Database Persistence (Important!)

### 5.1 Render Free Tier Limitation

**Important:** Render's free tier spins down services after 15 minutes of inactivity. This means:
- Your SQLite database file may be reset
- Data is not persistent on free tier

### 5.2 Solutions

**Option A: Upgrade to Paid Tier**
- Render paid tier keeps services always-on
- Database persists

**Option B: Use External Database**
- Migrate to PostgreSQL (Render offers free PostgreSQL)
- Update `backend/src/routes/*.js` to use PostgreSQL instead of SQLite

**Option C: Accept Free Tier Limitations**
- For MVP/testing, free tier is fine
- Data resets after inactivity (good for demos)

### 5.3 Quick PostgreSQL Migration (Optional)

If you want persistent data:

1. In Render dashboard, create a **PostgreSQL** database
2. Get connection string
3. Install `pg` package: `npm install pg`
4. Update database connection in route files
5. Create tables using PostgreSQL syntax

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:** Make sure:
- Backend `FRONTEND_URL` env var matches your Vercel URL
- Frontend `REACT_APP_API_URL` env var matches your Render URL
- Both URLs use `https://` (not `http://`)

### Issue: Backend Not Responding

**Solution:**
- Check Render logs for errors
- Verify `PORT` environment variable (Render uses port 10000 by default)
- Check if service is "spinning up" (free tier)

### Issue: Database Not Persisting

**Solution:**
- Upgrade to paid tier, or
- Migrate to PostgreSQL, or
- Accept free tier limitations

### Issue: Build Fails

**Solution:**
- Check build logs in Vercel/Render
- Verify all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

---

## 📝 Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Backend health check returns `{"status":"online"}`
- [ ] Can create account and agent
- [ ] Battle system works
- [ ] Breeding works
- [ ] Chat works
- [ ] Store works (purchases and redemptions)
- [ ] Coin balance updates correctly
- [ ] No CORS errors in console
- [ ] Mobile responsive (test on phone)

---

## 🎉 You're Live!

Your AI Breeding MVP is now deployed and accessible to the world!

**Frontend:** `https://your-app.vercel.app`
**Backend:** `https://your-backend.onrender.com`

---

## 🔄 Future Enhancements

1. **Custom Domain:** Add custom domain in Vercel
2. **Analytics:** Add Google Analytics or Plausible
3. **Monitoring:** Set up error tracking (Sentry)
4. **Real Payments:** Integrate Stripe/Coinbase
5. **Database:** Migrate to PostgreSQL for production
6. **CDN:** Optimize assets with Vercel's CDN

---

## 📞 Support

If you encounter issues:
1. Check Render/Vercel logs
2. Verify environment variables
3. Test locally first
4. Check GitHub issues/forums

---

**Good luck with your deployment! 🚀**
