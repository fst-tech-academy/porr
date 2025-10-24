const express = require('express');
const { body, validationResult, query } = require('express-validator');
const AuditService = require('../services/auditService');
const { protect, authorize, organisationContext } = require('../middleware/auth');
const { checkAuditLogging } = require('../middleware/settings');

const router = express.Router();
const AuditEvent = require('../models/AuditEvent');

// @desc    Get all audit events
// @route   GET /api/audit
// @access  Private (Admin and Super Admin)
router.get('/', protect, organisationContext, authorize('admin', 'super_admin'), checkAuditLogging, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('userId').optional().trim().notEmpty().withMessage('User ID cannot be empty'),
  query('action').optional().isIn(['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SEARCH', 'EXPORT', 'IMPORT', 'UPLOAD', 'DOWNLOAD', 'ACCESS_DENIED', 'AUTH_FAILED', 'ERROR']).withMessage('Invalid action'),
  query('entityType').optional().isIn(['User', 'SimCard', 'Dashboard', 'Auth', 'System', 'File']).withMessage('Invalid entity type'),
  query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid severity'),
  query('category').optional().isIn(['SECURITY', 'DATA_MANAGEMENT', 'SYSTEM', 'USER_MANAGEMENT', 'OPERATIONAL']).withMessage('Invalid category'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('sortBy').optional().isIn(['createdAt', 'action', 'entityType', 'severity']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order')
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

    const {
      page,
      limit,
      userId,
      action,
      entityType,
      severity,
      category,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder
    } = req.query;

    const result = await AuditService.getAuditEvents({
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      organisationId: req.organisationId,
      action,
      entityType,
      severity,
      category,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching audit events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit events'
    });
  }
});

// @desc    Get audit statistics
// @route   GET /api/audit/stats
// @access  Private (Admin and Super Admin)
router.get('/stats', protect, organisationContext, authorize('admin', 'super_admin'), checkAuditLogging, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
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

    const { startDate, endDate } = req.query;

    const stats = await AuditService.getAuditStats({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
});

// @desc    Get single audit event
// @route   GET /api/audit/:id
// @access  Private (Admin and Super Admin)
router.get('/:id', protect, organisationContext, authorize('admin', 'super_admin'), checkAuditLogging, async (req, res) => {
  try {
    const event = await AuditEvent.findById(req.params.id)
      .populate('user', 'firstName lastName email role');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Audit event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Error fetching audit event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit event'
    });
  }
});

// @desc    Export audit events to CSV
// @route   GET /api/audit/export
// @access  Private (Admin and Super Admin)
router.get('/export', protect, organisationContext, authorize('admin', 'super_admin'), checkAuditLogging, [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('entityType').optional().isIn(['User', 'SimCard', 'Dashboard', 'Auth', 'System', 'File']).withMessage('Invalid entity type'),
  query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid severity')
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

    const csvData = await AuditService.exportAuditEvents(req.query);

    // Convert to CSV format
    const csvContent = [
      csvData.headers.join(','),
      ...csvData.rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-events.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting audit events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit events'
    });
  }
});

// @desc    Cleanup old audit events
// @route   DELETE /api/audit/cleanup
// @access  Private (Admin and Super Admin)
router.delete('/cleanup', protect, organisationContext, authorize('admin', 'super_admin'), checkAuditLogging, [
  body('retentionDays').optional().isInt({ min: 1, max: 365 }).withMessage('Retention days must be between 1 and 365')
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

    const { retentionDays = 90 } = req.body;

    const result = await AuditService.cleanupAuditEvents(retentionDays);

    res.status(200).json({
      success: true,
      message: `Successfully cleaned up ${result.deletedCount} audit events`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up audit events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup audit events'
    });
  }
});

module.exports = router;
