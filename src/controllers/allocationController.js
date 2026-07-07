const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { sendAssetAssignmentEmail, sendAssetReturnConfirmationEmail } = require('../services/emailService');

// @desc    Get all allocations
// @route   GET /api/allocations
// @access  Private
const getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('assetId')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations
    });
  } catch (error) {
    console.error('Get allocations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching allocations',
      error: error.message
    });
  }
};

// @desc    Get allocation by ID
// @route   GET /api/allocations/:id
// @access  Private
const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('assetId')
      .populate('userId', 'name email');

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: allocation
    });
  } catch (error) {
    console.error('Get allocation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching allocation',
      error: error.message
    });
  }
};

// @desc    Create allocation (asset assignment)
// @route   POST /api/allocations
// @access  Private/Admin/Manager
const createAllocation = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const { assetId, userId, expectedReturnDate, purpose } = req.body;

    // Fetch asset and user details for email
    const asset = await Asset.findById(assetId);
    const user = await User.findById(userId).select('name email');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allocationData = {
      assetId,
      userId,
      allocatedDate: new Date(),
      expectedReturnDate: expectedReturnDate || null,
      purpose: purpose || '',
      allocatedBy: req.user.id,
      status: 'Active'  // or 'Allocated'
    };

    const allocation = await Allocation.create(allocationData);

    // Update asset status to 'Assigned' and link the allocation
    asset.status = 'Assigned';
    asset.assignedTo = userId;
    asset.assignedDate = new Date();
    asset.expectedReturnDate = expectedReturnDate || null;
    asset.purpose = purpose || '';
    await asset.save();

    // Also add asset to user's allocatedAssets array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { allocatedAssets: assetId }
    });

    // Send assignment email
    try {
      await sendAssetAssignmentEmail(
        user.email,
        user.name,
        asset.assetName,
        asset.assetTag,
        expectedReturnDate || 'Not specified',
        purpose || 'Work related'
      );
      console.log(`📧 Assignment email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send assignment email:', emailError.message);
      // Do not block allocation creation
    }

    res.status(201).json({
      success: true,
      message: 'Allocation created successfully. Email sent to the employee.',
      data: allocation
    });
  } catch (error) {
    console.error('Create allocation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update allocation (e.g., mark as returned)
// @route   PUT /api/allocations/:id
// @access  Private/Admin/Manager
const updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    // Check if this update marks the asset as returned
    const isReturned = (req.body.status === 'Returned' || req.body.returnDate);

    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };

    const updatedAllocation = await Allocation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // If returned, update asset status and send return confirmation email
    if (isReturned) {
      const asset = await Asset.findById(updatedAllocation.assetId);
      const user = await User.findById(updatedAllocation.userId).select('name email');

      if (asset && user) {
        // Update asset status
        asset.status = 'Available';
        asset.assignedTo = null;
        asset.assignedDate = null;
        asset.expectedReturnDate = null;
        await asset.save();

        // Remove asset from user's allocatedAssets
        await User.findByIdAndUpdate(user._id, {
          $pull: { allocatedAssets: asset._id }
        });

        // Send return confirmation email
        try {
          await sendAssetReturnConfirmationEmail(
            user.email,
            user.name,
            asset.assetName,
            asset.assetTag,
            updatedAllocation.returnDate || new Date(),
            updatedAllocation.returnCondition || 'Good'
          );
          console.log(`📧 Return confirmation email sent to ${user.email}`);
        } catch (emailError) {
          console.error('❌ Failed to send return email:', emailError.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: isReturned ? 'Asset returned successfully. Email sent.' : 'Allocation updated successfully',
      data: updatedAllocation
    });
  } catch (error) {
    console.error('Update allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating allocation',
      error: error.message
    });
  }
};

// @desc    Delete allocation
// @route   DELETE /api/allocations/:id
// @access  Private/Admin
const deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    await allocation.deleteOne();

    // Optionally, revert asset status if not already returned
    const asset = await Asset.findById(allocation.assetId);
    if (asset && asset.status === 'Assigned') {
      asset.status = 'Available';
      asset.assignedTo = null;
      await asset.save();
    }

    res.status(200).json({
      success: true,
      message: 'Allocation deleted successfully'
    });
  } catch (error) {
    console.error('Delete allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting allocation',
      error: error.message
    });
  }
};

// @desc    Mark allocation as returned
// @route   POST /api/allocations/:id/return
// @access  Private/Admin/Manager
const returnAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }

    // Prevent double return
    if (allocation.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Asset already returned' });
    }

    // Safely access body properties with defaults
    const condition = req.body?.condition || 'Good';

    // Update allocation
    allocation.status = 'Returned';
    allocation.returnDate = new Date();
    allocation.returnCondition = condition;
    allocation.updatedAt = Date.now();
    await allocation.save();

    // Update asset
    const asset = await Asset.findById(allocation.assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Associated asset not found' });
    }
    asset.status = 'Available';
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.expectedReturnDate = null;
    await asset.save();

    // Remove asset from user's allocatedAssets array
    await User.findByIdAndUpdate(allocation.userId, {
      $pull: { allocatedAssets: allocation.assetId }
    });

    // Send return confirmation email
    const user = await User.findById(allocation.userId).select('name email');
    if (user && asset) {
      try {
        const { sendAssetReturnConfirmationEmail } = require('../services/emailService');
        await sendAssetReturnConfirmationEmail(
          user.email,
          user.name,
          asset.assetName,
          asset.assetTag,
          allocation.returnDate,
          condition
        );
        console.log(`📧 Return confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send return email:', emailError.message);
        // Do not fail the request
      }
    }

    res.status(200).json({
      success: true,
      message: 'Asset returned successfully. Email sent to the employee.',
      data: allocation
    });
  } catch (error) {
    console.error('Return allocation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  returnAllocation
};