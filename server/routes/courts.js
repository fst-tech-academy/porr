const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Court = require('../models/Court');

const router = express.Router();

// Get all courts with search and filtering
router.get('/', protect, authorize(['admin', 'manager', 'officer']), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('type').optional().isIn(['supreme_court', 'appeals_court', 'district_court', 'regional_court', 'municipal_court', 'specialized_court', 'military_court', 'other']).withMessage('Invalid court type'),
  query('jurisdiction').optional().isIn(['federal', 'state', 'regional', 'municipal', 'specialized']).withMessage('Invalid jurisdiction'),
  query('level').optional().isIn(['trial', 'appellate', 'supreme', 'administrative']).withMessage('Invalid court level'),
  query('sortBy').optional().isIn(['name', 'code', 'type', 'jurisdiction', 'level', 'metadata.createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['1', '-1']).withMessage('Sort order must be 1 or -1')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type;
    const jurisdiction = req.query.jurisdiction;
    const level = req.query.level;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = parseInt(req.query.sortOrder) || 1;

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      type,
      jurisdiction,
      level
    };

    const courts = await Court.searchCourts(search, req.user.organisationId, options);
    const total = await Court.countDocuments({ organisationId: req.user.organisationId, isActive: true });

    res.json({
      success: true,
      data: {
        courts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch courts');
  }
});

// Get single court
router.get('/:id', protect, authorize(['admin', 'manager', 'officer']), [
  param('id').isMongoId().withMessage('Invalid court ID')
], async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check if user has access to this court
    if (court.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { court }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch court');
  }
});

// Create new court
router.post('/', protect, authorize(['admin', 'manager']), [
  body('name').trim().notEmpty().withMessage('Court name is required'),
  body('code').trim().notEmpty().withMessage('Court code is required'),
  body('type').isIn(['supreme_court', 'appeals_court', 'district_court', 'regional_court', 'municipal_court', 'specialized_court', 'military_court', 'other']).withMessage('Valid court type is required'),
  body('jurisdiction').isIn(['federal', 'state', 'regional', 'municipal', 'specialized']).withMessage('Valid jurisdiction is required'),
  body('level').isIn(['trial', 'appellate', 'supreme', 'administrative']).withMessage('Valid court level is required'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('contactInfo.phone').optional().trim(),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('contactInfo.website').optional().trim(),
  body('operations.businessHours').optional().isObject().withMessage('Business hours must be an object'),
  body('caseManagement.maxCaseLoad').optional().isInt({ min: 1 }).withMessage('Max case load must be a positive integer'),
  body('budget.annual').optional().isNumeric().withMessage('Annual budget must be a number')
], async (req, res) => {
  try {
    const courtData = {
      ...req.body,
      organisationId: req.user.organisationId,
      createdBy: req.user.id
    };

    // Check if court code already exists
    const existingCourt = await Court.findOne({
      code: courtData.code.toUpperCase(),
      organisationId: req.user.organisationId
    });
    
    if (existingCourt) {
      return res.status(400).json({
        success: false,
        message: 'Court with this code already exists'
      });
    }

    // Ensure code is uppercase
    courtData.code = courtData.code.toUpperCase();

    const court = new Court(courtData);
    await court.save();

    const populatedCourt = await Court.findById(court._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Court created successfully',
      data: { court: populatedCourt }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to create court');
  }
});

// Update court
router.put('/:id', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid court ID'),
  body('name').optional().trim().notEmpty().withMessage('Court name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Court code cannot be empty'),
  body('type').optional().isIn(['supreme_court', 'appeals_court', 'district_court', 'regional_court', 'municipal_court', 'specialized_court', 'military_court', 'other']).withMessage('Valid court type is required'),
  body('jurisdiction').optional().isIn(['federal', 'state', 'regional', 'municipal', 'specialized']).withMessage('Valid jurisdiction is required'),
  body('level').optional().isIn(['trial', 'appellate', 'supreme', 'administrative']).withMessage('Valid court level is required'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('caseManagement.maxCaseLoad').optional().isInt({ min: 1 }).withMessage('Max case load must be a positive integer'),
  body('budget.annual').optional().isNumeric().withMessage('Annual budget must be a number')
], async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check if user has access to this court
    if (court.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if code is being changed and if it already exists
    if (req.body.code && req.body.code.toUpperCase() !== court.code) {
      const existingCourt = await Court.findOne({
        code: req.body.code.toUpperCase(),
        organisationId: req.user.organisationId,
        _id: { $ne: court._id }
      });
      
      if (existingCourt) {
        return res.status(400).json({
          success: false,
          message: 'Court with this code already exists'
        });
      }
    }

    // Update court
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    updateData.lastModifiedBy = req.user.id;

    const updatedCourt = await Court.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Court updated successfully',
      data: { court: updatedCourt }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update court');
  }
});

// Add personnel to court
router.post('/:id/personnel', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid court ID'),
  body('type').isIn(['judge', 'clerk', 'prosecutor']).withMessage('Valid personnel type is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('contactInfo.phone').optional().trim(),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('specialization').optional().isArray().withMessage('Specialization must be an array')
], async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check if user has access to this court
    if (court.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const personnelData = {
      name: req.body.name,
      title: req.body.title,
      contactInfo: req.body.contactInfo || {},
      isActive: true
    };

    if (req.body.specialization) {
      personnelData.specialization = req.body.specialization;
    }

    // Add personnel to appropriate array
    if (req.body.type === 'judge') {
      court.personnel.judges.push(personnelData);
    } else if (req.body.type === 'clerk') {
      court.personnel.clerks.push(personnelData);
    } else if (req.body.type === 'prosecutor') {
      court.personnel.prosecutors.push(personnelData);
    }

    court.lastModifiedBy = req.user.id;
    await court.save();

    res.json({
      success: true,
      message: 'Personnel added successfully',
      data: { court }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to add personnel');
  }
});

// Update personnel status
router.patch('/:id/personnel/:personnelId', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid court ID'),
  param('personnelId').isMongoId().withMessage('Invalid personnel ID'),
  body('type').isIn(['judge', 'clerk', 'prosecutor']).withMessage('Valid personnel type is required'),
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check if user has access to this court
    if (court.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const personnelId = new mongoose.Types.ObjectId(req.params.personnelId);
    let personnelArray;

    if (req.body.type === 'judge') {
      personnelArray = court.personnel.judges;
    } else if (req.body.type === 'clerk') {
      personnelArray = court.personnel.clerks;
    } else if (req.body.type === 'prosecutor') {
      personnelArray = court.personnel.prosecutors;
    }

    const personnel = personnelArray.id(personnelId);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }

    personnel.isActive = req.body.isActive;
    court.lastModifiedBy = req.user.id;
    await court.save();

    res.json({
      success: true,
      message: 'Personnel status updated successfully',
      data: { court }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update personnel status');
  }
});

// Toggle court status
router.patch('/:id/toggle-status', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid court ID')
], async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check if user has access to this court
    if (court.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    court.isActive = !court.isActive;
    court.lastModifiedBy = req.user.id;
    await court.save();

    res.json({
      success: true,
      message: `Court ${court.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        court: {
          id: court._id,
          name: court.name,
          code: court.code,
          isActive: court.isActive
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to toggle court status');
  }
});

// Delete court
router.delete('/:id', protect, authorize(['admin']), [
  param('id').isMongoId().withMessage('Invalid court ID')
], async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Check if user has access to this court
    if (court.organisationId.toString() !== req.user.organisationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if court has active cases
    const Case = require('../models/Case');
    const activeCases = await Case.countDocuments({
      'court.courtId': court._id,
      'status.current': { $in: ['open', 'under_investigation', 'charges_pending', 'in_court', 'trial_in_progress'] }
    });

    if (activeCases > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete court. It has ${activeCases} active case(s). Please reassign or close cases first.`
      });
    }

    await Court.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Court deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete court');
  }
});

// Get court statistics
router.get('/stats/overview', protect, authorize(['admin', 'manager', 'officer']), async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    const stats = await Court.getCourtStats(organisationId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch court statistics');
  }
});

// Get court types
router.get('/types/list', protect, authorize(['admin', 'manager', 'officer']), async (req, res) => {
  try {
    const types = [
      { value: 'supreme_court', label: 'Supreme Court', description: 'Highest court in the jurisdiction' },
      { value: 'appeals_court', label: 'Appeals Court', description: 'Court that hears appeals from lower courts' },
      { value: 'district_court', label: 'District Court', description: 'General jurisdiction trial court' },
      { value: 'regional_court', label: 'Regional Court', description: 'Court serving a specific region' },
      { value: 'municipal_court', label: 'Municipal Court', description: 'Local court for municipal matters' },
      { value: 'specialized_court', label: 'Specialized Court', description: 'Court with specialized jurisdiction' },
      { value: 'military_court', label: 'Military Court', description: 'Court for military personnel' },
      { value: 'other', label: 'Other', description: 'Other type of court' }
    ];

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch court types');
  }
});

// Get court jurisdictions
router.get('/jurisdictions/list', protect, authorize(['admin', 'manager', 'officer']), async (req, res) => {
  try {
    const jurisdictions = [
      { value: 'federal', label: 'Federal', description: 'Federal jurisdiction' },
      { value: 'state', label: 'State', description: 'State jurisdiction' },
      { value: 'regional', label: 'Regional', description: 'Regional jurisdiction' },
      { value: 'municipal', label: 'Municipal', description: 'Municipal jurisdiction' },
      { value: 'specialized', label: 'Specialized', description: 'Specialized jurisdiction' }
    ];

    res.json({
      success: true,
      data: jurisdictions
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch court jurisdictions');
  }
});

module.exports = router;
