const mongoose = require('mongoose');

const offenceSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
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
  
  // Classification
  category: {
    type: String,
    required: true,
    enum: [
      'violent_crime',
      'property_crime',
      'drug_offence',
      'white_collar_crime',
      'cyber_crime',
      'traffic_violation',
      'public_order',
      'sexual_offence',
      'terrorism',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['minor', 'moderate', 'serious', 'major', 'felony']
  },

  // Legal Information
  legalDefinition: {
    type: String,
    required: true,
    trim: true
  },
  applicableLaws: [{
    law: String,
    section: String,
    description: String
  }],
  statuteOfLimitations: {
    type: Number, // in years
    default: null
  },

  // Penalties
  penalties: {
    minimumSentence: {
      type: String,
      trim: true
    },
    maximumSentence: {
      type: String,
      trim: true
    },
    fineRange: {
      minimum: Number,
      maximum: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    communityService: {
      minimum: Number, // hours
      maximum: Number
    },
    probation: {
      minimum: Number, // months
      maximum: Number
    },
    parole: {
      eligible: Boolean,
      minimum: Number, // months
      maximum: Number
    }
  },

  // Aggravating and Mitigating Factors
  aggravatingFactors: [{
    factor: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  mitigatingFactors: [{
    factor: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],

  // Risk Assessment
  riskFactors: {
    violenceRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    recidivismRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    publicSafetyRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },

  // Reporting Requirements
  reportingRequirements: {
    mandatoryReporting: Boolean,
    reportingPeriod: Number, // in days
    reportingAuthority: String,
    specialRequirements: String
  },

  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  repealedDate: Date,
  repealedReason: String,

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
offenceSchema.index({ name: 1 });
offenceSchema.index({ code: 1 });
offenceSchema.index({ category: 1 });
offenceSchema.index({ severity: 1 });
offenceSchema.index({ organisationId: 1 });
offenceSchema.index({ isActive: 1 });
offenceSchema.index({ 'metadata.createdAt': -1 });

// Virtual for display name
offenceSchema.virtual('displayName').get(function() {
  return `${this.code} - ${this.name}`;
});

// Pre-save middleware to update metadata
offenceSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Static method to search offences
offenceSchema.statics.searchOffences = function(query, organisationId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 1,
    category,
    severity,
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

  // Filter by category
  if (category) {
    searchQuery.category = category;
  }

  // Filter by severity
  if (severity) {
    searchQuery.severity = severity;
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

// Static method to get offence statistics
offenceSchema.statics.getOffenceStats = function(organisationId) {
  return this.aggregate([
    { $match: { organisationId: new mongoose.Types.ObjectId(organisationId), isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgSeverity: { $avg: { $cond: [
          { $eq: ['$severity', 'minor'] }, 1,
          { $cond: [
            { $eq: ['$severity', 'moderate'] }, 2,
            { $cond: [
              { $eq: ['$severity', 'serious'] }, 3,
              { $cond: [
                { $eq: ['$severity', 'major'] }, 4,
                5
              ]}
            ]}
          ]}
        ]}}
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Offence', offenceSchema);
