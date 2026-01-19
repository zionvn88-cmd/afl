import express from 'express';
import db from '../../../config/database.js';
import logger from '../../../utils/logger.js';
import { calculateCR, calculateROI, calculateEPC } from '../../../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/reports/dashboard - Dashboard stats
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { preset = 'today' } = req.query;
    
    // Calculate time range
    const { startTime, endTime } = getTimeRange(preset);
    
    // Overall stats
    const [overall] = await db.query(`
      SELECT 
        COUNT(DISTINCT click_id) as total_clicks,
        COUNT(DISTINCT ip) as unique_clicks,
        SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cost) as total_cost,
        SUM(payout) as total_revenue,
        (SUM(payout) - SUM(cost)) as profit
      FROM clicks
      WHERE timestamp >= ? AND timestamp < ?
    `, [startTime, endTime]);
    
    const stats = overall[0];
    stats.cr = calculateCR(stats.conversions, stats.total_clicks);
    stats.roi = calculateROI(stats.total_revenue, stats.total_cost);
    stats.epc = calculateEPC(stats.total_revenue, stats.total_clicks);
    
    // Campaign breakdown
    const [campaigns] = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.status,
        COUNT(DISTINCT cl.click_id) as clicks,
        SUM(CASE WHEN cl.is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cl.cost) as cost,
        SUM(cl.payout) as revenue,
        (SUM(cl.payout) - SUM(cl.cost)) as profit
      FROM campaigns c
      LEFT JOIN clicks cl ON c.id = cl.campaign_id 
        AND cl.timestamp >= ? AND cl.timestamp < ?
      GROUP BY c.id
      HAVING clicks > 0
      ORDER BY profit DESC
    `, [startTime, endTime]);
    
    // Add calculated fields
    campaigns.forEach(camp => {
      camp.cr = calculateCR(camp.conversions, camp.clicks);
      camp.roi = calculateROI(camp.revenue, camp.cost);
      camp.epc = calculateEPC(camp.revenue, camp.clicks);
    });
    
    // Chart data (hourly)
    const [chartData] = await db.query(`
      SELECT 
        FROM_UNIXTIME(FLOOR(timestamp/3600000)*3600, '%H:00') as hour,
        COUNT(DISTINCT click_id) as clicks,
        SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cost) as cost,
        SUM(payout) as revenue
      FROM clicks
      WHERE timestamp >= ? AND timestamp < ?
      GROUP BY FLOOR(timestamp/3600000)
      ORDER BY hour
    `, [startTime, endTime]);
    
    res.json({
      success: true,
      overall: stats,
      campaigns: campaigns,
      chartData: chartData,
      topPerformers: campaigns.slice(0, 5),
      worstPerformers: campaigns.slice(-5).reverse(),
      alerts: []
    });
  } catch (error) {
    logger.error('Dashboard report error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reports/campaign/:id - Campaign detailed report
 */
router.get('/campaign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { preset = 'today' } = req.query;
    
    const { startTime, endTime } = getTimeRange(preset);
    
    // Overall stats
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT click_id) as total_clicks,
        COUNT(DISTINCT ip) as unique_clicks,
        SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cost) as total_cost,
        SUM(payout) as total_revenue
      FROM clicks
      WHERE campaign_id = ? AND timestamp >= ? AND timestamp < ?
    `, [id, startTime, endTime]);
    
    // Country breakdown
    const [countries] = await db.query(`
      SELECT 
        country,
        COUNT(*) as clicks,
        SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cost) as cost,
        SUM(payout) as revenue
      FROM clicks
      WHERE campaign_id = ? AND timestamp >= ? AND timestamp < ?
      GROUP BY country
      ORDER BY clicks DESC
      LIMIT 10
    `, [id, startTime, endTime]);
    
    // Device breakdown
    const [devices] = await db.query(`
      SELECT 
        device,
        COUNT(*) as clicks,
        SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cost) as cost,
        SUM(payout) as revenue
      FROM clicks
      WHERE campaign_id = ? AND timestamp >= ? AND timestamp < ?
      GROUP BY device
    `, [id, startTime, endTime]);
    
    res.json({
      success: true,
      stats: stats[0],
      countries: countries,
      devices: devices
    });
  } catch (error) {
    logger.error('Campaign report error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Get time range from preset
 */
function getTimeRange(preset) {
  const now = Date.now();
  let startTime, endTime;
  
  switch (preset) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
      endTime = now;
      break;
      
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startTime = yesterday.getTime();
      endTime = startTime + 86400000;
      break;
      
    case 'last7days':
      startTime = now - (7 * 86400000);
      endTime = now;
      break;
      
    case 'last30days':
      startTime = now - (30 * 86400000);
      endTime = now;
      break;
      
    default:
      startTime = now - 86400000;
      endTime = now;
  }
  
  return { startTime, endTime };
}

export default router;
