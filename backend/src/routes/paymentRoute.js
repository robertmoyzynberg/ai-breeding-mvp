import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize Stripe (use test key if STRIPE_SECRET_KEY not set)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

// Initialize database
const dbPath = join(__dirname, '../../db.sqlite');
let db;

try {
  db = new Database(dbPath);
  
  // Create payments table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      transaction_id TEXT,
      stripe_session_id TEXT,
      stripe_payment_intent_id TEXT,
      coins INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Migrate existing payments table to add missing columns
  try {
    // Check if coins column exists
    const tableInfo = db.prepare("PRAGMA table_info(payments)").all();
    const hasCoins = tableInfo.some(col => col.name === 'coins');
    const hasStripeSession = tableInfo.some(col => col.name === 'stripe_session_id');
    const hasStripeIntent = tableInfo.some(col => col.name === 'stripe_payment_intent_id');
    
    if (!hasCoins) {
      db.exec('ALTER TABLE payments ADD COLUMN coins INTEGER DEFAULT 0');
      console.log('[Payment] Added coins column to payments table');
    }
    if (!hasStripeSession) {
      db.exec('ALTER TABLE payments ADD COLUMN stripe_session_id TEXT');
      console.log('[Payment] Added stripe_session_id column to payments table');
    }
    if (!hasStripeIntent) {
      db.exec('ALTER TABLE payments ADD COLUMN stripe_payment_intent_id TEXT');
      console.log('[Payment] Added stripe_payment_intent_id column to payments table');
    }
  } catch (migrationError) {
    console.error('[Payment] Migration error (table may not exist yet):', migrationError);
  }
  
  // Create user_balance table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_balance (
      user_id TEXT PRIMARY KEY,
      coins INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (error) {
  console.error('[Payment] Database error:', error);
}

// Coin package mapping (USD amount -> coins)
const COIN_PACKAGES = {
  4.99: 50,
  9.99: 100,
  19.99: 250,
  39.99: 500,
  79.99: 1000,
};

// POST /api/payment/create-checkout-session - Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId, amount, currency = 'USD' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'userId and amount are required' 
      });
    }

    // Calculate coins based on amount
    const coins = COIN_PACKAGES[amount] || Math.floor(amount * 10); // Default: $1 = 10 coins
    
    // Check if Stripe is configured
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                                !process.env.STRIPE_SECRET_KEY.includes('placeholder');
    
    if (!isStripeConfigured) {
      // Fallback to mock payment for development
      console.log('[Payment] Stripe not configured, using mock payment');
      const result = db.prepare(`
        INSERT INTO payments (user_id, amount, currency, status, payment_method, coins)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, amount, currency, 'pending', 'mock', coins);
      
      const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
      
      return res.json({
        sessionId: `mock_session_${payment.id}`,
        paymentId: payment.id,
        coins: coins,
        mock: true,
        message: 'Stripe not configured. Using mock payment for development.'
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${coins} Coins Package`,
              description: `Purchase ${coins} coins for your AI Breeding game`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        userId: userId,
        coins: coins.toString(),
        amount: amount.toString(),
      },
    });

    // Store payment record in database
    const result = db.prepare(`
      INSERT INTO payments (user_id, amount, currency, status, payment_method, stripe_session_id, coins)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, amount, currency, 'pending', 'stripe', session.id, coins);

    res.json({
      sessionId: session.id,
      url: session.url,
      paymentId: result.lastInsertRowid,
      coins: coins,
    });
  } catch (error) {
    console.error('[Payment] Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session', 
      message: error.message 
    });
  }
});

// POST /api/payment/webhook - Stripe Webhook Handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!webhookSecret || webhookSecret.includes('placeholder')) {
      console.log('[Payment] Webhook secret not configured, skipping verification');
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error('[Payment] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSuccess(session);
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentIntentSuccess(paymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    
    default:
      console.log(`[Payment] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful checkout
async function handleCheckoutSuccess(session) {
  try {
    const { userId, coins, amount } = session.metadata;
    const coinsAmount = parseInt(coins) || 0;

    // Update payment status
    const payment = db.prepare(`
      SELECT * FROM payments WHERE stripe_session_id = ?
    `).get(session.id);

    if (payment) {
      db.prepare(`
        UPDATE payments 
        SET status = ?, 
            transaction_id = ?,
            stripe_payment_intent_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run('completed', session.payment_intent, session.payment_intent, payment.id);

      // Add coins to user balance
      const existing = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
      
      if (existing) {
        db.prepare(`
          UPDATE user_balance 
          SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).run(coinsAmount, userId);
      } else {
        db.prepare(`
          INSERT INTO user_balance (user_id, coins)
          VALUES (?, ?)
        `).run(userId, coinsAmount);
      }

      console.log(`[Payment] Checkout completed: ${coinsAmount} coins added to user ${userId}`);
    }
  } catch (error) {
    console.error('[Payment] Error handling checkout success:', error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSuccess(paymentIntent) {
  try {
    const payment = db.prepare(`
      SELECT * FROM payments WHERE stripe_payment_intent_id = ?
    `).get(paymentIntent.id);

    if (payment && payment.status !== 'completed') {
      db.prepare(`
        UPDATE payments 
        SET status = ?, 
            transaction_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run('completed', paymentIntent.id, payment.id);

      // Add coins to user balance
      const existing = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(payment.user_id);
      
      if (existing) {
        db.prepare(`
          UPDATE user_balance 
          SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).run(payment.coins, payment.user_id);
      } else {
        db.prepare(`
          INSERT INTO user_balance (user_id, coins)
          VALUES (?, ?)
        `).run(payment.user_id, payment.coins);
      }

      console.log(`[Payment] Payment intent succeeded: ${payment.coins} coins added to user ${payment.user_id}`);
    }
  } catch (error) {
    console.error('[Payment] Error handling payment intent success:', error);
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
  try {
    const payment = db.prepare(`
      SELECT * FROM payments WHERE stripe_payment_intent_id = ?
    `).get(paymentIntent.id);

    if (payment) {
      db.prepare(`
        UPDATE payments 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run('failed', payment.id);

      console.log(`[Payment] Payment failed for payment ID: ${payment.id}`);
    }
  } catch (error) {
    console.error('[Payment] Error handling payment failure:', error);
  }
}

// GET /api/payment/success - Verify payment success
router.get('/success', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                                !process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (!isStripeConfigured) {
      // Mock success for development
      const payment = db.prepare(`
        SELECT * FROM payments WHERE stripe_session_id = ? OR stripe_session_id LIKE ?
      `).get(session_id, `mock_session_%`);

      if (payment && payment.status === 'pending') {
        db.prepare(`
          UPDATE payments 
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run('completed', payment.id);

        // Add coins
        const existing = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(payment.user_id);
        if (existing) {
          db.prepare(`
            UPDATE user_balance 
            SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).run(payment.coins, payment.user_id);
        } else {
          db.prepare(`
            INSERT INTO user_balance (user_id, coins)
            VALUES (?, ?)
          `).run(payment.user_id, payment.coins);
        }
      }

      return res.json({ success: true, mock: true });
    }

    // Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Payment was successful, webhook should have handled it, but verify
      const payment = db.prepare(`
        SELECT * FROM payments WHERE stripe_session_id = ?
      `).get(session_id);

      if (payment && payment.status !== 'completed') {
        // Webhook might not have fired yet, process manually
        await handleCheckoutSuccess(session);
      }

      res.json({ 
        success: true, 
        session: session,
        coins: parseInt(session.metadata?.coins || '0')
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed',
        payment_status: session.payment_status
      });
    }
  } catch (error) {
    console.error('[Payment] Error verifying payment success:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment', 
      message: error.message 
    });
  }
});

// POST /api/payment/cancel - Handle payment cancellation
router.post('/cancel', async (req, res) => {
  try {
    const { session_id, paymentId } = req.body;
    
    if (paymentId) {
      db.prepare(`
        UPDATE payments 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run('cancelled', paymentId);
    }

    res.json({ 
      success: true, 
      message: 'Payment cancelled' 
    });
  } catch (error) {
    console.error('[Payment] Error handling cancellation:', error);
    res.status(500).json({ 
      error: 'Failed to handle cancellation', 
      message: error.message 
    });
  }
});

// POST /api/payment/create - Legacy endpoint (kept for backward compatibility)
router.post('/create', async (req, res) => {
  try {
    const { userId, amount, currency = 'USD' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'userId and amount are required' 
      });
    }

    // Redirect to checkout session creation
    const result = await fetch(`${req.protocol}://${req.get('host')}/api/payment/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, currency })
    });

    const data = await result.json();
    res.json(data);
  } catch (error) {
    console.error('[Payment] Error in legacy create endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to create payment', 
      message: error.message 
    });
  }
});

// POST /api/payment/confirm - Legacy endpoint (kept for backward compatibility)
router.post('/confirm', async (req, res) => {
  try {
    const { paymentId, transactionId, userId, coins } = req.body;
    
    if (!paymentId || !userId || !coins) {
      return res.status(400).json({ 
        error: 'paymentId, userId, and coins are required' 
      });
    }
    
    // Update payment status
    db.prepare(`
      UPDATE payments 
      SET status = ?, transaction_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run('completed', transactionId || `tx_${Date.now()}`, paymentId);
    
    // Update or create user balance
    const existing = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    
    if (existing) {
      db.prepare(`
        UPDATE user_balance 
        SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(coins, userId);
    } else {
      db.prepare(`
        INSERT INTO user_balance (user_id, coins)
        VALUES (?, ?)
      `).run(userId, coins);
    }
    
    const updated = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    
    res.json({
      success: true,
      coins: updated.coins,
      message: `Successfully added ${coins} coins`
    });
  } catch (error) {
    console.error('[Payment] Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment', 
      message: error.message 
    });
  }
});

// GET /api/payment/balance/:userId - Get user's coin balance
router.get('/balance/:userId', (req, res) => {
  try {
    if (!db) {
      return res.json({ coins: 0 });
    }
    
    const { userId } = req.params;
    
    const balance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    
    if (!balance) {
      return res.json({ coins: 0 });
    }
    
    res.json({ coins: balance.coins || 0 });
  } catch (error) {
    console.error('[Payment] Error fetching balance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch balance', 
      message: error.message 
    });
  }
});

// GET /api/payment/history/:userId - Get payment history
router.get('/history/:userId', (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }
    
    const { userId } = req.params;
    
    const payments = db.prepare(`
      SELECT * FROM payments 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(userId);
    
    res.json(payments);
  } catch (error) {
    console.error('[Payment] Error fetching payment history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment history', 
      message: error.message 
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment router is working!',
    stripeConfigured: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder'))
  });
});

export default router;
