const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate, idValidation } = require('../middleware/validation');

const {
  getAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  returnAllocation   // <-- ensure this is imported
} = require('../controllers/allocationController');

// Return route (must be placed BEFORE the /:id route)
router.post(
  '/:id/return',
  protect,
  authorize('admin', 'manager'),
  validate(idValidation),
  returnAllocation
);

// Allocation CRUD Routes
router.route('/')
  .get(protect, getAllocations)
  .post(
    protect,
    authorize('admin', 'manager'),
    createAllocation
  );

router.route('/:id')
  .get(
    protect,
    validate(idValidation),
    getAllocationById
  )
  .put(
    protect,
    authorize('admin', 'manager'),
    validate(idValidation),
    updateAllocation
  )
  .delete(
    protect,
    authorize('admin'),
    validate(idValidation),
    deleteAllocation
  );

module.exports = router;