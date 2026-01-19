-- ============================================
-- AFL TRACKER - Sample Data
-- ============================================

-- Insert default traffic sources
INSERT INTO `traffic_sources` (`id`, `name`, `slug`, `icon`, `color`, `click_id_param`, `campaign_id_param`, `ad_id_param`, `adset_id_param`, `postback_template`, `is_active`, `sort_order`, `created_at`)
VALUES 
  ('ts_facebook', 'Facebook Ads', 'facebook', '📘', '#1877f2', 'fbclid', 'campaign_id', 'ad_id', 'adset_id', 
   'https://www.facebook.com/tr?id={pixel_id}&ev=Purchase&cd[value]={payout}&cd[currency]=USD&cd[order_id]={click_id}', 
   1, 1, UNIX_TIMESTAMP() * 1000),
  
  ('ts_google', 'Google Ads', 'google', '🔍', '#4285f4', 'gclid', 'campaignid', 'adgroupid', 'creative', 
   'https://www.googleadservices.com/pagead/conversion/{conversion_id}/?value={payout}&currency_code=USD&label={conversion_label}&oid={click_id}', 
   1, 2, UNIX_TIMESTAMP() * 1000),
  
  ('ts_tiktok', 'TikTok Ads', 'tiktok', '🎵', '#000000', 'ttclid', 'campaign_id', 'adgroup_id', 'ad_id', 
   'https://business-api.tiktok.com/open_api/v1.3/event/track/?event_type=CompletePayment&context.ad.callback={click_id}&properties.value={payout}&properties.currency=USD', 
   1, 3, UNIX_TIMESTAMP() * 1000),
  
  ('ts_snapchat', 'Snapchat Ads', 'snapchat', '👻', '#fffc00', 'ScCid', 'campaign_id', 'ad_squad_id', 'ad_id', 
   'https://tr.snapchat.com/cm/i?pid={pixel_id}&ev=PURCHASE&pr={payout}&cu=USD&ec={click_id}', 
   1, 4, UNIX_TIMESTAMP() * 1000),
  
  ('ts_native', 'Native Ads', 'native', '📰', '#ff6b6b', 'click_id', 'cid', 'aid', 'sid', 
   '', 1, 5, UNIX_TIMESTAMP() * 1000),
  
  ('ts_custom', 'Custom Source', 'custom', '⚙️', '#6c757d', 'click_id', 'campaign', 'ad', 'placement', 
   '', 1, 99, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Sample campaign
INSERT INTO `campaigns` (`id`, `name`, `traffic_source_id`, `cost_model`, `cost_value`, `status`, `created_at`)
VALUES ('camp_demo_001', 'Demo Campaign - Facebook', 'ts_facebook', 'CPC', 0.50, 'active', UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Sample offers
INSERT INTO `offers` (`id`, `campaign_id`, `name`, `url`, `payout`, `weight`, `created_at`)
VALUES 
  ('offer_demo_001', 'camp_demo_001', 'Offer A - High Payout', 'https://example.com/offer-a', 15.0, 60, UNIX_TIMESTAMP() * 1000),
  ('offer_demo_002', 'camp_demo_001', 'Offer B - Safe', 'https://example.com/offer-b', 10.0, 40, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Default settings
INSERT INTO `settings` (`key`, `value`, `type`, `updated_at`)
VALUES 
  ('site_name', 'AFL Tracker', 'string', UNIX_TIMESTAMP() * 1000),
  ('timezone', 'Asia/Ho_Chi_Minh', 'string', UNIX_TIMESTAMP() * 1000),
  ('currency', 'USD', 'string', UNIX_TIMESTAMP() * 1000),
  ('fraud_detection_enabled', '1', 'boolean', UNIX_TIMESTAMP() * 1000),
  ('telegram_alerts_enabled', '0', 'boolean', UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
