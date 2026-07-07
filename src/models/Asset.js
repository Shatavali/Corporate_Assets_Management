const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetName: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    maxlength: [100, 'Asset name cannot exceed 100 characters']
  },
  assetTag: {
    type: String,
    required: [true, 'Asset tag is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Printer', 
            'Scanner', 'Network Device', 'Server', 'Furniture', 'Software License', 
            'Office Equipment', 'Other']
  },
  subCategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired'],
    default: 'Available'
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    default: 'Good'
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  purchaseCost: {
    type: Number,
    min: 0,
    default: 0
  },
  currentValue: {
    type: Number,
    min: 0,
    default: 0
  },
  warrantyEndDate: {
    type: Date,
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedDate: {
    type: Date,
    default: null
  },
  location: {
    building: { type: String, default: '' },
    floor: { type: String, default: '' },
    room: { type: String, default: '' },
    section: { type: String, default: '' }
  },
  specifications: {
    processor: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    os: { type: String, default: '' },
    other: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  images: [{
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  usageHours: {
    type: Number,
    default: 0
  },
  repairFrequency: {
    type: Number,
    default: 0
  },
  lastMaintenanceDate: {
    type: Date,
    default: null
  },
  nextMaintenanceDate: {
    type: Date,
    default: null
  },
  qrCodeDataURL: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
// assetSchema.index({ assetTag: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ 'location.building': 1 });
assetSchema.index({ createdAt: -1 });

// Generate asset tag before saving (FIXED - removed 'next' parameter)
assetSchema.pre('save', async function() {
  if (!this.assetTag) {
    try {
      const year = new Date().getFullYear();
      const categoryCode = this.category.substring(0, 3).toUpperCase();
      const count = await mongoose.model('Asset').countDocuments();
      this.assetTag = `${categoryCode}${year}${(count + 1).toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating asset tag:', error);
      this.assetTag = `AST${Date.now()}`;
    }
  }
});

// Update the updatedAt timestamp on save (FIXED - removed 'next' parameter)
assetSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Calculate depreciation
assetSchema.methods.calculateDepreciation = function() {
  if (!this.purchaseCost || !this.purchaseDate) return 0;
  
  const yearsSincePurchase = (new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
  const depreciationRate = 0.2;
  const depreciation = this.purchaseCost * depreciationRate * yearsSincePurchase;
  const currentValue = Math.max(0, this.purchaseCost - depreciation);
  
  return Math.round(currentValue);
};

// Virtual for asset age in days
assetSchema.virtual('ageInDays').get(function() {
  if (!this.purchaseDate) return 0;
  return Math.floor((new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24));
});

// Virtual for warranty status
assetSchema.virtual('warrantyStatus').get(function() {
  if (!this.warrantyEndDate) return 'No Warranty';
  return this.warrantyEndDate > new Date() ? 'Active' : 'Expired';
});

module.exports = mongoose.model('Asset', assetSchema);