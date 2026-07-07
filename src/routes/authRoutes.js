const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, userValidation, idValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  resendOTP,
  changePassword
} = require('../controllers/authController');

// Public routes (with rate limiting)
router.post('/register', authLimiter, validate(userValidation.register), register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/login', authLimiter, validate(userValidation.login), login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/resend-otp', authLimiter, resendOTP);

// Protected routes
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);
router.get('/verify', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

module.exports = router;