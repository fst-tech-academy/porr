const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  // Agent ID - Auto-incremented numeric field with 5 digits (00001 format)
  agentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Pseudonym Information (instead of real names)
  pseudonym: {
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
    codeName: {
      type: String,
      trim: true,
      index: true
    }
  },

  // Real Identity (confidential, for internal use only)
  realIdentity: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    nationalId: {
      type: String,
      trim: true
    },
    dateOfBirth: Date,
    placeOfBirth: String
  },

  // Department Reference (one-to-many: Department -> Agents)
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },

  // User Reference (one-to-one: User -> Agent)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },

  // Agent Information
  rank: {
    type: String,
    enum: ['detective', 'senior_detective', 'supervisor', 'commander', 'director'],
    default: 'detective'
  },
  specialization: {
    type: String,
    enum: ['homicide', 'narcotics', 'fraud', 'cybercrime', 'terrorism', 'organized_crime', 'general', 'other'],
    default: 'general'
  },
  employmentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'on_leave', 'suspended', 'retired', 'transferred'],
    default: 'active'
  },
  clearanceLevel: {
    type: String,
    enum: ['confidential', 'secret', 'top_secret'],
    default: 'confidential'
  },

  // Contact Information (using pseudonym)
  contactInfo: {
    phone: String,
    email: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },

  // Physical Description
  physicalDescription: {
    height: Number,
    weight: Number,
    eyeColor: {
      type: String,
      enum: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'black', 'other']
    },
    hairColor: {
      type: String,
      enum: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'other']
    },
    distinguishingMarks: String
  },

  // Case Assignments
  caseAssignments: [{
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case'
    },
    crimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OffenderOffence'
    },
    assignedDate: Date,
    role: {
      type: String,
      enum: ['lead_investigator', 'co_investigator', 'support', 'supervisor']
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'transferred', 'closed']
    },
    notes: String
  }],

  // Performance Metrics
  performance: {
    totalCases: {
      type: Number,
      default: 0
    },
    solvedCases: {
      type: Number,
      default: 0
    },
    currentCases: {
      type: Number,
      default: 0
    },
    ratings: [{
      date: Date,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    certifications: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      certificateNumber: String
    }],
    training: [{
      courseName: String,
      institution: String,
      completionDate: Date,
      certificate: String
    }]
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
    medicalNotes: String,
    fitnessForDuty: {
      type: Boolean,
      default: true
    },
    lastFitnessTest: Date
  },

  // Status Information
  statusInfo: {
    isActive: {
      type: Boolean,
      default: true
    },
    lastActiveDate: Date,
    onDuty: {
      type: Boolean,
      default: false
    },
    currentLocation: String,
    availability: {
      type: String,
      enum: ['available', 'on_case', 'on_leave', 'off_duty'],
      default: 'available'
    }
  },

  // Profile Photo
  profilePhoto: String,
  photos: [{
    url: String,
    type: {
      type: String,
      enum: ['badge_photo', 'profile', 'identification', 'other']
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Documents
  documents: [{
    url: String,
    type: {
      type: String,
      enum: ['id_copy', 'passport_copy', 'badge_copy', 'certificate', 'medical_record', 'other']
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

// Indexes
agentSchema.index({ agentId: 1 });
agentSchema.index({ 'pseudonym.codeName': 1 });
agentSchema.index({ department: 1 });
agentSchema.index({ user: 1 });
agentSchema.index({ 'statusInfo.isActive': 1 });
agentSchema.index({ organisationId: 1 });
agentSchema.index({ 'metadata.createdAt': -1 });

// Virtual for full pseudonym name
agentSchema.virtual('fullPseudonym').get(function() {
  return `${this.pseudonym.firstName} ${this.pseudonym.lastName}`;
});

// Virtual for age (if realIdentity.dateOfBirth exists)
agentSchema.virtual('age').get(function() {
  if (!this.realIdentity?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.realIdentity.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for years of service
agentSchema.virtual('yearsOfService').get(function() {
  if (!this.employmentDate) return null;
  const today = new Date();
  const empDate = new Date(this.employmentDate);
  let years = today.getFullYear() - empDate.getFullYear();
  const monthDiff = today.getMonth() - empDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < empDate.getDate())) {
    years--;
  }
  return years;
});

// Pre-save middleware to update metadata
agentSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Pre-save middleware to auto-generate agentId
agentSchema.pre('save', async function(next) {
  // Only generate agentId if it's a new document and agentId is not set
  if (this.isNew && !this.agentId) {
    try {
      const organisationId = this.organisationId._id || this.organisationId;
      
      // Find the highest agentId for this organisation
      const lastAgent = await mongoose.model('Agent').findOne(
        { organisationId: organisationId },
        { agentId: 1 }
      ).sort({ agentId: -1 });

      let nextNumber = 1;
      if (lastAgent && lastAgent.agentId) {
        // Extract numeric part from agentId (e.g., "00001" -> 1)
        const lastNumber = parseInt(lastAgent.agentId, 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      // Format with 5 digits with leading zeros
      this.agentId = nextNumber.toString().padStart(5, '0');
    } catch (error) {
      // Fallback: use timestamp-based ID if error occurs
      this.agentId = Date.now().toString().slice(-5).padStart(5, '0');
    }
  }
  next();
});

// Static method to search agents
agentSchema.statics.searchAgents = function(query, organisationId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'metadata.createdAt',
    sortOrder = -1,
    rank,
    status,
    department,
    isActive
  } = options;

  const searchQuery = {
    organisationId: new mongoose.Types.ObjectId(organisationId)
  };

  // Text search on pseudonym and agentId
  if (query) {
    searchQuery.$or = [
      { 'pseudonym.firstName': { $regex: query, $options: 'i' } },
      { 'pseudonym.lastName': { $regex: query, $options: 'i' } },
      { 'pseudonym.codeName': { $regex: query, $options: 'i' } },
      { agentId: { $regex: query, $options: 'i' } }
    ];
  }

  // Filter by rank
  if (rank) {
    searchQuery.rank = rank;
  }

  // Filter by status
  if (status) {
    searchQuery.status = status;
  }

  // Filter by department
  if (department) {
    searchQuery.department = new mongoose.Types.ObjectId(department);
  }

  // Filter by active status
  if (isActive !== undefined) {
    searchQuery['statusInfo.isActive'] = isActive;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(searchQuery)
    .populate('department', 'name code')
    .populate('user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('lastModifiedBy', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Agent', agentSchema);

