import dotenv from 'dotenv';
import clickQueue from '../tracker/clickQueue.js';
import logger from '../../utils/logger.js';

dotenv.config();

logger.info('🚀 Worker service starting...');

// Worker processes clicks from queue
// This is handled by Bull queue consumer in clickQueue.js
// No additional code needed here - Bull handles it automatically

// Keep process alive
setInterval(() => {
  // Health check - just keep running
}, 60000);

logger.info('✅ Worker service ready - Processing click queue...');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Worker shutting down gracefully...');
  process.exit(0);
});
