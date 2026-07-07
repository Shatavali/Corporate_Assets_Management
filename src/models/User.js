const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other'],
    default: 'Other'
  },
  position: {
    type: String,
    trim: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneNumber: {
    type: String,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=4F46E5&color=fff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: String,
  emailVerificationOTPExpires: Date,
  passwordResetOTP: String,
  passwordResetOTPExpires: Date,
  lastLogin: Date,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  allocatedAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
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

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate employee ID
userSchema.pre('save', async function () {
  if (!this.employeeId && this.role !== 'admin') {
    const year = new Date().getFullYear();
    const count = await mongoose.model('User').countDocuments();

    this.employeeId = `EMP${year}${(count + 1)
      .toString()
      .padStart(5, '0')}`;
  }
});
// Virtual for asset count
userSchema.virtual('assetCount', {
  ref: 'Asset',
  localField: '_id',
  foreignField: 'assignedTo',
  count: true
});

module.exports = mongoose.model('User', userSchema);