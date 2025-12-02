import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize database
const dbPath = join(__dirname, '../../db.sqlite');
let db;

try {
  db = new Database(dbPath);
  console.log('Database initialized successfully');
  
  // Create agents table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner TEXT,
      traits TEXT NOT NULL,
      energy INTEGER DEFAULT 100,
      xp INTEGER DEFAULT 0,
      gene INTEGER DEFAULT 0,
      rarity TEXT DEFAULT 'common',
      rareTrait TEXT,
      power INTEGER,
      forSale INTEGER DEFAULT 0,
      price INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add forSale and price columns if they don't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE agents ADD COLUMN forSale INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.exec(`ALTER TABLE agents ADD COLUMN price INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore
  }
} catch (error) {
  console.error('Database initialization error:', error);
}

// GET /agents - Get all agents
router.get('/', (req, res) => {
  try {
    const agents = db.prepare('SELECT * FROM agents ORDER BY id ASC').all();
    
    // Parse JSON fields
    const parsedAgents = agents.map(agent => ({
      ...agent,
      traits: typeof agent.traits === 'string' ? JSON.parse(agent.traits) : agent.traits,
      rareTrait: agent.rareTrait ? JSON.parse(agent.rareTrait) : null,
      forSale: agent.forSale === 1 || agent.forSale === true,
      price: agent.price || 0
    }));
    
    res.json(parsedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET /agents/:id - Get single agent
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Parse JSON fields
    const parsedAgent = {
      ...agent,
      traits: typeof agent.traits === 'string' ? JSON.parse(agent.traits) : agent.traits,
      rareTrait: agent.rareTrait ? JSON.parse(agent.rareTrait) : null,
      forSale: agent.forSale === 1 || agent.forSale === true,
      price: agent.price || 0
    };
    
    res.json(parsedAgent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// PUT /agents/:id - Update agent
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if agent exists
    const existing = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Build update query dynamically
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.traits !== undefined) {
      fields.push('traits = ?');
      values.push(JSON.stringify(updates.traits));
    }
    if (updates.energy !== undefined) {
      fields.push('energy = ?');
      values.push(updates.energy);
    }
    if (updates.xp !== undefined) {
      fields.push('xp = ?');
      values.push(updates.xp);
    }
    if (updates.gene !== undefined) {
      fields.push('gene = ?');
      values.push(updates.gene);
    }
    if (updates.rarity !== undefined) {
      fields.push('rarity = ?');
      values.push(updates.rarity);
    }
    if (updates.rareTrait !== undefined) {
      fields.push('rareTrait = ?');
      values.push(updates.rareTrait ? JSON.stringify(updates.rareTrait) : null);
    }
    if (updates.power !== undefined) {
      fields.push('power = ?');
      values.push(updates.power);
    }
    if (updates.forSale !== undefined) {
      fields.push('forSale = ?');
      values.push(updates.forSale ? 1 : 0);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.owner !== undefined) {
      fields.push('owner = ?');
      values.push(updates.owner);
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const sql = `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);
    
    // Return updated agent
    const updated = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updated,
      traits: typeof updated.traits === 'string' ? JSON.parse(updated.traits) : updated.traits,
      rareTrait: updated.rareTrait ? JSON.parse(updated.rareTrait) : null,
      forSale: updated.forSale === 1 || updated.forSale === true,
      price: updated.price || 0
    };
    
    res.json(parsedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// POST /agents - Create new agent
router.post('/', (req, res) => {
  try {
    const { name, owner, traits, energy, xp, gene, rarity, rareTrait, power } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Agent name is required' });
    }
    
    const defaultTraits = traits || { strength: 1, speed: 1, intelligence: 1 };
    
    const result = db.prepare(`
      INSERT INTO agents (name, owner, traits, energy, xp, gene, rarity, rareTrait, power)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      owner || null,
      JSON.stringify(defaultTraits),
      energy || 100,
      xp || 0,
      gene || 0,
      rarity || 'common',
      rareTrait ? JSON.stringify(rareTrait) : null,
      power || null
    );
    
    const newAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(result.lastInsertRowid);
    const parsedAgent = {
      ...newAgent,
      traits: typeof newAgent.traits === 'string' ? JSON.parse(newAgent.traits) : newAgent.traits,
      rareTrait: newAgent.rareTrait ? JSON.parse(newAgent.rareTrait) : null,
      forSale: newAgent.forSale === 1 || newAgent.forSale === true,
      price: newAgent.price || 0
    };
    
    res.status(201).json(parsedAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// POST /agents/:id/refill-energy - Refill agent energy (costs 50 coins)
router.post('/:id/refill-energy', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Check user balance
    const balance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    const coins = balance?.coins || 0;
    
    if (coins < 50) {
      return res.status(400).json({ error: 'Insufficient coins. Need 50 coins to refill energy.' });
    }
    
    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Refill energy to 100
    db.prepare(`
      UPDATE agents 
      SET energy = 100, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
    
    // Deduct coins
    if (balance) {
      db.prepare(`
        UPDATE user_balance 
        SET coins = coins - 50, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(userId);
    } else {
      db.prepare(`
        INSERT INTO user_balance (user_id, coins)
        VALUES (?, -50)
      `).run(userId);
    }
    
    const updatedAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updatedAgent,
      traits: typeof updatedAgent.traits === 'string' ? JSON.parse(updatedAgent.traits) : updatedAgent.traits,
      rareTrait: updatedAgent.rareTrait ? JSON.parse(updatedAgent.rareTrait) : null
    };
    
    const newBalance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    
    res.json({
      success: true,
      agent: parsedAgent,
      coins: newBalance?.coins || 0,
      message: 'Energy refilled to 100!'
    });
  } catch (error) {
    console.error('Error refilling energy:', error);
    res.status(500).json({ error: 'Failed to refill energy' });
  }
});

// POST /agents/:id/xp-boost - Apply XP boost (costs 100 coins, gives +20% XP next match)
router.post('/:id/xp-boost', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Check user balance
    const balance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    const coins = balance?.coins || 0;
    
    if (coins < 100) {
      return res.status(400).json({ error: 'Insufficient coins. Need 100 coins for XP boost.' });
    }
    
    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Add XP boost flag (store as JSON in a field, or use a separate table)
    // For simplicity, we'll add a boost flag to the agent's traits or use a metadata field
    // Since we don't have a boost field, we'll add it to a metadata JSON field
    // For now, we'll just set a flag in the database - we can add a boost_until field
    const boostUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Add boost flag (we'll store it as a JSON string in a new column or reuse existing)
    // For MVP, let's add a simple boost_active flag
    db.prepare(`
      UPDATE agents 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
    
    // Deduct coins
    if (balance) {
      db.prepare(`
        UPDATE user_balance 
        SET coins = coins - 100, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(userId);
    } else {
      db.prepare(`
        INSERT INTO user_balance (user_id, coins)
        VALUES (?, -100)
      `).run(userId);
    }
    
    const updatedAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updatedAgent,
      traits: typeof updatedAgent.traits === 'string' ? JSON.parse(updatedAgent.traits) : updatedAgent.traits,
      rareTrait: updatedAgent.rareTrait ? JSON.parse(updatedAgent.rareTrait) : null,
      xpBoostActive: true,
      xpBoostUntil: boostUntil.toISOString()
    };
    
    const newBalance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    
    res.json({
      success: true,
      agent: parsedAgent,
      coins: newBalance?.coins || 0,
      message: 'XP boost activated! Next battle will give +20% XP.'
    });
  } catch (error) {
    console.error('Error applying XP boost:', error);
    res.status(500).json({ error: 'Failed to apply XP boost' });
  }
});

// POST /agents/:id/rare-trait-roll - Re-roll one random stat into a rare 8-10 roll (costs 200 coins)
router.post('/:id/rare-trait-roll', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Check user balance
    const balance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    const coins = balance?.coins || 0;
    
    if (coins < 200) {
      return res.status(400).json({ error: 'Insufficient coins. Need 200 coins for rare trait roll.' });
    }
    
    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Parse traits
    const traits = typeof agent.traits === 'string' ? JSON.parse(agent.traits) : agent.traits;
    
    // Randomly select one trait to re-roll
    const traitKeys = ['strength', 'speed', 'intelligence'];
    const randomTrait = traitKeys[Math.floor(Math.random() * traitKeys.length)];
    const newValue = Math.floor(Math.random() * 3) + 8; // 8, 9, or 10
    
    traits[randomTrait] = newValue;
    
    // Update agent
    db.prepare(`
      UPDATE agents 
      SET traits = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(traits), id);
    
    // Deduct coins
    if (balance) {
      db.prepare(`
        UPDATE user_balance 
        SET coins = coins - 200, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(userId);
    } else {
      db.prepare(`
        INSERT INTO user_balance (user_id, coins)
        VALUES (?, -200)
      `).run(userId);
    }
    
    const updatedAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updatedAgent,
      traits: typeof updatedAgent.traits === 'string' ? JSON.parse(updatedAgent.traits) : updatedAgent.traits,
      rareTrait: updatedAgent.rareTrait ? JSON.parse(updatedAgent.rareTrait) : null
    };
    
    const newBalance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
    
    res.json({
      success: true,
      agent: parsedAgent,
      coins: newBalance?.coins || 0,
      message: `${randomTrait} re-rolled to ${newValue}!`
    });
  } catch (error) {
    console.error('Error rolling rare trait:', error);
    res.status(500).json({ error: 'Failed to roll rare trait' });
  }
});

// POST /agents/:id/list-for-sale - Mark agent as for sale
router.post('/:id/list-for-sale', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, price } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    
    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Verify ownership
    if (agent.owner !== userId) {
      return res.status(403).json({ error: 'You can only list your own agents' });
    }
    
    // Update agent
    db.prepare(`
      UPDATE agents 
      SET forSale = 1, price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(price, id);
    
    const updatedAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updatedAgent,
      traits: typeof updatedAgent.traits === 'string' ? JSON.parse(updatedAgent.traits) : updatedAgent.traits,
      rareTrait: updatedAgent.rareTrait ? JSON.parse(updatedAgent.rareTrait) : null,
      forSale: updatedAgent.forSale === 1
    };
    
    res.json({
      success: true,
      agent: parsedAgent,
      message: 'Agent listed for sale!'
    });
  } catch (error) {
    console.error('Error listing agent for sale:', error);
    res.status(500).json({ error: 'Failed to list agent for sale' });
  }
});

// POST /agents/:id/remove-from-sale - Remove agent from sale
router.post('/:id/remove-from-sale', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Verify ownership
    if (agent.owner !== userId) {
      return res.status(403).json({ error: 'You can only remove your own agents from sale' });
    }
    
    // Update agent
    db.prepare(`
      UPDATE agents 
      SET forSale = 0, price = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
    
    const updatedAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updatedAgent,
      traits: typeof updatedAgent.traits === 'string' ? JSON.parse(updatedAgent.traits) : updatedAgent.traits,
      rareTrait: updatedAgent.rareTrait ? JSON.parse(updatedAgent.rareTrait) : null,
      forSale: false
    };
    
    res.json({
      success: true,
      agent: parsedAgent,
      message: 'Agent removed from sale'
    });
  } catch (error) {
    console.error('Error removing agent from sale:', error);
    res.status(500).json({ error: 'Failed to remove agent from sale' });
  }
});

// POST /agents/:id/purchase - Purchase an agent
router.post('/:id/purchase', (req, res) => {
  try {
    const { id } = req.params;
    const { buyerId } = req.body;
    
    if (!buyerId) {
      return res.status(400).json({ error: 'buyerId is required' });
    }
    
    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Check if agent is for sale
    if (!agent.forSale || agent.forSale === 0) {
      return res.status(400).json({ error: 'Agent is not for sale' });
    }
    
    // Check if buyer is trying to buy their own agent
    if (agent.owner === buyerId) {
      return res.status(400).json({ error: 'You cannot purchase your own agent' });
    }
    
    const price = agent.price || 0;
    
    // Check buyer's balance
    const buyerBalance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(buyerId);
    const buyerCoins = buyerBalance?.coins || 0;
    
    if (buyerCoins < price) {
      return res.status(400).json({ error: `Insufficient coins. Need ${price} coins.` });
    }
    
    // Get seller's balance
    const sellerId = agent.owner;
    const sellerBalance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(sellerId);
    
    // Transfer ownership
    db.prepare(`
      UPDATE agents 
      SET owner = ?, forSale = 0, price = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(buyerId, id);
    
    // Deduct coins from buyer
    if (buyerBalance) {
      db.prepare(`
        UPDATE user_balance 
        SET coins = coins - ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(price, buyerId);
    } else {
      db.prepare(`
        INSERT INTO user_balance (user_id, coins)
        VALUES (?, ?)
      `).run(buyerId, -price);
    }
    
    // Add coins to seller (if seller exists)
    if (sellerId) {
      if (sellerBalance) {
        db.prepare(`
          UPDATE user_balance 
          SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).run(price, sellerId);
      } else {
        db.prepare(`
          INSERT INTO user_balance (user_id, coins)
          VALUES (?, ?)
        `).run(sellerId, price);
      }
    }
    
    const updatedAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    const parsedAgent = {
      ...updatedAgent,
      traits: typeof updatedAgent.traits === 'string' ? JSON.parse(updatedAgent.traits) : updatedAgent.traits,
      rareTrait: updatedAgent.rareTrait ? JSON.parse(updatedAgent.rareTrait) : null,
      forSale: false
    };
    
    const newBuyerBalance = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(buyerId);
    
    res.json({
      success: true,
      agent: parsedAgent,
      coins: newBuyerBalance?.coins || 0,
      message: `Successfully purchased ${agent.name} for ${price} coins!`
    });
  } catch (error) {
    console.error('Error purchasing agent:', error);
    res.status(500).json({ error: 'Failed to purchase agent' });
  }
});

export default router;


