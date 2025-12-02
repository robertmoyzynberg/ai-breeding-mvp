import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import agentsRoute from './routes/agentsRoute.js';
import battleRoute from './routes/battleRoute.js';
import breedRoute from './routes/breedRoute.js';
import chatRoute from './routes/chatRoute.js';
import healthRoute from './routes/healthRoute.js';
import paymentRoute from './routes/paymentRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Stripe webhook needs raw body, so handle it before JSON parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Debug: Log all registered routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/payment')) {
    console.log(`[Route Debug] Payment route hit: ${req.method} ${req.path}`);
  }
  next();
});

// Routes
app.use('/api/health', healthRoute);
app.use('/agents', agentsRoute);
app.use('/api/battle', battleRoute);
app.use('/api/breed', breedRoute);
app.use('/api/chat', chatRoute);
app.use('/api/payment', paymentRoute);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Breeding MVP Backend API',
    version: '1.0.0',
    status: 'online'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;


