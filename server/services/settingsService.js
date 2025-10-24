const Settings = require('../models/Settings');

class SettingsService {
  /**
   * Get current system settings
   */
  static async getCurrentSettings() {
    return await Settings.getCurrentSettings();
  }

  /**
   * Update system settings
   */
  static async updateSettings(updates, userId) {
    return await Settings.updateSettings(updates, userId);
  }

  /**
   * Check if public registration is enabled
   */
  static async isPublicRegistrationEnabled() {
    const settings = await this.getCurrentSettings();
    return settings.registration.publicRegistration;
  }

  /**
   * Check if admin registration is enabled
   */
  static async isAdminRegistrationEnabled() {
    const settings = await this.getCurrentSettings();
    return settings.registration.adminRegistration;
  }

  /**
   * Check if email verification is required
   */
  static async isEmailVerificationRequired() {
    const settings = await this.getCurrentSettings();
    return settings.registration.emailVerificationRequired;
  }

  /**
   * Check if users should be auto-approved
   */
  static async isAutoApproveUsers() {
    const settings = await this.getCurrentSettings();
    return settings.registration.autoApproveUsers;
  }

  /**
   * Get allowed roles for registration
   */
  static async getAllowedRoles() {
    const settings = await this.getCurrentSettings();
    return settings.registration.allowedRoles;
  }

  /**
   * Check if a specific role is allowed for registration
   */
  static async isRoleAllowed(role) {
    const allowedRoles = await this.getAllowedRoles();
    return allowedRoles.includes(role);
  }

  /**
   * Check if maintenance mode is enabled
   */
  static async isMaintenanceMode() {
    const settings = await this.getCurrentSettings();
    return settings.maintenance.isMaintenanceMode;
  }

  /**
   * Check if user is allowed during maintenance
   */
  static async isUserAllowedDuringMaintenance(userId) {
    const settings = await this.getCurrentSettings();
    return settings.maintenance.allowedMaintenanceUsers.includes(userId.toString());
  }

  /**
   * Get maintenance message
   */
  static async getMaintenanceMessage() {
    const settings = await this.getCurrentSettings();
    return settings.maintenance.maintenanceMessage;
  }

  /**
   * Check if a feature is enabled
   */
  static async isFeatureEnabled(featureName) {
    const settings = await this.getCurrentSettings();
    return settings.features[featureName] || false;
  }

  /**
   * Get password policy requirements
   */
  static async getPasswordPolicy() {
    const settings = await this.getCurrentSettings();
    return settings.authentication.passwordPolicy;
  }

  /**
   * Validate password against policy
   */
  static async validatePassword(password) {
    const policy = await this.getPasswordPolicy();
    const errors = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get session timeout in hours
   */
  static async getSessionTimeout() {
    const settings = await this.getCurrentSettings();
    return settings.authentication.sessionTimeout;
  }

  /**
   * Get max login attempts
   */
  static async getMaxLoginAttempts() {
    const settings = await this.getCurrentSettings();
    return settings.authentication.maxLoginAttempts;
  }

  /**
   * Get lockout duration in minutes
   */
  static async getLockoutDuration() {
    const settings = await this.getCurrentSettings();
    return settings.authentication.lockoutDuration;
  }

  /**
   * Get public settings for frontend
   */
  static async getPublicSettings() {
    const settings = await this.getCurrentSettings();
    
    return {
      systemName: settings.systemName,
      systemDescription: settings.systemDescription,
      registration: {
        publicRegistration: settings.registration.publicRegistration,
        emailVerificationRequired: settings.registration.emailVerificationRequired
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
      }
    };
  }

  /**
   * Check if IP is whitelisted
   */
  static async isIPWhitelisted(ip) {
    const settings = await this.getCurrentSettings();
    const whitelist = settings.security.ipWhitelist;
    
    // If no whitelist is configured, allow all IPs
    if (!whitelist || whitelist.length === 0) {
      return true;
    }
    
    return whitelist.includes(ip);
  }

  /**
   * Get allowed CORS origins
   */
  static async getAllowedOrigins() {
    const settings = await this.getCurrentSettings();
    return settings.security.allowedOrigins;
  }

  /**
   * Check if HTTPS is required
   */
  static async isHttpsRequired() {
    const settings = await this.getCurrentSettings();
    return settings.security.requireHttps;
  }

  /**
   * Initialize default settings if none exist
   */
  static async initializeDefaultSettings(adminUserId) {
    try {
      const existingSettings = await Settings.findOne();
      
      if (!existingSettings) {
        const defaultSettings = await Settings.create({
          updatedBy: adminUserId
        });
        
        console.log('✅ Default settings initialized');
        return defaultSettings;
      }
      
      return existingSettings;
    } catch (error) {
      console.error('❌ Failed to initialize default settings:', error);
      throw error;
    }
  }
}

module.exports = SettingsService;
