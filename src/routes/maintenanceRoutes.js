const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate, idValidation } = require('../middleware/validation');

const {
  getMaintenanceRequests,
  getMaintenanceById,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  startMaintenance,
  completeMaintenanceRequest,
  getMaintenanceStatistics
} = require('../controllers/maintenanceController');

// Statistics route (must be before /:id route)
router.get(
  '/statistics',
  protect,
  authorize('admin', 'manager'),
  getMaintenanceStatistics
);

// Maintenance CRUD
router.route('/')
  .get(protect, getMaintenanceRequests)
  .post(protect, createMaintenanceRequest);

router.route('/:id')
  .get(protect, validate(idValidation), getMaintenanceById)
  .put(
    protect,
    authorize('admin', 'manager'),
    validate(idValidation),
    updateMaintenanceRequest
  )
  .delete(
    protect,
    authorize('admin'),
    validate(idValidation),
    deleteMaintenanceRequest
  );

// ==================== APPROVAL WORKFLOW ROUTES ====================

// Approve a maintenance request (Manager/Admin only)
router.put(
  '/:id/approve',
  protect,
  authorize('admin', 'manager'),
  validate(idValidation),
  approveMaintenanceRequest
);

// Reject a maintenance request with reason (Manager/Admin only)
router.put(
  '/:id/reject',
  protect,
  authorize('admin', 'manager'),
  validate(idValidation),
  rejectMaintenanceRequest
);

// Start maintenance (assign technician) (Manager/Admin only)
router.put(
  '/:id/start',
  protect,
  authorize('admin', 'manager'),
  validate(idValidation),
  startMaintenance
);

// Complete maintenance (Manager/Admin only)
router.put(
  '/:id/complete',
  protect,
  authorize('admin', 'manager'),
  validate(idValidation),
  completeMaintenanceRequest
);

module.exports = router;