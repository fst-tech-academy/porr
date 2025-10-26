const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  // Case Information
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  caseType: {
    type: String,
    required: true,
    enum: [
      'criminal',
      'civil',
      'administrative',
      'appeal',
      'review',
      'investigation',
      'other'
    ]
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Parties Involved
  offenders: [{
    offenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offender',
      required: true
    },
    role: {
      type: String,
      enum: ['primary', 'secondary', 'accomplice', 'witness'],
      default: 'primary'
    },
    charges: [{
      offenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offence',
        required: true
      },
      count: {
        type: Number,
        default: 1,
        min: 1
      },
      description: String,
      dateCommitted: Date,
      location: String
    }]
  }],
  victims: [{
    name: String,
    contactInfo: {
      phone: String,
      email: String,
      address: String
    },
    relationship: String,
    impactStatement: String
  }],
  witnesses: [{
    name: String,
    contactInfo: {
      phone: String,
      email: String,
      address: String
    },
    statement: String,
    credibility: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],

  // Legal Information
  offences: [{
    offenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offence',
      required: true
    },
    count: {
      type: Number,
      default: 1,
      min: 1
    },
    description: String,
    dateCommitted: Date,
    location: String,
    evidence: [String]
  }],
  court: {
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court'
    },
    judge: String,
    prosecutor: String,
    defenseAttorney: String,
    courtDate: Date,
    nextHearing: Date
  },

  // Case Timeline
  timeline: [{
    date: {
      type: Date,
      required: true
    },
    event: {
      type: String,
      required: true,
      enum: [
        'case_opened',
        'investigation_started',
        'arrest_made',
        'charges_filed',
        'arraignment',
        'preliminary_hearing',
        'trial_started',
        'trial_completed',
        'sentencing',
        'appeal_filed',
        'case_closed',
        'other'
      ]
    },
    description: String,
    location: String,
    participants: [String],
    documents: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Case Status
  status: {
    current: {
      type: String,
      required: true,
      enum: [
        'open',
        'under_investigation',
        'charges_pending',
        'in_court',
        'trial_in_progress',
        'awaiting_sentencing',
        'sentenced',
        'appealed',
        'closed',
        'dismissed',
        'acquitted'
      ],
      default: 'open'
    },
    previous: [{
      status: String,
      dateChanged: Date,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String
    }]
  },

  // Investigation Details
  investigation: {
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedTeam: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    startDate: Date,
    endDate: Date,
    evidence: [{
      type: {
        type: String,
        enum: ['physical', 'digital', 'testimony', 'document', 'other']
      },
      description: String,
      collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      collectedDate: Date,
      location: String,
      chainOfCustody: [{
        person: String,
        date: Date,
        action: String
      }]
    }],
    leads: [{
      description: String,
      source: String,
      status: {
        type: String,
        enum: ['active', 'investigated', 'closed', 'false']
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },

  // Outcome and Resolution
  outcome: {
    verdict: {
      type: String,
      enum: ['guilty', 'not_guilty', 'dismissed', 'plea_bargain', 'pending']
    },
    sentence: {
      type: String,
      trim: true
    },
    fine: Number,
    communityService: Number, // hours
    probationPeriod: Number, // months
    paroleEligibility: Date,
    restitution: Number,
    notes: String
  },

  // Documents and Files
  documents: [{
    name: String,
    type: {
      type: String,
      enum: [
        'arrest_report',
        'investigation_report',
        'court_document',
        'evidence',
        'medical_report',
        'witness_statement',
        'other'
      ]
    },
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    isConfidential: {
      type: Boolean,
      default: false
    }
  }],

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
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ 'offenders.offenderId': 1 });
caseSchema.index({ 'offences.offenceId': 1 });
caseSchema.index({ 'status.current': 1 });
caseSchema.index({ 'investigation.assignedOfficer': 1 });
caseSchema.index({ organisationId: 1 });
caseSchema.index({ 'metadata.createdAt': -1 });

// Virtual for case age
caseSchema.virtual('caseAge').get(function() {
  const today = new Date();
  const created = new Date(this.metadata.createdAt);
  const diffTime = Math.abs(today - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update metadata
caseSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Static method to search cases
caseSchema.statics.searchCases = function(query, organisationId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'metadata.createdAt',
    sortOrder = -1,
    status,
    caseType,
    priority,
    assignedOfficer
  } = options;

  const searchQuery = {
    organisationId: new mongoose.Types.ObjectId(organisationId)
  };

  // Text search
  if (query) {
    searchQuery.$or = [
      { caseNumber: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }

  // Filter by status
  if (status) {
    searchQuery['status.current'] = status;
  }

  // Filter by case type
  if (caseType) {
    searchQuery.caseType = caseType;
  }

  // Filter by priority
  if (priority) {
    searchQuery.priority = priority;
  }

  // Filter by assigned officer
  if (assignedOfficer) {
    searchQuery['investigation.assignedOfficer'] = new mongoose.Types.ObjectId(assignedOfficer);
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(searchQuery)
    .populate('offenders.offenderId', 'personalInfo.firstName personalInfo.lastName personalInfo.nationalId')
    .populate('offences.offenceId', 'name code category')
    .populate('investigation.assignedOfficer', 'firstName lastName')
    .populate('createdBy', 'firstName lastName')
    .populate('lastModifiedBy', 'firstName lastName')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get case statistics
caseSchema.statics.getCaseStats = function(organisationId) {
  return this.aggregate([
    { $match: { organisationId: new mongoose.Types.ObjectId(organisationId) } },
    {
      $group: {
        _id: '$status.current',
        count: { $sum: 1 },
        avgPriority: { $avg: { $cond: [
          { $eq: ['$priority', 'low'] }, 1,
          { $cond: [
            { $eq: ['$priority', 'medium'] }, 2,
            { $cond: [
              { $eq: ['$priority', 'high'] }, 3,
              4
            ]}
          ]}
        ]}}
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Case', caseSchema);
