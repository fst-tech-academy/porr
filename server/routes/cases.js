const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Case = require('../models/Case');
const Offender = require('../models/Offender');
const Offence = require('../models/Offence');

const router = express.Router();

// Get all cases with search and filtering
router.get('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('status').optional().isIn(['open', 'under_investigation', 'charges_pending', 'in_court', 'trial_in_progress', 'awaiting_sentencing', 'sentenced', 'appealed', 'closed', 'dismissed', 'acquitted']).withMessage('Invalid status'),
  query('caseType').optional().isIn(['criminal', 'civil', 'administrative', 'appeal', 'review', 'investigation', 'other']).withMessage('Invalid case type'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('assignedOfficer').optional().isMongoId().withMessage('Invalid assigned officer ID'),
  query('sortBy').optional().isIn(['metadata.createdAt', 'caseNumber', 'priority', 'status.current']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['1', '-1']).withMessage('Sort order must be 1 or -1')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const caseType = req.query.caseType;
    const priority = req.query.priority;
    const assignedOfficer = req.query.assignedOfficer;
    const sortBy = req.query.sortBy || 'metadata.createdAt';
    const sortOrder = parseInt(req.query.sortOrder) || -1;

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      caseType,
      priority,
      assignedOfficer
    };

    const cases = await Case.searchCases(search, req.user.organisationId, options);
    const total = await Case.countDocuments({ organisationId: req.user.organisationId });

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch cases');
  }
});

// Get single case
router.get('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid case ID')
], async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('offenders.offenderId', 'personalInfo.firstName personalInfo.lastName personalInfo.nationalId personalInfo.dateOfBirth')
      .populate('offences.offenceId', 'name code category severity')
      .populate('investigation.assignedOfficer', 'firstName lastName email')
      .populate('investigation.assignedTeam', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    if (caseDoc.organisationId.toString() !== userOrgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { case: caseDoc }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch case');
  }
});

// Create new case
router.post('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  body('caseNumber').trim().notEmpty().withMessage('Case number is required'),
  body('title').trim().notEmpty().withMessage('Case title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('caseType').isIn(['criminal', 'civil', 'administrative', 'appeal', 'review', 'investigation', 'other']).withMessage('Valid case type is required'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required'),
  body('offenders').isArray({ min: 1 }).withMessage('At least one offender is required'),
  body('offenders.*.offenderId').isMongoId().withMessage('Valid offender ID is required'),
  body('offenders.*.role').isIn(['primary', 'secondary', 'accomplice', 'witness']).withMessage('Valid role is required'),
  body('offences').isArray({ min: 1 }).withMessage('At least one offence is required'),
  body('offences.*.offenceId').isMongoId().withMessage('Valid offence ID is required'),
  body('offences.*.count').optional().isInt({ min: 1 }).withMessage('Count must be a positive integer'),
  body('offences.*.dateCommitted').isISO8601().withMessage('Valid date is required'),
  body('offences.*.location').optional().trim()
], async (req, res) => {
  try {
    const caseData = {
      ...req.body,
      organisationId: req.user.organisationId,
      createdBy: req.user.id
    };

    // Check if case number already exists
    const existingCase = await Case.findOne({
      caseNumber: caseData.caseNumber,
      organisationId: req.user.organisationId
    });
    
    if (existingCase) {
      return res.status(400).json({
        success: false,
        message: 'Case with this number already exists'
      });
    }

    // Verify all offenders exist
    const offenderIds = caseData.offenders.map(o => o.offenderId);
    const offenders = await Offender.find({
      _id: { $in: offenderIds },
      organisationId: req.user.organisationId
    });

    if (offenders.length !== offenderIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more offenders not found'
      });
    }

    // Verify all offences exist
    const offenceIds = caseData.offences.map(o => o.offenceId);
    const offences = await Offence.find({
      _id: { $in: offenceIds },
      organisationId: req.user.organisationId,
      isActive: true
    });

    if (offences.length !== offenceIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more offences not found or inactive'
      });
    }

    // Add initial timeline event
    caseData.timeline = [{
      date: new Date(),
      event: 'case_opened',
      description: 'Case opened and assigned',
      createdBy: req.user.id
    }];

    const caseDoc = new Case(caseData);
    await caseDoc.save();

    const populatedCase = await Case.findById(caseDoc._id)
      .populate('offenders.offenderId', 'personalInfo.firstName personalInfo.lastName personalInfo.nationalId')
      .populate('offences.offenceId', 'name code category')
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: { case: populatedCase }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to create case');
  }
});

// Update case
router.put('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid case ID'),
  body('title').optional().trim().notEmpty().withMessage('Case title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('caseType').optional().isIn(['criminal', 'civil', 'administrative', 'appeal', 'review', 'investigation', 'other']).withMessage('Valid case type is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required')
], async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    if (caseDoc.organisationId.toString() !== userOrgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update case
    const updateData = { ...req.body };
    updateData.lastModifiedBy = req.user.id;

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('offenders.offenderId', 'personalInfo.firstName personalInfo.lastName personalInfo.nationalId')
      .populate('offences.offenceId', 'name code category')
      .populate('investigation.assignedOfficer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Case updated successfully',
      data: { case: updatedCase }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update case');
  }
});

// Update case status
router.patch('/:id/status', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid case ID'),
  body('status').isIn(['open', 'under_investigation', 'charges_pending', 'in_court', 'trial_in_progress', 'awaiting_sentencing', 'sentenced', 'appealed', 'closed', 'dismissed', 'acquitted']).withMessage('Valid status is required'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    if (caseDoc.organisationId.toString() !== userOrgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const oldStatus = caseDoc.status.current;
    const newStatus = req.body.status;

    // Update status
    caseDoc.status.current = newStatus;
    caseDoc.status.previous.push({
      status: oldStatus,
      dateChanged: new Date(),
      changedBy: req.user.id,
      reason: req.body.reason || 'Status updated'
    });

    // Add timeline event
    caseDoc.timeline.push({
      date: new Date(),
      event: 'status_changed',
      description: `Case status changed from ${oldStatus} to ${newStatus}`,
      createdBy: req.user.id
    });

    caseDoc.lastModifiedBy = req.user.id;
    await caseDoc.save();

    res.json({
      success: true,
      message: 'Case status updated successfully',
      data: { 
        case: {
          id: caseDoc._id,
          caseNumber: caseDoc.caseNumber,
          status: caseDoc.status.current
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update case status');
  }
});

// Assign case to officer
router.patch('/:id/assign', protect, authorize(['admin', 'manager']), [
  param('id').isMongoId().withMessage('Invalid case ID'),
  body('assignedOfficer').isMongoId().withMessage('Valid officer ID is required'),
  body('assignedTeam').optional().isArray().withMessage('Assigned team must be an array'),
  body('assignedTeam.*').optional().isMongoId().withMessage('Valid team member ID is required')
], async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    if (caseDoc.organisationId.toString() !== userOrgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update assignment
    caseDoc.investigation.assignedOfficer = req.body.assignedOfficer;
    if (req.body.assignedTeam) {
      caseDoc.investigation.assignedTeam = req.body.assignedTeam;
    }

    // Add timeline event
    caseDoc.timeline.push({
      date: new Date(),
      event: 'case_assigned',
      description: 'Case assigned to investigation team',
      createdBy: req.user.id
    });

    caseDoc.lastModifiedBy = req.user.id;
    await caseDoc.save();

    const updatedCase = await Case.findById(caseDoc._id)
      .populate('investigation.assignedOfficer', 'firstName lastName email')
      .populate('investigation.assignedTeam', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Case assigned successfully',
      data: { case: updatedCase }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to assign case');
  }
});

// Add timeline event
router.post('/:id/timeline', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid case ID'),
  body('event').isIn(['case_opened', 'investigation_started', 'arrest_made', 'charges_filed', 'arraignment', 'preliminary_hearing', 'trial_started', 'trial_completed', 'sentencing', 'appeal_filed', 'case_closed', 'other']).withMessage('Valid event type is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('location').optional().trim(),
  body('participants').optional().isArray().withMessage('Participants must be an array'),
  body('documents').optional().isArray().withMessage('Documents must be an array')
], async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    if (caseDoc.organisationId.toString() !== userOrgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add timeline event
    const timelineEvent = {
      date: req.body.date ? new Date(req.body.date) : new Date(),
      event: req.body.event,
      description: req.body.description,
      location: req.body.location,
      participants: req.body.participants || [],
      documents: req.body.documents || [],
      createdBy: req.user.id
    };

    caseDoc.timeline.push(timelineEvent);
    caseDoc.lastModifiedBy = req.user.id;
    await caseDoc.save();

    res.json({
      success: true,
      message: 'Timeline event added successfully',
      data: { 
        case: {
          id: caseDoc._id,
          caseNumber: caseDoc.caseNumber,
          timeline: caseDoc.timeline
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to add timeline event');
  }
});

// Delete case
router.delete('/:id', protect, authorize(['admin']), [
  param('id').isMongoId().withMessage('Invalid case ID')
], async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user has access to this case
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    if (caseDoc.organisationId.toString() !== userOrgId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if case is still active
    if (['open', 'under_investigation', 'charges_pending', 'in_court', 'trial_in_progress'].includes(caseDoc.status.current)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active case. Please close the case first.'
      });
    }

    await Case.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete case');
  }
});

// Get case statistics
router.get('/stats/overview', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    const organisationId = req.user.organisationId;

    const stats = await Case.getCaseStats(organisationId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch case statistics');
  }
});

module.exports = router;
