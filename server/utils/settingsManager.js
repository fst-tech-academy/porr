const Settings = require('../models/Settings');

class SettingsManager {
  constructor() {
    this.settings = null;
    this.isLoaded = false;
  }

  async loadSettings() {
    try {
      console.log('🔄 Loading application settings...');
      
      // Try to get existing settings
      let settings = await Settings.findOne().sort({ createdAt: -1 });
      
      // If no settings exist, create default settings
      if (!settings) {
        console.log('📝 No settings found, creating default settings...');
        settings = new Settings({
          systemName: 'New Project Starter Template',
          systemDescription: 'A comprehensive system for managing offence records and legal proceedings',
          registration: {
            publicRegistration: true,
            adminRegistration: true,
            emailVerificationRequired: true,
            autoApproveUsers: false,
            allowedRoles: ['admin', 'manager', 'officer', 'viewer']
          },
          authentication: {
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            lockoutDuration: 30,
            passwordPolicy: {
              minLength: 6,
              requireUppercase: false,
              requireLowercase: false,
              requireNumbers: false,
              requireSpecialChars: false
            }
          },
          features: {
            auditLogging: true,
            emailNotifications: true,
            fileUploads: true,
            dashboardAnalytics: true,
            userManagement: true,
            caseManagement: true,
            offenceRecords: true
          },
          ui: {
            theme: 'light',
            language: 'en',
            showRegistrationForm: true,
            showForgotPassword: true
          },
          security: {
            ipWhitelist: [],
            requireHttps: false,
            enableCors: true,
            allowedOrigins: ['http://localhost:3000', 'http://localhost:3009']
          },
          maintenance: {
            isMaintenanceMode: false,
            maintenanceMessage: 'System is under maintenance. Please try again later.',
            allowedMaintenanceUsers: []
          }
        });
        
        await settings.save();
        console.log('✅ Default settings created successfully');
      } else {
        console.log('✅ Settings loaded from database');
      }
      
      this.settings = settings;
      this.isLoaded = true;
      
      console.log('🎯 Current Settings:');
      console.log(`   📝 System: ${this.settings.systemName}`);
      console.log(`   🔐 Public Registration: ${this.settings.registration.publicRegistration ? 'Enabled' : 'Disabled'}`);
      console.log(`   👥 Admin Registration: ${this.settings.registration.adminRegistration ? 'Enabled' : 'Disabled'}`);
      console.log(`   📧 Email Verification: ${this.settings.registration.emailVerificationRequired ? 'Required' : 'Optional'}`);
      console.log(`   🔧 Maintenance Mode: ${this.settings.maintenance.isMaintenanceMode ? 'Active' : 'Inactive'}`);
      
      return this.settings;
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      throw error;
    }
  }

  getSettings() {
    if (!this.isLoaded) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return this.settings;
  }

  async updateSettings(newSettings) {
    try {
      if (!this.settings) {
        throw new Error('Settings not loaded');
      }

      // Update the settings object
      Object.assign(this.settings, newSettings);
      await this.settings.save();
      
      console.log('✅ Settings updated successfully');
      return this.settings;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw error;
    }
  }

  // Helper methods for common settings checks
  isPublicRegistrationEnabled() {
    return this.settings?.registration?.publicRegistration ?? true;
  }

  isAdminRegistrationEnabled() {
    return this.settings?.registration?.adminRegistration ?? true;
  }

  isEmailVerificationRequired() {
    return this.settings?.registration?.emailVerificationRequired ?? true;
  }

  isMaintenanceMode() {
    return this.settings?.maintenance?.isMaintenanceMode ?? false;
  }

  getMaintenanceMessage() {
    return this.settings?.maintenance?.maintenanceMessage ?? 'System is under maintenance. Please try again later.';
  }

  isRoleAllowed(role) {
    const allowedRoles = this.settings?.registration?.allowedRoles ?? ['admin', 'manager', 'officer', 'viewer'];
    return allowedRoles.includes(role);
  }

  validatePassword(password) {
    const policy = this.settings?.authentication?.passwordPolicy;
    if (!policy) return true;

    if (password.length < policy.minLength) {
      return { valid: false, message: `Password must be at least ${policy.minLength} characters long` };
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true };
  }

  isUserAllowedDuringMaintenance(userId) {
    const allowedUsers = this.settings?.maintenance?.allowedMaintenanceUsers ?? [];
    return allowedUsers.includes(userId);
  }

  // Feature toggle methods
  isFeatureEnabled(featureName) {
    return this.settings?.features?.[featureName] ?? true;
  }

  isFileUploadsEnabled() {
    return this.isFeatureEnabled('fileUploads');
  }

  isUserManagementEnabled() {
    return this.isFeatureEnabled('userManagement');
  }

  isDashboardAnalyticsEnabled() {
    return this.isFeatureEnabled('dashboardAnalytics');
  }

  isCaseManagementEnabled() {
    return this.isFeatureEnabled('caseManagement');
  }

  isOffenceRecordsEnabled() {
    return this.isFeatureEnabled('offenceRecords');
  }

  isEmailNotificationsEnabled() {
    return this.isFeatureEnabled('emailNotifications');
  }

  isAuditLoggingEnabled() {
    return this.isFeatureEnabled('auditLogging');
  }
}

// Create a singleton instance
const settingsManager = new SettingsManager();

module.exports = settingsManager;
