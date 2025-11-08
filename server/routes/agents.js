const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Agent = require('../models/Agent');
const User = require('../models/User');

const router = express.Router();

// Get all agents with search and filtering
router.get('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('rank').optional().isIn(['detective', 'senior_detective', 'supervisor', 'commander', 'director']).withMessage('Invalid rank'),
  query('status').optional().isIn(['active', 'on_leave', 'suspended', 'retired', 'transferred']).withMessage('Invalid status'),
  query('department').optional().isMongoId().withMessage('Invalid department ID'),
  query('isActive').optional().isIn(['true', 'false']).withMessage('isActive must be true or false'),
  query('sortBy').optional().isIn(['metadata.createdAt', 'agentId', 'pseudonym.firstName', 'rank']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['1', '-1']).withMessage('Sort order must be 1 or -1')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const rank = req.query.rank;
    const status = req.query.status;
    const department = req.query.department;
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
      rank,
      status,
      department,
      isActive
    };

    const agents = await Agent.searchAgents(search, userOrgId, options);
    const total = await Agent.countDocuments({ organisationId: userOrgId });

    res.json({
      success: true,
      data: {
        agents,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch agents');
  }
});

// Get single agent
router.get('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid agent ID')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const agent = await Agent.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    })
      .populate('department', 'name code')
      .populate('user', 'firstName lastName email username')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: { agent }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch agent');
  }
});

// Create new agent
router.post('/', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  body('pseudonym.firstName').trim().notEmpty().withMessage('Pseudonym first name is required'),
  body('pseudonym.lastName').trim().notEmpty().withMessage('Pseudonym last name is required'),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('rank').isIn(['detective', 'senior_detective', 'supervisor', 'commander', 'director']).withMessage('Valid rank is required'),
  body('specialization').optional().isIn(['homicide', 'narcotics', 'fraud', 'cybercrime', 'terrorism', 'organized_crime', 'general', 'other']),
  body('employmentDate').isISO8601().withMessage('Valid employment date is required'),
  body('status').optional().isIn(['active', 'on_leave', 'suspended', 'retired', 'transferred']),
  body('clearanceLevel').optional().isIn(['confidential', 'secret', 'top_secret']),
  body('user').optional().isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const agentData = {
      ...req.body,
      organisationId: userOrgId,
      createdBy: req.user.id
    };

    // Verify department exists and belongs to organisation
    const Department = require('../models/Department');
    const department = await Department.findOne({
      _id: agentData.department,
      organisationId: userOrgId
    });

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department not found or does not belong to your organisation'
      });
    }

    // If user is provided, verify it exists and doesn't already have an agent
    if (agentData.user) {
      const existingUser = await User.findById(agentData.user);
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user already has an agent
      const existingAgent = await Agent.findOne({ user: agentData.user });
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: 'User already has an agent assigned'
        });
      }

      // Verify user belongs to same organisation
      const userOrgIdCheck = existingUser.organisationId._id || existingUser.organisationId;
      if (userOrgIdCheck.toString() !== userOrgId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'User does not belong to your organisation'
        });
      }
    }

    // agentId will be auto-generated in pre-save middleware
    const agent = new Agent(agentData);
    await agent.save();

    // Update user's agent reference if provided
    if (agentData.user) {
      await User.findByIdAndUpdate(agentData.user, { agent: agent._id });
    }

    const populatedAgent = await Agent.findById(agent._id)
      .populate('department', 'name code')
      .populate('user', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: { agent: populatedAgent }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to create agent');
  }
});

// Update agent
router.put('/:id', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  body('pseudonym.firstName').optional().trim().notEmpty().withMessage('Pseudonym first name cannot be empty'),
  body('pseudonym.lastName').optional().trim().notEmpty().withMessage('Pseudonym last name cannot be empty'),
  body('department').optional().isMongoId().withMessage('Invalid department ID'),
  body('rank').optional().isIn(['detective', 'senior_detective', 'supervisor', 'commander', 'director']),
  body('status').optional().isIn(['active', 'on_leave', 'suspended', 'retired', 'transferred'])
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const agent = await Agent.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // If department is being changed, verify it exists
    if (req.body.department && req.body.department !== agent.department.toString()) {
      const Department = require('../models/Department');
      const department = await Department.findOne({
        _id: req.body.department,
        organisationId: userOrgId
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found or does not belong to your organisation'
        });
      }
    }

    // If user is being changed, handle the relationship
    if (req.body.user !== undefined) {
      // Remove agent reference from old user
      if (agent.user) {
        await User.findByIdAndUpdate(agent.user, { $unset: { agent: 1 } });
      }

      // Set agent reference on new user
      if (req.body.user) {
        const existingUser = await User.findById(req.body.user);
        if (!existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User not found'
          });
        }

        // Check if user already has an agent
        const existingAgent = await Agent.findOne({ 
          user: req.body.user,
          _id: { $ne: agent._id }
        });
        if (existingAgent) {
          return res.status(400).json({
            success: false,
            message: 'User already has an agent assigned'
          });
        }

        await User.findByIdAndUpdate(req.body.user, { agent: agent._id });
      }
    }

    // Update agent
    const updateData = { ...req.body };
    updateData.lastModifiedBy = req.user.id;

    // Don't allow agentId to be changed
    delete updateData.agentId;

    const updatedAgent = await Agent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('user', 'firstName lastName email username')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: { agent: updatedAgent }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update agent');
  }
});

// Update agent status
router.patch('/:id/status', protect, authorize('admin', 'manager', 'officer', 'super_admin'), [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('onDuty').optional().isBoolean().withMessage('onDuty must be boolean'),
  body('availability').optional().isIn(['available', 'on_case', 'on_leave', 'off_duty']).withMessage('Invalid availability status'),
  body('status').optional().isIn(['active', 'on_leave', 'suspended', 'retired', 'transferred']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const agent = await Agent.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update status fields
    if (req.body.isActive !== undefined) {
      agent.statusInfo.isActive = req.body.isActive;
    }
    if (req.body.onDuty !== undefined) {
      agent.statusInfo.onDuty = req.body.onDuty;
    }
    if (req.body.availability !== undefined) {
      agent.statusInfo.availability = req.body.availability;
    }
    if (req.body.status !== undefined) {
      agent.status = req.body.status;
    }

    agent.lastModifiedBy = req.user.id;
    await agent.save();

    res.json({
      success: true,
      message: 'Agent status updated successfully',
      data: { 
        agent: {
          id: agent._id,
          isActive: agent.statusInfo.isActive,
          onDuty: agent.statusInfo.onDuty,
          availability: agent.statusInfo.availability,
          status: agent.status
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update agent status');
  }
});

// Delete agent
router.delete('/:id', protect, authorize(['admin']), [
  param('id').isMongoId().withMessage('Invalid agent ID')
], async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;

    const agent = await Agent.findOne({
      _id: req.params.id,
      organisationId: userOrgId
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check if agent has active case assignments
    if (agent.caseAssignments && agent.caseAssignments.length > 0) {
      const activeCases = agent.caseAssignments.filter(ca => ca.status === 'active');
      if (activeCases.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete agent. Agent has ${activeCases.length} active case assignment(s). Please reassign cases first.`
        });
      }
    }

    // Remove agent reference from user if exists
    if (agent.user) {
      await User.findByIdAndUpdate(agent.user, { $unset: { agent: 1 } });
    }

    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete agent');
  }
});

// Get agent statistics
router.get('/stats/overview', protect, authorize('admin', 'manager', 'officer', 'super_admin'), async (req, res) => {
  try {
    // Handle organisationId - extract _id if populated
    const userOrgId = req.user.organisationId._id || req.user.organisationId;
    const organisationId = new mongoose.Types.ObjectId(userOrgId);

    const stats = await Agent.aggregate([
      { $match: { organisationId: organisationId } },
      {
        $group: {
          _id: null,
          totalAgents: { $sum: 1 },
          activeAgents: { $sum: { $cond: ['$statusInfo.isActive', 1, 0] } },
          onDutyAgents: { $sum: { $cond: ['$statusInfo.onDuty', 1, 0] } },
          rankDistribution: {
            $push: '$rank'
          },
          specializationDistribution: {
            $push: '$specialization'
          }
        }
      },
      {
        $project: {
          totalAgents: 1,
          activeAgents: 1,
          inactiveAgents: { $subtract: ['$totalAgents', '$activeAgents'] },
          onDutyAgents: 1,
          rankDistribution: {
            detective: { $size: { $filter: { input: '$rankDistribution', cond: { $eq: ['$$this', 'detective'] } } } },
            senior_detective: { $size: { $filter: { input: '$rankDistribution', cond: { $eq: ['$$this', 'senior_detective'] } } } },
            supervisor: { $size: { $filter: { input: '$rankDistribution', cond: { $eq: ['$$this', 'supervisor'] } } } },
            commander: { $size: { $filter: { input: '$rankDistribution', cond: { $eq: ['$$this', 'commander'] } } } },
            director: { $size: { $filter: { input: '$rankDistribution', cond: { $eq: ['$$this', 'director'] } } } }
          },
          specializationDistribution: {
            homicide: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'homicide'] } } } },
            narcotics: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'narcotics'] } } } },
            fraud: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'fraud'] } } } },
            cybercrime: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'cybercrime'] } } } },
            terrorism: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'terrorism'] } } } },
            organized_crime: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'organized_crime'] } } } },
            general: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'general'] } } } },
            other: { $size: { $filter: { input: '$specializationDistribution', cond: { $eq: ['$$this', 'other'] } } } }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalAgents: 0,
        activeAgents: 0,
        inactiveAgents: 0,
        onDutyAgents: 0,
        rankDistribution: { detective: 0, senior_detective: 0, supervisor: 0, commander: 0, director: 0 },
        specializationDistribution: { homicide: 0, narcotics: 0, fraud: 0, cybercrime: 0, terrorism: 0, organized_crime: 0, general: 0, other: 0 }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch agent statistics');
  }
});

module.exports = router;

