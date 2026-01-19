import Queue from 'bull';
import db from '../../config/database.js';
import logger from '../../utils/logger.js';
import redis from '../../config/redis.js';

// Create Bull queue for click processing
const clickQueue = new Queue('click-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

/**
 * Add click to queue
 */
export async function addClickToQueue(clickData) {
  try {
    await clickQueue.add(clickData, {
      priority: 1,
      delay: 0
    });
  } catch (error) {
    logger.error('Failed to add click to queue:', error);
    // Fallback: insert directly
    await insertClickDirectly(clickData);
  }
}

/**
 * Process click queue
 */
clickQueue.process(parseInt(process.env.WORKER_CONCURRENCY) || 5, async (job) => {
  const clickData = job.data;
  
  try {
    await insertClickDirectly(clickData);
    logger.info(`Processed click: ${clickData.click_id}`);
  } catch (error) {
    logger.error(`Failed to process click ${clickData.click_id}:`, error);
    throw error; // Retry
  }
});

/**
 * Insert click directly to database
 */
async function insertClickDirectly(clickData) {
  const sql = `
    INSERT INTO clicks (
      click_id, campaign_id, offer_id, landing_page_id,
      ip, country, city, device, os, browser,
      user_agent, referrer, landing_clicked,
      cost, payout, is_converted,
      timestamp, conversion_time,
      is_bot, bot_score, fraud_flags, ip_quality_score, is_unique, user_fingerprint,
      gclid, fbclid, msclkid, ttclid,
      gad_source, gad_campaignid, gbraid, wbraid,
      fbadid, fbcampaignid,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      external_id,
      custom_var1, custom_var2, custom_var3, custom_var4, custom_var5,
      custom_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    clickData.click_id,
    clickData.campaign_id,
    clickData.offer_id,
    clickData.landing_page_id,
    clickData.ip,
    clickData.country,
    clickData.city,
    clickData.device,
    clickData.os,
    clickData.browser,
    clickData.user_agent,
    clickData.referrer,
    clickData.landing_clicked,
    clickData.cost,
    clickData.payout,
    clickData.is_converted,
    clickData.timestamp,
    clickData.conversion_time,
    clickData.is_bot,
    clickData.bot_score,
    clickData.fraud_flags,
    clickData.ip_quality_score,
    clickData.is_unique,
    clickData.user_fingerprint,
    clickData.gclid,
    clickData.fbclid,
    clickData.msclkid,
    clickData.ttclid,
    clickData.gad_source,
    clickData.gad_campaignid,
    clickData.gbraid,
    clickData.wbraid,
    clickData.fbadid,
    clickData.fbcampaignid,
    clickData.utm_source,
    clickData.utm_medium,
    clickData.utm_campaign,
    clickData.utm_term,
    clickData.utm_content,
    clickData.external_id,
    clickData.custom_var1,
    clickData.custom_var2,
    clickData.custom_var3,
    clickData.custom_var4,
    clickData.custom_var5,
    clickData.custom_data
  ];
  
  await db.query(sql, values);
}

// Queue event handlers
clickQueue.on('completed', (job) => {
  logger.debug(`Click job completed: ${job.id}`);
});

clickQueue.on('failed', (job, err) => {
  logger.error(`Click job failed: ${job.id}`, err);
});

export default clickQueue;
