const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },

  issue: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true
  },

  issueType: {
    type: String,
    enum: [
      'Hardware',
      'Software',
      'Network',
      'Physical Damage',
      'Regular Service',
      'Other'
    ],
    default: 'Other'
  },

  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  status: {
    type: String,
    enum: [
      'Pending Approval',  // New status for approval workflow
      'Approved',
      'In Progress',
      'Completed',
      'Rejected',         // New status for rejected requests
      'Reported',
      'Cancelled'
    ],
    default: 'Pending Approval'  // Changed from 'Reported'
  },

  repairCost: {
    type: Number,
    default: 0
  },

  maintenanceDate: {
    type: Date,
    required: true
  },

  completionDate: Date,

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // NEW FIELDS FOR APPROVAL WORKFLOW
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approvedAt: {
    type: Date
  },

  startedAt: {
    type: Date
  },

  rejectionReason: {
    type: String,
    default: ''
  },

  technician: {
    name: String,
    contact: String,
    company: String
  },

  description: String,

  resolution: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// Index for better query performance
maintenanceSchema.index({ assetId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ reportedBy: 1 });
maintenanceSchema.index({ createdAt: -1 });

// Virtual for time taken to complete
maintenanceSchema.virtual('completionTime').get(function() {
  if (this.completionDate && this.createdAt) {
    const days = Math.ceil((this.completionDate - this.createdAt) / (1000 * 60 * 60 * 24));
    return days;
  }
  return null;
});

// Virtual for time taken to approve
maintenanceSchema.virtual('approvalTime').get(function() {
  if (this.approvedAt && this.createdAt) {
    const hours = Math.ceil((this.approvedAt - this.createdAt) / (1000 * 60 * 60));
    return hours;
  }
  return null;
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);