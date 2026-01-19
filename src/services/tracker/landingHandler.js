import db from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * Handle landing page click (user clicked from lander to offer)
 */
export async function handleLandingClick(req, res) {
  try {
    const clickId = req.query.click_id || req.query.afl_click_id;
    
    if (!clickId) {
      return res.status(400).send('Missing click_id');
    }
    
    // Update click: landing_clicked = 1
    await db.query(
      'UPDATE clicks SET landing_clicked = 1 WHERE click_id = ?',
      [clickId]
    );
    
    // Get click to find offer
    const [clicks] = await db.query(
      'SELECT * FROM clicks WHERE click_id = ?',
      [clickId]
    );
    
    if (clicks.length === 0) {
      logger.warn(`Click not found: ${clickId}`);
      return res.status(404).send('Click not found');
    }
    
    const click = clicks[0];
    
    // Get offer
    const [offers] = await db.query(
      'SELECT * FROM offers WHERE id = ?',
      [click.offer_id]
    );
    
    if (offers.length === 0) {
      logger.warn(`Offer not found: ${click.offer_id}`);
      return res.status(404).send('Offer not found');
    }
    
    const offer = offers[0];
    
    // Build redirect URL
    let redirectUrl = offer.url;
    const separator = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl += `${separator}afl_click_id=${clickId}`;
    
    logger.info(`Landing click: ${clickId} -> ${offer.id}`);
    
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    logger.error('Landing click handler error:', error);
    res.status(500).send('Internal Server Error');
  }
}
