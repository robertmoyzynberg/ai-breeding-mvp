import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize database
const dbPath = join(__dirname, '../../db.sqlite');
let db;

try {
  db = new Database(dbPath);
  
  // Create chat_messages table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `);
} catch (error) {
  console.error('Database error:', error);
}

// Initialize OpenAI client (optional - works without API key)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Helper function to get personality description from stats
function getPersonalityDescription(agent) {
  const traits = agent.traits || {};
  const int = traits.intelligence || 0;
  const str = traits.strength || 0;
  const ene = agent.energy || 0;
  
  let description = "You are an AI agent. ";
  
  if (int >= 15) {
    description += "You are highly intelligent and use sophisticated vocabulary. ";
  } else if (int < 10) {
    description += "You use simple language and keep responses brief. ";
  }
  
  if (str >= 15) {
    description += "You are confident and make bold, decisive statements. ";
  } else if (str < 10) {
    description += "You are cautious and often ask for input before making decisions. ";
  }
  
  if (ene >= 15) {
    description += "You are energetic and enthusiastic, using exclamation marks and longer responses. ";
  } else if (ene < 10) {
    description += "You are calm and measured, preferring shorter, thoughtful responses. ";
  }
  
  return description;
}

// GET /api/chat/:agentId - Get chat history
router.get('/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE agent_id = ? 
      ORDER BY created_at ASC
    `).all(agentId);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat - Send a message and get AI response
router.post('/', async (req, res) => {
  const startTime = Date.now();
  console.log(`[Chat] ${new Date().toISOString()} - Chat message:`, { agentId: req.body.agentId, messageLength: req.body.message?.length });
  
  try {
    const { agentId, message } = req.body;
    
    if (!agentId || !message) {
      return res.status(400).json({ 
        error: 'agentId and message are required' 
      });
    }
    
    // Fetch agent from database
    const agentData = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
    
    if (!agentData) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Parse agent data
    const agent = {
      ...agentData,
      traits: typeof agentData.traits === 'string' 
        ? JSON.parse(agentData.traits) 
        : agentData.traits,
      rareTrait: agentData.rareTrait ? JSON.parse(agentData.rareTrait) : null
    };
    
    // Save user message
    db.prepare(`
      INSERT INTO chat_messages (agent_id, role, content)
      VALUES (?, ?, ?)
    `).run(agentId, 'user', message);
    
    // Get chat history for context
    const history = db.prepare(`
      SELECT role, content FROM chat_messages 
      WHERE agent_id = ? 
      ORDER BY created_at ASC 
      LIMIT 20
    `).all(agentId);
    
    // Prepare messages for OpenAI
    const systemPrompt = `You are ${agent.name}, an AI agent with the following personality: ${getPersonalityDescription(agent)}. 
Your stats are: Intelligence ${agent.traits.intelligence || 0}, Strength ${agent.traits.strength || 0}, Energy ${agent.energy || 0}.
Respond in character based on these stats.`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content }))
    ];
    
    let aiResponse;
    
    // Try OpenAI API if available
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 150
        });
        
        aiResponse = completion.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fall through to mock response
        aiResponse = null;
      }
    }
    
    // Fallback to mock response if OpenAI fails or is unavailable
    if (!aiResponse) {
      const mockResponses = [
        `Hello! I'm ${agent.name}. How can I help you?`,
        `I'm ${agent.name}, ready to assist!`,
        `Hey there! ${agent.name} here. What's up?`
      ];
      aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      if (!openai) {
        aiResponse += " (Note: OpenAI API key not configured. This is a mock response.)";
      }
    }
    
    // Save AI response
    db.prepare(`
      INSERT INTO chat_messages (agent_id, role, content)
      VALUES (?, ?, ?)
    `).run(agentId, 'assistant', aiResponse);
    
    const duration = Date.now() - startTime;
    console.log(`[Chat] ${new Date().toISOString()} - Chat response generated:`, {
      agentId,
      responseLength: aiResponse.length,
      usedOpenAI: !!openai && !aiResponse.includes('mock'),
      duration: `${duration}ms`
    });
    
    res.json({
      role: 'assistant',
      content: aiResponse
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Chat] ${new Date().toISOString()} - Chat failed:`, {
      agentId: req.body.agentId,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    res.status(500).json({ 
      error: 'Chat failed', 
      message: error.message 
    });
  }
});

export default router;


