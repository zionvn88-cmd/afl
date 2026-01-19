import express from 'express';
import { nanoid } from 'nanoid';
import db from '../../../config/database.js';
import logger from '../../../utils/logger.js';
import { now } from '../../../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/offers?campaign_id=xxx - List offers
 */
router.get('/', async (req, res) => {
  try {
    const { campaign_id } = req.query;
    
    let query = 'SELECT * FROM offers';
    let params = [];
    
    if (campaign_id) {
      query += ' WHERE campaign_id = ?';
      params.push(campaign_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [offers] = await db.query(query, params);
    
    res.json({ success: true, offers });
  } catch (error) {
    logger.error('Get offers error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/offers - Create offer
 */
router.post('/', async (req, res) => {
  try {
    const {
      campaign_id,
      name,
      url,
      payout = 0,
      weight = 100
    } = req.body;
    
    if (!campaign_id || !name || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const offerId = 'offer_' + nanoid(10);
    
    await db.query(`
      INSERT INTO offers (id, campaign_id, name, url, payout, weight, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `, [offerId, campaign_id, name, url, payout, weight, now()]);
    
    logger.info(`Offer created: ${offerId}`);
    
    res.json({ 
      success: true, 
      offer_id: offerId,
      message: 'Offer created successfully'
    });
  } catch (error) {
    logger.error('Create offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/offers/:id - Update offer
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, payout, weight, status } = req.body;
    
    const fields = [];
    const values = [];
    
    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (url !== undefined) {
      fields.push('url = ?');
      values.push(url);
    }
    if (payout !== undefined) {
      fields.push('payout = ?');
      values.push(payout);
    }
    if (weight !== undefined) {
      fields.push('weight = ?');
      values.push(weight);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE offers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    logger.info(`Offer updated: ${id}`);
    
    res.json({ 
      success: true,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    logger.error('Update offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/offers/:id - Delete offer
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM offers WHERE id = ?', [id]);
    
    logger.info(`Offer deleted: ${id}`);
    
    res.json({ 
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    logger.error('Delete offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
