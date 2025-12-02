# ✅ Human Steps Checklist

## 🚨 IMMEDIATE (Do This First)

### 1. Restart Backend Server ⚠️ REQUIRED
**Why:** Database migration needs to run to fix payment errors

```bash
# Stop current server (Ctrl+C)
cd backend
npm run dev
```

**Check:** Look for console message: `[Payment] Added coins column to payments table`

**Time:** 30 seconds

---

## 🧪 LOCAL TESTING (Before Deployment)

### 2. Test Payment Flow
- [ ] Go to Store page
- [ ] Click "Purchase" on a coin package
- [ ] Verify it works (will use mock payment if Stripe not configured)
- [ ] Check that coins are added to balance

**Time:** 2 minutes

### 3. Test All Features
- [ ] Create an agent
- [ ] Battle two agents
- [ ] Breed two agents
- [ ] List agent for sale
- [ ] Purchase agent from marketplace
- [ ] Use chat feature

**Time:** 10 minutes

---

## 💳 STRIPE SETUP (Optional - For Real Payments)

### 4. Create Stripe Account
- [ ] Go to [https://stripe.com](https://stripe.com)
- [ ] Sign up for account
- [ ] Verify email
- [ ] Complete account setup

**Time:** 5 minutes

### 5. Get Stripe API Keys
- [ ] Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
- [ ] Copy **Secret Key** (starts with `sk_test_`)
- [ ] Copy **Publishable Key** (starts with `pk_test_`)

**Time:** 2 minutes

### 6. Set Up Webhook (Local Development)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:5001/api/payment/webhook
```
- [ ] Copy the webhook secret (starts with `whsec_`)

**Time:** 5 minutes

### 7. Configure Environment Variables (Local)
- [ ] Create `backend/.env` file:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-your_openai_key_here (optional)
```

- [ ] Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here (optional)
```

**Time:** 2 minutes

### 8. Test Real Stripe Payment
- [ ] Restart backend server
- [ ] Go to Store page
- [ ] Click "Purchase"
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify coins added

**Time:** 3 minutes

---

## 🚀 DEPLOYMENT (Production)

### 9. Deploy Backend to Render

#### 9a. Create Render Account
- [ ] Go to [https://render.com](https://render.com)
- [ ] Sign up (free tier available)
- [ ] Verify email

**Time:** 3 minutes

#### 9b. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository: `robertmoyzynberg/ai-breeding-mvp`
- [ ] Configure service:
  - **Name:** `ai-breeding-backend`
  - **Environment:** `Node`
  - **Build Command:** `cd backend && npm install`
  - **Start Command:** `cd backend && npm start`
  - **Plan:** Free (or Paid for better performance)

**Time:** 5 minutes

#### 9c. Set Environment Variables (Render)
- [ ] Go to Environment tab
- [ ] Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5001` | (or let Render assign) |
| `DATABASE_PATH` | `./db.sqlite` | |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Update after frontend deploy |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Your Stripe key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe Dashboard |
| `OPENAI_API_KEY` | `sk-...` | Optional |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Update after frontend deploy |

**Time:** 5 minutes

#### 9d. Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete
- [ ] Copy the service URL (e.g., `https://ai-breeding-backend.onrender.com`)
- [ ] Test health check: `https://your-backend.onrender.com/api/health`

**Time:** 5 minutes (build time)

#### 9e. Set Up Stripe Webhook (Production)
- [ ] Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Click "Add endpoint"
- [ ] URL: `https://your-backend.onrender.com/api/payment/webhook`
- [ ] Events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- [ ] Copy the webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Render environment variables

**Time:** 5 minutes

---

### 10. Deploy Frontend to Vercel

#### 10a. Create Vercel Account
- [ ] Go to [https://vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Authorize Vercel

**Time:** 2 minutes

#### 10b. Import Project
- [ ] Click "Add New Project"
- [ ] Select repository: `robertmoyzynberg/ai-breeding-mvp`
- [ ] Configure:
  - **Framework Preset:** Create React App
  - **Root Directory:** `frontend`
  - **Build Command:** `npm run build`
  - **Output Directory:** `build`

**Time:** 2 minutes

#### 10c. Set Environment Variables (Vercel)
- [ ] Go to Project Settings → Environment Variables
- [ ] Add:
  - `REACT_APP_API_URL` = `https://your-backend.onrender.com`
  - `REACT_APP_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` or `pk_test_...` (optional)

**Time:** 2 minutes

#### 10d. Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Copy the frontend URL (e.g., `https://ai-breeding-mvp.vercel.app`)

**Time:** 3 minutes (build time)

#### 10e. Update Backend CORS
- [ ] Go back to Render dashboard
- [ ] Update environment variables:
  - `FRONTEND_URL` = `https://your-frontend.vercel.app`
  - `CORS_ORIGIN` = `https://your-frontend.vercel.app`
- [ ] Restart the service (or it will auto-restart)

**Time:** 2 minutes

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 11. Test Production Deployment
- [ ] Visit your frontend URL
- [ ] Create an account
- [ ] Create an agent
- [ ] Test battle system
- [ ] Test breeding
- [ ] Test payment flow (use test card)
- [ ] Check browser console for errors
- [ ] Verify all features work

**Time:** 10 minutes

### 12. Monitor & Debug
- [ ] Check Render logs for backend errors
- [ ] Check Vercel logs for frontend errors
- [ ] Test Stripe webhook events in Stripe Dashboard
- [ ] Verify database persists data

**Time:** 5 minutes

---

## 📋 QUICK REFERENCE

### Essential Steps (Minimum)
1. ✅ Restart backend server (fixes payment error)
2. ✅ Test locally
3. ✅ Deploy backend to Render
4. ✅ Deploy frontend to Vercel
5. ✅ Set environment variables
6. ✅ Test production

**Total Time:** ~30-45 minutes

### Full Setup (With Stripe)
1. ✅ All essential steps
2. ✅ Get Stripe keys
3. ✅ Configure webhooks
4. ✅ Test real payments

**Total Time:** ~1 hour

---

## 🆘 TROUBLESHOOTING

### If Payment Doesn't Work
- [ ] Check backend server is running
- [ ] Verify database migration ran (check console logs)
- [ ] Check Stripe keys are correct
- [ ] Verify webhook URL is accessible

### If Deployment Fails
- [ ] Check build logs in Render/Vercel
- [ ] Verify environment variables are set
- [ ] Check that `package.json` has correct scripts
- [ ] Verify database path is correct

### If CORS Errors
- [ ] Verify `FRONTEND_URL` matches actual frontend URL
- [ ] Check `CORS_ORIGIN` in backend environment
- [ ] Ensure URLs don't have trailing slashes

---

## 📚 DOCUMENTATION REFERENCE

- **Stripe Setup:** See `STRIPE_SETUP_GUIDE.md`
- **Deployment:** See `build_instructions.md`
- **Testing:** See `TEST_FULL_FLOW.md`
- **Database:** See `DATABASE_MIGRATION_PLAN.md`

---

## ✅ COMPLETION CHECKLIST

- [ ] Backend server restarted
- [ ] Local testing passed
- [ ] Stripe account created (optional)
- [ ] Stripe keys obtained (optional)
- [ ] Environment variables configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Production testing passed
- [ ] All features working

---

**Status:** Ready to start! Begin with Step 1 (restart backend server).

