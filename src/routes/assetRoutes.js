const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, assetValidation, idValidation } = require('../middleware/validation');
const { assetCreationLimiter } = require('../middleware/rateLimiter');
const { uploadMultiple, uploadSingle } = require('../middleware/upload');

const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetQRCode,
  getAssetStatistics,
  bulkUploadAssets,
  exportAssets,
  getAssetMaintenanceHistory,
  assignAsset,
  returnAsset,
  uploadAssetImages,
  getAssetByTag
} = require('../controllers/assetController');

// Public routes (within protected scope but open access)
router.get('/statistics', protect, authorize('admin', 'manager'), getAssetStatistics);
router.get('/export', protect, authorize('admin', 'manager'), exportAssets);

// Asset CRUD operations
router.route('/')
  .get(protect, getAssets)
  .post(protect, authorize('admin', 'manager'), assetCreationLimiter, validate(assetValidation.create), createAsset);

router.post('/bulk-upload', protect, authorize('admin'), bulkUploadAssets);

router.route('/:id')
  .get(protect, validate(idValidation), getAssetById)
  .put(protect, authorize('admin', 'manager'), validate([...idValidation, ...assetValidation.update]), updateAsset)
  .delete(protect, authorize('admin'), validate(idValidation), deleteAsset);

// Asset specific routes
router.get('/tag/:tag', protect, getAssetByTag);
router.get('/:id/qrcode', protect, validate(idValidation), getAssetQRCode);
router.get('/:id/maintenance', protect, validate(idValidation), getAssetMaintenanceHistory);

// Asset assignment routes
router.post('/:id/assign', protect, authorize('admin', 'manager'), validate(idValidation), assignAsset);
router.post('/:id/return', protect, authorize('admin', 'manager'), validate(idValidation), returnAsset);

// Asset image upload
router.post('/:id/images', protect, authorize('admin', 'manager'), uploadMultiple('images', 5), uploadAssetImages);

module.exports = router;