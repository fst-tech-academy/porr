const mongoose = require('mongoose');

const auditEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for system events
  },
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: false // Allow null for super admin events
  },
  userId: {
    type: String,
    required: false // Store user ID for quick access
  },
  userEmail: {
    type: String,
    required: false // Store user email for quick access
  },
  userName: {
    firstName: String,
    lastName: String,
    fullName: String
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'READ', 
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'SEARCH',
      'EXPORT',
      'IMPORT',
      'UPLOAD',
      'DOWNLOAD',
      'ACCESS_DENIED',
      'AUTH_FAILED',
      'ERROR'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: [
      'User',
      'SimCard',
      'Dashboard',
      'Auth',
      'System',
      'File'
    ]
  },
  entityId: {
    type: String,
    required: false // The ID of the affected entity
  },
  entityName: {
    type: String,
    required: false // Human-readable name
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    summary: String // Brief description of changes
  },
  requestData: {
    method: String,
    url: String,
    params: mongoose.Schema.Types.Mixed,
    query: mongoose.Schema.Types.Mixed,
    bodyKeys: [String], // Only store keys, not sensitive data
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  responseData: {
    statusCode: Number,
    success: Boolean,
    message: String,
    duration: Number, // Response time in milliseconds
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  category: {
    type: String,
    enum: [
      'SECURITY',
      'DATA_MANAGEMENT', 
      'SYSTEM',
      'USER_MANAGEMENT',
      'OPERATIONAL'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [String] // Additional categorization
}, {
  timestamps: true
});

// Indexes for performance
auditEventSchema.index({ userId: 1, createdAt: -1 });
auditEventSchema.index({ organisationId: 1, createdAt: -1 });
auditEventSchema.index({ action: 1, createdAt: -1 });
auditEventSchema.index({ entityType: 1, createdAt: -1 });
auditEventSchema.index({ entityId: 1, createdAt: -1 });
auditEventSchema.index({ severity: 1, createdAt: -1 });
auditEventSchema.index({ createdAt: -1 });
auditEventSchema.index({ 'requestData.ipAddress': 1, createdAt: -1 });

// Virtual for formatted date
auditEventSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString();
});

// Pre-save middleware to set userName fullName
auditEventSchema.pre('save', function(next) {
  if (this.userName && this.userName.firstName && this.userName.lastName) {
    this.userName.fullName = `${this.userName.firstName} ${this.userName.lastName}`;
  }
  next();
});

// Static method to log an event
auditEventSchema.statics.logEvent = function(params) {
  const auditEvent = new this({
    user: params.user?._id,
    userId: params.user?.id || params.userId,
    userEmail: params.user?.email || params.userEmail,
    userName: params.user ? {
      firstName: params.user.firstName,
      lastName: params.user.lastName
    } : params.userName,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    changes: params.changes,
    requestData: {
      method: params.method,
      url: params.url,
      params: params.params,
      query: params.query,
      bodyKeys: params.bodyKeys,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: params.timestamp || new Date()
    },
    responseData: {
      statusCode: params.statusCode,
      success: params.success,
      message: params.message,
      duration: params.duration,
      timestamp: new Date()
    },
    severity: params.severity || 'LOW',
    category: params.category,
    description: params.description,
    tags: params.tags || []
  });

  return auditEvent.save().catch(err => {
    console.error('Audit event logging failed:', err);
    // Don't throw error to avoid breaking main operations
  });
};

module.exports = mongoose.model('AuditEvent', auditEventSchema);
