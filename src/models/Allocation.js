const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    allocationDate: {
      type: Date,
      default: Date.now
    },

    expectedReturnDate: {
      type: Date
    },

    actualReturnDate: {
      type: Date
    },

    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active'
    },

    purpose: {
      type: String,
      trim: true
    },

    condition: {
      type: String,
      trim: true
    },

    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Check if allocation is overdue
allocationSchema.methods.isOverdue = function () {
  if (this.status !== 'Active') return false;

  if (!this.expectedReturnDate) return false;

  return this.expectedReturnDate < new Date();
};

// Virtual field for allocation duration
allocationSchema.virtual('duration').get(function () {
  const endDate = this.actualReturnDate || new Date();

  return Math.ceil(
    (endDate - this.allocationDate) /
      (1000 * 60 * 60 * 24)
  );
});

module.exports = mongoose.model(
  'Allocation',
  allocationSchema
);