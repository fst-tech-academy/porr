const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, organisationContext } = require('../middleware/auth');
const { checkUserManagement } = require('../middleware/settings');
const { validateRoleCreation, validateRoleEdit, validateUserDeletion, validateUserViewing } = require('../middleware/roleHierarchy');
const SettingsService = require('../services/settingsService');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (All authenticated users)
router.get('/', protect, organisationContext, checkUserManagement, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['super_admin', 'admin', 'manager', 'officer', 'viewer']).withMessage('Invalid role'),
  query('nationalId').optional().trim().notEmpty().withMessage('National ID cannot be empty'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // Organisation filtering - super admin sees all, others see only their org
    if (req.user.role !== 'super_admin' && req.organisationId) {
      filter.organisationId = req.organisationId;
    }
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.nationalId) {
      filter.nationalId = new RegExp(req.query.nationalId, 'i');
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex }
      ];
    }

    // Get users with pagination and organisation info
    const users = await User.find(filter)
      .select('-password')
      .populate('organisationId', 'name email settings.isActive subscription.plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (All authenticated users)
router.get('/:id', protect, organisationContext, validateUserViewing, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (All authenticated users)
router.post('/', protect, organisationContext, checkUserManagement, validateRoleCreation, [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('middleName').optional().trim(),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('nationalId').optional().trim(),
  body('role').isIn(['super_admin', 'admin', 'manager', 'officer', 'viewer']).withMessage('Invalid role'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('phone').optional().trim().custom((value) => {
    if (value && !/^[\+]?[\d\s\-\(\)]{7,20}$/.test(value)) {
      throw new Error('Please enter a valid phone number');
    }
    return true;
  }).withMessage('Please enter a valid phone number'),
  body('profilePhoto').optional().trim().isURL().withMessage('Profile photo must be a valid URL')
], async (req, res) => {
  try {
    console.log('Create user request body:', req.body); // Debug log
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array()); // Debug log
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, middleName, lastName, email, password, nationalId, role, phone, gender, username } = req.body;

    // Check if user already exists by email within the same organisation
    const existingUserByEmail = await User.findOne({ 
      email, 
      organisationId: req.organisationId 
    });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email in this organisation'
      });
    }

    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this username'
      });
    }

    // Check if auto approve is enabled
    const isAutoApproveEnabled = await SettingsService.isAutoApproveUsers();
    
    // Determine organisation assignment
    let organisationId = null;
    if (req.user.role === 'super_admin') {
      // Super admin can assign to any organisation or none
      organisationId = req.body.organisationId || null;
    } else {
      // Other users can only create users in their own organisation
      organisationId = req.user.organisationId;
    }
    
    // Create user with auto approve status and organisation assignment
    const user = await User.create({
      firstName,
      middleName,
      lastName,
      username,
      email,
      password,
      nationalId,
      role,
      phone,
      gender,
      organisationId, // Assign to organisation
      isActive: isAutoApproveEnabled, // Auto approve if enabled
      emailVerified: isAutoApproveEnabled // Auto verify email if auto approve is enabled
    });

    res.status(201).json({
      success: true,
      message: isAutoApproveEnabled 
        ? 'User created and auto-approved successfully' 
        : 'User created successfully and requires approval',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role,
          nationalId: user.nationalId,
          employeeId: user.employeeId,
          phone: user.phone,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        },
        autoApproved: isAutoApproveEnabled
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'email' ? 'email' : field === 'username' ? 'username' : field;
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${fieldName}`,
        field: fieldName
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error during user creation'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (All authenticated users)
router.put('/:id', protect, organisationContext, checkUserManagement, validateUserViewing, validateRoleEdit, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('middleName').optional().trim(),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('nationalId').optional().trim(),
  body('role').optional().isIn(['super_admin', 'admin', 'manager', 'officer', 'viewer']).withMessage('Invalid role'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('phone').optional().trim().custom((value) => {
    if (value && !/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(value)) {
      throw new Error('Please enter a valid phone number');
    }
    return true;
  }).withMessage('Please enter a valid phone number'),
  body('profilePhoto').optional().trim().isURL().withMessage('Profile photo must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    console.log('Update user request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Check if username is being changed and if it already exists
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this username'
        });
      }
    }

    // Handle password update - if password is provided, hash it; if empty, keep existing password
    let updateData = { ...req.body };
    
    if (req.body.password) {
      // Hash the new password
      const bcrypt = require('bcryptjs');
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      updateData.password = await bcrypt.hash(req.body.password, saltRounds);
    } else {
      // Remove password from update data to keep existing password
      delete updateData.password;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user update'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (All authenticated users)
router.delete('/:id', protect, organisationContext, checkUserManagement, validateUserDeletion, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user deletion'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private (All authenticated users)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    const roleStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: roleStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
