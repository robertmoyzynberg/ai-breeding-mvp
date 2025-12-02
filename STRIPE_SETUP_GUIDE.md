# 💳 Stripe Payment Integration Setup Guide

## Overview
This guide will walk you through setting up real Stripe payment processing for the AI Breeding MVP.

---

## 📋 Prerequisites

1. **Stripe Account**
   - Sign up at [https://stripe.com](https://stripe.com)
   - Complete account verification
   - Access your Stripe Dashboard

2. **API Keys**
   - Navigate to: **Developers → API Keys**
   - Copy your **Secret Key** (starts with `sk_test_` for test mode)
   - Copy your **Publishable Key** (starts with `pk_test_` for test mode)

---

## 🔧 Step 1: Get Your Stripe Keys

### Test Mode (Development)
1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy the **Secret key** (starts with `sk_test_`)
3. Copy the **Publishable key** (starts with `pk_test_`)

### Production Mode (Live)
1. Switch to **Live mode** in Stripe Dashboard
2. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
3. Copy the **Secret key** (starts with `sk_live_`)
4. Copy the **Publishable key** (starts with `pk_live_`)

---

## 🔧 Step 2: Set Up Webhook Endpoint

### For Local Development (using Stripe CLI)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   # Download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:5001/api/payment/webhook
   ```

4. **Copy the Webhook Signing Secret**
   - The CLI will output: `whsec_...`
   - Copy this value for your `.env` file

### For Production (Render/Heroku/etc.)

1. **Go to Stripe Dashboard → Webhooks**
   - URL: `https://your-backend-url.com/api/payment/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Copy Webhook Signing Secret**
   - After creating the webhook, click on it
   - Copy the **Signing secret** (starts with `whsec_`)

---

## 🔧 Step 3: Configure Environment Variables

### Local Development

Create a `.env` file in the `backend/` directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Other variables...
NODE_ENV=development
PORT=5001
```

### Production (Render)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the following variables:

| Key | Value | Description |
|-----|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Your live Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Your webhook signing secret |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your frontend URL |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | CORS origin |

---

## 🔧 Step 4: Update Frontend (Optional)

If you want to use Stripe Elements for a custom checkout:

1. **Install Stripe.js**
   ```bash
   cd frontend
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Add Publishable Key**
   - Create `frontend/.env`:
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

3. **Update Store Component**
   - Import Stripe: `import { loadStripe } from '@stripe/stripe-js'`
   - Initialize: `const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)`
   - Redirect to checkout: `stripe.redirectToCheckout({ sessionId })`

---

## 🧪 Step 5: Test the Integration

### Test Mode Cards

Use these test card numbers in Stripe Checkout:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication |

- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Test Flow

1. **Start Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Test Purchase**
   - Go to Store page
   - Click "Purchase" on a coin package
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Verify coins added to balance

4. **Check Webhook Logs**
   - In Stripe Dashboard → Webhooks
   - View event logs
   - Verify `checkout.session.completed` event

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Use Webhook Signing**
   - Always verify webhook signatures
   - Prevents unauthorized requests

3. **Use HTTPS in Production**
   - Stripe requires HTTPS for webhooks
   - Render/Vercel provide HTTPS by default

4. **Test Mode vs Live Mode**
   - Use test keys for development
   - Switch to live keys only in production
   - Test thoroughly before going live

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

1. **Check Webhook URL**
   - Must be publicly accessible (use ngrok for local testing)
   - Must use HTTPS in production

2. **Verify Webhook Secret**
   - Check `.env` file has correct `STRIPE_WEBHOOK_SECRET`
   - Re-copy from Stripe Dashboard if needed

3. **Check Server Logs**
   - Look for webhook errors in backend logs
   - Verify webhook endpoint is accessible

### Payment Not Completing

1. **Check Stripe Dashboard**
   - Go to Payments → View payment status
   - Check for error messages

2. **Verify Database**
   - Check `payments` table for payment records
   - Verify `user_balance` table updates

3. **Check Frontend Redirect**
   - Verify `FRONTEND_URL` is correct
   - Check success/cancel pages load correctly

### Test Mode vs Live Mode Issues

- **Test keys won't work in live mode**
- **Live keys won't work in test mode**
- Make sure you're using matching keys

---

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

---

## ✅ Checklist

- [ ] Stripe account created and verified
- [ ] API keys obtained (test and/or live)
- [ ] Webhook endpoint configured
- [ ] Webhook signing secret copied
- [ ] Environment variables set (local and production)
- [ ] Test payment completed successfully
- [ ] Webhook events received and processed
- [ ] Coins added to user balance
- [ ] Payment history recorded in database

---

## 🚀 Going Live

When ready for production:

1. **Switch to Live Mode**
   - Update `STRIPE_SECRET_KEY` to live key
   - Update `STRIPE_WEBHOOK_SECRET` to live webhook secret
   - Update `FRONTEND_URL` to production URL

2. **Test with Real Card**
   - Use a real card with small amount ($0.50)
   - Verify payment processes correctly
   - Verify webhook receives events

3. **Monitor**
   - Check Stripe Dashboard regularly
   - Monitor webhook success rate
   - Set up email alerts for failed payments

---

**Need Help?** Check the [Stripe Support Center](https://support.stripe.com/) or [Stripe Discord](https://discord.gg/stripe).

