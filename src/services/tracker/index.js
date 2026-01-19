import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import db from '../../config/database.js';
import redis from '../../config/redis.js';
import logger from '../../utils/logger.js';
import { trackerLimiter } from '../../middleware/rateLimit.js';
import { handleClick } from './clickHandler.js';
import { handleLandingClick } from './landingHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.TRACKER_PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(trackerLimiter);

// Trust proxy (only trust from localhost/Nginx)
app.set('trust proxy', 1); // Only trust first proxy (Nginx)

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'tracker',
    timestamp: Date.now() 
  });
});

// Click tracking endpoints
// Support: /c/:campaignId, /t/:campaignId, /click
app.get('/c/:campaignId', handleClick);
app.get('/t/:campaignId', handleClick);
app.get('/click', handleClick);

// Landing page click (user clicked from lander to offer)
app.get('/lp-click', handleLandingClick);

// Root
app.get('/', (req, res) => {
  res.send('AFL Tracker - Click Tracking Service');
});

// 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Tracker error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Tracker service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await db.end();
  await redis.quit();
  process.exit(0);
});
