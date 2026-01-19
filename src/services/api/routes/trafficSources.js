import express from 'express';
import db from '../../../config/database.js';
import logger from '../../../utils/logger.js';
import { nanoid } from 'nanoid';

const router = express.Router();

/**
 * GET /api/traffic-sources - List all traffic sources
 */
router.get('/', async (req, res) => {
  try {
    const [sources] = await db.query(`
      SELECT * FROM traffic_sources 
      WHERE is_active = 1 
      ORDER BY sort_order, name
    `);
    
    res.json({ success: true, traffic_sources: sources });
  } catch (error) {
    logger.error('Get traffic sources error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/traffic-sources/:id - Get traffic source by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [sources] = await db.query(`
      SELECT * FROM traffic_sources WHERE id = ?
    `, [id]);
    
    if (sources.length === 0) {
      return res.status(404).json({ error: 'Traffic source not found' });
    }
    
    // Count campaigns using this traffic source
    const [campaigns] = await db.query(`
      SELECT COUNT(*) as count FROM campaigns WHERE traffic_source_id = ?
    `, [id]);
    
    res.json({ 
      success: true, 
      traffic_source: {
        ...sources[0],
        campaigns_count: campaigns[0].count || 0
      }
    });
  } catch (error) {
    logger.error('Get traffic source error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/traffic-sources - Create traffic source
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      icon = '🌐',
      color = '#6c757d',
      click_id_param = 'click_id',
      campaign_id_param,
      ad_id_param,
      adset_id_param,
      postback_template = '',
      is_active = 1,
      sort_order = 99
    } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and Slug are required' });
    }
    
    // Check if slug already exists
    const [existing] = await db.query(`
      SELECT id FROM traffic_sources WHERE slug = ?
    `, [slug]);
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    
    const id = 'ts_' + nanoid(10);
    const now = new Date();
    
    await db.query(`
      INSERT INTO traffic_sources (
        id, name, slug, icon, color,
        click_id_param, campaign_id_param, ad_id_param, adset_id_param,
        postback_template, is_active, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, name, slug, icon, color,
      click_id_param, campaign_id_param, ad_id_param, adset_id_param,
      postback_template, is_active ? 1 : 0, sort_order, now, now
    ]);
    
    logger.info(`Traffic source created: ${id}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Traffic source created successfully',
      traffic_source: { id }
    });
  } catch (error) {
    logger.error('Create traffic source error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/traffic-sources/:id - Update traffic source
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if exists
    const [existing] = await db.query(`
      SELECT * FROM traffic_sources WHERE id = ?
    `, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Traffic source not found' });
    }
    
    // If slug is being updated, check for conflicts
    if (updateData.slug && updateData.slug !== existing[0].slug) {
      const [conflict] = await db.query(`
        SELECT id FROM traffic_sources WHERE slug = ? AND id != ?
      `, [updateData.slug, id]);
      
      if (conflict.length > 0) {
        return res.status(409).json({ error: 'Slug already exists' });
      }
    }
    
    const now = new Date();
    
    // Build update query dynamically
    const fields = [];
    const values = [];
    
    if (updateData.name !== undefined) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.slug !== undefined) {
      fields.push('slug = ?');
      values.push(updateData.slug);
    }
    if (updateData.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updateData.icon);
    }
    if (updateData.color !== undefined) {
      fields.push('color = ?');
      values.push(updateData.color);
    }
    if (updateData.click_id_param !== undefined) {
      fields.push('click_id_param = ?');
      values.push(updateData.click_id_param);
    }
    if (updateData.campaign_id_param !== undefined) {
      fields.push('campaign_id_param = ?');
      values.push(updateData.campaign_id_param);
    }
    if (updateData.ad_id_param !== undefined) {
      fields.push('ad_id_param = ?');
      values.push(updateData.ad_id_param);
    }
    if (updateData.adset_id_param !== undefined) {
      fields.push('adset_id_param = ?');
      values.push(updateData.adset_id_param);
    }
    if (updateData.postback_template !== undefined) {
      fields.push('postback_template = ?');
      values.push(updateData.postback_template);
    }
    if (updateData.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updateData.is_active ? 1 : 0);
    }
    if (updateData.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(updateData.sort_order);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.query(`
      UPDATE traffic_sources SET ${fields.join(', ')} WHERE id = ?
    `, values);
    
    logger.info(`Traffic source updated: ${id}`);
    
    res.json({ 
      success: true, 
      message: 'Traffic source updated successfully'
    });
  } catch (error) {
    logger.error('Update traffic source error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/traffic-sources/:id - Delete traffic source
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any campaigns are using this traffic source
    const [campaigns] = await db.query(`
      SELECT COUNT(*) as count FROM campaigns WHERE traffic_source_id = ?
    `, [id]);
    
    if (campaigns[0].count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete traffic source: ${campaigns[0].count} campaign(s) are using it` 
      });
    }
    
    await db.query(`
      DELETE FROM traffic_sources WHERE id = ?
    `, [id]);
    
    logger.info(`Traffic source deleted: ${id}`);
    
    res.json({ 
      success: true, 
      message: 'Traffic source deleted successfully'
    });
  } catch (error) {
    logger.error('Delete traffic source error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
