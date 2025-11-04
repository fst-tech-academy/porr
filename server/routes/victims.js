const express = require('express');
const { body, validationResult } = require('express-validator');
const Victim = require('../models/Victim');
const { protect } = require('../middleware/auth');
const roleHierarchy = require('../middleware/roleHierarchy');
const { checkUserManagement } = require('../middleware/settings');

const router = express.Router();

// Validation rules
const victimValidationRules = [
  body('personalInfo.firstName').trim().notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('personalInfo.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('personalInfo.gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('personalInfo.nationality').trim().notEmpty().withMessage('Nationality is required'),
  body('personalInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('personalInfo.phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('address.current.city').trim().notEmpty().withMessage('Current city is required'),
  body('address.current.state').trim().notEmpty().withMessage('Current state is required'),
  body('address.current.country').trim().notEmpty().withMessage('Current country is required')
];

// Get all victims
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      isDeceased = 'all',
      sortBy = 'metadata.createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId?._id || req.user.organisationId;
    const query = { organisationId: userOrgId };

    // Search filter
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.nationalId': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'caseInfo.victimId': { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query['status.isActive'] = status === 'active';
    }

    // Deceased filter
    if (isDeceased !== 'all') {
      query['status.isDeceased'] = isDeceased === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const victims = await Victim.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Victim.countDocuments(query);

    res.json({
      success: true,
      data: victims,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching victims:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching victims'
    });
  }
});

// Get victim by ID
router.get('/:id', protect, async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId?._id || req.user.organisationId;
    const victim = await Victim.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!victim) {
      return res.status(404).json({
        success: false,
        message: 'Victim not found'
      });
    }

    res.json({
      success: true,
      data: victim
    });
  } catch (error) {
    console.error('Error fetching victim:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching victim'
    });
  }
});

// Create new victim
router.post('/', protect, checkUserManagement, victimValidationRules, async (req, res) => {
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
    const userOrgId = req.user.organisationId?._id || req.user.organisationId;
    const victimData = {
      ...req.body,
      organisationId: userOrgId,
      createdBy: req.user.id
    };

    const victim = new Victim(victimData);
    await victim.save();

    await victim.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Victim created successfully',
      data: victim
    });
  } catch (error) {
    console.error('Error creating victim:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating victim'
    });
  }
});

// Update victim
router.put('/:id', protect, victimValidationRules, async (req, res) => {
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
    const userOrgId = req.user.organisationId?._id || req.user.organisationId;
    const victim = await Victim.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });

    if (!victim) {
      return res.status(404).json({
        success: false,
        message: 'Victim not found'
      });
    }

    // Check if user can modify this victim
    if (!roleHierarchy.canModifyResource(req.user, victim.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this victim'
      });
    }

    Object.assign(victim, req.body);
    victim.lastModifiedBy = req.user.id;
    await victim.save();

    await victim.populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Victim updated successfully',
      data: victim
    });
  } catch (error) {
    console.error('Error updating victim:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating victim'
    });
  }
});

// Delete victim
router.delete('/:id', protect, async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId?._id || req.user.organisationId;
    const victim = await Victim.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });

    if (!victim) {
      return res.status(404).json({
        success: false,
        message: 'Victim not found'
      });
    }

    // Check if user can delete this victim
    if (!roleHierarchy.canModifyResource(req.user, victim.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this victim'
      });
    }

    await Victim.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Victim deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting victim:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting victim'
    });
  }
});

// Get victim statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    const [
      totalVictims,
      activeVictims,
      deceasedVictims,
      minorVictims,
      recentVictims
    ] = await Promise.all([
      Victim.countDocuments({ organisationId }),
      Victim.countDocuments({ organisationId, 'status.isActive': true }),
      Victim.countDocuments({ organisationId, 'status.isDeceased': true }),
      Victim.countDocuments({ organisationId, 'status.isMinor': true }),
      Victim.countDocuments({
        organisationId,
        'metadata.createdAt': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalVictims,
        active: activeVictims,
        deceased: deceasedVictims,
        minors: minorVictims,
        recent: recentVictims
      }
    });
  } catch (error) {
    console.error('Error fetching victim statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching victim statistics'
    });
  }
});

module.exports = router;
