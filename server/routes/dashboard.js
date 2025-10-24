const express = require('express');
const User = require('../models/User');
const AuditEvent = require('../models/AuditEvent');
const { protect } = require('../middleware/auth');
const { checkDashboardAnalytics } = require('../middleware/settings');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, checkDashboardAnalytics, async (req, res) => {
  try {
    console.log('📊 Fetching PORR dashboard stats...');
    
    // Get counts for PORR system
    const [
      usersCount,
      auditEventsCount,
      activeUsersCount
    ] = await Promise.all([
      User.countDocuments(),
      AuditEvent.countDocuments(),
      User.countDocuments({ isActive: true })
    ]);

    // Get user role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recent audit events
    const recentAuditEvents = await AuditEvent.find()
      .select('action resource userId timestamp')
      .populate('userId', 'username email')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get recent users
    const recentUsers = await User.find()
      .select('username email role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get audit events by action type
    const auditByAction = await AuditEvent.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    console.log('✅ PORR dashboard stats fetched successfully');

    res.json({
      success: true,
      data: {
        counts: {
          totalUsers: usersCount,
          activeUsers: activeUsersCount,
          auditEvents: auditEventsCount
        },
        charts: {
          userRoles,
          auditByAction
        },
        recentActivity: {
          auditEvents: recentAuditEvents,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    console.log('📊 Fetching PORR dashboard overview...');
    
    // Get basic system information
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAuditEvents = await AuditEvent.countDocuments();
    
    // Get system health
    const systemHealth = {
      database: 'connected',
      users: totalUsers,
      activeUsers: activeUsers,
      auditEvents: totalAuditEvents,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ PORR dashboard overview fetched successfully');

    res.json({
      success: true,
      data: {
        systemHealth,
        message: 'New Project Starter Template (NPST) is ready for development'
      }
    });
  } catch (error) {
    console.error('❌ Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview'
    });
  }
});

module.exports = router;
