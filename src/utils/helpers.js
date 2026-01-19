import { nanoid } from 'nanoid';
import UAParser from 'ua-parser-js';

/**
 * Generate unique click ID
 */
export function generateClickId() {
  const prefix = process.env.CLICK_ID_PREFIX || 'afl_';
  return prefix + nanoid(16);
}

/**
 * Parse User Agent
 */
export function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    device: result.device.type || 'desktop',
    os: result.os.name || 'Unknown',
    browser: result.browser.name || 'Unknown',
    osVersion: result.os.version || '',
    browserVersion: result.browser.version || ''
  };
}

/**
 * Generate browser fingerprint
 */
export function generateFingerprint(ip, userAgent, headers = {}) {
  const ua = parseUserAgent(userAgent);
  const acceptLang = headers['accept-language'] || '';
  const acceptEnc = headers['accept-encoding'] || '';
  
  const str = `${ip}|${ua.device}|${ua.os}|${ua.browser}|${acceptLang}|${acceptEnc}`;
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Weighted random selection
 */
export function weightedRandom(items, weightKey = 'weight') {
  if (!items || items.length === 0) return null;
  
  const totalWeight = items.reduce((sum, item) => sum + (item[weightKey] || 0), 0);
  
  if (totalWeight === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }
  
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= (item[weightKey] || 0);
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

/**
 * Extract tracking parameters from URL
 */
export function extractTrackingParams(url) {
  const params = new URLSearchParams(url.search);
  
  return {
    // Google
    gclid: params.get('gclid') || '',
    gad_source: params.get('gad_source') || '',
    gad_campaignid: params.get('campaignid') || '',
    gbraid: params.get('gbraid') || '',
    wbraid: params.get('wbraid') || '',
    
    // Facebook
    fbclid: params.get('fbclid') || '',
    fbadid: params.get('ad_id') || '',
    fbcampaignid: params.get('campaign_id') || '',
    
    // Microsoft
    msclkid: params.get('msclkid') || '',
    
    // TikTok
    ttclid: params.get('ttclid') || '',
    
    // UTM
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
    
    // External ID
    external_id: params.get('external_id') || params.get('clickid') || ''
  };
}

/**
 * Escape SQL string
 */
export function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").substring(0, 500);
}

/**
 * Get current timestamp in milliseconds
 */
export function now() {
  return Date.now();
}

/**
 * Round to hour timestamp
 */
export function roundToHour(timestamp) {
  return Math.floor(timestamp / 3600000) * 3600000;
}

/**
 * Calculate conversion rate
 */
export function calculateCR(conversions, clicks) {
  if (!clicks || clicks === 0) return 0;
  return parseFloat(((conversions / clicks) * 100).toFixed(2));
}

/**
 * Calculate ROI
 */
export function calculateROI(revenue, cost) {
  if (!cost || cost === 0) return 0;
  return parseFloat((((revenue - cost) / cost) * 100).toFixed(2));
}

/**
 * Calculate EPC (Earnings Per Click)
 */
export function calculateEPC(revenue, clicks) {
  if (!clicks || clicks === 0) return 0;
  return parseFloat((revenue / clicks).toFixed(4));
}
