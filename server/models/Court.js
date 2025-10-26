const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },

  // Court Classification
  type: {
    type: String,
    required: true,
    enum: [
      'supreme_court',
      'appeals_court',
      'district_court',
      'regional_court',
      'municipal_court',
      'specialized_court',
      'military_court',
      'other'
    ]
  },
  jurisdiction: {
    type: String,
    required: true,
    enum: [
      'federal',
      'state',
      'regional',
      'municipal',
      'specialized'
    ]
  },
  level: {
    type: String,
    required: true,
    enum: [
      'trial',
      'appellate',
      'supreme',
      'administrative'
    ]
  },

  // Location Information
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Somalia'
    },
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    fax: String,
    website: String
  },

  // Court Personnel
  personnel: {
    judges: [{
      name: String,
      title: String,
      specialization: [String],
      contactInfo: {
        phone: String,
        email: String
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    clerks: [{
      name: String,
      title: String,
      contactInfo: {
        phone: String,
        email: String
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    prosecutors: [{
      name: String,
      title: String,
      specialization: [String],
      contactInfo: {
        phone: String,
        email: String
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Court Operations
  operations: {
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    holidays: [Date],
    capacity: {
      courtrooms: Number,
      seatingCapacity: Number
    },
    facilities: [{
      name: String,
      type: {
        type: String,
        enum: ['courtroom', 'conference_room', 'holding_cell', 'office', 'other']
      },
      capacity: Number,
      equipment: [String]
    }]
  },

  // Case Management
  caseManagement: {
    caseTypes: [String],
    maxCaseLoad: Number,
    currentCaseLoad: {
      type: Number,
      default: 0
    },
    averageProcessingTime: Number, // in days
    backlogThreshold: Number
  },

  // Financial Information
  budget: {
    annual: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    allocated: Number,
    spent: Number,
    remaining: Number
  },

  // Performance Metrics
  metrics: {
    casesProcessed: {
      type: Number,
      default: 0
    },
    averageResolutionTime: Number, // in days
    successRate: Number, // percentage
    satisfactionRating: Number, // 1-5 scale
    lastUpdated: Date
  },

  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  establishedDate: Date,
  lastInspectionDate: Date,
  nextInspectionDate: Date,

  // System Information
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  notes: String,

  // Metadata
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
courtSchema.index({ name: 1 });
courtSchema.index({ code: 1 });
courtSchema.index({ type: 1 });
courtSchema.index({ jurisdiction: 1 });
courtSchema.index({ level: 1 });
courtSchema.index({ organisationId: 1 });
courtSchema.index({ isActive: 1 });
courtSchema.index({ 'metadata.createdAt': -1 });

// Virtual for full address
courtSchema.virtual('fullAddress').get(function() {
  const { street, city, state, country, postalCode } = this.address;
  const parts = [street, city, state, postalCode, country].filter(Boolean);
  return parts.join(', ');
});

// Virtual for utilization rate
courtSchema.virtual('utilizationRate').get(function() {
  if (!this.caseManagement.maxCaseLoad || this.caseManagement.maxCaseLoad === 0) {
    return 0;
  }
  return (this.caseManagement.currentCaseLoad / this.caseManagement.maxCaseLoad) * 100;
});

// Pre-save middleware to update metadata
courtSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Static method to search courts
courtSchema.statics.searchCourts = function(query, organisationId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 1,
    type,
    jurisdiction,
    level,
    isActive = true
  } = options;

  const searchQuery = {
    organisationId: new mongoose.Types.ObjectId(organisationId),
    isActive
  };

  // Text search
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { code: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }

  // Filter by type
  if (type) {
    searchQuery.type = type;
  }

  // Filter by jurisdiction
  if (jurisdiction) {
    searchQuery.jurisdiction = jurisdiction;
  }

  // Filter by level
  if (level) {
    searchQuery.level = level;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(searchQuery)
    .populate('createdBy', 'firstName lastName')
    .populate('lastModifiedBy', 'firstName lastName')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get court statistics
courtSchema.statics.getCourtStats = function(organisationId) {
  return this.aggregate([
    { $match: { organisationId: new mongoose.Types.ObjectId(organisationId), isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCapacity: { $sum: '$caseManagement.maxCaseLoad' },
        totalCurrentLoad: { $sum: '$caseManagement.currentCaseLoad' },
        avgUtilization: { $avg: '$utilizationRate' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Court', courtSchema);
