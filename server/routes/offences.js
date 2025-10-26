const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Offence = require('../models/Offence');

const router = express.Router();

// Get all offences with search and filtering
router.get('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('category').optional().isIn(['violent_crime', 'property_crime', 'drug_offence', 'white_collar_crime', 'cyber_crime', 'traffic_violation', 'public_order', 'sexual_offence', 'terrorism', 'other']).withMessage('Invalid category'),
  query('severity').optional().isIn(['minor', 'moderate', 'serious', 'major', 'felony']).withMessage('Invalid severity'),
  query('sortBy').optional().isIn(['name', 'code', 'category', 'severity', 'metadata.createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['1', '-1']).withMessage('Sort order must be 1 or -1')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category;
    const severity = req.query.severity;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = parseInt(req.query.sortOrder) || 1;

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      category,
      severity
    };

    const offences = await Offence.searchOffences(search, req.user.organisationId, options);
    const total = await Offence.countDocuments({ organisationId: req.user.organisationId, isActive: true });

    res.json({
      success: true,
      data: {
        offences,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offences');
  }
});

// Get single offence
router.get('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid offence ID')
], async (req, res) => {
  try {
    const offence = await Offence.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!offence) {
      return res.status(404).json({
        success: false,
        message: 'Offence not found'
      });
    }

    // Check if user has access to this offence
    if (offence.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { offence }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offence');
  }
});

// Create new offence
router.post('/', protect, authorize(['admin', 'manager']), [
  body('name').trim().notEmpty().withMessage('Offence name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('code').trim().notEmpty().withMessage('Offence code is required'),
  body('category').isIn(['violent_crime', 'property_crime', 'drug_offence', 'white_collar_crime', 'cyber_crime', 'traffic_violation', 'public_order', 'sexual_offence', 'terrorism', 'other']).withMessage('Valid category is required'),
  body('severity').isIn(['minor', 'moderate', 'serious', 'major', 'felony']).withMessage('Valid severity is required'),
  body('legalDefinition').trim().notEmpty().withMessage('Legal definition is required'),
  body('penalties.minimumSentence').optional().trim(),
  body('penalties.maximumSentence').optional().trim(),
  body('penalties.fineRange.minimum').optional().isNumeric().withMessage('Minimum fine must be a number'),
  body('penalties.fineRange.maximum').optional().isNumeric().withMessage('Maximum fine must be a number'),
  body('penalties.communityService.minimum').optional().isInt({ min: 0 }).withMessage('Minimum community service must be a positive integer'),
  body('penalties.communityService.maximum').optional().isInt({ min: 0 }).withMessage('Maximum community service must be a positive integer'),
  body('penalties.probation.minimum').optional().isInt({ min: 0 }).withMessage('Minimum probation must be a positive integer'),
  body('penalties.probation.maximum').optional().isInt({ min: 0 }).withMessage('Maximum probation must be a positive integer')
], async (req, res) => {
  try {
    const offenceData = {
      ...req.body,
      organisationId: req.user.organisationId,
      createdBy: req.user.id
    };

    // Check if offence code already exists
    const existingOffence = await Offence.findOne({
      code: offenceData.code.toUpperCase(),
      organisationId: req.user.organisationId
    });
    
    if (existingOffence) {
      return res.status(400).json({
        success: false,
        message: 'Offence with this code already exists'
      });
    }

    // Ensure code is uppercase
    offenceData.code = offenceData.code.toUpperCase();

    const offence = new Offence(offenceData);
    await offence.save();

    const populatedOffence = await Offence.findById(offence._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Offence created successfully',
      data: { offence: populatedOffence }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to create offence');
  }
});

// Update offence
router.put('/:id', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid offence ID'),
  body('name').optional().trim().notEmpty().withMessage('Offence name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Offence code cannot be empty'),
  body('category').optional().isIn(['violent_crime', 'property_crime', 'drug_offence', 'white_collar_crime', 'cyber_crime', 'traffic_violation', 'public_order', 'sexual_offence', 'terrorism', 'other']).withMessage('Valid category is required'),
  body('severity').optional().isIn(['minor', 'moderate', 'serious', 'major', 'felony']).withMessage('Valid severity is required'),
  body('legalDefinition').optional().trim().notEmpty().withMessage('Legal definition cannot be empty')
], async (req, res) => {
  try {
    const offence = await Offence.findById(req.params.id);
    
    if (!offence) {
      return res.status(404).json({
        success: false,
        message: 'Offence not found'
      });
    }

    // Check if user has access to this offence
    if (offence.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if code is being changed and if it already exists
    if (req.body.code && req.body.code.toUpperCase() !== offence.code) {
      const existingOffence = await Offence.findOne({
        code: req.body.code.toUpperCase(),
        organisationId: req.user.organisationId,
        _id: { $ne: offence._id }
      });
      
      if (existingOffence) {
        return res.status(400).json({
          success: false,
          message: 'Offence with this code already exists'
        });
      }
    }

    // Update offence
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    updateData.lastModifiedBy = req.user.id;

    const updatedOffence = await Offence.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Offence updated successfully',
      data: { offence: updatedOffence }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update offence');
  }
});

// Toggle offence status
router.patch('/:id/toggle-status', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid offence ID')
], async (req, res) => {
  try {
    const offence = await Offence.findById(req.params.id);
    
    if (!offence) {
      return res.status(404).json({
        success: false,
        message: 'Offence not found'
      });
    }

    // Check if user has access to this offence
    if (offence.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    offence.isActive = !offence.isActive;
    offence.lastModifiedBy = req.user.id;
    
    if (!offence.isActive) {
      offence.repealedDate = new Date();
      offence.repealedReason = 'Deactivated by administrator';
    } else {
      offence.repealedDate = undefined;
      offence.repealedReason = undefined;
    }
    
    await offence.save();

    res.json({
      success: true,
      message: `Offence ${offence.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        offence: {
          id: offence._id,
          name: offence.name,
          code: offence.code,
          isActive: offence.isActive
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to toggle offence status');
  }
});

// Delete offence
router.delete('/:id', protect, authorize(['admin']), [
  param('id').isMongoId().withMessage('Invalid offence ID')
], async (req, res) => {
  try {
    const offence = await Offence.findById(req.params.id);
    
    if (!offence) {
      return res.status(404).json({
        success: false,
        message: 'Offence not found'
      });
    }

    // Check if user has access to this offence
    if (offence.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if offence is being used in any cases or offender records
    const Offender = require('../models/Offender');
    const Case = require('../models/Case');
    
    const offenderCount = await Offender.countDocuments({
      'criminalHistory.offences.offenceId': offence._id,
      organisationId: req.user.organisationId
    });

    const caseCount = await Case.countDocuments({
      'offences.offenceId': offence._id,
      organisationId: req.user.organisationId
    });

    if (offenderCount > 0 || caseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete offence. It is being used in ${offenderCount + caseCount} record(s). Please deactivate instead.`
      });
    }

    await Offence.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Offence deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete offence');
  }
});

// Get offence statistics
router.get('/stats/overview', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    const stats = await Offence.getOffenceStats(organisationId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offence statistics');
  }
});

// Get offence categories
router.get('/categories/list', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    const categories = [
      { value: 'violent_crime', label: 'Violent Crime', description: 'Crimes involving physical harm or threat of harm' },
      { value: 'property_crime', label: 'Property Crime', description: 'Crimes against property such as theft, burglary, vandalism' },
      { value: 'drug_offence', label: 'Drug Offence', description: 'Crimes related to illegal drugs and substances' },
      { value: 'white_collar_crime', label: 'White Collar Crime', description: 'Non-violent crimes committed for financial gain' },
      { value: 'cyber_crime', label: 'Cyber Crime', description: 'Crimes committed using computers or the internet' },
      { value: 'traffic_violation', label: 'Traffic Violation', description: 'Violations of traffic laws and regulations' },
      { value: 'public_order', label: 'Public Order', description: 'Crimes that disturb public peace and order' },
      { value: 'sexual_offence', label: 'Sexual Offence', description: 'Crimes of a sexual nature' },
      { value: 'terrorism', label: 'Terrorism', description: 'Acts of terrorism and related offences' },
      { value: 'other', label: 'Other', description: 'Other types of offences not covered above' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offence categories');
  }
});

// Get offence severities
router.get('/severities/list', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    const severities = [
      { value: 'minor', label: 'Minor', description: 'Minor offences with minimal penalties', color: 'green' },
      { value: 'moderate', label: 'Moderate', description: 'Moderate offences with standard penalties', color: 'yellow' },
      { value: 'serious', label: 'Serious', description: 'Serious offences with significant penalties', color: 'orange' },
      { value: 'major', label: 'Major', description: 'Major offences with severe penalties', color: 'red' },
      { value: 'felony', label: 'Felony', description: 'Felony offences with maximum penalties', color: 'purple' }
    ];

    res.json({
      success: true,
      data: severities
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch offence severities');
  }
});

module.exports = router;
