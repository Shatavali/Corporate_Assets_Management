const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { exportLimiter } = require('../middleware/rateLimiter');

const {
  generateAssetReport,
  generateMaintenanceReport,
  generateAllocationReport
} = require('../controllers/reportController');

// Asset Report
router.post(
  '/assets',
  protect,
  authorize('admin', 'manager'),
  exportLimiter,
  generateAssetReport
);

// Maintenance Report
router.post(
  '/maintenance',
  protect,
  authorize('admin', 'manager'),
  exportLimiter,
  generateMaintenanceReport
);

// Allocation Report
router.post(
  '/allocations',
  protect,
  authorize('admin', 'manager'),
  exportLimiter,
  generateAllocationReport
);

module.exports = router;