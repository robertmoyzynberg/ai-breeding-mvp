# ✅ Deployment Checklist

Use this checklist to ensure a smooth deployment. Check off each item as you complete it.

---

## 📋 Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] `.gitignore` file includes `node_modules/`, `.env`, `*.sqlite`, `*.db`
- [ ] No hardcoded API URLs (all use environment variables)
- [ ] No console errors in browser DevTools
- [ ] App works locally (frontend + backend)

### Repository Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository is public (or you have Render/Vercel access to private repos)

---

## 🔧 Backend Deployment (Render)

### Account Setup
- [ ] Render account created (sign up at https://render.com)
- [ ] GitHub account connected to Render

### Service Configuration
- [ ] Click "New +" → "Web Service"
- [ ] Connected GitHub repository selected
- [ ] **Root Directory:** `backend` ✅
- [ ] **Environment:** `Node` ✅
- [ ] **Build Command:** `npm install` ✅
- [ ] **Start Command:** `npm start` ✅
- [ ] **Plan:** Free (or Paid if needed)

### Environment Variables (Render Dashboard)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (Render default, or leave empty)
- [ ] `FRONTEND_URL=https://your-vercel-app.vercel.app` (update after Vercel deploy)
- [ ] `OPENAI_API_KEY=your_key_here` (optional, has mock fallback)

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Build completed successfully (check logs)
- [ ] Service is "Live" (green status)
- [ ] Backend URL copied: `https://____________________.onrender.com`

### Backend Verification
- [ ] Health check works: `https://your-backend.onrender.com/api/health`
- [ ] Returns: `{"status":"online"}`
- [ ] No errors in Render logs

---

## 🎨 Frontend Deployment (Vercel)

### Account Setup
- [ ] Vercel account created (sign up at https://vercel.com)
- [ ] GitHub account connected to Vercel

### Project Configuration
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] **Framework Preset:** React ✅
- [ ] **Root Directory:** `frontend` ✅
- [ ] **Build Command:** `npm run build` (default) ✅
- [ ] **Output Directory:** `build` (default) ✅
- [ ] **Install Command:** `npm install` (default) ✅

### Environment Variables (Vercel Dashboard)
- [ ] `REACT_APP_API_URL=https://your-backend.onrender.com` (use your Render URL)

### Deployment
- [ ] Clicked "Deploy"
- [ ] Build completed successfully (check logs)
- [ ] Deployment is "Ready" (green status)
- [ ] Frontend URL copied: `https://____________________.vercel.app`

### Frontend Verification
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] API calls go to Render backend (check Network tab)

---

## 🔄 Post-Deployment Configuration

### Update Backend CORS
- [ ] Go back to Render dashboard
- [ ] Update `FRONTEND_URL` environment variable with your Vercel URL
- [ ] Service auto-redeploys (or manually redeploy)
- [ ] CORS now allows requests from Vercel

### Verify Connection
- [ ] Frontend can communicate with backend
- [ ] No CORS errors in console
- [ ] Health check works from frontend

---

## 🧪 Full Flow Testing

### Account & Agent Creation
- [ ] Can create account (enter username)
- [ ] Can create first agent
- [ ] Agent appears in "My Agents" page
- [ ] Agent profile page loads correctly

### Battle System
- [ ] Can select two agents to battle
- [ ] Battle animation plays
- [ ] Winner/loser displayed correctly
- [ ] XP and energy updated after battle
- [ ] Coins awarded (winner +5, loser +1)
- [ ] Coin balance updates in navigation bar

### Breeding System
- [ ] Can select Parent A
- [ ] Can select Parent B
- [ ] Breeding result page shows baby agent
- [ ] Baby agent has combined traits
- [ ] Baby agent appears in "My Agents"

### Chat System
- [ ] Can open chat with agent
- [ ] Can send messages
- [ ] AI responds (or shows mock response)
- [ ] Chat history persists
- [ ] Messages display correctly

### Store & Payments
- [ ] Store page loads
- [ ] Coin balance displays correctly
- [ ] Can "purchase" coins (mock payment)
- [ ] Payment success page works
- [ ] Payment cancel page works
- [ ] Can redeem coins for:
  - [ ] Energy refill (50 coins)
  - [ ] XP boost (100 coins)
  - [ ] Rare trait roll (200 coins)
- [ ] Balance updates after redemption

### Agent Management
- [ ] Can view agent profile
- [ ] Can delete agent
- [ ] Can use action buttons (Chat, Battle, Breed)

---

## 🔍 Final Verification

### Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile (responsive design)

### Performance
- [ ] Pages load quickly (< 3 seconds)
- [ ] API responses are fast (< 1 second)
- [ ] No console errors
- [ ] No network errors

### Security
- [ ] No sensitive data in console logs
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] HTTPS enabled (Vercel/Render default)

---

## 📝 Database Considerations

### SQLite (Current - Free Tier)
- [ ] Understand: Data resets after 15 min inactivity on free tier
- [ ] Acceptable for MVP/demo purposes ✅

### PostgreSQL (Optional - Production)
- [ ] Created PostgreSQL database in Render
- [ ] Updated connection string in backend
- [ ] Migrated database schema
- [ ] Tested database persistence

---

## 🎉 Launch Checklist

### Final Steps
- [ ] All tests pass
- [ ] No critical errors
- [ ] Documentation updated (README.md)
- [ ] Share your live URL! 🚀

### URLs to Save
- **Frontend:** `https://____________________.vercel.app`
- **Backend:** `https://____________________.onrender.com`
- **GitHub Repo:** `https://github.com/____________________`

---

## 🐛 Troubleshooting (If Issues)

### Backend Issues
- [ ] Check Render logs for errors
- [ ] Verify environment variables are set
- [ ] Check if service is "spinning up" (free tier)
- [ ] Verify PORT is correct (10000 for Render)

### Frontend Issues
- [ ] Check Vercel build logs
- [ ] Verify `REACT_APP_API_URL` is correct
- [ ] Clear browser cache
- [ ] Check browser console for errors

### CORS Issues
- [ ] Verify `FRONTEND_URL` in Render matches Vercel URL
- [ ] Check both URLs use `https://` (not `http://`)
- [ ] Redeploy backend after updating CORS

### Database Issues
- [ ] Understand free tier limitations
- [ ] Consider upgrading to paid tier
- [ ] Or migrate to PostgreSQL

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Issues:** Check your repo for issues
- **Console Logs:** Always check logs first!

---

**🎊 Congratulations! Your MVP is live!**

---

## Quick Reference

### Backend Environment Variables (Render)
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENAI_API_KEY=your_key (optional)
```

### Frontend Environment Variables (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Test URLs
- Health: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-app.vercel.app`

---

**Last Updated:** Ready for deployment! 🚀

