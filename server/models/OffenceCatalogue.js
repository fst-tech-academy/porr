const mongoose = require('mongoose');

const offenceCatalogueSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'violent_crime',
      'property_crime',
      'white_collar_crime',
      'drug_crime',
      'cyber_crime',
      'traffic_violation',
      'public_order',
      'sexual_crime',
      'terrorism',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['minor', 'moderate', 'serious', 'major', 'severe', 'felony']
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  penaltyRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
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
offenceCatalogueSchema.index({ code: 1, organisationId: 1 });
offenceCatalogueSchema.index({ name: 1, organisationId: 1 });
offenceCatalogueSchema.index({ category: 1, organisationId: 1 });
offenceCatalogueSchema.index({ severity: 1, organisationId: 1 });
offenceCatalogueSchema.index({ isActive: 1, organisationId: 1 });

// Pre-save middleware
offenceCatalogueSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Virtual for display name
offenceCatalogueSchema.virtual('displayName').get(function() {
  return `${this.code} - ${this.name}`;
});

// Ensure virtual fields are serialized
offenceCatalogueSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('OffenceCatalogue', offenceCatalogueSchema);
