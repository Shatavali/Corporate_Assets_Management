const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  };
};

// User validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
    body('department')
      .optional()
      .isIn(['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other']).withMessage('Invalid department')
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
    body('department')
      .optional()
      .isIn(['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other']).withMessage('Invalid department')
  ]
};

// Asset validation rules
const assetValidation = {
  create: [
    body('assetName')
      .trim()
      .notEmpty().withMessage('Asset name is required')
      .isLength({ max: 100 }).withMessage('Asset name cannot exceed 100 characters'),
    body('category')
      .notEmpty().withMessage('Category is required')
      .isIn(['Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Printer', 
             'Scanner', 'Network Device', 'Server', 'Furniture', 'Software License', 
             'Office Equipment', 'Other']).withMessage('Invalid category'),
    body('purchaseDate')
      .notEmpty().withMessage('Purchase date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('purchaseCost')
      .optional()
      .isFloat({ min: 0 }).withMessage('Purchase cost must be a positive number'),
    body('status')
      .optional()
      .isIn(['Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired']).withMessage('Invalid status')
  ],
  update: [
    param('id')
      .isMongoId().withMessage('Invalid asset ID'),
    body('assetName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Asset name cannot exceed 100 characters'),
    body('status')
      .optional()
      .isIn(['Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired']).withMessage('Invalid status'),
    body('condition')
      .optional()
      .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Critical']).withMessage('Invalid condition')
  ]
};

// ID validation
const idValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  validate,
  userValidation,
  assetValidation,
  idValidation
};