const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // System-wide settings
  systemName: {
    type: String,
    default: 'New Project Starter Template',
    trim: true
  },
  systemDescription: {
    type: String,
    default: 'A comprehensive system for managing offence records and legal proceedings',
    trim: true
  },
  
  // Registration settings
  registration: {
    publicRegistration: {
      type: Boolean,
      default: true,
      description: 'Allow public user registration'
    },
    adminRegistration: {
      type: Boolean,
      default: true,
      description: 'Allow admin to create users internally'
    },
    emailVerificationRequired: {
      type: Boolean,
      default: true,
      description: 'Require email verification for new users'
    },
    autoApproveUsers: {
      type: Boolean,
      default: false,
      description: 'Automatically approve new user registrations'
    },
    allowedRoles: {
      type: [String],
      default: ['admin', 'manager', 'officer', 'viewer'],
      enum: ['super_admin', 'admin', 'manager', 'officer', 'viewer']
    }
  },

  // Authentication settings
  authentication: {
    sessionTimeout: {
      type: Number,
      default: 24, // hours
      min: 1,
      max: 168 // 7 days
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    },
    lockoutDuration: {
      type: Number,
      default: 30, // minutes
      min: 5,
      max: 1440 // 24 hours
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 6,
        min: 4,
        max: 20
      },
      requireUppercase: {
        type: Boolean,
        default: false
      },
      requireLowercase: {
        type: Boolean,
        default: false
      },
      requireNumbers: {
        type: Boolean,
        default: false
      },
      requireSpecialChars: {
        type: Boolean,
        default: false
      }
    }
  },

  // Feature toggles
  features: {
    auditLogging: {
      type: Boolean,
      default: true,
      description: 'Enable audit logging for system activities'
    },
    emailNotifications: {
      type: Boolean,
      default: true,
      description: 'Enable email notifications'
    },
    fileUploads: {
      type: Boolean,
      default: true,
      description: 'Enable file upload functionality'
    },
    dashboardAnalytics: {
      type: Boolean,
      default: true,
      description: 'Enable dashboard analytics and reporting'
    },
    userManagement: {
      type: Boolean,
      default: true,
      description: 'Enable user management features'
    },
    caseManagement: {
      type: Boolean,
      default: true,
      description: 'Enable case management features'
    },
    offenceRecords: {
      type: Boolean,
      default: true,
      description: 'Enable offence records management'
    }
  },

  // UI/UX settings
  ui: {
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'so'] // English, Somali
    },
    showRegistrationForm: {
      type: Boolean,
      default: true,
      description: 'Show registration form on login page'
    },
    showForgotPassword: {
      type: Boolean,
      default: true,
      description: 'Show forgot password link'
    }
  },

  // Security settings
  security: {
    ipWhitelist: {
      type: [String],
      default: [],
      description: 'List of allowed IP addresses (empty = no restriction)'
    },
    requireHttps: {
      type: Boolean,
      default: false,
      description: 'Require HTTPS for all connections'
    },
    enableCors: {
      type: Boolean,
      default: true,
      description: 'Enable CORS for cross-origin requests'
    },
    allowedOrigins: {
      type: [String],
      default: ['http://localhost:3000', 'http://localhost:3009'],
      description: 'Allowed CORS origins'
    }
  },

  // Maintenance settings
  maintenance: {
    isMaintenanceMode: {
      type: Boolean,
      default: false,
      description: 'Enable maintenance mode'
    },
    maintenanceMessage: {
      type: String,
      default: 'System is under maintenance. Please try again later.',
      trim: true
    },
    allowedMaintenanceUsers: {
      type: [String],
      default: [],
      description: 'User IDs allowed to access during maintenance'
    }
  },

  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  versionKey: false
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Static method to get current settings
settingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      updatedBy: new mongoose.Types.ObjectId() // Will be updated when first admin logs in
    });
  }
  
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
  const settings = await this.getCurrentSettings();
  
  // Update the settings
  Object.keys(updates).forEach(key => {
    if (settings[key] !== undefined) {
      if (typeof settings[key] === 'object' && settings[key] !== null) {
        Object.assign(settings[key], updates[key]);
      } else {
        settings[key] = updates[key];
      }
    }
  });
  
  settings.lastUpdated = new Date();
  settings.updatedBy = userId;
  settings.version += 1;
  
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
