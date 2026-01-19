import express from 'express';
import db from '../../../config/database.js';
import logger from '../../../utils/logger.js';

const router = express.Router();

/**
 * GET /api/conversions - List conversions
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'all', event = 'all', dateRange = 'today' } = req.query;
    
    // Calculate time range
    const now = Date.now();
    let from = now - 86400000; // Default: last 24 hours
    
    switch (dateRange) {
      case 'yesterday':
        from = now - (86400000 * 2);
        break;
      case 'last7days':
        from = now - (86400000 * 7);
        break;
      case 'last30days':
        from = now - (86400000 * 30);
        break;
    }
    
    // Query conversions from clicks table
    let query = `
      SELECT 
        c.click_id,
        c.campaign_id,
        c.offer_id,
        c.ip,
        c.country,
        c.device,
        c.browser,
        c.timestamp as click_time,
        c.conversion_time,
        c.payout,
        c.cost,
        c.is_converted,
        camp.name as campaign_name,
        o.name as offer_name
      FROM clicks c
      LEFT JOIN campaigns camp ON c.campaign_id = camp.id
      LEFT JOIN offers o ON c.offer_id = o.id
      WHERE c.is_converted = 1
        AND c.timestamp >= ?
      ORDER BY c.conversion_time DESC
      LIMIT 100
    `;
    
    const [conversions] = await db.query(query, [from]);
    
    res.json({
      success: true,
      conversions: conversions || [],
      total: conversions?.length || 0
    });
  } catch (error) {
    logger.error('Error fetching conversions:', error);
    res.status(500).json({ error: 'Failed to fetch conversions' });
  }
});

export default router;
