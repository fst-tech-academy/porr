const mongoose = require('mongoose');

const victimSchema = new mongoose.Schema({
  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other']
    },
    nationality: {
      type: String,
      required: true,
      trim: true
    },
    nationalId: {
      type: String,
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
      min: 0
    },
    weight: {
      type: Number, // in kg
      min: 0
    },
    eyeColor: {
      type: String,
      trim: true
    },
    hairColor: {
      type: String,
      trim: true
    },
    skinTone: {
      type: String,
      trim: true
    },
    distinguishingMarks: {
      type: String,
      trim: true
    }
  },

  // Address Information
  address: {
    current: {
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
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    permanent: {
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
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // Victim Status
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    isDeceased: {
      type: Boolean,
      default: false
    },
    dateOfDeath: {
      type: Date
    },
    causeOfDeath: {
      type: String,
      trim: true
    },
    isMinor: {
      type: Boolean,
      default: false
    },
    guardianInfo: {
      name: String,
      relationship: String,
      contactInfo: {
        phone: String,
        email: String
      }
    }
  },

  // Impact Assessment
  impactAssessment: {
    physicalInjuries: [{
      type: {
        type: String,
        trim: true
      },
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'severe', 'critical']
      },
      description: {
        type: String,
        trim: true
      },
      medicalTreatment: {
        type: String,
        trim: true
      },
      recoveryStatus: {
        type: String,
        enum: ['recovered', 'ongoing', 'permanent']
      }
    }],
    psychologicalImpact: {
      traumaLevel: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe']
      },
      counselingRequired: {
        type: Boolean,
        default: false
      },
      notes: {
        type: String,
        trim: true
      }
    },
    financialImpact: {
      medicalExpenses: {
        type: Number,
        default: 0
      },
      lostWages: {
        type: Number,
        default: 0
      },
      propertyDamage: {
        type: Number,
        default: 0
      },
      otherExpenses: {
        type: Number,
        default: 0
      }
    }
  },

  // Contact Information
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },

  // Case Information
  caseInfo: {
    victimId: {
      type: String,
      unique: true,
      required: true
    },
    caseNumbers: [{
      type: String,
      trim: true
    }],
    assignedOfficer: {
      type: String,
      trim: true
    },
    assignedProsecutor: {
      type: String,
      trim: true
    },
    assignedSocialWorker: {
      type: String,
      trim: true
    }
  },

  // Notes and Additional Information
  notes: {
    type: String,
    trim: true
  },

  tags: [{
    type: String,
    trim: true
  }],

  // Metadata
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true,
    index: true
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
  timestamps: true
});

// Indexes
victimSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
victimSchema.index({ 'personalInfo.nationalId': 1 });
victimSchema.index({ 'personalInfo.email': 1 });
victimSchema.index({ 'caseInfo.victimId': 1 });
victimSchema.index({ 'status.isActive': 1 });
victimSchema.index({ 'status.isDeceased': 1 });
victimSchema.index({ organisationId: 1 });

// Pre-save middleware
victimSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Generate victim ID
victimSchema.pre('save', async function(next) {
  if (!this.caseInfo.victimId) {
    const count = await this.constructor.countDocuments();
    this.caseInfo.victimId = `VIC-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Victim', victimSchema);
