import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Payment router is working!' });
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create user_balance table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_balance (
      user_id TEXT PRIMARY KEY,
      coins INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (error) {
  console.error('Database error:', error);
}

// POST /api/payment/create - Create a payment intent (Stripe/Coinbase/etc)
router.post('/create', async (req, res) => {
  try {
    const { userId, amount, currency = 'USD', paymentMethod = 'stripe' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'userId and amount are required' 
      });
    }
    
    console.log('[Payment] Creating payment intent:', { userId, amount, currency, paymentMethod });
    
    // TODO: Integrate with actual payment provider (Stripe, Coinbase Pay, etc.)
    // For now, create a mock payment record
    const result = db.prepare(`
      INSERT INTO payments (user_id, amount, currency, status, payment_method)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, amount, currency, 'pending', paymentMethod);
    
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
    
    // Mock payment intent response (Stripe format)
    const mockPaymentIntent = {
      id: `pi_mock_${payment.id}`,
      client_secret: `pi_mock_${payment.id}_secret_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      payment_method: paymentMethod
    };
    
    console.log('[Payment] Payment intent created:', mockPaymentIntent.id);
    
    res.json({
      paymentIntent: mockPaymentIntent,
      paymentId: payment.id
    });
  } catch (error) {
    console.error('[Payment] Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent', 
      message: error.message 
    });
  }
});

// POST /api/payment/confirm - Confirm a payment and add coins
router.post('/confirm', async (req, res) => {
  try {
    const { paymentId, transactionId, userId, coins } = req.body;
    
    if (!paymentId || !userId || !coins) {
      return res.status(400).json({ 
        error: 'paymentId, userId, and coins are required' 
      });
    }
    
    console.log('[Payment] Confirming payment:', { paymentId, userId, coins });
    
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
    
    console.log('[Payment] Payment confirmed, new balance:', updated.coins);
    
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
      console.error('[Payment] Database not initialized');
      return res.json({ coins: 0 });
    }
    
    const { userId } = req.params;
    console.log('[Payment] Fetching balance for user:', userId);
    
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
      console.error('[Payment] Database not initialized');
      return res.json([]);
    }
    
    const { userId } = req.params;
    console.log('[Payment] Fetching payment history for user:', userId);
    
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

export default router;

