const express = require('express');
const { body, validationResult } = require('express-validator');
const Settings = require('../models/Settings');
const settingsManager = require('../utils/settingsManager');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');

const router = express.Router();

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private (Admin only)
router.get('/', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const settings = settingsManager.getSettings();
    
    res.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch settings');
  }
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin only)
router.put('/', protect, authorize('admin', 'super_admin'), [
  // Registration validation
  body('registration.publicRegistration').optional().isBoolean(),
  body('registration.adminRegistration').optional().isBoolean(),
  body('registration.emailVerificationRequired').optional().isBoolean(),
  body('registration.autoApproveUsers').optional().isBoolean(),
  body('registration.allowedRoles').optional().isArray(),
  
  // Authentication validation
  body('authentication.sessionTimeout').optional().isInt({ min: 1, max: 168 }),
  body('authentication.maxLoginAttempts').optional().isInt({ min: 3, max: 10 }),
  body('authentication.lockoutDuration').optional().isInt({ min: 5, max: 1440 }),
  body('authentication.passwordPolicy.minLength').optional().isInt({ min: 4, max: 20 }),
  body('authentication.passwordPolicy.requireUppercase').optional().isBoolean(),
  body('authentication.passwordPolicy.requireLowercase').optional().isBoolean(),
  body('authentication.passwordPolicy.requireNumbers').optional().isBoolean(),
  body('authentication.passwordPolicy.requireSpecialChars').optional().isBoolean(),
  
  // Features validation
  body('features.auditLogging').optional().isBoolean(),
  body('features.emailNotifications').optional().isBoolean(),
  body('features.fileUploads').optional().isBoolean(),
  body('features.dashboardAnalytics').optional().isBoolean(),
  body('features.userManagement').optional().isBoolean(),
  body('features.caseManagement').optional().isBoolean(),
  body('features.offenceRecords').optional().isBoolean(),
  
  // UI validation
  body('ui.theme').optional().isIn(['light', 'dark', 'auto']),
  body('ui.language').optional().isIn(['en', 'so']),
  body('ui.showRegistrationForm').optional().isBoolean(),
  body('ui.showForgotPassword').optional().isBoolean(),
  
  // Security validation
  body('security.ipWhitelist').optional().isArray(),
  body('security.requireHttps').optional().isBoolean(),
  body('security.enableCors').optional().isBoolean(),
  body('security.allowedOrigins').optional().isArray(),
  
  // Maintenance validation
  body('maintenance.isMaintenanceMode').optional().isBoolean(),
  body('maintenance.maintenanceMessage').optional().isString().trim(),
  body('maintenance.allowedMaintenanceUsers').optional().isArray(),
  
  // System validation
  body('systemName').optional().isString().trim(),
  body('systemDescription').optional().isString().trim()
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

    const updates = req.body;
    const settings = await settingsManager.updateSettings(updates);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update settings');
  }
});

// @desc    Get public settings (non-sensitive settings for frontend)
// @route   GET /api/settings/public
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const settings = settingsManager.getSettings();
    
    // Return only public settings
    const publicSettings = {
      systemName: settings.systemName,
      systemDescription: settings.systemDescription,
      registration: {
        publicRegistration: settings.registration.publicRegistration,
        emailVerificationRequired: settings.registration.emailVerificationRequired,
        autoApproveUsers: settings.registration.autoApproveUsers
      },
      ui: {
        theme: settings.ui.theme,
        language: settings.ui.language,
        showRegistrationForm: settings.ui.showRegistrationForm,
        showForgotPassword: settings.ui.showForgotPassword
      },
      maintenance: {
        isMaintenanceMode: settings.maintenance.isMaintenanceMode,
        maintenanceMessage: settings.maintenance.maintenanceMessage
      },
      features: {
        auditLogging: settings.features.auditLogging,
        emailNotifications: settings.features.emailNotifications,
        fileUploads: settings.features.fileUploads,
        dashboardAnalytics: settings.features.dashboardAnalytics,
        userManagement: settings.features.userManagement,
        caseManagement: settings.features.caseManagement,
        offenceRecords: settings.features.offenceRecords
      }
    };
    
    res.json({
      success: true,
      data: {
        settings: publicSettings
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch public settings');
  }
});

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private (Super Admin only)
router.post('/reset', protect, authorize('super_admin'), async (req, res) => {
  try {
    // Delete existing settings
    await Settings.deleteMany({});
    
    // Create new default settings
    const defaultSettings = await Settings.create({
      updatedBy: req.user.id
    });
    
    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: {
        settings: defaultSettings
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to reset settings');
  }
});

// @desc    Get settings history/audit
// @route   GET /api/settings/history
// @access  Private (Admin only)
router.get('/history', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    // This would require implementing audit trail for settings changes
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Settings history feature coming soon',
      data: {
        history: []
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch settings history');
  }
});

module.exports = router;
