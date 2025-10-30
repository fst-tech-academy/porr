const express = require('express');
const { body, validationResult } = require('express-validator');
const OffenderOffence = require('../models/OffenderOffence');
const Offender = require('../models/Offender');
const OffenceCatalogue = require('../models/OffenceCatalogue');
const Victim = require('../models/Victim');
const { protect } = require('../middleware/auth');
const roleHierarchy = require('../middleware/roleHierarchy');
const { checkUserManagement } = require('../middleware/settings');

const router = express.Router();

// Validation rules
const offenderOffenceValidationRules = [
  body('crimeInfo.caseNumber').trim().notEmpty().withMessage('Case number is required'),
  body('crimeInfo.title').trim().notEmpty().withMessage('Crime title is required'),
  body('crimeInfo.description').trim().notEmpty().withMessage('Crime description is required'),
  body('crimeInfo.category').trim().notEmpty().withMessage('Crime category is required'),
  body('dateTime.dateCommitted').isISO8601().withMessage('Valid date committed is required'),
  body('dateTime.dateReported').isISO8601().withMessage('Valid date reported is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('location.country').trim().notEmpty().withMessage('Country is required'),
  body('offender').isMongoId().withMessage('Valid offender ID is required'),
  body('offenceCatalogue').isMongoId().withMessage('Valid offence catalogue ID is required'),
  body('legal.severity').isIn(['minor', 'moderate', 'serious', 'major', 'felony']).withMessage('Valid severity is required'),
  body('legal.status').isIn(['reported', 'under_investigation', 'charged', 'trial', 'convicted', 'acquitted', 'dismissed', 'plea_bargain']).withMessage('Valid status is required')
];

// Get all offender offences (crimes)
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      severity = 'all',
      offender = '',
      offence = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'dateTime.dateCommitted',
      sortOrder = 'desc'
    } = req.query;

    const query = { organisationId: req.user.organisationId };

    // Search filter
    if (search) {
      query.$or = [
        { 'crimeInfo.caseNumber': { $regex: search, $options: 'i' } },
        { 'crimeInfo.title': { $regex: search, $options: 'i' } },
        { 'crimeInfo.description': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query['legal.status'] = status;
    }

    // Severity filter
    if (severity !== 'all') {
      query['legal.severity'] = severity;
    }

    // Offender filter
    if (offender) {
      query.offender = offender;
    }

    // Offence catalogue filter
    if (offence) {
      query.offenceCatalogue = offence;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query['dateTime.dateCommitted'] = {};
      if (dateFrom) {
        query['dateTime.dateCommitted'].$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query['dateTime.dateCommitted'].$lte = new Date(dateTo);
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const crimes = await OffenderOffence.find(query)
      .populate('offender', 'personalInfo.firstName personalInfo.lastName offenderId')
      .populate('offenceCatalogue', 'name code category')
      .populate('victims.victim', 'personalInfo.firstName personalInfo.lastName caseInfo.victimId')
      .populate('legal.court', 'name code type')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await OffenderOffence.countDocuments(query);

    res.json({
      success: true,
      data: crimes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching crimes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crimes'
    });
  }
});

// Get crime by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const crime = await OffenderOffence.findOne({
      _id: req.params.id,
      organisationId: req.user.organisationId
    })
      .populate('offender', 'personalInfo.firstName personalInfo.lastName offenderId personalInfo.dateOfBirth')
      .populate('offenceCatalogue', 'name code category description')
      .populate('victims.victim', 'personalInfo.firstName personalInfo.lastName caseInfo.victimId personalInfo.dateOfBirth')
      .populate('legal.court', 'name code type address')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!crime) {
      return res.status(404).json({
        success: false,
        message: 'Crime not found'
      });
    }

    res.json({
      success: true,
      data: crime
    });
  } catch (error) {
    console.error('Error fetching crime:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crime'
    });
  }
});

// Create new crime
router.post('/', protect, checkUserManagement, offenderOffenceValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify offender exists and belongs to organization
    const offender = await Offender.findOne({
      _id: req.body.offender,
      organisationId: req.user.organisationId
    });

    if (!offender) {
      return res.status(400).json({
        success: false,
        message: 'Offender not found or does not belong to your organization'
      });
    }

    // Verify offence catalogue exists
    const offenceCatalogue = await OffenceCatalogue.findOne({
      _id: req.body.offenceCatalogue,
      organisationId: req.user.organisationId
    });

    if (!offenceCatalogue) {
      return res.status(400).json({
        success: false,
        message: 'Offence catalogue not found or does not belong to your organization'
      });
    }

    // Verify victims exist and belong to organization
    if (req.body.victims && req.body.victims.length > 0) {
      const victimIds = req.body.victims.map(v => v.victim);
      const victims = await Victim.find({
        _id: { $in: victimIds },
        organisationId: req.user.organisationId
      });

      if (victims.length !== victimIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more victims not found or do not belong to your organization'
        });
      }
    }

    const crimeData = {
      ...req.body,
      organisationId: req.user.organisationId,
      createdBy: req.user.id
    };

    const crime = new OffenderOffence(crimeData);
    await crime.save();

    // Update offender's criminal history
    await Offender.findByIdAndUpdate(req.body.offender, {
      $push: {
        'criminalHistory.offences': {
          offenceCatalogueId: req.body.offenceCatalogue,
          dateCommitted: req.body.dateTime.dateCommitted,
          dateArrested: req.body.dateTime.dateArrested,
          location: req.body.location.city + ', ' + req.body.location.state,
          status: req.body.legal.status,
          severity: req.body.legal.severity,
          notes: req.body.notes
        }
      },
      $inc: { 'criminalHistory.totalOffences': 1 },
      $set: {
        'criminalHistory.lastOffenceDate': req.body.dateTime.dateCommitted,
        'criminalHistory.firstOffenceDate': offender.criminalHistory.firstOffenceDate || req.body.dateTime.dateCommitted
      }
    });

    await crime.populate('offender', 'personalInfo.firstName personalInfo.lastName offenderId');
    await crime.populate('offenceCatalogue', 'name code category');
    await crime.populate('victims.victim', 'personalInfo.firstName personalInfo.lastName caseInfo.victimId');
    await crime.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Crime recorded successfully',
      data: crime
    });
  } catch (error) {
    console.error('Error creating crime:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating crime'
    });
  }
});

// Update crime
router.put('/:id', protect, offenderOffenceValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const crime = await OffenderOffence.findOne({
      _id: req.params.id,
      organisationId: req.user.organisationId
    });

    if (!crime) {
      return res.status(404).json({
        success: false,
        message: 'Crime not found'
      });
    }

    // Check if user can modify this crime
    if (!roleHierarchy.canModifyResource(req.user, crime.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this crime'
      });
    }

    Object.assign(crime, req.body);
    crime.lastModifiedBy = req.user.id;
    await crime.save();

    await crime.populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Crime updated successfully',
      data: crime
    });
  } catch (error) {
    console.error('Error updating crime:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating crime'
    });
  }
});

// Delete crime
router.delete('/:id', protect, async (req, res) => {
  try {
    const crime = await OffenderOffence.findOne({
      _id: req.params.id,
      organisationId: req.user.organisationId
    });

    if (!crime) {
      return res.status(404).json({
        success: false,
        message: 'Crime not found'
      });
    }

    // Check if user can delete this crime
    if (!roleHierarchy.canModifyResource(req.user, crime.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this crime'
      });
    }

    // Update offender's criminal history
    await Offender.findByIdAndUpdate(crime.offender, {
      $pull: {
        'criminalHistory.offences': { offenceCatalogueId: crime.offenceCatalogue }
      },
      $inc: { 'criminalHistory.totalOffences': -1 }
    });

    await OffenderOffence.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Crime deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting crime:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting crime'
    });
  }
});

// Get crimes by offender
router.get('/offender/:offenderId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'dateTime.dateCommitted', sortOrder = 'desc' } = req.query;

    const query = {
      offender: req.params.offenderId,
      organisationId: req.user.organisationId
    };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const crimes = await OffenderOffence.find(query)
      .populate('offenceCatalogue', 'name code category')
      .populate('victims.victim', 'personalInfo.firstName personalInfo.lastName caseInfo.victimId')
      .populate('legal.court', 'name code type')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await OffenderOffence.countDocuments(query);

    res.json({
      success: true,
      data: crimes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching offender crimes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offender crimes'
    });
  }
});

// Get crime statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    const [
      totalCrimes,
      recentCrimes,
      crimesByStatus,
      crimesBySeverity,
      crimesByMonth
    ] = await Promise.all([
      OffenderOffence.countDocuments({ organisationId }),
      OffenderOffence.countDocuments({
        organisationId,
        'dateTime.dateCommitted': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      OffenderOffence.aggregate([
        { $match: { organisationId } },
        { $group: { _id: '$legal.status', count: { $sum: 1 } } }
      ]),
      OffenderOffence.aggregate([
        { $match: { organisationId } },
        { $group: { _id: '$legal.severity', count: { $sum: 1 } } }
      ]),
      OffenderOffence.aggregate([
        { $match: { organisationId } },
        {
          $group: {
            _id: {
              year: { $year: '$dateTime.dateCommitted' },
              month: { $month: '$dateTime.dateCommitted' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalCrimes,
        recent: recentCrimes,
        byStatus: crimesByStatus,
        bySeverity: crimesBySeverity,
        byMonth: crimesByMonth
      }
    });
  } catch (error) {
    console.error('Error fetching crime statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crime statistics'
    });
  }
});

module.exports = router;
