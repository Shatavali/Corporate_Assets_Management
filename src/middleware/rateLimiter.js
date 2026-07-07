const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth specific rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour.'
  },
  skipSuccessfulRequests: true,
});

// Asset creation rate limiter
const assetCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    success: false,
    message: 'Asset creation limit reached. Please try again later.'
  },
});

// Export rate limiter
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Export limit reached. Please try again later.'
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  assetCreationLimiter,
  exportLimiter
};