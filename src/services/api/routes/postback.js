import express from 'express';
import db from '../../../config/database.js';
import logger from '../../../utils/logger.js';
import { now } from '../../../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/postback - Handle conversion postback
 * Example: /api/postback?click_id=xxx&payout=10&status=approved
 */
router.get('/', async (req, res) => {
  try {
    const { 
      click_id, 
      afl_click_id,
      payout = 0, 
      status = 'approved' 
    } = req.query;
    
    const clickId = click_id || afl_click_id;
    
    if (!clickId) {
      return res.status(400).json({ error: 'Missing click_id' });
    }
    
    // Check if click exists
    const [clicks] = await db.query(
      'SELECT * FROM clicks WHERE click_id = ?',
      [clickId]
    );
    
    if (clicks.length === 0) {
      logger.warn(`Postback: Click not found - ${clickId}`);
      return res.status(404).json({ error: 'Click not found' });
    }
    
    const click = clicks[0];
    
    // Check if already converted
    if (click.is_converted === 1) {
      logger.warn(`Postback: Already converted - ${clickId}`);
      return res.json({ 
        success: true, 
        message: 'Already converted',
        click_id: clickId
      });
    }
    
    // Update click with conversion
    await db.query(`
      UPDATE clicks 
      SET is_converted = 1, 
          payout = ?, 
          conversion_time = ?
      WHERE click_id = ?
    `, [parseFloat(payout), now(), clickId]);
    
    logger.info(`Conversion recorded: ${clickId}, Payout: $${payout}`);
    
    res.json({ 
      success: true, 
      message: 'Conversion recorded',
      click_id: clickId,
      payout: payout
    });
    
  } catch (error) {
    logger.error('Postback error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
