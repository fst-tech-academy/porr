const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Offender = require('../models/Offender');
const Offence = require('../models/Offence');
const Case = require('../models/Case');

const router = express.Router();

// Get all offenders with search and filtering
router.get('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  query('custodyStatus').optional().isIn(['in_custody', 'released']).withMessage('Invalid custody status'),
  query('offenceType').optional().isMongoId().withMessage('Invalid offence type ID'),
  query('sortBy').optional().isIn(['metadata.createdAt', 'personalInfo.firstName', 'criminalHistory.totalOffences', 'riskAssessment.level']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['1', '-1']).withMessage('Sort order must be 1 or -1')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const riskLevel = req.query.riskLevel;
    const custodyStatus = req.query.custodyStatus;
    const offenceType = req.query.offenceType;
    const sortBy = req.query.sortBy || 'metadata.createdAt';
    const sortOrder = parseInt(req.query.sortOrder) || -1;

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      riskLevel,
      custodyStatus,
      offenceType
    };

    const offenders = await Offender.searchOffenders(search, req.user.organisationId, options);
    const total = await Offender.countDocuments({ organisationId: req.user.organisationId });

    res.json({
      success: true,
      data: {
        offenders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offenders');
  }
});

// Get single offender
router.get('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid offender ID')
], async (req, res) => {
  try {
    const offender = await Offender.findById(req.params.id)
      .populate('criminalHistory.offences.offenceId', 'name code category severity')
      .populate('criminalHistory.offences.caseId', 'caseNumber title status')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!offender) {
      return res.status(404).json({
        success: false,
        message: 'Offender not found'
      });
    }

    // Check if user has access to this offender
    if (offender.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { offender }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offender');
  }
});

// Create new offender
router.post('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  body('personalInfo.firstName').trim().notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('personalInfo.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('personalInfo.gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('personalInfo.nationality').trim().notEmpty().withMessage('Nationality is required'),
  body('personalInfo.nationalId').optional().trim(),
  body('personalInfo.phoneNumber').optional().trim(),
  body('personalInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('address.current.street').optional().trim(),
  body('address.current.city').optional().trim(),
  body('address.current.state').optional().trim(),
  body('familyInfo.maritalStatus').optional().isIn(['single', 'married', 'divorced', 'widowed', 'separated']),
  body('riskAssessment.level').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const offenderData = {
      ...req.body,
      organisationId: req.user.organisationId,
      createdBy: req.user.id
    };

    // Check if national ID already exists
    if (offenderData.personalInfo.nationalId) {
      const existingOffender = await Offender.findOne({
        'personalInfo.nationalId': offenderData.personalInfo.nationalId,
        organisationId: req.user.organisationId
      });
      
      if (existingOffender) {
        return res.status(400).json({
          success: false,
          message: 'Offender with this national ID already exists'
        });
      }
    }

    const offender = new Offender(offenderData);
    await offender.save();

    const populatedOffender = await Offender.findById(offender._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Offender created successfully',
      data: { offender: populatedOffender }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to create offender');
  }
});

// Update offender
router.put('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid offender ID'),
  body('personalInfo.firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('personalInfo.lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('personalInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('personalInfo.gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('personalInfo.nationality').optional().trim().notEmpty().withMessage('Nationality cannot be empty'),
  body('personalInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('riskAssessment.level').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const offender = await Offender.findById(req.params.id);
    
    if (!offender) {
      return res.status(404).json({
        success: false,
        message: 'Offender not found'
      });
    }

    // Check if user has access to this offender
    if (offender.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if national ID is being changed and if it already exists
    if (req.body.personalInfo?.nationalId && 
        req.body.personalInfo.nationalId !== offender.personalInfo.nationalId) {
      const existingOffender = await Offender.findOne({
        'personalInfo.nationalId': req.body.personalInfo.nationalId,
        organisationId: req.user.organisationId,
        _id: { $ne: offender._id }
      });
      
      if (existingOffender) {
        return res.status(400).json({
          success: false,
          message: 'Offender with this national ID already exists'
        });
      }
    }

    // Update offender
    const updateData = { ...req.body };
    updateData.lastModifiedBy = req.user.id;

    const updatedOffender = await Offender.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('criminalHistory.offences.offenceId', 'name code category')
      .populate('criminalHistory.offences.caseId', 'caseNumber title')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Offender updated successfully',
      data: { offender: updatedOffender }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update offender');
  }
});

// Add offence to offender
router.post('/:id/offences', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid offender ID'),
  body('offenceId').isMongoId().withMessage('Valid offence ID is required'),
  body('caseId').isMongoId().withMessage('Valid case ID is required'),
  body('dateCommitted').isISO8601().withMessage('Valid date is required'),
  body('dateArrested').optional().isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['pending', 'convicted', 'acquitted', 'dismissed', 'appealed']).withMessage('Valid status is required'),
  body('sentence').optional().trim(),
  body('fine').optional().isNumeric().withMessage('Fine must be a number'),
  body('communityService').optional().isInt({ min: 0 }).withMessage('Community service must be a positive integer'),
  body('probationPeriod').optional().isInt({ min: 0 }).withMessage('Probation period must be a positive integer'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const offender = await Offender.findById(req.params.id);
    
    if (!offender) {
      return res.status(404).json({
        success: false,
        message: 'Offender not found'
      });
    }

    // Check if user has access to this offender
    if (offender.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify offence exists
    const offence = await Offence.findById(req.body.offenceId);
    if (!offence) {
      return res.status(400).json({
        success: false,
        message: 'Offence not found'
      });
    }

    // Verify case exists
    const caseDoc = await Case.findById(req.body.caseId);
    if (!caseDoc) {
      return res.status(400).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Add offence to offender's criminal history
    const offenceRecord = {
      offenceId: req.body.offenceId,
      caseId: req.body.caseId,
      dateCommitted: req.body.dateCommitted,
      dateArrested: req.body.dateArrested,
      status: req.body.status,
      sentence: req.body.sentence,
      fine: req.body.fine,
      communityService: req.body.communityService,
      probationPeriod: req.body.probationPeriod,
      notes: req.body.notes
    };

    offender.criminalHistory.offences.push(offenceRecord);
    offender.criminalHistory.totalOffences += 1;
    
    // Update first and last offence dates
    if (!offender.criminalHistory.firstOffenceDate || 
        new Date(req.body.dateCommitted) < offender.criminalHistory.firstOffenceDate) {
      offender.criminalHistory.firstOffenceDate = new Date(req.body.dateCommitted);
    }
    
    if (!offender.criminalHistory.lastOffenceDate || 
        new Date(req.body.dateCommitted) > offender.criminalHistory.lastOffenceDate) {
      offender.criminalHistory.lastOffenceDate = new Date(req.body.dateCommitted);
    }

    offender.lastModifiedBy = req.user.id;
    await offender.save();

    const updatedOffender = await Offender.findById(offender._id)
      .populate('criminalHistory.offences.offenceId', 'name code category severity')
      .populate('criminalHistory.offences.caseId', 'caseNumber title status');

    res.json({
      success: true,
      message: 'Offence added to offender successfully',
      data: { offender: updatedOffender }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to add offence to offender');
  }
});

// Update offender status
router.patch('/:id/status', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid offender ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isInCustody').optional().isBoolean().withMessage('isInCustody must be boolean'),
  body('custodyLocation').optional().trim(),
  body('custodyStartDate').optional().isISO8601().withMessage('Valid date is required'),
  body('expectedReleaseDate').optional().isISO8601().withMessage('Valid date is required'),
  body('paroleStatus').optional().isIn(['none', 'eligible', 'on_parole', 'parole_violated', 'completed']),
  body('probationStatus').optional().isIn(['none', 'active', 'completed', 'violated'])
], async (req, res) => {
  try {
    const offender = await Offender.findById(req.params.id);
    
    if (!offender) {
      return res.status(404).json({
        success: false,
        message: 'Offender not found'
      });
    }

    // Check if user has access to this offender
    if (offender.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status fields
    if (req.body.isActive !== undefined) {
      offender.status.isActive = req.body.isActive;
    }
    if (req.body.isInCustody !== undefined) {
      offender.status.isInCustody = req.body.isInCustody;
    }
    if (req.body.custodyLocation) {
      offender.status.custodyLocation = req.body.custodyLocation;
    }
    if (req.body.custodyStartDate) {
      offender.status.custodyStartDate = new Date(req.body.custodyStartDate);
    }
    if (req.body.expectedReleaseDate) {
      offender.status.expectedReleaseDate = new Date(req.body.expectedReleaseDate);
    }
    if (req.body.paroleStatus) {
      offender.status.paroleStatus = req.body.paroleStatus;
    }
    if (req.body.probationStatus) {
      offender.status.probationStatus = req.body.probationStatus;
    }

    offender.lastModifiedBy = req.user.id;
    await offender.save();

    res.json({
      success: true,
      message: 'Offender status updated successfully',
      data: { 
        offender: {
          id: offender._id,
          isActive: offender.status.isActive,
          isInCustody: offender.status.isInCustody,
          custodyLocation: offender.status.custodyLocation,
          paroleStatus: offender.status.paroleStatus,
          probationStatus: offender.status.probationStatus
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update offender status');
  }
});

// Delete offender
router.delete('/:id', protect, authorize(['admin']), [
  param('id').isMongoId().withMessage('Invalid offender ID')
], async (req, res) => {
  try {
    const offender = await Offender.findById(req.params.id);
    
    if (!offender) {
      return res.status(404).json({
        success: false,
        message: 'Offender not found'
      });
    }

    // Check if user has access to this offender
    if (offender.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if offender has active cases
    const activeCases = await Case.countDocuments({
      'offenders.offenderId': offender._id,
      'status.current': { $in: ['open', 'under_investigation', 'charges_pending', 'in_court', 'trial_in_progress'] }
    });

    if (activeCases > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete offender. They have ${activeCases} active case(s). Please close or reassign cases first.`
      });
    }

    await Offender.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Offender deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete offender');
  }
});

// Get offender statistics
router.get('/stats/overview', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    const stats = await Offender.aggregate([
      { $match: { organisationId: new mongoose.Types.ObjectId(organisationId) } },
      {
        $group: {
          _id: null,
          totalOffenders: { $sum: 1 },
          activeOffenders: { $sum: { $cond: ['$status.isActive', 1, 0] } },
          inCustody: { $sum: { $cond: ['$status.isInCustody', 1, 0] } },
          avgOffences: { $avg: '$criminalHistory.totalOffences' },
          riskDistribution: {
            $push: '$riskAssessment.level'
          }
        }
      },
      {
        $project: {
          totalOffenders: 1,
          activeOffenders: 1,
          inCustody: 1,
          released: { $subtract: ['$activeOffenders', '$inCustody'] },
          avgOffences: { $round: ['$avgOffences', 1] },
          riskDistribution: {
            low: { $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'low'] } } } },
            medium: { $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'medium'] } } } },
            high: { $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'high'] } } } },
            critical: { $size: { $filter: { input: '$riskDistribution', cond: { $eq: ['$$this', 'critical'] } } } }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalOffenders: 0,
        activeOffenders: 0,
        inCustody: 0,
        released: 0,
        avgOffences: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offender statistics');
  }
});

module.exports = router;
