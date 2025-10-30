const mongoose = require('mongoose');

const offenderSchema = new mongoose.Schema({
  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    placeOfBirth: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other']
    },
    nationality: {
      type: String,
      required: true,
      default: 'Somali'
    },
    nationalId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    passportNumber: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },

  // Physical Description
  physicalDescription: {
    height: {
      type: Number, // in cm
      min: 30, // Allow very short heights (around 1 foot)
      max: 250
    },
    weight: {
      type: Number, // in kg
      min: 20,
      max: 200
    },
    eyeColor: {
      type: String,
      enum: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'black', 'other']
    },
    hairColor: {
      type: String,
      enum: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'other']
    },
    skinTone: {
      type: String,
      enum: ['light', 'medium', 'dark', 'very dark', 'maariin', 'jecel', 'other']
    },
    distinguishingMarks: {
      type: String,
      trim: true
    },
    tattoos: [{
      description: String,
      location: String
    }],
    scars: [{
      description: String,
      location: String
    }]
  },

  // Address Information
  address: {
    current: {
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
    permanent: {
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
    previousAddresses: [{
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      dateFrom: Date,
      dateTo: Date
    }]
  },

  // Family Information
  familyInfo: {
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'separated'],
      default: 'single',
      set: function(value) {
        // Convert empty string to default value
        return value === '' ? 'single' : value;
      }
    },
    spouse: {
      name: String,
      phone: String,
      address: String
    },
    children: [{
      name: String,
      age: Number,
      relationship: String
    }],
    parents: {
      father: {
        name: String,
        phone: String,
        address: String
      },
      mother: {
        name: String,
        phone: String,
        address: String
      }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      address: String
    }
  },

  // Employment Information
  employment: {
    current: {
      employer: String,
      position: String,
      address: String,
      phone: String,
      startDate: Date
    },
    previous: [{
      employer: String,
      position: String,
      address: String,
      phone: String,
      startDate: Date,
      endDate: Date
    }]
  },

  // Criminal History
  criminalHistory: {
    offences: [{
      offenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offence'
      },
      caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
      },
      dateCommitted: Date,
      dateArrested: Date,
      status: {
        type: String,
        enum: ['pending', 'convicted', 'acquitted', 'dismissed', 'appealed']
      },
      sentence: {
        type: String,
        trim: true
      },
      fine: Number,
      communityService: Number, // hours
      probationPeriod: Number, // months
      notes: String
    }],
    aliases: [{
      name: String,
      type: {
        type: String,
        enum: ['nickname', 'alias', 'maiden_name', 'other']
      }
    }]
  },

  // Risk Assessment
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [{
      factor: String,
      weight: {
        type: Number,
        min: 1,
        max: 10
      }
    }],
    lastAssessment: Date,
    nextAssessment: Date,
    notes: String
  },

  // Medical Information
  medicalInfo: {
    mentalHealthStatus: {
      type: String,
      enum: ['stable', 'treatment_required', 'medication_required', 'hospitalized']
    },
    physicalHealthStatus: {
      type: String,
      enum: ['good', 'fair', 'poor', 'critical']
    },
    medications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    allergies: [String],
    medicalNotes: String
  },

  // Status and Tracking
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    isInCustody: {
      type: Boolean,
      default: false
    },
    custodyLocation: String,
    custodyStartDate: Date,
    expectedReleaseDate: Date,
    paroleStatus: {
      type: String,
      enum: ['none', 'eligible', 'on_parole', 'parole_violated', 'completed']
    },
    probationStatus: {
      type: String,
      enum: ['none', 'active', 'completed', 'violated']
    }
  },

  // Profile Photo
  profilePhoto: {
    type: String,
    trim: true
  },

  // Photos and Documents
  photos: [{
    url: String,
    type: {
      type: String,
      enum: ['mugshot', 'profile', 'identification', 'other']
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    url: String,
    type: {
      type: String,
      enum: ['id_copy', 'passport_copy', 'court_document', 'medical_record', 'other']
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
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
offenderSchema.index({ 'personalInfo.nationalId': 1 });
offenderSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
offenderSchema.index({ 'personalInfo.dateOfBirth': 1 });
// Removed index on removed field 'criminalHistory.totalOffences'
offenderSchema.index({ 'riskAssessment.level': 1 });
offenderSchema.index({ 'status.isInCustody': 1 });
offenderSchema.index({ organisationId: 1 });
offenderSchema.index({ 'metadata.createdAt': -1 });

// Virtual for full name
offenderSchema.virtual('fullName').get(function() {
  const { firstName, lastName, middleName } = this.personalInfo;
  return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
});

// Virtual for age
offenderSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Pre-save middleware to update metadata
offenderSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Static method to search offenders
offenderSchema.statics.searchOffenders = function(query, organisationId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'metadata.createdAt',
    sortOrder = -1,
    riskLevel,
    custodyStatus,
    offenceType
  } = options;

  const searchQuery = {
    organisationId: new mongoose.Types.ObjectId(organisationId)
  };

  // Text search
  if (query) {
    searchQuery.$or = [
      { 'personalInfo.firstName': { $regex: query, $options: 'i' } },
      { 'personalInfo.lastName': { $regex: query, $options: 'i' } },
      { 'personalInfo.nationalId': { $regex: query, $options: 'i' } },
      { 'personalInfo.passportNumber': { $regex: query, $options: 'i' } },
      { 'aliases.name': { $regex: query, $options: 'i' } }
    ];
  }

  // Filter by risk level
  if (riskLevel) {
    searchQuery['riskAssessment.level'] = riskLevel;
  }

  // Filter by custody status
  if (custodyStatus === 'in_custody') {
    searchQuery['status.isInCustody'] = true;
  } else if (custodyStatus === 'released') {
    searchQuery['status.isInCustody'] = false;
  }

  // Filter by offence type
  if (offenceType) {
    searchQuery['criminalHistory.offences.offenceId'] = new mongoose.Types.ObjectId(offenceType);
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(searchQuery)
    .populate('criminalHistory.offences.offenceId', 'name category')
    .populate('criminalHistory.offences.caseId', 'caseNumber')
    .populate('createdBy', 'firstName lastName')
    .populate('lastModifiedBy', 'firstName lastName')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to handle empty strings
offenderSchema.pre('save', function(next) {
  // Set default marital status if empty string
  if (this.familyInfo && this.familyInfo.maritalStatus === '') {
    this.familyInfo.maritalStatus = 'single';
  }
  next();
});

module.exports = mongoose.model('Offender', offenderSchema);
