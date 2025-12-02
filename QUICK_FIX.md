# 🔧 Quick Fix: Payment Route 404 Error

## Issue
The `/api/payment/create-checkout-session` route returns 404.

## Solution

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This will install Stripe and other missing dependencies.

### Step 2: Restart Backend Server

**If using `npm run dev`:**
- Stop the server (Ctrl+C)
- Restart: `npm run dev`

**If using `npm start`:**
- Stop the server (Ctrl+C)
- Restart: `npm start`

### Step 3: Verify Route Works

Test the route:
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","amount":9.99}'
```

Should return a checkout session object (or mock payment if Stripe not configured).

---

## Why This Happened

1. **Stripe package not installed** - Added to `package.json` but `npm install` wasn't run
2. **Server not restarted** - New routes require server restart

---

## After Fix

The payment flow should work:
1. Click "Purchase" in Store
2. Creates checkout session
3. Redirects to Stripe (or mock payment)
4. Returns to success page

---

**Status**: Run `npm install` in backend folder, then restart server.

