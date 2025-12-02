# 🏗️ Build Instructions

## Overview
This document provides step-by-step instructions for building and deploying the AI Breeding MVP.

---

## 📦 Prerequisites

- **Node.js** v18+ installed
- **npm** or **yarn** package manager
- **Git** for version control
- **Stripe Account** (for payments)
- **Vercel Account** (for frontend)
- **Render Account** (for backend)

---

## 🔧 Local Development Build

### Backend Build

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env`
   - Fill in required values:
     ```env
     PORT=5001
     DATABASE_PATH=./db.sqlite
     FRONTEND_URL=http://localhost:3000
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     OPENAI_API_KEY=sk-... (optional)
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:5001`
   - Health check: `http://localhost:5001/api/health`

---

### Frontend Build

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create `.env` file:
     ```env
     REACT_APP_API_URL=http://localhost:5001
     REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... (optional)
     ```

4. **Start development server**
   ```bash
   npm start
   ```
   - App runs on `http://localhost:3000`
   - Auto-opens in browser

---

## 🚀 Production Build

### Backend Production Build

1. **Build for production**
   ```bash
   cd backend
   npm install --production
   ```

2. **Start production server**
   ```bash
   npm start
   ```
   - Uses `node src/server.js`
   - No file watching (production mode)

3. **Verify**
   ```bash
   curl http://localhost:5001/api/health
   ```
   - Should return: `{status: "online"}`

---

### Frontend Production Build

1. **Build React app**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Verify build**
   - Check `frontend/build/` directory exists
   - Contains `index.html` and static assets
   - No build errors in console

3. **Test production build locally (optional)**
   ```bash
   npm install -g serve
   serve -s build -l 3000
   ```
   - Visit `http://localhost:3000`
   - Verify all features work

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```
   - Follow prompts
   - Set environment variables:
     - `REACT_APP_API_URL` = Your backend URL

4. **Or use GitHub Integration**
   - Push code to GitHub
   - Connect repo to Vercel
   - Vercel auto-deploys on push

5. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add:
     - `REACT_APP_API_URL` = `https://your-backend.onrender.com`

---

### Backend Deployment (Render)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**
   - **Name**: `ai-breeding-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or Paid for better performance)

3. **Set Environment Variables**
   - Go to Environment tab
   - Add all variables from `env.example`:
     ```
     NODE_ENV=production
     PORT=5001
     DATABASE_PATH=./db.sqlite
     FRONTEND_URL=https://your-frontend.vercel.app
     STRIPE_SECRET_KEY=sk_live_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     OPENAI_API_KEY=sk-...
     CORS_ORIGIN=https://your-frontend.vercel.app
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Render builds and deploys automatically
   - Note the service URL (e.g., `https://ai-breeding-backend.onrender.com`)

5. **Update Frontend**
   - Update `REACT_APP_API_URL` in Vercel to point to Render URL

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      # Add deployment steps here

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Add deployment steps here
```

---

## 🧪 Pre-Deployment Checklist

- [ ] All tests pass (see `TEST_FULL_FLOW.md`)
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Stripe keys set (test or live)
- [ ] CORS configured correctly
- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Health check endpoint works
- [ ] All API endpoints return valid JSON
- [ ] No console errors in browser
- [ ] Payment flow tested
- [ ] Webhook endpoint accessible

---

## 🔍 Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   - Should return: `{status: "online"}`

2. **Frontend Loads**
   - Visit frontend URL
   - Verify page loads
   - Check browser console for errors

3. **API Connectivity**
   - Create account
   - Create agent
   - Verify data persists

4. **Payment Test**
   - Go to Store
   - Attempt purchase (test mode)
   - Verify coins added

---

## 🐛 Troubleshooting

### Build Fails

**Frontend:**
- Check Node.js version (v18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors
- Verify all dependencies installed

**Backend:**
- Check Node.js version
- Verify database path exists
- Check environment variables

### Deployment Fails

**Vercel:**
- Check build logs
- Verify `vercel.json` configuration
- Check environment variables

**Render:**
- Check build logs
- Verify `render.yaml` configuration
- Check start command
- Verify environment variables

### Runtime Errors

- Check server logs
- Verify database connection
- Check API endpoints
- Verify CORS configuration

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [React Build Documentation](https://create-react-app.dev/docs/deployment/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## ✅ Build Status

After successful build and deployment:

- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Health Check: Working
- ✅ All Features: Functional
- ✅ Payments: Configured
- ✅ Database: Connected

---

**Ready for production! 🚀**

