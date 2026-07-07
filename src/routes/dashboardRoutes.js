const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getAdminDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
  getRecentActivities
} = require('../controllers/dashboardController');

// Role-based dashboards
router.get(
  '/admin',
  protect,
  authorize('admin'),
  getAdminDashboard
);

router.get(
  '/manager',
  protect,
  authorize('admin', 'manager'),
  getManagerDashboard
);

router.get(
  '/employee',
  protect,
  getEmployeeDashboard
);

// Recent activities
router.get(
  '/recent-activities',
  protect,
  getRecentActivities
);

module.exports = router;