const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { checkEmailNotifications } = require('../middleware/settings');
const { 
  generateVerificationToken, 
  decodeVerificationToken, 
  isTokenExpired,
  sendVerificationEmail,
  sendWelcomeEmail
} = require('../utils/emailService');

const router = express.Router();

/**
 * @route   POST /api/email-verification/send
 * @desc    Send email verification to user
 * @access  Public
 */
router.post('/send', checkEmailNotifications, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('userId').isMongoId().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, userId } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken(userId);
    const expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

    // Update user with verification token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = expiryDate;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.firstName, verificationToken);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/email-verification/verify
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify', [
  body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;

    // URL decode the token if it's encoded
    const decodedToken = decodeURIComponent(token);

    // Decode token
    const tokenData = decodeVerificationToken(decodedToken);
    if (!tokenData.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token is expired
    if (isTokenExpired(tokenData.timestamp)) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    }

    // Check if token matches
    if (user.emailVerificationToken !== decodedToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token is expired in database
    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    console.log(`✅ Email verified successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/email-verification/status/:token
 * @desc    Check verification token status
 * @access  Public
 */
router.get('/status/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Decode token
    const tokenData = decodeVerificationToken(token);
    if (!tokenData.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
        status: 'invalid'
      });
    }

    // Check if token is expired
    if (isTokenExpired(tokenData.timestamp)) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired',
        status: 'expired'
      });
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        status: 'not_found'
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified',
        status: 'already_verified',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    }

    // Check if token matches
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
        status: 'invalid'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      status: 'valid',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Token status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/email-verification/resend
 * @desc    Resend email verification to logged-in user
 * @access  Private (requires authentication)
 */
router.post('/resend', protect, async (req, res) => {
  try {
    // Get user ID from the authenticated request (set by auth middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user._id);
    const expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

    // Update user with new verification token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = expiryDate;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.firstName, verificationToken);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
