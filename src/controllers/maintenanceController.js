const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const User = require('../models/User');
const {
  sendMaintenanceApprovalRequestEmail,
  sendMaintenanceStatusUpdateEmail,
  sendAdminAlertEmail
} = require('../services/emailService');

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRequests = async (req, res) => {
  try {
    let query = {};
    
    // Role-based access
    if (req.user.role === 'employee') {
      query.reportedBy = req.user._id;
    }
    
    const maintenanceRequests = await Maintenance.find(query)
      .populate('assetId')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('approvedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: maintenanceRequests.length,
      data: maintenanceRequests
    });

  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance requests',
      error: error.message
    });
  }
};

// @desc    Get maintenance request by ID
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('assetId')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('approvedBy', 'name email');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Check access
    if (req.user.role === 'employee' && maintenance.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: maintenance
    });

  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance request',
      error: error.message
    });
  }
};

// @desc    Create maintenance request (with approval workflow)
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceRequest = async (req, res) => {
  try {
    const maintenanceData = {
      ...req.body,
      reportedBy: req.user._id,
      status: 'Pending Approval'  // Changed from 'Reported' to 'Pending Approval'
    };

    const maintenance = await Maintenance.create(maintenanceData);
    
    // Populate asset details for email
    const asset = await Asset.findById(maintenance.assetId);
    const reportedBy = await User.findById(maintenance.reportedBy);
    
    // Notify all managers for approval
    const managers = await User.find({ role: 'manager' });
    
    for (const manager of managers) {
      await sendMaintenanceApprovalRequestEmail(
        manager.email,
        manager.name,
        {
          id: maintenance._id,
          assetName: asset.assetName,
          assetTag: asset.assetTag,
          issue: maintenance.issue,
          issueType: maintenance.issueType,
          severity: maintenance.severity,
          reportedByName: reportedBy.name,
          maintenanceDate: maintenance.maintenanceDate
        }
      );
    }
    
    // For critical issues, also notify admin
    if (maintenance.severity === 'Critical' || maintenance.severity === 'High') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendAdminAlertEmail(
          admin.email,
          admin.name,
          'maintenance',
          `
            <p><strong>Critical Maintenance Request</strong></p>
            <p>Asset: ${asset.assetName}</p>
            <p>Issue: ${maintenance.issue}</p>
            <p>Severity: ${maintenance.severity}</p>
            <p>Reported By: ${reportedBy.name}</p>
          `
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully. Waiting for manager approval.',
      data: maintenance
    });

  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance request',
      error: error.message
    });
  }
};

// @desc    Approve maintenance request (Manager only)
// @route   PUT /api/maintenance/:id/approve
// @access  Private/Manager
const approveMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('assetId')
      .populate('reportedBy', 'name email');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    if (maintenance.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    const updateData = {
      status: 'Approved',
      approvedBy: req.user._id,
      approvedAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Notify the employee who requested
    await sendMaintenanceStatusUpdateEmail(
      maintenance.reportedBy.email,
      maintenance.reportedBy.name,
      {
        assetName: maintenance.assetId.assetName,
        issue: maintenance.issue,
        resolution: null
      },
      'Approved'
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance request approved successfully',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Approve maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving maintenance request',
      error: error.message
    });
  }
};

// @desc    Reject maintenance request (Manager only)
// @route   PUT /api/maintenance/:id/reject
// @access  Private/Manager
const rejectMaintenanceRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('assetId')
      .populate('reportedBy', 'name email');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    if (maintenance.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    const updateData = {
      status: 'Rejected',
      rejectionReason: rejectionReason || 'No reason provided',
      approvedBy: req.user._id,
      approvedAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Notify the employee about rejection
    await sendMaintenanceStatusUpdateEmail(
      maintenance.reportedBy.email,
      maintenance.reportedBy.name,
      {
        assetName: maintenance.assetId.assetName,
        issue: maintenance.issue,
        resolution: `Rejected: ${rejectionReason || 'No reason provided'}`
      },
      'Rejected'
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance request rejected',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Reject maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting maintenance request',
      error: error.message
    });
  }
};

// @desc    Start maintenance (Assign technician)
// @route   PUT /api/maintenance/:id/start
// @access  Private/Manager
const startMaintenance = async (req, res) => {
  try {
    const { assignedTo, technician } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    const updateData = {
      status: 'In Progress',
      assignedTo,
      technician,
      startedAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Maintenance started',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Start maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting maintenance',
      error: error.message
    });
  }
};

// @desc    Complete maintenance
// @route   PUT /api/maintenance/:id/complete
// @access  Private/Manager
const completeMaintenanceRequest = async (req, res) => {
  try {
    const { resolution, repairCost } = req.body;
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('assetId')
      .populate('reportedBy', 'name email');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    const updateData = {
      status: 'Completed',
      resolution,
      repairCost,
      completionDate: Date.now(),
      updatedAt: Date.now()
    };

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Update asset status back to Available
    await Asset.findByIdAndUpdate(maintenance.assetId._id, {
      status: 'Available',
      lastMaintenanceDate: Date.now(),
      repairFrequency: (maintenance.assetId.repairFrequency || 0) + 1
    });

    // Notify the employee who requested
    await sendMaintenanceStatusUpdateEmail(
      maintenance.reportedBy.email,
      maintenance.reportedBy.name,
      {
        assetName: maintenance.assetId.assetName,
        issue: maintenance.issue,
        resolution
      },
      'Completed'
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance completed successfully',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Complete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing maintenance',
      error: error.message
    });
  }
};

// @desc    Update maintenance request (basic info)
// @route   PUT /api/maintenance/:id
// @access  Private/Admin/Manager
const updateMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Only allow update if not completed or cancelled
    if (maintenance.status === 'Completed' || maintenance.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled requests'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance request',
      error: error.message
    });
  }
};

// @desc    Delete maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private/Admin
const deleteMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    await maintenance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });

  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance request',
      error: error.message
    });
  }
};

// @desc    Get maintenance statistics (for dashboard)
// @route   GET /api/maintenance/statistics
// @access  Private/Admin/Manager
const getMaintenanceStatistics = async (req, res) => {
  try {
    const [
      totalRequests,
      pendingApproval,
      approved,
      inProgress,
      completed,
      cancelled,
      bySeverity,
      byType
    ] = await Promise.all([
      Maintenance.countDocuments(),
      Maintenance.countDocuments({ status: 'Pending Approval' }),
      Maintenance.countDocuments({ status: 'Approved' }),
      Maintenance.countDocuments({ status: 'In Progress' }),
      Maintenance.countDocuments({ status: 'Completed' }),
      Maintenance.countDocuments({ status: 'Cancelled' }),
      Maintenance.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Maintenance.aggregate([
        { $group: { _id: '$issueType', count: { $sum: 1 } } }
      ])
    ]);

    const avgCompletionTime = await Maintenance.aggregate([
      {
        $match: { status: 'Completed', completionDate: { $exists: true }, createdAt: { $exists: true } }
      },
      {
        $project: {
          completionTime: { $subtract: ['$completionDate', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$completionTime' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalRequests,
        pendingApproval,
        approved,
        inProgress,
        completed,
        cancelled,
        bySeverity,
        byType,
        averageCompletionDays: avgCompletionTime[0] ? Math.round(avgCompletionTime[0].avgTime / (1000 * 60 * 60 * 24)) : 0
      }
    });

  } catch (error) {
    console.error('Maintenance statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
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
};