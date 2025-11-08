const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Department = require('../models/Department');

const router = express.Router();

// Get all departments with search and filtering
router.get('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('type').optional().isIn(['investigation', 'forensics', 'intelligence', 'operations', 'administration', 'training', 'support', 'other']).withMessage('Invalid department type'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
  query('sortBy').optional().isIn(['metadata.createdAt', 'name', 'code', 'type']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['1', '-1']).withMessage('Sort order must be 1 or -1')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const sortBy = req.query.sortBy || 'metadata.createdAt';
    const sortOrder = parseInt(req.query.sortOrder) || -1;

    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      type,
      isActive
    };

    const departments = await Department.searchDepartments(search, userOrgId, options);
    const total = await Department.countDocuments({ organisationId: userOrgId });

    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch departments');
  }
});

// Get single department
router.get('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid department ID')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const department = await Department.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    })
      .populate('leadership.head', 'firstName lastName email')
      .populate('leadership.deputyHead', 'firstName lastName email')
      .populate('leadership.supervisors', 'firstName lastName email')
      .populate('parentDepartment', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch department');
  }
});

// Create new department
router.post('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
  body('type').isIn(['investigation', 'forensics', 'intelligence', 'operations', 'administration', 'training', 'support', 'other']).withMessage('Valid department type is required'),
  body('description').optional().trim(),
  body('parentDepartment').optional().isMongoId().withMessage('Invalid parent department ID'),
  body('location.address.street').optional().trim(),
  body('location.address.city').optional().trim(),
  body('location.address.state').optional().trim(),
  body('contactInfo.phone').optional().trim(),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const departmentData = {
      ...req.body,
      organisationId: userOrgId,
      createdBy: req.user.id
    };
    
    // Handle parentDepartment: convert empty string to null
    if (departmentData.parentDepartment === '' || departmentData.parentDepartment === null) {
      departmentData.parentDepartment = null;
    }

    // Check if code already exists
    if (departmentData.code) {
      const existingDepartment = await Department.findOne({
        code: departmentData.code.toUpperCase(),
        organisationId: userOrgId
      });
      
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
    }

    // Ensure code is uppercase
    if (departmentData.code) {
      departmentData.code = departmentData.code.toUpperCase();
    }

    const department = new Department(departmentData);
    await department.save();

    const populatedDepartment = await Department.findById(department._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('parentDepartment', 'name code');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department: populatedDepartment }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to create department');
  }
});

// Update department
router.put('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid department ID'),
  body('name').optional().trim().notEmpty().withMessage('Department name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Department code cannot be empty'),
  body('type').optional().isIn(['investigation', 'forensics', 'intelligence', 'operations', 'administration', 'training', 'support', 'other']),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const department = await Department.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if code is being changed and if it already exists
    if (req.body.code && req.body.code.toUpperCase() !== department.code) {
      const existingDepartment = await Department.findOne({
        code: req.body.code.toUpperCase(),
        organisationId: userOrgId,
        _id: { $ne: department._id }
      });
      
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
    }

    // Update department
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    // Handle parentDepartment: convert empty string to null
    if (updateData.parentDepartment === '' || updateData.parentDepartment === null) {
      updateData.parentDepartment = null;
    }
    updateData.lastModifiedBy = req.user.id;

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('leadership.head', 'firstName lastName email')
      .populate('leadership.deputyHead', 'firstName lastName email')
      .populate('leadership.supervisors', 'firstName lastName email')
      .populate('parentDepartment', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department: updatedDepartment }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update department');
  }
});

// Update department status
router.patch('/:id/status', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid department ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const department = await Department.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Update status
    if (req.body.isActive !== undefined) {
      department.status.isActive = req.body.isActive;
    }

    department.lastModifiedBy = req.user.id;
    await department.save();

    res.json({
      success: true,
      message: 'Department status updated successfully',
      data: { 
        department: {
          id: department._id,
          isActive: department.status.isActive
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update department status');
  }
});

// Delete department
router.delete('/:id', protect, authorize(['admin']), [
  param('id').isMongoId().withMessage('Invalid department ID')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const department = await Department.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active agents (if Agent model exists)
    // This check can be added later when Agent model is created

    // Check if department has child departments
    const childDepartments = await Department.countDocuments({
      parentDepartment: department._id
    });

    if (childDepartments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${childDepartments} child department(s). Please reassign or delete child departments first.`
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete department');
  }
});

// Get department statistics
router.get('/stats/overview', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const organisationId = new mongoose.Types.ObjectId(userOrgId);

    const stats = await Department.aggregate([
      { $match: { organisationId: organisationId } },
      {
        $group: {
          _id: null,
          totalDepartments: { $sum: 1 },
          activeDepartments: { $sum: { $cond: ['$status.isActive', 1, 0] } },
          typeDistribution: {
            $push: '$type'
          }
        }
      },
      {
        $project: {
          totalDepartments: 1,
          activeDepartments: 1,
          inactiveDepartments: { $subtract: ['$totalDepartments', '$activeDepartments'] },
          typeDistribution: {
            investigation: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'investigation'] } } } },
            forensics: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'forensics'] } } } },
            intelligence: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'intelligence'] } } } },
            operations: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'operations'] } } } },
            administration: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'administration'] } } } },
            training: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'training'] } } } },
            support: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'support'] } } } },
            other: { $size: { $filter: { input: '$typeDistribution', cond: { $eq: ['$$this', 'other'] } } } }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalDepartments: 0,
        activeDepartments: 0,
        inactiveDepartments: 0,
        typeDistribution: { investigation: 0, forensics: 0, intelligence: 0, operations: 0, administration: 0, training: 0, support: 0, other: 0 }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch department statistics');
  }
});

module.exports = router;

