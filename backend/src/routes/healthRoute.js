import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// GET /api/health - Health check endpoint with database connectivity test
router.get('/', (req, res) => {
  try {
    // Test database connection
    const dbPath = join(__dirname, '../../db.sqlite');
    const db = new Database(dbPath);
    
    // Quick query to verify database is accessible
    db.prepare('SELECT 1').get();
    db.close();
    
    res.json({ 
      status: 'online',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    // Database might not exist yet, but server is still online
    res.status(200).json({ 
      status: 'online',
      database: 'not_initialized',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      warning: 'Database not initialized yet'
    });
  }
});

export default router;
