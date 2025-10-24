const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organisation name is required'],
    trim: true,
    maxlength: [100, 'Organisation name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  email: {
    type: String,
    required: [true, 'Organisation email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[\d]{7,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  settings: {
    isActive: {
      type: Boolean,
      default: true
    },
    maxUsers: {
      type: Number,
      default: 50,
      min: [1, 'Max users must be at least 1']
    },
    features: {
      userManagement: {
        type: Boolean,
        default: true
      },
      caseManagement: {
        type: Boolean,
        default: true
      },
      offenceRecords: {
        type: Boolean,
        default: true
      },
      fileUploads: {
        type: Boolean,
        default: true
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      auditLogging: {
        type: Boolean,
        default: true
      },
      dashboardAnalytics: {
        type: Boolean,
        default: true
      }
    }
  },
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Will be set when admin user is created
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
organisationSchema.index({ name: 1 });
organisationSchema.index({ email: 1 });
organisationSchema.index({ 'settings.isActive': 1 });
organisationSchema.index({ 'subscription.plan': 1 });
organisationSchema.index({ createdAt: -1 });

// Virtual for user count
organisationSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organisationId',
  count: true
});

// Virtual for active user count
organisationSchema.virtual('activeUserCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organisationId',
  count: true,
  match: { isActive: true }
});

// Pre-save middleware
organisationSchema.pre('save', function(next) {
  // Ensure admin user is set if not already set
  if (!this.adminUser && this.isNew) {
    // This will be handled in the route when creating the admin user
  }
  next();
});

// Instance methods
organisationSchema.methods.isSubscriptionActive = function() {
  if (!this.subscription.isActive) return false;
  if (this.subscription.endDate && new Date() > this.subscription.endDate) {
    return false;
  }
  return true;
};

organisationSchema.methods.canAddUser = function() {
  return this.userCount < this.settings.maxUsers;
};

organisationSchema.methods.hasFeature = function(feature) {
  return this.settings.features[feature] === true;
};

// Static methods
organisationSchema.statics.findActive = function() {
  return this.find({ 'settings.isActive': true });
};

organisationSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('Organisation', organisationSchema);
