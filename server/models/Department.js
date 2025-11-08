const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // Department Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['investigation', 'forensics', 'intelligence', 'operations', 'administration', 'training', 'support', 'other'],
    default: 'investigation'
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  
  // Location Information
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'Somalia'
      },
      postalCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    phone: String,
    email: String,
    fax: String
  },

  // Department Statistics
  statistics: {
    totalAgents: {
      type: Number,
      default: 0
    },
    activeAgents: {
      type: Number,
      default: 0
    },
    totalCases: {
      type: Number,
      default: 0
    },
    activeCases: {
      type: Number,
      default: 0
    },
    solvedCases: {
      type: Number,
      default: 0
    }
  },

  // Department Head/Leadership
  leadership: {
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deputyHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    supervisors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Contact Information
  contactInfo: {
    phone: String,
    email: String,
    fax: String,
    website: String,
    emergencyContact: String
  },

  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },

  // Status and Metadata
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    establishedDate: Date,
    lastInspectionDate: Date,
    nextInspectionDate: Date
  },

  // Resources
  resources: {
    budget: {
      annual: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    equipment: [{
      name: String,
      quantity: Number,
      description: String
    }],
    vehicles: [{
      type: String,
      licensePlate: String,
      status: {
        type: String,
        enum: ['available', 'in_use', 'maintenance', 'out_of_service'],
        default: 'available'
      }
    }]
  },

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
departmentSchema.index({ code: 1 });
departmentSchema.index({ name: 1 });
departmentSchema.index({ type: 1 });
departmentSchema.index({ 'status.isActive': 1 });
departmentSchema.index({ organisationId: 1 });
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ 'metadata.createdAt': -1 });

// Virtual for full address
departmentSchema.virtual('fullAddress').get(function() {
  if (!this.location || !this.location.address) return '';
  const addr = this.location.address;
  const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean);
  return parts.join(', ');
});

// Pre-save middleware to update metadata
departmentSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Static method to search departments
departmentSchema.statics.searchDepartments = function(query, organisationId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'metadata.createdAt',
    sortOrder = -1,
    type,
    isActive
  } = options;

  const searchQuery = {
    organisationId: new mongoose.Types.ObjectId(organisationId)
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

  // Filter by active status
  if (isActive !== undefined) {
    searchQuery['status.isActive'] = isActive;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(searchQuery)
    .populate('leadership.head', 'firstName lastName email')
    .populate('leadership.deputyHead', 'firstName lastName email')
    .populate('leadership.supervisors', 'firstName lastName email')
    .populate('parentDepartment', 'name code')
    .populate('createdBy', 'firstName lastName email')
    .populate('lastModifiedBy', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Department', departmentSchema);

