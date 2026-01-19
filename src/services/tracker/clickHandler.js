import db from '../../config/database.js';
import redis from '../../config/redis.js';
import logger from '../../utils/logger.js';
import { 
  generateClickId, 
  parseUserAgent, 
  generateFingerprint,
  extractTrackingParams,
  weightedRandom,
  now
} from '../../utils/helpers.js';
import { addClickToQueue } from './clickQueue.js';

/**
 * Handle click tracking
 */
export async function handleClick(req, res) {
  const startTime = Date.now();
  
  try {
    // ━━━ STEP 1: Get Campaign ID ━━━
    const campaignId = req.params.campaignId || req.query.cid || req.query.campaign_id;
    
    if (!campaignId) {
      return res.status(400).send('Missing campaign_id');
    }
    
    // ━━━ STEP 2: Extract data ━━━
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const parsedUA = parseUserAgent(userAgent);
    const trackingParams = extractTrackingParams(new URL(req.url, `http://${req.headers.host}`));
    const fingerprint = generateFingerprint(ip, userAgent, req.headers);
    
    // ━━━ STEP 3: Get Campaign Config (with cache) ━━━
    const campaign = await getCampaignConfig(campaignId);
    
    if (!campaign) {
      logger.warn(`Campaign not found: ${campaignId}`);
      return res.status(404).send('Campaign not found');
    }
    
    if (campaign.status !== 'active') {
      logger.warn(`Campaign inactive: ${campaignId}`);
      return res.status(403).send('Campaign inactive');
    }
    
    // ━━━ STEP 4: Anti-Fraud Check (if enabled) ━━━
    let isBot = 0;
    let botScore = 0;
    
    if (campaign.enable_fraud_detection) {
      const fraudCheck = await checkFraud(ip, userAgent, fingerprint);
      isBot = fraudCheck.isBot ? 1 : 0;
      botScore = fraudCheck.score;
      
      // Block if high bot score
      if (fraudCheck.isBot && fraudCheck.action === 'block') {
        logger.warn(`Blocked bot: IP=${ip}, Score=${botScore}`);
        return res.status(403).send('Access denied');
      }
    }
    
    // ━━━ STEP 5: Check Deduplication ━━━
    const isDuplicate = await checkDuplication(campaignId, fingerprint, trackingParams.external_id);
    
    // ━━━ STEP 6: Generate Click ID ━━━
    const clickId = generateClickId();
    
    // ━━━ STEP 7: Select Offer ━━━
    let redirectUrl;
    let offerId = null;
    let landingPageId = null;
    let landingClicked = 1; // Default: direct to offer
    
    if (campaign.flow_type === 'lander' && campaign.landing_page_id) {
      // Landing page flow
      const lander = await getLandingPage(campaign.landing_page_id);
      if (lander) {
        redirectUrl = lander.url;
        landingPageId = lander.id;
        landingClicked = 0;
      }
    } else if (campaign.flow_type === 'direct' && campaign.offer_url) {
      // Direct flow
      redirectUrl = campaign.offer_url;
    } else {
      // Legacy: Select from offers
      const offers = await getActiveOffers(campaignId);
      if (offers.length === 0) {
        logger.warn(`No active offers for campaign: ${campaignId}`);
        return res.status(503).send('No available offers');
      }
      
      const selectedOffer = weightedRandom(offers, 'weight');
      redirectUrl = selectedOffer.url;
      offerId = selectedOffer.id;
    }
    
    if (!redirectUrl) {
      logger.warn(`No redirect URL for campaign: ${campaignId}`);
      return res.status(503).send('No destination available');
    }
    
    // ━━━ STEP 8: Add click_id to URL ━━━
    const separator = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl += `${separator}afl_click_id=${clickId}`;
    
    if (trackingParams.external_id) {
      redirectUrl += `&external_id=${trackingParams.external_id}`;
    }
    
    // ━━━ STEP 9: Build Click Data ━━━
    const clickData = {
      click_id: clickId,
      campaign_id: campaignId,
      offer_id: offerId,
      landing_page_id: landingPageId,
      
      // User info
      ip: ip,
      country: req.headers['cf-ipcountry'] || 'XX',
      city: '',
      device: parsedUA.device,
      os: parsedUA.os,
      browser: parsedUA.browser,
      user_agent: userAgent,
      referrer: req.headers.referer || '',
      
      // Tracking
      landing_clicked: landingClicked,
      
      // Financial
      cost: isDuplicate ? 0 : parseFloat(campaign.cost_value) || 0,
      payout: 0,
      is_converted: 0,
      
      // Timestamps
      timestamp: now(),
      conversion_time: null,
      
      // Fraud
      is_bot: isBot,
      bot_score: botScore,
      fraud_flags: '',
      ip_quality_score: 0,
      is_unique: isDuplicate ? 0 : 1,
      user_fingerprint: fingerprint,
      
      // Tracking params
      ...trackingParams,
      
      // Custom vars
      custom_var1: req.query.v1 || req.query.custom1 || '',
      custom_var2: req.query.v2 || req.query.custom2 || '',
      custom_var3: req.query.v3 || req.query.custom3 || '',
      custom_var4: req.query.v4 || req.query.custom4 || '',
      custom_var5: req.query.v5 || req.query.custom5 || '',
      
      custom_data: JSON.stringify(req.query)
    };
    
    // ━━━ STEP 10: Queue click for async processing ━━━
    await addClickToQueue(clickData);
    
    // ━━━ STEP 11: Set cookie & redirect ━━━
    res.cookie('afl_fp', fingerprint, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax'
    });
    
    res.setHeader('X-Click-ID', clickId);
    res.setHeader('X-Processing-Time', `${Date.now() - startTime}ms`);
    
    res.redirect(302, redirectUrl);
    
    logger.info(`Click tracked: ${clickId} -> ${campaignId}`);
    
  } catch (error) {
    logger.error('Click handler error:', error);
    res.status(500).send('Internal Server Error');
  }
}

/**
 * Get campaign config with Redis cache
 */
async function getCampaignConfig(campaignId) {
  const cacheKey = `campaign:${campaignId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const [rows] = await db.query(
    'SELECT * FROM campaigns WHERE id = ? AND status = ?',
    [campaignId, 'active']
  );
  
  if (rows.length === 0) return null;
  
  const campaign = rows[0];
  
  // Cache for 5 minutes
  await redis.setEx(cacheKey, 300, JSON.stringify(campaign));
  
  return campaign;
}

/**
 * Get landing page
 */
async function getLandingPage(landingPageId) {
  const [rows] = await db.query(
    'SELECT * FROM landing_pages WHERE id = ? AND status = ?',
    [landingPageId, 'active']
  );
  
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get active offers for campaign
 */
async function getActiveOffers(campaignId) {
  const [rows] = await db.query(
    'SELECT * FROM offers WHERE campaign_id = ? AND status = ? ORDER BY weight DESC',
    [campaignId, 'active']
  );
  
  return rows;
}

/**
 * Check for fraud/bot
 */
async function checkFraud(ip, userAgent, fingerprint) {
  // Simple bot detection
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /scrape/i,
    /curl/i, /wget/i, /python/i, /java/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  return {
    isBot: isBot,
    score: isBot ? 100 : 0,
    action: isBot ? 'block' : 'allow'
  };
}

/**
 * Check for duplicate clicks
 */
async function checkDuplication(campaignId, fingerprint, externalId) {
  const cacheKey = `dedup:${campaignId}:${fingerprint}`;
  
  const exists = await redis.get(cacheKey);
  
  if (exists) {
    return true; // Duplicate
  }
  
  // Mark as seen for 24 hours
  await redis.setEx(cacheKey, 86400, '1');
  
  return false;
}
