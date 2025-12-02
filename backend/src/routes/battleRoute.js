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

// POST /api/battle - Battle two agents
router.post('/', async (req, res) => {
  const startTime = Date.now();
  console.log(`[Battle] ${new Date().toISOString()} - Battle request:`, { agentA: req.body.agentA, agentB: req.body.agentB });
  
  try {
    const { agentA, agentB } = req.body;
    
    if (!agentA || !agentB) {
      return res.status(400).json({ 
        error: 'Both agentA and agentB are required' 
      });
    }
    
    // Fetch agents from database
    const agentAData = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentA);
    const agentBData = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentB);
    
    if (!agentAData || !agentBData) {
      return res.status(404).json({ 
        error: 'One or both agents not found' 
      });
    }
    
    // Parse JSON fields
    const agentA_parsed = {
      ...agentAData,
      traits: typeof agentAData.traits === 'string' 
        ? JSON.parse(agentAData.traits) 
        : agentAData.traits,
      rareTrait: agentAData.rareTrait 
        ? JSON.parse(agentAData.rareTrait) 
        : null
    };
    
    const agentB_parsed = {
      ...agentBData,
      traits: typeof agentBData.traits === 'string' 
        ? JSON.parse(agentBData.traits) 
        : agentBData.traits,
      rareTrait: agentBData.rareTrait 
        ? JSON.parse(agentBData.rareTrait) 
        : null
    };
    
    // Calculate power if not set
    function calculatePower(agent) {
      if (agent.power) return agent.power;
      const basePower = 
        (agent.traits.strength || 0) * 2 +
        (agent.traits.speed || 0) * 2 +
        (agent.traits.intelligence || 0) * 3 +
        Math.floor((agent.xp || 0) / 5);
      const rareTraitBonus = agent.rareTrait ? agent.rareTrait.powerBonus : 0;
      return basePower + rareTraitBonus;
    }
    
    const powerA = calculatePower(agentA_parsed);
    const powerB = calculatePower(agentB_parsed);
    
    // Determine winner
    let winner, loser;
    if (powerA > powerB) {
      winner = { ...agentA_parsed, power: powerA };
      loser = { ...agentB_parsed, power: powerB };
    } else if (powerB > powerA) {
      winner = { ...agentB_parsed, power: powerB };
      loser = { ...agentA_parsed, power: powerA };
    } else {
      // Tie - random winner
      const random = Math.random();
      if (random > 0.5) {
        winner = { ...agentA_parsed, power: powerA };
        loser = { ...agentB_parsed, power: powerB };
      } else {
        winner = { ...agentB_parsed, power: powerB };
        loser = { ...agentA_parsed, power: powerA };
      }
    }
    
    // Award XP and deduct energy
    winner.xp = (winner.xp || 0) + 10;
    loser.xp = (loser.xp || 0) + 2;
    winner.energy = Math.max((winner.energy || 100) - 10, 0);
    loser.energy = Math.max((loser.energy || 100) - 10, 0);
    
    // Recalculate power after XP gain
    winner.power = calculatePower(winner);
    loser.power = calculatePower(loser);
    
    // Update agents in database
    const updateAgent = db.prepare(`
      UPDATE agents 
      SET xp = ?, energy = ?, power = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateAgent.run(winner.xp, winner.energy, winner.power, winner.id);
    updateAgent.run(loser.xp, loser.energy, loser.power, loser.id);
    
    // Award coins to users (winner gets +5, loser gets +1)
    const winnerOwner = winner.owner || agentA_parsed.owner;
    const loserOwner = loser.owner || agentB_parsed.owner;
    
    const awardCoins = (userId, amount) => {
      if (!userId) return;
      const existing = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId);
      if (existing) {
        db.prepare(`
          UPDATE user_balance 
          SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).run(amount, userId);
      } else {
        db.prepare(`
          INSERT INTO user_balance (user_id, coins)
          VALUES (?, ?)
        `).run(userId, amount);
      }
    };
    
    awardCoins(winnerOwner, 5);
    awardCoins(loserOwner, 1);
    
    const duration = Date.now() - startTime;
    console.log(`[Battle] ${new Date().toISOString()} - Battle completed:`, {
      winner: winner.id,
      loser: loser.id,
      winnerPower: winner.power,
      loserPower: loser.power,
      duration: `${duration}ms`
    });
    
    // Return battle result
    res.json({
      winner: winner,
      loser: loser,
      agentA: winner.id === agentA ? winner : loser,
      agentB: winner.id === agentB ? winner : loser,
      coinRewards: {
        winner: 5,
        loser: 1
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Battle] ${new Date().toISOString()} - Battle failed:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ 
      error: 'Battle failed', 
      message: error.message 
    });
  }
});

export default router;


