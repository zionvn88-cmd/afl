import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import corsMiddleware from '../../middleware/cors.js';
import { apiLimiter } from '../../middleware/rateLimit.js';
import logger from '../../utils/logger.js';
import db from '../../config/database.js';
import redis from '../../config/redis.js';

// Route handlers
import campaignsRouter from './routes/campaigns.js';
import offersRouter from './routes/offers.js';
import reportsRouter from './routes/reports.js';
import trafficSourcesRouter from './routes/trafficSources.js';
import postbackRouter from './routes/postback.js';
import landingPagesRouter from './routes/landingPages.js';
import customDomainsRouter from './routes/customDomains.js';
import alertsRouter from './routes/alerts.js';
import conversionsRouter from './routes/conversions.js';
import settingsRouter from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Trust proxy (only trust from localhost/Nginx)
app.set('trust proxy', 1); // Only trust first proxy (Nginx)

// Middleware
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'api',
    timestamp: Date.now() 
  });
});

// API Routes
app.use('/api/campaigns', campaignsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/traffic-sources', trafficSourcesRouter);
app.use('/api/postback', postbackRouter);
app.use('/api/landing-pages', landingPagesRouter);
app.use('/api/landing_pages', landingPagesRouter); // Alias for compatibility
app.use('/api/custom-domains', customDomainsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/conversions', conversionsRouter);
app.use('/api/settings', settingsRouter);

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'AFL Tracker API',
    version: '3.0.0',
    endpoints: [
      '/api/campaigns',
      '/api/offers',
      '/api/reports',
      '/api/traffic-sources',
      '/api/landing-pages',
      '/api/custom-domains',
      '/api/alerts',
      '/api/conversions',
      '/api/settings'
    ]
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 API service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await db.end();
  await redis.quit();
  process.exit(0);
});
