const Asset = require('../models/Asset');
const ActivityLog = require('../models/ActivityLog');
const QRCode = require('qrcode');
const { sendAssetAssignmentEmail } = require('../services/emailService'); // adjust path
const User = require('../models/User'); // ensure User model is imported


// Helper function to generate asset tag
const generateAssetTag = async () => {
  const year = new Date().getFullYear();

  const latestAsset = await Asset.findOne()
    .sort({ createdAt: -1 });

  if (!latestAsset) {
    return `AST${year}000001`;
  }

  const lastNumber = parseInt(
    latestAsset.assetTag.slice(-6)
  );

  return `AST${year}${String(lastNumber + 1).padStart(6, '0')}`;
};

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status, 
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    // Role-based access
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .populate('assignedTo', 'name email employeeId department')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Asset.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'name email employeeId department phoneNumber')
      .populate('createdBy', 'name email');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check access
    if (req.user.role === 'employee' && asset.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset'
    });
  }
};

// @desc    Create asset
// @route   POST /api/assets
// @access  Private (Admin/Manager)
const createAsset = async (req, res) => {
  try {
    // Clean up the request body - remove undefined values
    const cleanData = {};
    const allowedFields = [
      'assetName','assetTag', 'category', 'subCategory', 'brand', 'model', 'serialNumber',
      'purchaseDate', 'purchaseCost', 'status', 'condition', 'location', 
      'specifications', 'notes', 'warrantyEndDate', 'usageHours', 'repairFrequency'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        cleanData[field] = req.body[field];
      }
    }
    
    // Handle nested objects
    if (req.body.location) {
      cleanData.location = {};
      if (req.body.location.building) cleanData.location.building = req.body.location.building;
      if (req.body.location.floor) cleanData.location.floor = req.body.location.floor;
      if (req.body.location.room) cleanData.location.room = req.body.location.room;
      if (req.body.location.section) cleanData.location.section = req.body.location.section;
    }
    
    if (req.body.specifications) {
      cleanData.specifications = {};
      if (req.body.specifications.processor) cleanData.specifications.processor = req.body.specifications.processor;
      if (req.body.specifications.ram) cleanData.specifications.ram = req.body.specifications.ram;
      if (req.body.specifications.storage) cleanData.specifications.storage = req.body.specifications.storage;
      if (req.body.specifications.os) cleanData.specifications.os = req.body.specifications.os;
    }
    
    // Add created by
    cleanData.createdBy = req.user._id;
    
    // Generate asset tag if not provided
    if (!cleanData.assetTag) {
      cleanData.assetTag = await generateAssetTag();
    }

    const asset = await Asset.create(cleanData);

    // Generate QR code data URL (optional, can be done later)
    try {
      const qrData = JSON.stringify({
        id: asset._id,
        tag: asset.assetTag,
        name: asset.assetName
      });
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      asset.qrCodeDataURL = qrCodeDataURL;
      await asset.save();
    } catch (qrError) {
      console.log('QR Code generation skipped:', qrError.message);
      // Don't fail the asset creation if QR generation fails
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entityType: 'ASSET',
      entityId: asset._id,
      details: { assetName: asset.assetName, assetTag: asset.assetTag },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Asset with this ${field} already exists`
      });
    }
    
    // Handle validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin/Manager)
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Clean update data
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'ASSET',
      entityId: asset._id,
      details: { changes: req.body },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating asset'
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin only)
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset is assigned
    if (asset.status === 'Assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assigned asset. Please return it first.'
      });
    }

    await asset.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE',
      entityType: 'ASSET',
      entityId: asset._id,
      details: { assetName: asset.assetName, assetTag: asset.assetTag },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting asset'
    });
  }
};

// @desc    Get asset QR code
// @route   GET /api/assets/:id/qrcode
// @access  Private
const getAssetQRCode = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Generate QR code if not exists
    if (!asset.qrCodeDataURL) {
      const qrData = JSON.stringify({
        id: asset._id,
        tag: asset.assetTag,
        name: asset.assetName
      });
      asset.qrCodeDataURL = await QRCode.toDataURL(qrData);
      await asset.save();
    }

    res.status(200).json({
      success: true,
      data: {
        qrCodeDataURL: asset.qrCodeDataURL,
        assetTag: asset.assetTag,
        assetName: asset.assetName
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code'
    });
  }
};

// @desc    Get asset statistics
// @route   GET /api/assets/statistics
// @access  Private (Admin/Manager)
const getAssetStatistics = async (req, res) => {
  try {
    const [
      totalAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      damagedAssets,
      categoryStats,
      monthlyGrowth
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'Assigned' }),
      Asset.countDocuments({ status: 'Available' }),
      Asset.countDocuments({ status: 'Under Maintenance' }),
      Asset.countDocuments({ status: 'Damaged' }),
      Asset.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Asset.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalAssets,
        assigned: assignedAssets,
        available: availableAssets,
        maintenance: maintenanceAssets,
        damaged: damagedAssets,
        byCategory: categoryStats,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('Asset statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// Placeholder functions (implement as needed)
const bulkUploadAssets = async (req, res) => {
  res.json({ message: 'Bulk upload - coming soon' });
};

const exportAssets = async (req, res) => {
  res.json({ message: 'Export - coming soon' });
};

const getAssetMaintenanceHistory = async (req, res) => {
  res.json({ message: 'Maintenance history - coming soon' });
};

const assignAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Check if asset is available
    if (asset.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign asset with status: ${asset.status}`
      });
    }

    const { assignedTo, expectedReturnDate, purpose } = req.body;

    // Get employee details
    const employee = await User.findById(assignedTo).select('name email');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update asset
    asset.status = 'Assigned';
    asset.assignedTo = assignedTo;
    asset.assignedDate = new Date();
    if (expectedReturnDate) {
      asset.expectedReturnDate = new Date(expectedReturnDate);
    }
    if (purpose) {
      asset.purpose = purpose;
    }
    await asset.save();

    // Also add asset to user's allocatedAssets array
    await User.findByIdAndUpdate(assignedTo, {
      $addToSet: { allocatedAssets: asset._id }
    });

    // Send email notification
    try {
      await sendAssetAssignmentEmail(
        employee.email,
        employee.name,
        asset.assetName,
        asset.assetTag,
        expectedReturnDate || 'Not specified',
        purpose || 'Work related'
      );
      console.log(`📧 Assignment email sent to ${employee.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send assignment email:', emailError.message);
      // Do not block the assignment
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ASSIGN',
      entityType: 'ASSET',
      entityId: asset._id,
      details: {
        assetName: asset.assetName,
        assetTag: asset.assetTag,
        assignedTo: employee.email,
        expectedReturnDate: asset.expectedReturnDate,
        purpose
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Asset assigned successfully',
      data: asset
    });
  } catch (error) {
    console.error('Assign asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const returnAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    
    asset.status = 'Available';
    asset.assignedTo = null;
    asset.assignedDate = null;
    await asset.save();
    
    res.json({ success: true, message: 'Asset returned successfully', data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadAssetImages = async (req, res) => {
  res.json({ message: 'Image upload - coming soon' });
};

const getAssetByTag = async (req, res) => {
  try {
    const asset = await Asset.findOne({ assetTag: req.params.tag });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};