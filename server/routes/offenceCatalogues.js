const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { checkUserManagement } = require('../middleware/settings');
const OffenceCatalogue = require('../models/OffenceCatalogue');

// Get all offence catalogues with pagination and filtering
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      severity = '',
      riskLevel = '',
      isActive = ''
    } = req.query;

    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const query = { organisationId: userOrgId };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add severity filter
    if (severity) {
      query.severity = severity;
    }

    // Add risk level filter
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    // Add active status filter
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await OffenceCatalogue.countDocuments(query);

    // Fetch offence catalogues with pagination
    const offenceCatalogues = await OffenceCatalogue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      data: offenceCatalogues,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching offence catalogues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offence catalogues',
      error: error.message
    });
  }
});

// Get offence catalogue by ID
router.get('/:id', protect, async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const offenceCatalogue = await OffenceCatalogue.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    }).populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!offenceCatalogue) {
      return res.status(404).json({
        success: false,
        message: 'Offence catalogue not found'
      });
    }

    res.json({
      success: true,
      data: {
        offenceCatalogue: offenceCatalogue
      }
    });
  } catch (error) {
    console.error('Error fetching offence catalogue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offence catalogue',
      error: error.message
    });
  }
});

// Create new offence catalogue
router.post('/', [
  protect,
  checkUserManagement,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('category').isIn([
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
    ]).withMessage('Invalid category'),
    body('severity').isIn(['minor', 'moderate', 'serious', 'major', 'severe', 'felony'])
      .withMessage('Invalid severity'),
    body('riskLevel').isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid risk level')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const offenceCatalogueData = {
      ...req.body,
      organisationId: userOrgId,
      createdBy: req.user.id
    };

    const offenceCatalogue = new OffenceCatalogue(offenceCatalogueData);
    await offenceCatalogue.save();

    await offenceCatalogue.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Offence catalogue created successfully',
      data: offenceCatalogue
    });
  } catch (error) {
    console.error('Error creating offence catalogue:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Offence catalogue with this code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating offence catalogue',
      error: error.message
    });
  }
});

// Update offence catalogue
router.put('/:id', [
  protect,
  checkUserManagement,
  [
    body('code').optional().notEmpty().withMessage('Code cannot be empty'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('category').optional().isIn([
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
    ]).withMessage('Invalid category'),
    body('severity').optional().isIn(['minor', 'moderate', 'serious', 'major', 'severe', 'felony'])
      .withMessage('Invalid severity'),
    body('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid risk level')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const offenceCatalogue = await OffenceCatalogue.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });

    if (!offenceCatalogue) {
      return res.status(404).json({
        success: false,
        message: 'Offence catalogue not found'
      });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    Object.assign(offenceCatalogue, updateData);
    await offenceCatalogue.save();

    // Populate fields using array syntax
    await OffenceCatalogue.populate(offenceCatalogue, [
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'lastModifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Offence catalogue updated successfully',
      data: {
        offenceCatalogue: offenceCatalogue
      }
    });
  } catch (error) {
    console.error('Error updating offence catalogue:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Offence catalogue with this code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating offence catalogue',
      error: error.message
    });
  }
});

// Delete offence catalogue
router.delete('/:id', [protect, checkUserManagement], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const offenceCatalogue = await OffenceCatalogue.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });

    if (!offenceCatalogue) {
      return res.status(404).json({
        success: false,
        message: 'Offence catalogue not found'
      });
    }

    await OffenceCatalogue.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Offence catalogue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting offence catalogue:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting offence catalogue',
      error: error.message
    });
  }
});

// Get offence catalogue statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const organisationId = req.user.organisationId._id || req.user.organisationId;

    const stats = await OffenceCatalogue.aggregate([
      { $match: { organisationId: organisationId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          },
          bySeverity: {
            $push: {
              severity: '$severity',
              count: 1
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      byCategory: [],
      bySeverity: []
    };

    // Group by category
    const categoryStats = {};
    result.byCategory.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });

    // Group by severity
    const severityStats = {};
    result.bySeverity.forEach(item => {
      severityStats[item.severity] = (severityStats[item.severity] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: result.total,
        active: result.active,
        inactive: result.inactive,
        byCategory: categoryStats,
        bySeverity: severityStats
      }
    });
  } catch (error) {
    console.error('Error fetching offence catalogue statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offence catalogue statistics',
      error: error.message
    });
  }
});

module.exports = router;
