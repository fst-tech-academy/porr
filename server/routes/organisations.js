const express = require('express');
const mongoose = require('mongoose');
const { body, query, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleMongooseError } = require('../utils/errorHandler');
const Organisation = require('../models/Organisation');
const User = require('../models/User');
const { generateEmployeeId } = require('../utils/generateId');
const { sendVerificationEmail } = require('../utils/emailService');

const router = express.Router();

// Get all organisations (Super Admin only)
router.get('/', protect, authorize('super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Invalid status filter'),
  query('plan').optional().isIn(['free', 'basic', 'premium', 'enterprise', 'all']).withMessage('Invalid plan filter')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const plan = req.query.plan || 'all';

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      filter['settings.isActive'] = status === 'active';
    }

    if (plan !== 'all') {
      filter['subscription.plan'] = plan;
    }

    const organisations = await Organisation.find(filter)
      .populate('adminUser', 'firstName lastName email role isActive')
      .populate('metadata.createdBy', 'firstName lastName email')
      .populate('metadata.lastModifiedBy', 'firstName lastName email')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Organisation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        organisations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch organisations');
  }
});

// Get single organisation
router.get('/:id', protect, authorize('super_admin'), [
  param('id').isMongoId().withMessage('Invalid organisation ID')
], async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id)
      .populate('adminUser', 'firstName lastName email role isActive phone')
      .populate('metadata.createdBy', 'firstName lastName email')
      .populate('metadata.lastModifiedBy', 'firstName lastName email')
      .select('-__v');

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    res.json({
      success: true,
      data: { organisation }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch organisation');
  }
});

// Create organisation with admin user
router.post('/', protect, authorize('super_admin'), [
  body('name').trim().notEmpty().withMessage('Organisation name is required'),
  body('description').optional().trim(),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('settings.maxUsers').optional().isInt({ min: 1 }).withMessage('Max users must be at least 1'),
  body('subscription.plan').optional().isIn(['free', 'basic', 'premium', 'enterprise']).withMessage('Invalid subscription plan'),
  body('adminUser.firstName').trim().notEmpty().withMessage('Admin first name is required'),
  body('adminUser.lastName').trim().notEmpty().withMessage('Admin last name is required'),
  body('adminUser.email').isEmail().withMessage('Valid admin email is required'),
  body('adminUser.password').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
  body('adminUser.phone').optional().trim(),
  body('adminUser.nationalId').optional().trim()
], async (req, res) => {
  try {
    const {
      name,
      description,
      email,
      phone,
      address,
      settings,
      subscription,
      adminUser
    } = req.body;

    // Check if organisation email already exists
    const existingOrg = await Organisation.findOne({ email: email.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organisation with this email already exists'
      });
    }

    // No need to check for existing admin users - allow same email as admin in different organisations
    // The compound unique index (email + organisationId) will handle uniqueness within each organisation

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    
    try {
      console.log('Creating organisation with user:', req.user.id);
      await session.withTransaction(async () => {
        console.log('Starting transaction...');
        
        // Create organisation
        const organisation = new Organisation({
          name,
          description,
          email: email.toLowerCase(),
          phone,
          address,
          settings: {
            isActive: true,
            maxUsers: settings?.maxUsers || 50,
            features: {
              userManagement: true,
              caseManagement: true,
              offenceRecords: true,
              fileUploads: true,
              emailNotifications: true,
              auditLogging: true,
              dashboardAnalytics: true,
              ...settings?.features
            }
          },
          subscription: {
            plan: subscription?.plan || 'free',
            startDate: new Date(),
            isActive: true,
            ...subscription
          },
          metadata: {
            createdBy: req.user.id,
            tags: []
          }
        });

        console.log('Saving organisation...');
        await organisation.save({ session });
        console.log('Organisation saved:', organisation._id);

        // Create admin user
        const employeeId = generateEmployeeId();
        const adminUserData = new User({
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          username: adminUser.email.toLowerCase(), // Set username to email
          email: adminUser.email.toLowerCase(),
          password: adminUser.password,
          nationalId: adminUser.nationalId,
          phone: adminUser.phone,
          role: 'admin',
          organisationId: organisation._id,
          employeeId,
          isActive: true,
          emailVerified: true // Auto-verify admin users
        });

        console.log('Saving admin user...');
        await adminUserData.save({ session });
        console.log('Admin user saved:', adminUserData._id);

        // Update organisation with admin user reference
        organisation.adminUser = adminUserData._id;
        await organisation.save({ session });
        console.log('Organisation updated with admin user');
      });
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      throw transactionError;
    } finally {
      await session.endSession();
    }

    // Get the created organisation for response
    const createdOrganisation = await Organisation.findOne({ email: email.toLowerCase() })
      .populate('adminUser', 'firstName lastName email role isActive phone employeeId')
      .populate('metadata.createdBy', 'firstName lastName email')
      .select('-__v');

    res.status(201).json({
      success: true,
      message: 'Organisation and admin user created successfully',
      data: {
        organisation: createdOrganisation
      }
    });
  } catch (error) {
    console.error('Organisation creation error:', error);
    return handleMongooseError(error, res, 'Failed to create organisation');
  }
});

// Update organisation
router.put('/:id', protect, authorize('super_admin'), [
  param('id').isMongoId().withMessage('Invalid organisation ID'),
  body('name').optional().trim().notEmpty().withMessage('Organisation name cannot be empty'),
  body('description').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('settings.maxUsers').optional().isInt({ min: 1 }).withMessage('Max users must be at least 1'),
  body('settings.isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('subscription.plan').optional().isIn(['free', 'basic', 'premium', 'enterprise']).withMessage('Invalid subscription plan'),
  body('subscription.isActive').optional().isBoolean().withMessage('Subscription isActive must be boolean')
], async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);
    
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== organisation.email) {
      const existingOrg = await Organisation.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: organisation._id }
      });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Organisation with this email already exists'
        });
      }
    }

    // Update organisation
    const updateData = { ...req.body };
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }
    
    updateData.metadata = {
      ...organisation.metadata,
      lastModifiedBy: req.user.id
    };

    const updatedOrganisation = await Organisation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('adminUser', 'firstName lastName email role isActive phone')
      .populate('metadata.createdBy', 'firstName lastName email')
      .populate('metadata.lastModifiedBy', 'firstName lastName email')
      .select('-__v');

    res.json({
      success: true,
      message: 'Organisation updated successfully',
      data: { organisation: updatedOrganisation }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to update organisation');
  }
});

// Toggle organisation status
router.patch('/:id/toggle-status', protect, authorize('super_admin'), [
  param('id').isMongoId().withMessage('Invalid organisation ID')
], async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);
    
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    organisation.settings.isActive = !organisation.settings.isActive;
    organisation.metadata.lastModifiedBy = req.user.id;
    
    await organisation.save();

    res.json({
      success: true,
      message: `Organisation ${organisation.settings.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        organisation: {
          id: organisation._id,
          name: organisation.name,
          isActive: organisation.settings.isActive
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to toggle organisation status');
  }
});

// Delete organisation
router.delete('/:id', protect, authorize('super_admin'), [
  param('id').isMongoId().withMessage('Invalid organisation ID')
], async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);
    
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    // Check if organisation has users
    const userCount = await User.countDocuments({ organisationId: organisation._id });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete organisation. It has ${userCount} user(s). Please reassign or delete users first.`
      });
    }

    await Organisation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Organisation deleted successfully'
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to delete organisation');
  }
});

// Get organisation statistics
router.get('/:id/stats', protect, authorize('super_admin'), [
  param('id').isMongoId().withMessage('Invalid organisation ID')
], async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);
    
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    const userCount = await User.countDocuments({ organisationId: organisation._id });
    const activeUserCount = await User.countDocuments({ 
      organisationId: organisation._id, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        organisation: {
          id: organisation._id,
          name: organisation.name,
          isActive: organisation.settings.isActive,
          maxUsers: organisation.settings.maxUsers,
          subscription: organisation.subscription
        },
        stats: {
          totalUsers: userCount,
          activeUsers: activeUserCount,
          inactiveUsers: userCount - activeUserCount,
          userLimit: organisation.settings.maxUsers,
          usagePercentage: Math.round((userCount / organisation.settings.maxUsers) * 100)
        }
      }
    });
  } catch (error) {
    return handleMongooseError(error, res, 'Failed to fetch organisation statistics');
  }
});

module.exports = router;
