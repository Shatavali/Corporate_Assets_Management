const Asset = require('../models/Asset');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const ActivityLog = require('../models/ActivityLog');

// @desc    Admin Dashboard
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAllocations = await Allocation.countDocuments();
    const totalMaintenance = await Maintenance.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        totalUsers,
        totalAllocations,
        totalMaintenance
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);

    res.status(500).json({
      success: false,
      message: 'Error loading admin dashboard',
      error: error.message
    });
  }
};

// @desc    Manager Dashboard
// @route   GET /api/dashboard/manager
// @access  Private/Admin/Manager
const getManagerDashboard = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const activeAllocations = await Allocation.countDocuments({
      status: 'Active'
    });

    const pendingMaintenance = await Maintenance.countDocuments({
      status: 'Reported'
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        activeAllocations,
        pendingMaintenance
      }
    });

  } catch (error) {
    console.error('Manager dashboard error:', error);

    res.status(500).json({
      success: false,
      message: 'Error loading manager dashboard',
      error: error.message
    });
  }
};

// @desc    Employee Dashboard
// @route   GET /api/dashboard/employee
// @access  Private
const getEmployeeDashboard = async (req, res) => {
  try {
    const myAllocations = await Allocation.countDocuments({
      userId: req.user._id,
      status: 'Active'
    });

    const myMaintenanceRequests = await Maintenance.countDocuments({
      reportedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      data: {
        myAllocations,
        myMaintenanceRequests
      }
    });

  } catch (error) {
    console.error('Employee dashboard error:', error);

    res.status(500).json({
      success: false,
      message: 'Error loading employee dashboard',
      error: error.message
    });
  }
};

// @desc    Recent Activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
const getRecentActivities = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });

  } catch (error) {
    console.error('Recent activities error:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

module.exports = {
  getAdminDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
  getRecentActivities
};