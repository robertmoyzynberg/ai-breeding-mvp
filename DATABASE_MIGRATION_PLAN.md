# 🗄️ Database Migration Plan: SQLite → PostgreSQL

## Overview
This document outlines the migration plan from SQLite (development) to PostgreSQL (production) for the AI Breeding MVP.

---

## 📊 Current Database Schema (SQLite)

### Tables

1. **agents**
   - `id` (INTEGER PRIMARY KEY)
   - `name` (TEXT)
   - `owner` (TEXT)
   - `traits` (TEXT - JSON string)
   - `energy` (INTEGER)
   - `xp` (INTEGER)
   - `gene` (INTEGER)
   - `rarity` (TEXT)
   - `rareTrait` (TEXT - JSON string)
   - `power` (INTEGER)
   - `forSale` (BOOLEAN)
   - `price` (INTEGER)
   - `created_at` (DATETIME)
   - `updated_at` (DATETIME)

2. **user_balance**
   - `user_id` (TEXT PRIMARY KEY)
   - `coins` (INTEGER)
   - `updated_at` (DATETIME)

3. **payments**
   - `id` (INTEGER PRIMARY KEY)
   - `user_id` (TEXT)
   - `amount` (REAL)
   - `currency` (TEXT)
   - `status` (TEXT)
   - `payment_method` (TEXT)
   - `transaction_id` (TEXT)
   - `stripe_session_id` (TEXT)
   - `stripe_payment_intent_id` (TEXT)
   - `coins` (INTEGER)
   - `created_at` (DATETIME)
   - `updated_at` (DATETIME)

4. **chat_messages**
   - `id` (INTEGER PRIMARY KEY)
   - `agent_id` (INTEGER)
   - `user_id` (TEXT)
   - `message` (TEXT)
   - `role` (TEXT)
   - `created_at` (DATETIME)

---

## 🎯 PostgreSQL Schema Design

### Migration Strategy

**Option 1: Use PostgreSQL JSONB for Complex Fields**
- Store `traits` and `rareTrait` as JSONB
- Better querying capabilities
- Maintains flexibility

**Option 2: Normalize Complex Fields**
- Create separate `agent_traits` table
- Create separate `rare_traits` table
- More normalized, better for complex queries

**Recommended: Option 1** (JSONB) for MVP simplicity.

---

## 📝 PostgreSQL Schema

### 1. Users Table (New)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

### 2. Agents Table
```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  traits JSONB NOT NULL DEFAULT '{}',
  energy INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  gene INTEGER DEFAULT 0 CHECK (gene >= 0),
  rarity VARCHAR(50) DEFAULT 'common',
  rare_trait JSONB,
  power INTEGER DEFAULT 0 CHECK (power >= 0),
  for_sale BOOLEAN DEFAULT FALSE,
  price INTEGER DEFAULT 0 CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agents_owner ON agents(owner_id);
CREATE INDEX idx_agents_for_sale ON agents(for_sale);
CREATE INDEX idx_agents_rarity ON agents(rarity);
CREATE INDEX idx_agents_traits ON agents USING GIN(traits);
```

### 3. User Balance Table
```sql
CREATE TABLE user_balance (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_balance_user ON user_balance(user_id);
```

### 4. Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX idx_payments_created ON payments(created_at);
```

### 5. Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_agent ON chat_messages(agent_id);
CREATE INDEX idx_chat_user ON chat_messages(user_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at);
```

### 6. Battles Table (New - for history)
```sql
CREATE TABLE battles (
  id SERIAL PRIMARY KEY,
  agent_a_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  agent_b_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  winner_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_battles_agent_a ON battles(agent_a_id);
CREATE INDEX idx_battles_agent_b ON battles(agent_b_id);
CREATE INDEX idx_battles_winner ON battles(winner_id);
```

### 7. Marketplace Listings Table (New - for better tracking)
```sql
CREATE TABLE marketplace_listings (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_agent ON marketplace_listings(agent_id);
CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
```

---

## 🔄 Migration Script

### Step 1: Export SQLite Data

```javascript
// migration/export-sqlite.js
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./db.sqlite');

// Export agents
const agents = db.prepare('SELECT * FROM agents').all();
fs.writeFileSync('./migration/agents.json', JSON.stringify(agents, null, 2));

// Export user_balance
const balances = db.prepare('SELECT * FROM user_balance').all();
fs.writeFileSync('./migration/balances.json', JSON.stringify(balances, null, 2));

// Export payments
const payments = db.prepare('SELECT * FROM payments').all();
fs.writeFileSync('./migration/payments.json', JSON.stringify(payments, null, 2));

// Export chat_messages
const messages = db.prepare('SELECT * FROM chat_messages').all();
fs.writeFileSync('./migration/messages.json', JSON.stringify(messages, null, 2));

console.log('Data exported successfully!');
```

### Step 2: Import to PostgreSQL

```javascript
// migration/import-postgres.js
import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importData() {
  // Import users (create from unique owners)
  const agents = JSON.parse(fs.readFileSync('./migration/agents.json'));
  const uniqueOwners = [...new Set(agents.map(a => a.owner).filter(Boolean))];
  
  for (const owner of uniqueOwners) {
    await pool.query(
      'INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING',
      [owner]
    );
  }

  // Import agents
  for (const agent of agents) {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [agent.owner]
    );
    const userId = userResult.rows[0]?.id || null;

    await pool.query(`
      INSERT INTO agents (
        name, owner_id, traits, energy, xp, gene, rarity,
        rare_trait, power, for_sale, price, created_at, updated_at
      ) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13)
    `, [
      agent.name,
      userId,
      agent.traits,
      agent.energy,
      agent.xp,
      agent.gene,
      agent.rarity,
      agent.rareTrait || null,
      agent.power,
      agent.forSale || false,
      agent.price || 0,
      agent.created_at,
      agent.updated_at
    ]);
  }

  // Import balances
  const balances = JSON.parse(fs.readFileSync('./migration/balances.json'));
  for (const balance of balances) {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [balance.user_id]
    );
    const userId = userResult.rows[0]?.id;
    
    if (userId) {
      await pool.query(`
        INSERT INTO user_balance (user_id, coins, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET coins = EXCLUDED.coins
      `, [userId, balance.coins, balance.updated_at]);
    }
  }

  // Import payments
  const payments = JSON.parse(fs.readFileSync('./migration/payments.json'));
  for (const payment of payments) {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [payment.user_id]
    );
    const userId = userResult.rows[0]?.id;

    await pool.query(`
      INSERT INTO payments (
        user_id, amount, currency, status, payment_method,
        transaction_id, stripe_session_id, stripe_payment_intent_id,
        coins, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      userId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.payment_method,
      payment.transaction_id,
      payment.stripe_session_id,
      payment.stripe_payment_intent_id,
      payment.coins || 0,
      payment.created_at,
      payment.updated_at
    ]);
  }

  // Import chat messages
  const messages = JSON.parse(fs.readFileSync('./migration/messages.json'));
  for (const message of messages) {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [message.user_id]
    );
    const userId = userResult.rows[0]?.id;

    await pool.query(`
      INSERT INTO chat_messages (agent_id, user_id, message, role, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      message.agent_id,
      userId,
      message.message,
      message.role,
      message.created_at
    ]);
  }

  console.log('Data imported successfully!');
  await pool.end();
}

importData().catch(console.error);
```

---

## 🔧 Code Changes Required

### 1. Update Database Connection

**Before (SQLite):**
```javascript
import Database from 'better-sqlite3';
const db = new Database('./db.sqlite');
```

**After (PostgreSQL):**
```javascript
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

### 2. Update Query Syntax

**SQLite:**
```javascript
db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
```

**PostgreSQL:**
```javascript
const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
return result.rows[0];
```

### 3. Update JSON Handling

**SQLite:**
```javascript
// Store as string
JSON.stringify(traits)

// Retrieve
JSON.parse(agent.traits)
```

**PostgreSQL:**
```javascript
// Store as JSONB
await pool.query('INSERT INTO agents (traits) VALUES ($1::jsonb)', [traits]);

// Retrieve
const result = await pool.query('SELECT traits FROM agents WHERE id = $1', [id]);
const traits = result.rows[0].traits; // Already parsed
```

---

## 📦 Dependencies

Add to `backend/package.json`:
```json
{
  "dependencies": {
    "pg": "^8.11.3"
  }
}
```

---

## 🚀 Deployment Steps

1. **Set up PostgreSQL Database**
   - Use Render PostgreSQL, Heroku Postgres, or AWS RDS
   - Get connection string

2. **Update Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. **Run Migration Scripts**
   ```bash
   node migration/export-sqlite.js
   node migration/import-postgres.js
   ```

4. **Update Code**
   - Replace SQLite queries with PostgreSQL
   - Test all endpoints

5. **Deploy**
   - Deploy backend with new DATABASE_URL
   - Verify all features work

---

## ✅ Migration Checklist

- [ ] PostgreSQL database created
- [ ] Schema created (all tables)
- [ ] Indexes created
- [ ] Data exported from SQLite
- [ ] Data imported to PostgreSQL
- [ ] Code updated (connection, queries)
- [ ] All endpoints tested
- [ ] Performance verified
- [ ] Backup created
- [ ] Production deployment successful

---

## 🔄 Rollback Plan

If migration fails:

1. Keep SQLite database as backup
2. Revert code changes
3. Update DATABASE_URL back to SQLite path
4. Restart services

---

**Note:** For MVP, SQLite is sufficient. Migrate to PostgreSQL when:
- Multiple concurrent users
- Need for better performance
- Need for advanced queries
- Scaling requirements

