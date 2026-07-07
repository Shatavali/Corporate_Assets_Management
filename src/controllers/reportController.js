const Asset = require('../models/Asset');
const Maintenance = require('../models/Maintenance');
const Allocation = require('../models/Allocation');

// @desc    Generate Asset Report
// @route   POST /api/reports/assets
// @access  Private/Admin/Manager
const generateAssetReport = async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      reportType: 'Asset Report',
      total: assets.length,
      data: assets
    });

  } catch (error) {
    console.error('Generate asset report error:', error);

    res.status(500).json({
      success: false,
      message: 'Error generating asset report',
      error: error.message
    });
  }
};

// @desc    Generate Maintenance Report
// @route   POST /api/reports/maintenance
// @access  Private/Admin/Manager
const generateMaintenanceReport = async (req, res) => {
  try {
    const maintenance = await Maintenance.find()
      .populate('assetId')
      .populate('reportedBy', 'name email');

    res.status(200).json({
      success: true,
      reportType: 'Maintenance Report',
      total: maintenance.length,
      data: maintenance
    });

  } catch (error) {
    console.error('Generate maintenance report error:', error);

    res.status(500).json({
      success: false,
      message: 'Error generating maintenance report',
      error: error.message
    });
  }
};

// @desc    Generate Allocation Report
// @route   POST /api/reports/allocations
// @access  Private/Admin/Manager
const generateAllocationReport = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('assetId')
      .populate('userId', 'name email')
      .populate('allocatedBy', 'name email');

    res.status(200).json({
      success: true,
      reportType: 'Allocation Report',
      total: allocations.length,
      data: allocations
    });

  } catch (error) {
    console.error('Generate allocation report error:', error);

    res.status(500).json({
      success: false,
      message: 'Error generating allocation report',
      error: error.message
    });
  }
};

module.exports = {
  generateAssetReport,
  generateMaintenanceReport,
  generateAllocationReport
};