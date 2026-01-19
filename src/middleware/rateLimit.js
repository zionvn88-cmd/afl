import rateLimit from 'express-rate-limit';

// API rate limiter
export const apiLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Disable trust proxy validation warning
  skip: (req) => {
    // Skip validation - we trust Nginx proxy
    return false;
  },
  // Custom key generator to get real IP from proxy
  keyGenerator: (req) => {
    // Get IP from X-Forwarded-For header (from Nginx) or direct connection
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Disable validation warnings
  validate: false
});

// Tracker rate limiter (more lenient)
export const trackerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: 'Rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Disable validation warnings
  validate: false
});
