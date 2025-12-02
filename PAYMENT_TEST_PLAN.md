# 💳 Payment System Test Plan

## Overview
Comprehensive testing plan for the payment system including Stripe integration and mock payments.

---

## 🧪 Test Suite 1: Mock Payment Flow

### Test 1.1: Create Mock Payment
**Steps:**
1. Go to Store page
2. Click "Purchase" on a coin package (e.g., 100 coins for $9.99)
3. Verify no Stripe keys configured (mock mode)

**Expected:**
- ✅ Payment record created in database
- ✅ Status: "pending"
- ✅ Payment method: "mock"
- ✅ Coins calculated correctly (100 for $9.99)
- ✅ Returns `mock: true` in response

**API Test:**
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","amount":9.99}'
```

**Expected Response:**
```json
{
  "sessionId": "mock_session_XX",
  "paymentId": XX,
  "coins": 100,
  "mock": true,
  "message": "Stripe not configured. Using mock payment for development."
}
```

---

### Test 1.2: Confirm Mock Payment
**Steps:**
1. After creating mock payment
2. Frontend calls `confirmPayment`
3. Verify coins added to balance

**Expected:**
- ✅ Payment status updated to "completed"
- ✅ Coins added to user balance
- ✅ Balance updated in navigation
- ✅ Success notification shown

**API Test:**
```bash
curl -X POST http://localhost:5001/api/payment/confirm \
  -H "Content-Type: application/json" \
  -d '{"paymentId":1,"userId":"testuser","coins":100,"transactionId":"mock_tx_123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "coins": 100,
  "message": "Successfully added 100 coins"
}
```

---

## 🧪 Test Suite 2: Stripe Payment Flow (Production)

### Test 2.1: Create Stripe Checkout Session
**Prerequisites:**
- Stripe keys configured
- `STRIPE_SECRET_KEY` set

**Steps:**
1. Configure Stripe keys in `.env`
2. Restart backend
3. Go to Store
4. Click "Purchase"

**Expected:**
- ✅ Stripe checkout session created
- ✅ Payment record in database
- ✅ Redirect to Stripe Checkout URL
- ✅ Session ID stored

**API Test:**
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","amount":9.99}'
```

**Expected Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "paymentId": XX,
  "coins": 100
}
```

---

### Test 2.2: Complete Stripe Checkout
**Steps:**
1. Use test card: `4242 4242 4242 4242`
2. Complete checkout
3. Verify redirect to success page

**Expected:**
- ✅ Redirected to success page
- ✅ Session ID in URL
- ✅ Payment verified
- ✅ Coins added

---

### Test 2.3: Stripe Webhook Events
**Prerequisites:**
- Stripe CLI running: `stripe listen --forward-to localhost:5001/api/payment/webhook`
- Webhook secret configured

**Test Events:**
1. **checkout.session.completed**
   - Trigger: Complete checkout
   - Expected: Payment confirmed, coins added

2. **payment_intent.succeeded**
   - Trigger: Payment succeeds
   - Expected: Payment status updated, coins added

3. **payment_intent.payment_failed**
   - Trigger: Payment fails
   - Expected: Payment status set to "failed"

**Webhook Test:**
```bash
stripe trigger checkout.session.completed
```

**Expected Logs:**
```
[Payment] Webhook: checkout.session.completed
[Payment] Checkout completed: 100 coins added to user testuser
```

---

## 🧪 Test Suite 3: Payment Verification

### Test 3.1: Verify Payment Success
**Steps:**
1. Complete payment (mock or real)
2. Navigate to `/payment/success?session_id=XXX`
3. Verify coins added

**API Test:**
```bash
curl "http://localhost:5001/api/payment/success?session_id=mock_session_1"
```

**Expected:**
- ✅ Payment verified
- ✅ Coins confirmed
- ✅ Balance updated

---

### Test 3.2: Payment History
**Steps:**
1. Make multiple payments
2. Check payment history

**API Test:**
```bash
curl http://localhost:5001/api/payment/history/testuser
```

**Expected:**
- ✅ All payments listed
- ✅ Correct statuses
- ✅ Correct amounts
- ✅ Correct coins

---

## 🧪 Test Suite 4: Error Handling

### Test 4.1: Missing User ID
**API Test:**
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"amount":9.99}'
```

**Expected:**
- ✅ 400 Bad Request
- ✅ Error: "userId and amount are required"

---

### Test 4.2: Invalid Amount
**API Test:**
```bash
curl -X POST http://localhost:5001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","amount":-10}'
```

**Expected:**
- ✅ Payment created (amount validation on frontend)
- ✅ Coins calculated from amount

---

### Test 4.3: Webhook Signature Failure
**Steps:**
1. Send invalid webhook signature
2. Verify error handling

**Expected:**
- ✅ 400 Bad Request
- ✅ Error logged
- ✅ No payment processing

---

### Test 4.4: Database Errors
**Steps:**
1. Simulate database error
2. Verify graceful handling

**Expected:**
- ✅ Error logged
- ✅ 500 status returned
- ✅ User-friendly error message

---

## 🧪 Test Suite 5: Coin Package Mapping

### Test 5.1: Standard Packages
- [ ] $4.99 → 50 coins
- [ ] $9.99 → 100 coins
- [ ] $19.99 → 250 coins
- [ ] $39.99 → 500 coins
- [ ] $79.99 → 1000 coins

### Test 5.2: Custom Amounts
- [ ] $1.00 → 10 coins (default calculation)
- [ ] $5.00 → 50 coins (if in mapping)
- [ ] $10.00 → 100 coins (if in mapping)

---

## 🧪 Test Suite 6: Balance Updates

### Test 6.1: Initial Balance
**API Test:**
```bash
curl http://localhost:5001/api/payment/balance/testuser
```

**Expected:**
- ✅ Returns `{"coins": 0}` for new user
- ✅ Returns actual balance for existing user

---

### Test 6.2: Balance After Payment
**Steps:**
1. Check initial balance
2. Make payment
3. Check balance again

**Expected:**
- ✅ Balance increased by payment amount
- ✅ Balance updates immediately
- ✅ Balance persists after refresh

---

### Test 6.3: Multiple Payments
**Steps:**
1. Make payment 1: 100 coins
2. Make payment 2: 50 coins
3. Check balance

**Expected:**
- ✅ Balance = 150 coins
- ✅ Both payments recorded
- ✅ History shows both

---

## 🧪 Test Suite 7: Frontend Integration

### Test 7.1: Store Page
- [ ] Coin packages displayed
- [ ] Current balance shown
- [ ] Purchase button works
- [ ] Loading state during payment
- [ ] Success notification
- [ ] Error notification

### Test 7.2: Payment Success Page
- [ ] Redirects after payment
- [ ] Shows success message
- [ ] Displays coins added
- [ ] Auto-redirects to dashboard
- [ ] Balance updated

### Test 7.3: Payment Cancel Page
- [ ] Shows cancel message
- [ ] Option to retry
- [ ] No coins added
- [ ] Payment status: "cancelled"

---

## 🧪 Test Suite 8: Production Readiness

### Test 8.1: Environment Variables
- [ ] All required variables set
- [ ] Stripe keys valid (if using)
- [ ] Frontend URL correct
- [ ] CORS configured

### Test 8.2: Webhook URL
- [ ] Webhook URL publicly accessible
- [ ] HTTPS enabled (required by Stripe)
- [ ] Webhook secret configured
- [ ] Events received correctly

### Test 8.3: Database
- [ ] Payments table exists
- [ ] All columns present
- [ ] Migrations run successfully
- [ ] Data persists

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: Development / Production

Mock Payment Tests:
  [ ] Test 1.1: Create Mock Payment - PASS / FAIL
  [ ] Test 1.2: Confirm Mock Payment - PASS / FAIL

Stripe Payment Tests:
  [ ] Test 2.1: Create Checkout Session - PASS / FAIL
  [ ] Test 2.2: Complete Checkout - PASS / FAIL
  [ ] Test 2.3: Webhook Events - PASS / FAIL

Verification Tests:
  [ ] Test 3.1: Verify Success - PASS / FAIL
  [ ] Test 3.2: Payment History - PASS / FAIL

Error Handling:
  [ ] Test 4.1: Missing User ID - PASS / FAIL
  [ ] Test 4.2: Invalid Amount - PASS / FAIL
  [ ] Test 4.3: Webhook Signature - PASS / FAIL
  [ ] Test 4.4: Database Errors - PASS / FAIL

Coin Packages:
  [ ] Test 5.1: Standard Packages - PASS / FAIL
  [ ] Test 5.2: Custom Amounts - PASS / FAIL

Balance Updates:
  [ ] Test 6.1: Initial Balance - PASS / FAIL
  [ ] Test 6.2: After Payment - PASS / FAIL
  [ ] Test 6.3: Multiple Payments - PASS / FAIL

Frontend Integration:
  [ ] Test 7.1: Store Page - PASS / FAIL
  [ ] Test 7.2: Success Page - PASS / FAIL
  [ ] Test 7.3: Cancel Page - PASS / FAIL

Production:
  [ ] Test 8.1: Environment - PASS / FAIL
  [ ] Test 8.2: Webhook URL - PASS / FAIL
  [ ] Test 8.3: Database - PASS / FAIL

Issues Found:
1. ___________
2. ___________

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🚨 Critical Tests (Must Pass)

1. ✅ Mock payment creates payment record
2. ✅ Mock payment adds coins to balance
3. ✅ Stripe checkout session created (if configured)
4. ✅ Webhook receives events (if configured)
5. ✅ Balance updates correctly
6. ✅ Payment history recorded
7. ✅ Error handling works
8. ✅ Database migrations run

---

**Run all tests before deploying payment system to production!**

