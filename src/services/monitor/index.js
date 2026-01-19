import dotenv from 'dotenv';
import cron from 'node-cron';
import db from '../../config/database.js';
import logger from '../../utils/logger.js';

dotenv.config();

logger.info('🚀 Monitor service starting...');

/**
 * Monitor service - Checks system health and sends alerts
 * Runs checks every 6 hours
 */

// Check database health
async function checkDatabase() {
  try {
    const [result] = await db.query('SELECT 1 as test');
    logger.debug('Database health check: OK');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

// Check for campaigns with no clicks in 24h
async function checkInactiveCampaigns() {
  try {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const [campaigns] = await db.query(`
      SELECT c.id, c.name, c.status
      FROM campaigns c
      LEFT JOIN clicks cl ON c.id = cl.campaign_id 
        AND cl.timestamp >= ?
      WHERE c.status = 'active'
        AND cl.click_id IS NULL
    `, [oneDayAgo]);
    
    if (campaigns.length > 0) {
      logger.warn(`Found ${campaigns.length} inactive campaigns`);
      // TODO: Send alert (Telegram, Email, etc.)
    }
    
    return campaigns.length;
  } catch (error) {
    logger.error('Check inactive campaigns error:', error);
    return 0;
  }
}

// Main monitoring function
async function runMonitoring() {
  logger.info('Running monitoring checks...');
  
  const dbOk = await checkDatabase();
  if (!dbOk) {
    logger.error('Database check failed - system may be unhealthy');
  }
  
  const inactiveCount = await checkInactiveCampaigns();
  if (inactiveCount > 0) {
    logger.warn(`Found ${inactiveCount} inactive campaigns`);
  }
  
  logger.info('Monitoring checks completed');
}

// Run immediately on start
runMonitoring();

// Schedule to run every 6 hours
cron.schedule('0 */6 * * *', () => {
  runMonitoring();
});

logger.info('✅ Monitor service ready - Checks scheduled every 6 hours');

// Keep process alive
setInterval(() => {
  // Health check
}, 60000);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Monitor shutting down gracefully...');
  process.exit(0);
});
