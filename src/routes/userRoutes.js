const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, userValidation, idValidation } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');
const User = require('../models/User'); // Add this import for cleanup
const Asset = require('../models/Asset'); // Add this import for cleanup

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  updateUserRole,
  getUserAssets,
  getUserActivityLogs,
  uploadAvatar,
  getEmployeesByDepartment,
  toggleUserStatus,
  bulkImportUsers,
  exportUsers,
  createUser
} = require('../controllers/userController');

// Current user routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, validate(userValidation.updateProfile), updateCurrentUser);
router.post(
  '/me/avatar',
  protect,
  (req, res, next) => {
    uploadSingle('avatar')(req, res, function(err) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      console.log(req.file);
      next();
    });
  },
  uploadAvatar
);
router.get('/me/assets', protect, getUserAssets);
router.get('/me/activities', protect, getUserActivityLogs);

// Admin/Manager routes
router.route('/')
  .get(protect, authorize('admin', 'manager'), getUsers)
  .post(protect, authorize('admin'), validate(userValidation.register), createUser);

router.post(
  '/bulk-import',
  protect,
  authorize('admin'),
  bulkImportUsers
);

router.get('/export', protect, authorize('admin', 'manager'), exportUsers);
router.get('/department/:department', protect, authorize('admin', 'manager'), getEmployeesByDepartment);

// ========== CLEANUP ROUTE - Add this before the :id routes ==========
// @desc    Clean up corrupted users (users with _deleted_ in email)
// @route   POST /api/users/cleanup-corrupted
// @access  Private (Admin only)
router.post(
  '/cleanup-corrupted',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      // Find all users with corrupted emails (contain _deleted_)
      const corruptedUsers = await User.find({
        email: { $regex: '_deleted_', $options: 'i' }
      });

      console.log(`Found ${corruptedUsers.length} corrupted users to clean up`);

      let deletedCount = 0;
      let failedCount = 0;
      const failedUsers = [];

      for (const user of corruptedUsers) {
        try {
          // Check if user has allocated assets
          const hasAssets = await Asset.findOne({ 
            assignedTo: user._id, 
            status: 'Assigned' 
          });
          
          if (!hasAssets) {
            await user.deleteOne();
            deletedCount++;
            console.log(`✅ Deleted corrupted user: ${user.email} (${user._id})`);
          } else {
            failedCount++;
            failedUsers.push({
              id: user._id,
              email: user.email,
              reason: 'Has allocated assets'
            });
            console.log(`⚠️ Cannot delete ${user.email} - has allocated assets`);
          }
        } catch (err) {
          failedCount++;
          failedUsers.push({
            id: user._id,
            email: user.email,
            reason: err.message
          });
          console.error(`❌ Failed to delete ${user.email}:`, err.message);
        }
      }

      res.status(200).json({
        success: true,
        message: `Cleanup completed: ${deletedCount} deleted, ${failedCount} failed`,
        data: {
          deletedCount,
          failedCount,
          failedUsers: failedUsers.slice(0, 10) // Return first 10 failures
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cleaning up corrupted users',
        error: error.message
      });
    }
  }
);
// ========== END OF CLEANUP ROUTE ==========

router.route('/:id')
  .get(protect, authorize('admin', 'manager'), validate(idValidation), getUserById)
  .put(protect, authorize('admin'), validate([...idValidation, ...userValidation.updateProfile]), updateUser)
  .delete(protect, authorize('admin'), validate(idValidation), deleteUser);

// User management routes
router.put('/:id/role', protect, authorize('admin'), validate(idValidation), updateUserRole);
router.put('/:id/toggle-status', protect, authorize('admin'), validate(idValidation), toggleUserStatus);
router.get('/:id/assets', protect, authorize('admin', 'manager'), validate(idValidation), getUserAssets);
router.get('/:id/activities', protect, authorize('admin', 'manager'), validate(idValidation), getUserActivityLogs);

module.exports = router;