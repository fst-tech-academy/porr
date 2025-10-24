const settingsManager = require('../utils/settingsManager');

// Middleware to check if public registration is enabled
const checkPublicRegistration = (req, res, next) => {
  try {
    if (!settingsManager.isPublicRegistrationEnabled()) {
      return res.status(403).json({
        success: false,
        message: 'Public registration is currently disabled'
      });
    }
    next();
  } catch (error) {
    console.error('Error checking public registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if admin registration is enabled
const checkAdminRegistration = (req, res, next) => {
  try {
    if (!settingsManager.isAdminRegistrationEnabled()) {
      return res.status(403).json({
        success: false,
        message: 'Admin registration is currently disabled'
      });
    }
    next();
  } catch (error) {
    console.error('Error checking admin registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check maintenance mode
const checkMaintenanceMode = (req, res, next) => {
  try {
    if (settingsManager.isMaintenanceMode()) {
      // Check if user is allowed during maintenance
      const userId = req.user?.id;
      if (!userId || !settingsManager.isUserAllowedDuringMaintenance(userId)) {
        return res.status(503).json({
          success: false,
          message: settingsManager.getMaintenanceMessage()
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if role is allowed
const checkRoleAllowed = (req, res, next) => {
  try {
    const { role } = req.body;
    if (role && !settingsManager.isRoleAllowed(role)) {
      return res.status(400).json({
        success: false,
        message: `Role '${role}' is not allowed for registration`
      });
    }
    next();
  } catch (error) {
    console.error('Error checking role:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to validate password policy
const validatePasswordPolicy = (req, res, next) => {
  try {
    const { password } = req.body;
    if (password) {
      const validation = settingsManager.validatePassword(password);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error validating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to inject settings into request
const injectSettings = (req, res, next) => {
  try {
    req.settings = settingsManager.getSettings();
    next();
  } catch (error) {
    console.error('Error injecting settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

  // Middleware to check if file uploads are enabled
  const checkFileUploads = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('fileUploads')) {
        return res.status(403).json({
          success: false,
          message: 'File uploads are currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking file uploads:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Middleware to check if user management is enabled
  const checkUserManagement = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('userManagement')) {
        return res.status(403).json({
          success: false,
          message: 'User management is currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking user management:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Middleware to check if dashboard analytics is enabled
  const checkDashboardAnalytics = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('dashboardAnalytics')) {
        return res.status(403).json({
          success: false,
          message: 'Dashboard analytics are currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking dashboard analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Middleware to check if case management is enabled
  const checkCaseManagement = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('caseManagement')) {
        return res.status(403).json({
          success: false,
          message: 'Case management is currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking case management:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Middleware to check if offence records are enabled
  const checkOffenceRecords = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('offenceRecords')) {
        return res.status(403).json({
          success: false,
          message: 'Offence records are currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking offence records:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Middleware to check if email notifications are enabled
  const checkEmailNotifications = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('emailNotifications')) {
        return res.status(403).json({
          success: false,
          message: 'Email notifications are currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking email notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Middleware to check if audit logging is enabled
  const checkAuditLogging = (req, res, next) => {
    try {
      if (!settingsManager.isFeatureEnabled('auditLogging')) {
        return res.status(403).json({
          success: false,
          message: 'Audit logging is currently disabled'
        });
      }
      next();
    } catch (error) {
      console.error('Error checking audit logging:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  module.exports = {
    checkPublicRegistration,
    checkAdminRegistration,
    checkMaintenanceMode,
    checkRoleAllowed,
    validatePasswordPolicy,
    injectSettings,
    checkFileUploads,
    checkUserManagement,
    checkDashboardAnalytics,
    checkCaseManagement,
    checkOffenceRecords,
    checkEmailNotifications,
    checkAuditLogging
  };
