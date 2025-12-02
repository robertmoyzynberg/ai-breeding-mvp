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
} catch (error) {
  console.error('Database error:', error);
}

// POST /api/breed - Breed two agents
router.post('/', (req, res) => {
  const startTime = Date.now();
  console.log(`[Breed] ${new Date().toISOString()} - Breeding request:`, { parent1Id: req.body.parent1Id, parent2Id: req.body.parent2Id });
  
  try {
    const { parent1Id, parent2Id } = req.body;
    
    if (!parent1Id || !parent2Id) {
      return res.status(400).json({ 
        error: 'parent1Id and parent2Id are required' 
      });
    }
    
    // Fetch parent agents from database
    const parent1 = db.prepare('SELECT * FROM agents WHERE id = ?').get(parent1Id);
    const parent2 = db.prepare('SELECT * FROM agents WHERE id = ?').get(parent2Id);
    
    if (!parent1 || !parent2) {
      return res.status(404).json({ 
        error: 'One or both parent agents not found' 
      });
    }
    
    // Parse JSON fields
    const p1 = {
      ...parent1,
      traits: typeof parent1.traits === 'string' 
        ? JSON.parse(parent1.traits) 
        : parent1.traits,
      rareTrait: parent1.rareTrait ? JSON.parse(parent1.rareTrait) : null
    };
    
    const p2 = {
      ...parent2,
      traits: typeof parent2.traits === 'string' 
        ? JSON.parse(parent2.traits) 
        : parent2.traits,
      rareTrait: parent2.rareTrait ? JSON.parse(parent2.rareTrait) : null
    };
    
    // Breeding logic: combine traits from both parents
    const babyTraits = {
      strength: Math.floor((p1.traits.strength + p2.traits.strength) / 2) + 
                (Math.random() < 0.1 ? 1 : 0), // 10% mutation chance
      speed: Math.floor((p1.traits.speed + p2.traits.speed) / 2) + 
             (Math.random() < 0.1 ? 1 : 0),
      intelligence: Math.floor((p1.traits.intelligence + p2.traits.intelligence) / 2) + 
                    (Math.random() < 0.1 ? 1 : 0)
    };
    
    // Cap traits at 10
    babyTraits.strength = Math.min(babyTraits.strength, 10);
    babyTraits.speed = Math.min(babyTraits.speed, 10);
    babyTraits.intelligence = Math.min(babyTraits.intelligence, 10);
    
    // 5% chance for rare trait
    let rareTrait = null;
    if (Math.random() < 0.05) {
      const rareTraits = [
        { name: "winged", powerBonus: 5 },
        { name: "telepathic", powerBonus: 7 },
        { name: "invisible", powerBonus: 10 }
      ];
      rareTrait = rareTraits[Math.floor(Math.random() * rareTraits.length)];
    }
    
    // Calculate rarity
    const totalWeight = 
      (babyTraits.strength <= 3 ? 1 : babyTraits.strength <= 6 ? 2 : 4) +
      (babyTraits.speed <= 3 ? 1 : babyTraits.speed <= 6 ? 2 : 4) +
      (babyTraits.intelligence <= 3 ? 1 : babyTraits.intelligence <= 6 ? 2 : 4);
    const maxWeight = 12;
    const rarityPercent = (totalWeight / maxWeight) * 100;
    const rarity = rarityPercent >= 75 ? 'rare' : rarityPercent >= 50 ? 'uncommon' : 'common';
    
    // Calculate power
    const basePower = 
      babyTraits.strength * 2 +
      babyTraits.speed * 2 +
      babyTraits.intelligence * 3;
    const rareTraitBonus = rareTrait ? rareTrait.powerBonus : 0;
    const power = basePower + rareTraitBonus;
    
    // Create baby agent
    const babyName = `Baby_${p1.name}_${p2.name}_${Date.now()}`;
    const result = db.prepare(`
      INSERT INTO agents (name, owner, traits, energy, xp, gene, rarity, rareTrait, power)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      babyName,
      p1.owner || null,
      JSON.stringify(babyTraits),
      100,
      0,
      0,
      rarity,
      rareTrait ? JSON.stringify(rareTrait) : null,
      power
    );
    
    // Award GENE to parents
    db.prepare('UPDATE agents SET gene = gene + 1 WHERE id IN (?, ?)').run(parent1Id, parent2Id);
    
    // Fetch created baby
    const baby = db.prepare('SELECT * FROM agents WHERE id = ?').get(result.lastInsertRowid);
    const parsedBaby = {
      ...baby,
      traits: typeof baby.traits === 'string' ? JSON.parse(baby.traits) : baby.traits,
      rareTrait: baby.rareTrait ? JSON.parse(baby.rareTrait) : null
    };
    
    const duration = Date.now() - startTime;
    console.log(`[Breed] ${new Date().toISOString()} - Breeding completed:`, {
      babyId: parsedBaby.id,
      babyName: parsedBaby.name,
      rarity: parsedBaby.rarity,
      hasRareTrait: !!parsedBaby.rareTrait,
      duration: `${duration}ms`
    });
    
    res.json(parsedBaby);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Breed] ${new Date().toISOString()} - Breeding failed:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ 
      error: 'Breeding failed', 
      message: error.message 
    });
  }
});

export default router;


