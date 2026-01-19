import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import corsMiddleware from '../../middleware/cors.js';
import { apiLimiter } from '../../middleware/rateLimit.js';
import logger from '../../utils/logger.js';
import db from '../../config/database.js';
import redis from '../../config/redis.js';
import { now } from '../../utils/helpers.js';

dotenv.config();

const app = express();
const PORT = process.env.POSTBACK_PORT || 3003;

// Middleware
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Trust proxy (only trust from localhost/Nginx)
app.set('trust proxy', 1); // Only trust first proxy (Nginx)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'postback',
    timestamp: Date.now() 
  });
});

/**
 * GET /api/postback - Handle conversion postback
 * Example: /api/postback?click_id=xxx&payout=10&status=approved
 */
app.get('/api/postback', async (req, res) => {
  try {
    const { 
      click_id, 
      afl_click_id,
      payout = 0, 
      status = 'approved' 
    } = req.query;
    
    const clickId = click_id || afl_click_id;
    
    if (!clickId) {
      return res.status(400).json({ error: 'Missing click_id' });
    }
    
    // Check if click exists
    const [clicks] = await db.query(
      'SELECT * FROM clicks WHERE click_id = ?',
      [clickId]
    );
    
    if (clicks.length === 0) {
      logger.warn(`Postback: Click not found - ${clickId}`);
      return res.status(404).json({ error: 'Click not found' });
    }
    
    const click = clicks[0];
    
    // Check if already converted
    if (click.is_converted === 1) {
      logger.warn(`Postback: Already converted - ${clickId}`);
      return res.json({ 
        success: true, 
        message: 'Already converted',
        click_id: clickId
      });
    }
    
    // Update click with conversion
    await db.query(`
      UPDATE clicks 
      SET is_converted = 1, 
          payout = ?, 
          conversion_time = ?
      WHERE click_id = ?
    `, [parseFloat(payout), now(), clickId]);
    
    logger.info(`Conversion recorded: ${clickId}, Payout: $${payout}`);
    
    res.json({ 
      success: true, 
      message: 'Conversion recorded',
      click_id: clickId,
      payout: payout
    });
    
  } catch (error) {
    logger.error('Postback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'AFL Tracker Postback',
    version: '3.0.0',
    endpoint: '/api/postback'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Postback error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Postback service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await db.end();
  await redis.quit();
  process.exit(0);
});
