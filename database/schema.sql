-- ============================================
-- AFL TRACKER SELF-HOSTING - MySQL Schema
-- Chuyển đổi từ Cloudflare D1 (SQLite) sang MySQL
-- ============================================

-- Set charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLE 1: Traffic Sources
-- ============================================
CREATE TABLE IF NOT EXISTS `traffic_sources` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(50) UNIQUE NOT NULL,
  `icon` VARCHAR(10),
  `color` VARCHAR(20),
  
  -- Tracking Parameters
  `click_id_param` VARCHAR(50),
  `campaign_id_param` VARCHAR(50),
  `ad_id_param` VARCHAR(50),
  `adset_id_param` VARCHAR(50),
  
  -- Postback Template
  `postback_template` TEXT,
  
  -- Metadata
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT,
  
  INDEX `idx_slug` (`slug`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 2: Campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `traffic_source_id` VARCHAR(50),
  `cost_model` VARCHAR(20) DEFAULT 'CPC',
  `cost_value` DECIMAL(10,4) DEFAULT 0,
  `daily_budget` DECIMAL(10,2) DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'active',
  
  -- Flow settings
  `flow_type` VARCHAR(20) DEFAULT 'direct',
  `offer_url` TEXT,
  `landing_page_id` VARCHAR(50),
  
  -- Advanced settings
  `enable_fraud_detection` TINYINT(1) DEFAULT 0,
  `fraud_preset` VARCHAR(20) DEFAULT 'medium',
  `rotation_mode` VARCHAR(20) DEFAULT 'weighted',
  `enable_lander` TINYINT(1) DEFAULT 0,
  
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT,
  
  FOREIGN KEY (`traffic_source_id`) REFERENCES `traffic_sources`(`id`) ON DELETE SET NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 3: Offers
-- ============================================
CREATE TABLE IF NOT EXISTS `offers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `campaign_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `url` TEXT NOT NULL,
  `payout` DECIMAL(10,2) DEFAULT 0,
  `weight` INT DEFAULT 100,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` BIGINT NOT NULL,
  
  FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE,
  INDEX `idx_campaign` (`campaign_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 4: Landing Pages
-- ============================================
CREATE TABLE IF NOT EXISTS `landing_pages` (
  `id` VARCHAR(50) PRIMARY KEY,
  `campaign_id` VARCHAR(50),
  `name` VARCHAR(200) NOT NULL,
  `url` TEXT,
  `weight` INT DEFAULT 100,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` BIGINT NOT NULL,
  
  INDEX `idx_campaign` (`campaign_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 5: Clicks (Main tracking table)
-- ============================================
CREATE TABLE IF NOT EXISTS `clicks` (
  `click_id` VARCHAR(50) PRIMARY KEY,
  `campaign_id` VARCHAR(50) NOT NULL,
  `offer_id` VARCHAR(50),
  `path_id` VARCHAR(50),
  `landing_page_id` VARCHAR(50),
  
  -- External IDs
  `external_id` VARCHAR(200),
  
  -- User Information
  `ip` VARCHAR(45),
  `country` VARCHAR(5),
  `city` VARCHAR(100),
  `device` VARCHAR(20),
  `os` VARCHAR(50),
  `browser` VARCHAR(50),
  `user_agent` TEXT,
  `referrer` TEXT,
  
  -- Tracking
  `landing_clicked` TINYINT(1) DEFAULT 0,
  
  -- Financial
  `cost` DECIMAL(10,4) DEFAULT 0,
  `payout` DECIMAL(10,2) DEFAULT 0,
  `is_converted` TINYINT(1) DEFAULT 0,
  
  -- Timestamps
  `timestamp` BIGINT NOT NULL,
  `conversion_time` BIGINT,
  
  -- Fraud Detection
  `is_bot` TINYINT(1) DEFAULT 0,
  `bot_score` INT DEFAULT 0,
  `fraud_flags` TEXT,
  `ip_quality_score` INT DEFAULT 0,
  `is_unique` TINYINT(1) DEFAULT 1,
  `user_fingerprint` VARCHAR(100),
  
  -- Tracking Parameters (Facebook, Google, TikTok, etc)
  `gclid` VARCHAR(200),
  `fbclid` VARCHAR(200),
  `msclkid` VARCHAR(200),
  `ttclid` VARCHAR(200),
  `gad_source` VARCHAR(200),
  `gad_campaignid` VARCHAR(200),
  `gbraid` VARCHAR(200),
  `wbraid` VARCHAR(200),
  `fbadid` VARCHAR(200),
  `fbcampaignid` VARCHAR(200),
  
  -- UTM Parameters
  `utm_source` VARCHAR(200),
  `utm_medium` VARCHAR(200),
  `utm_campaign` VARCHAR(200),
  `utm_term` VARCHAR(200),
  `utm_content` VARCHAR(200),
  
  -- Custom Variables
  `custom_var1` VARCHAR(200),
  `custom_var2` VARCHAR(200),
  `custom_var3` VARCHAR(200),
  `custom_var4` VARCHAR(200),
  `custom_var5` VARCHAR(200),
  
  -- Additional Data
  `custom_data` TEXT,
  
  FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE,
  INDEX `idx_campaign` (`campaign_id`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_converted` (`is_converted`),
  INDEX `idx_country` (`country`),
  INDEX `idx_device` (`device`),
  INDEX `idx_external_id` (`external_id`),
  INDEX `idx_campaign_timestamp` (`campaign_id`, `timestamp`),
  INDEX `idx_fingerprint` (`user_fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 6: Stats Hourly (Pre-aggregated)
-- ============================================
CREATE TABLE IF NOT EXISTS `stats_hourly` (
  `campaign_id` VARCHAR(50) NOT NULL,
  `hour` BIGINT NOT NULL,
  `clicks` INT DEFAULT 0,
  `unique_clicks` INT DEFAULT 0,
  `conversions` INT DEFAULT 0,
  `cost` DECIMAL(10,2) DEFAULT 0,
  `revenue` DECIMAL(10,2) DEFAULT 0,
  
  PRIMARY KEY (`campaign_id`, `hour`),
  FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE,
  INDEX `idx_hour` (`hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 7: Alerts
-- ============================================
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `campaign_id` VARCHAR(50),
  `alert_type` VARCHAR(50) NOT NULL,
  `severity` VARCHAR(20) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `data` TEXT,
  `acknowledged` TINYINT(1) DEFAULT 0,
  `created_at` BIGINT NOT NULL,
  
  FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE,
  INDEX `idx_campaign` (`campaign_id`),
  INDEX `idx_created` (`created_at` DESC),
  INDEX `idx_acknowledged` (`acknowledged`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 8: User Offer History (For smart rotation)
-- ============================================
CREATE TABLE IF NOT EXISTS `user_offer_history` (
  `user_fingerprint` VARCHAR(100) NOT NULL,
  `offer_id` VARCHAR(50) NOT NULL,
  `campaign_id` VARCHAR(50) NOT NULL,
  `last_seen` BIGINT NOT NULL,
  
  PRIMARY KEY (`user_fingerprint`, `offer_id`, `campaign_id`),
  INDEX `idx_fingerprint` (`user_fingerprint`),
  INDEX `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 9: Settings
-- ============================================
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT,
  `type` VARCHAR(20) DEFAULT 'string',
  `updated_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS
-- ============================================

-- Campaign Performance View
CREATE OR REPLACE VIEW `v_campaign_stats` AS
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.status,
  COUNT(cl.click_id) as total_clicks,
  COUNT(DISTINCT cl.ip) as unique_clicks,
  SUM(CASE WHEN cl.is_converted = 1 THEN 1 ELSE 0 END) as conversions,
  ROUND(CAST(SUM(CASE WHEN cl.is_converted = 1 THEN 1 ELSE 0 END) AS DECIMAL) / NULLIF(COUNT(cl.click_id), 0) * 100, 2) as conversion_rate,
  SUM(cl.cost) as total_cost,
  SUM(cl.payout) as total_revenue,
  (SUM(cl.payout) - SUM(cl.cost)) as profit,
  ROUND((SUM(cl.payout) - SUM(cl.cost)) / NULLIF(SUM(cl.cost), 0) * 100, 2) as roi,
  ROUND(SUM(cl.payout) / NULLIF(COUNT(cl.click_id), 0), 4) as epc
FROM campaigns c
LEFT JOIN clicks cl ON c.id = cl.campaign_id
GROUP BY c.id, c.name, c.status;

SET FOREIGN_KEY_CHECKS = 1;
