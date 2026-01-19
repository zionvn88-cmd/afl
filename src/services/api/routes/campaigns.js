import express from 'express';
import { nanoid } from 'nanoid';
import db from '../../../config/database.js';
import redis from '../../../config/redis.js';
import logger from '../../../utils/logger.js';
import { now } from '../../../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/campaigns - List all campaigns
 */
router.get('/', async (req, res) => {
  try {
    const [campaigns] = await db.query(`
      SELECT 
        c.*,
        ts.name as traffic_source_name,
        ts.icon as traffic_source_icon,
        COUNT(DISTINCT cl.click_id) as clicks,
        SUM(CASE WHEN cl.is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cl.cost) as cost,
        SUM(cl.payout) as revenue,
        (SUM(cl.payout) - SUM(cl.cost)) as profit,
        ROUND((SUM(cl.payout) - SUM(cl.cost)) / NULLIF(SUM(cl.cost), 0) * 100, 2) as roi
      FROM campaigns c
      LEFT JOIN traffic_sources ts ON c.traffic_source_id = ts.id
      LEFT JOIN clicks cl ON c.id = cl.campaign_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, campaigns });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/campaigns/:id - Get single campaign
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [campaigns] = await db.query(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );
    
    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Get offers
    const [offers] = await db.query(
      'SELECT * FROM offers WHERE campaign_id = ?',
      [id]
    );
    
    // Get stats
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT click_id) as total_clicks,
        COUNT(DISTINCT ip) as unique_clicks,
        SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cost) as total_cost,
        SUM(payout) as total_revenue,
        (SUM(payout) - SUM(cost)) as profit
      FROM clicks
      WHERE campaign_id = ?
    `, [id]);
    
    res.json({ 
      success: true, 
      campaign: campaigns[0],
      offers: offers,
      stats: stats[0]
    });
  } catch (error) {
    logger.error('Get campaign error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/campaigns - Create campaign
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      traffic_source_id,
      cost_model = 'CPC',
      cost_value = 0,
      daily_budget = 0,
      flow_type = 'direct',
      offer_url,
      landing_page_id,
      enable_fraud_detection = 0,
      fraud_preset = 'medium'
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const campaignId = 'camp_' + nanoid(10);
    
    await db.query(`
      INSERT INTO campaigns (
        id, name, traffic_source_id, cost_model, cost_value, daily_budget,
        flow_type, offer_url, landing_page_id,
        enable_fraud_detection, fraud_preset,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [
      campaignId, name, traffic_source_id, cost_model, cost_value, daily_budget,
      flow_type, offer_url, landing_page_id,
      enable_fraud_detection, fraud_preset,
      now()
    ]);
    
    // Clear cache
    await redis.del(`campaign:${campaignId}`);
    
    logger.info(`Campaign created: ${campaignId}`);
    
    res.json({ 
      success: true, 
      campaign_id: campaignId,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/campaigns/:id - Update campaign
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build update query
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'name', 'traffic_source_id', 'cost_model', 'cost_value', 'daily_budget',
      'flow_type', 'offer_url', 'landing_page_id',
      'enable_fraud_detection', 'fraud_preset', 'status'
    ];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);
    
    await db.query(
      `UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Clear cache
    await redis.del(`campaign:${id}`);
    
    logger.info(`Campaign updated: ${id}`);
    
    res.json({ 
      success: true,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/campaigns/:id - Delete campaign
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM campaigns WHERE id = ?', [id]);
    
    // Clear cache
    await redis.del(`campaign:${id}`);
    
    logger.info(`Campaign deleted: ${id}`);
    
    res.json({ 
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
