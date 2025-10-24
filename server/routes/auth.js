const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const { protect } = require('../middleware/auth');
const { generateEmployeeId } = require('../utils/generateId');
const { handleMongooseError } = require('../utils/errorHandler');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');
const SettingsService = require('../services/settingsService');
const { 
  checkPublicRegistration, 
  checkAdminRegistration, 
  checkMaintenanceMode, 
  checkRoleAllowed, 
  validatePasswordPolicy 
} = require('../middleware/settings');

const router = express.Router();

// @desc    Get organisations for login
// @route   GET /api/auth/organisations
// @access  Public
router.get('/organisations', async (req, res) => {
  try {
    const organisations = await Organisation.find({ 
      'settings.isActive': true 
    }).select('name email id').sort({ name: 1 });

    res.json({
      success: true,
      data: organisations
    });
  } catch (error) {
    console.error('Error fetching organisations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organisations'
    });
  }
});

// Generate JWT Token
const generateToken = async (id) => {
  try {
    // Get session timeout from settings
    const sessionTimeout = await SettingsService.getSessionTimeout();
    const expiresIn = `${sessionTimeout}h`;
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });
  } catch (error) {
    console.error('Error getting session timeout from settings:', error);
    // Fallback to default
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (only for initial admin setup)
router.post('/register', [
  checkMaintenanceMode,
  checkPublicRegistration,
  checkRoleAllowed,
  validatePasswordPolicy,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('nationalId').trim().notEmpty().withMessage('National ID is required'),
  body('role').optional().isIn(['admin', 'manager', 'officer', 'viewer']).withMessage('Invalid role'),
  body('phone').optional().trim().custom((value) => {
    if (value && !/^\d+$/.test(value)) {
      throw new Error('Phone number must contain only digits');
    }
    return true;
  }).withMessage('Phone number must contain only digits')
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

    const { firstName, lastName, email, password, nationalId, role = 'admin', phone } = req.body;

    // Check if the role is allowed for registration
    const isRoleAllowed = await SettingsService.isRoleAllowed(role);
    if (!isRoleAllowed) {
      return res.status(400).json({
        success: false,
        message: `Role '${role}' is not allowed for registration`
      });
    }

    // Validate password against policy
    const passwordValidation = await SettingsService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate employee ID
    const employeeId = generateEmployeeId();

    // Check if auto approve is enabled
    const isAutoApproveEnabled = await SettingsService.isAutoApproveUsers();

    // Create user with auto approve status
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      nationalId,
      role,
      phone,
      employeeId,
      isActive: isAutoApproveEnabled, // Auto approve if enabled
      emailVerified: isAutoApproveEnabled // Auto verify email if auto approve is enabled
    });

    // Only generate verification token and send email if auto approve is disabled
    if (!isAutoApproveEnabled) {
      // Generate verification token with user ID
      const verificationToken = generateVerificationToken(user._id);
      const expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

      // Update user with verification token
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpiry = expiryDate;
      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(email, firstName, verificationToken);
        console.log(`✅ Verification email sent to: ${email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send verification email to ${email}:`, emailError);
        // Continue with registration even if email fails
      }
    }

    // Generate token
    const token = await generateToken(user._id);

    res.status(201).json({
      success: true,
      message: isAutoApproveEnabled 
        ? 'User registered and auto-approved successfully. You can now access all features.' 
        : 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          nationalId: user.nationalId,
          employeeId: user.employeeId,
          phone: user.phone,
          isActive: user.isActive,
          emailVerified: user.emailVerified
        },
        token,
        autoApproved: isAutoApproveEnabled
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Server error during registration');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  checkMaintenanceMode,
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('organisationId').notEmpty().withMessage('Organisation selection is required')
], async (req, res) => {
  try {
    console.log('=== LOGIN ROUTE HIT ===');
    console.log('Request body:', req.body);
    const errors = validationResult(req);
    console.log('Validation errors:', errors.array());
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }

    const { email, password, organisationId } = req.body;

    // Check for user and include password for comparison
    const user = await User.findOne({ email }).select('+password').populate('organisationId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate user belongs to the selected organisation
    if (!user.organisationId || user.organisationId._id.toString() !== organisationId) {
      return res.status(401).json({
        success: false,
        message: 'User does not belong to the selected organisation'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user is locked out
    if (user.isLockedOut()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Get settings for login attempts and lockout
    const maxLoginAttempts = await SettingsService.getMaxLoginAttempts();
    const lockoutDuration = await SettingsService.getLockoutDuration();

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      // Check if user should be locked out
      const updatedUser = await User.findById(user._id);
      if (updatedUser.loginAttempts >= maxLoginAttempts) {
        const lockoutUntil = new Date(Date.now() + lockoutDuration * 60 * 1000);
        await User.findByIdAndUpdate(user._id, { lockoutUntil });
        
        return res.status(423).json({
          success: false,
          message: `Account locked due to too many failed login attempts. Please try again in ${lockoutDuration} minutes.`
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = await generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          nationalId: user.nationalId,
          employeeId: user.employeeId,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          lastLogin: user.lastLogin,
          emailVerified: user.emailVerified
        },
        token
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Server error during login');
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          nationalId: user.nationalId,
          employeeId: user.employeeId,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          lastLogin: user.lastLogin,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Server error');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim().isMobilePhone().withMessage('Please provide a valid phone number')
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

    const { firstName, lastName, phone } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          nationalId: user.nationalId,
          employeeId: user.employeeId,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Server error during profile update');
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Server error during password change');
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
