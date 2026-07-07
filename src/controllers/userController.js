const User = require('../models/User');
const Asset = require('../models/Asset');
const ActivityLog = require('../models/ActivityLog');
const Allocation = require('../models/Allocation');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ==================== CURRENT USER CONTROLLERS ====================

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('allocatedAssets', 'assetName assetTag category status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateCurrentUser = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phoneNumber', 'department', 'position'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: req.user._id,
      details: { updates },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/me/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {

    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Convert image buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const user = await User.findById(req.user._id);

    user.avatar = base64Image;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);

    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
};

// @desc    Get current user's assets
// @route   GET /api/users/me/assets
// @access  Private
const getUserAssets = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    
    // Check authorization
    if (req.params.id && req.user.role !== 'admin' && req.user.role !== 'manager' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own assets.'
      });
    }

    const assets = await Asset.find({ assignedTo: userId })
      .populate('assignedTo', 'name email employeeId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    console.error('Get user assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user assets',
      error: error.message
    });
  }
};

// @desc    Get current user's activity logs
// @route   GET /api/users/me/activities
// @access  Private
const getUserActivityLogs = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const { limit = 50, page = 1 } = req.query;
    
    // Check authorization
    if (req.params.id && req.user.role !== 'admin' && req.user.role !== 'manager' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own activities.'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      ActivityLog.find({ userId })
        .sort('-timestamp')
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments({ userId })
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: activities
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activities',
      error: error.message
    });
  }
};

// ==================== ADMIN & MANAGER CONTROLLERS ====================

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager)
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      role, 
      department, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('allocatedAssets', 'assetName assetTag')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin/Manager)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('allocatedAssets', 'assetName assetTag category status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phoneNumber', 'department', 'position', 'role'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: user._id,
      details: { updates, targetUser: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
// Replace your existing deleteUser function with this:
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has allocated assets
    const hasAssets = await Asset.findOne({ assignedTo: user._id, status: 'Assigned' });
    if (hasAssets) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user. Please回收 all allocated assets first.'
      });
    }

    // HARD DELETE - Actually remove the user from database
    await user.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE',
      entityType: 'USER',
      entityId: user._id,
      details: { deletedUser: user.email, type: 'HARD_DELETE' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'User permanently deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be admin, manager, or employee'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: user._id,
      details: { newRole: role, targetUser: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Toggle user status (Activate/Deactivate)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: user._id,
      details: { status: user.isActive ? 'activated' : 'deactivated', targetUser: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: user._id, name: user.name, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling user status',
      error: error.message
    });
  }
};

// @desc    Get employees by department
// @route   GET /api/users/department/:department
// @access  Private (Admin/Manager)
const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const { includeInactive = false } = req.query;

    const query = { department };
    if (!includeInactive) query.isActive = true;

    const users = await User.find(query)
      .select('-password')
      .populate('allocatedAssets', 'assetName assetTag')
      .sort('name');

    res.status(200).json({
      success: true,
      count: users.length,
      department,
      data: users
    });
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};
const createUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      role,
      department,
      position,
      phoneNumber
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role ? role.toLowerCase() : 'employee',
      department,
      position,
      phoneNumber,
      isActive: true,
      isEmailVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });

  } catch (error) {

    console.error('Create user error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Bulk import users
// @route   POST /api/users/bulk-import
// @access  Private (Admin)
const bulkImportUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of users'
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const userData of users) {
      try {
        const { name, email, password, role, department, phoneNumber } = userData;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          results.failed.push({ email, reason: 'User already exists' });
          continue;
        }

        // Create user
        const user = await User.create({
          name,
          email,
          password: password || 'Temp@123456',
          role: role || 'employee',
          department: department || 'Other',
          phoneNumber,
          isEmailVerified: true, // Auto-verify for bulk import
          isActive: true
        });

        results.successful.push({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      } catch (error) {
        results.failed.push({ email: userData.email, reason: error.message });
      }
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entityType: 'USER',
      details: { 
        bulkImport: true,
        successful: results.successful.length,
        failed: results.failed.length
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: `Bulk import completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    console.error('Bulk import users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during bulk import',
      error: error.message
    });
  }
};

// @desc    Export users to CSV/Excel
// @route   GET /api/users/export
// @access  Private (Admin/Manager)
const exportUsers = async (req, res) => {
  try {
    const { format = 'json', role, department } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    
    const users = await User.find(query)
      .select('-password')
      .sort('name');

    if (format === 'json') {
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    }

    // For CSV format
    if (format === 'csv') {
      const csvData = users.map(user => ({
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Department: user.department,
        EmployeeId: user.employeeId || 'N/A',
        PhoneNumber: user.phoneNumber || 'N/A',
        Status: user.isActive ? 'Active' : 'Inactive',
        CreatedAt: user.createdAt.toISOString()
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.csv`);
      
      // Simple CSV conversion
      const headers = Object.keys(csvData[0] || {});
      const csvRows = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
      ];
      
      return res.status(200).send(csvRows.join('\n'));
    }

    res.status(400).json({
      success: false,
      message: 'Invalid export format. Use json or csv'
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting users',
      error: error.message
    });
  }
};

// ==================== ADDITIONAL HELPER CONTROLLERS ====================

// @desc    Get user statistics
// @route   GET /api/users/statistics
// @access  Private (Admin/Manager)
const getUserStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminCount,
      managerCount,
      employeeCount,
      departmentStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'employee' }),
      User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: {
          admin: adminCount,
          manager: managerCount,
          employee: employeeCount
        },
        byDepartment: departmentStats
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

module.exports = {
  // Current user controllers
  getCurrentUser,
  updateCurrentUser,
  uploadAvatar,
  getUserAssets,
  getUserActivityLogs,
  
  // Admin/Manager controllers
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
  getEmployeesByDepartment,
  bulkImportUsers,
  exportUsers,
  createUser,
  
  // Statistics
  getUserStatistics
};