const AuditEvent = require('../models/AuditEvent');

class AuditService {
  
  /**
   * Get audit events with filtering and pagination
   */
  static async getAuditEvents(options = {}) {
    const {
      page = 1,
      limit = 20,
      userId,
      organisationId,
      action,
      entityType,
      severity,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build filter query
    if (userId) query.userId = userId;
    if (organisationId) query.organisationId = organisationId;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (severity) query.severity = severity;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { 'userName.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    try {
      const [events, total] = await Promise.all([
        AuditEvent.find(query)
          .populate('user', 'firstName lastName email role nationalId')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditEvent.countDocuments(query)
      ]);

      return {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching audit events:', error);
      throw new Error('Failed to fetch audit events');
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(options = {}) {
    const { startDate, endDate } = options;
    
    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    try {
      const [totalStats, entityStats, userStats] = await Promise.all([
        // Total statistics
        AuditEvent.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: null,
              totalEvents: { $sum: 1 },
              avgResponseTime: { $avg: '$responseData.duration' },
              maxResponseTime: { $max: '$responseData.duration' },
              minResponseTime: { $min: '$responseData.duration' },
              failedRequests: {
                $sum: { $cond: [{ $gte: ['$responseData.statusCode', 400] }, 1, 0] }
              },
              successRequests: {
                $sum: { $cond: [{ $and: [{ $gte: ['$responseData.statusCode', 200] }, { $lt: ['$responseData.statusCode', 300] }] }, 1, 0] }
              }
            }
          }
        ]),

        // Entity breakdown
        AuditEvent.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: '$entityType',
              count: { $sum: 1 },
              actions: { $addToSet: '$action' }
            }
          },
          { $sort: { count: -1 } }
        ]),

        // Most active users
        AuditEvent.aggregate([
          { $match: { ...matchQuery, userId: { $exists: true } } },
          {
            $group: {
              _id: '$userEmail',
              count: { $sum: 1 },
              actions: { $addToSet: '$action' },
              userName: { $first: '$userName.fullName' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      const totalStat = totalStats[0] || {};
      const totalEvents = totalStat.totalEvents || 0;
      const failedRequests = totalStat.failedRequests || 0;
      const successRequests = totalStat.successRequests || 0;

      return {
        summary: {
          totalEvents,
          avgResponseTime: totalStat.avgResponseTime || 0,
          maxResponseTime: totalStat.maxResponseTime || 0,
          minResponseTime: totalStat.minResponseTime || 0,
          failedRequests,
          successRequests,
          successRate: totalEvents > 0 ? ((successRequests / totalEvents) * 100).toFixed(2) : 0
        },
        entityBreakdown: entityStats,
        topUsers: userStats
      };
    } catch (error) {
      console.error('Error generating audit stats:', error);
      throw new Error('Failed to generate audit statistics');
    }
  }

  /**
   * Export audit events to CSV format
   */
  static async exportAuditEvents(options = {}) {
    const events = await this.getAuditEvents({
      ...options,
      limit: 10000 // Large limit for export
    });

    const csvHeaders = [
      'Timestamp',
      'User',
      'Email', 
      'Action',
      'Entity Type',
      'Entity Name',
      'Severity',
      'Category',
      'Description',
      'IP Address',
      'Status Code',
      'Duration (ms)',
      'Success'
    ];

    const csvRows = events.events.map(event => [
      event.formattedDate || new Date(event.createdAt).toLocaleString(),
      event.userName?.fullName || 'System',
      event.userEmail || 'N/A',
      event.action,
      event.entityType,
      event.entityName || 'N/A',
      event.severity,
      event.category,
      event.description,
      event.requestData?.ipAddress || 'N/A',
      event.responseData?.statusCode || 'N/A',
      event.responseData?.duration || 'N/A',
      event.responseData?.success ? 'Yes' : 'No'
    ]);

    return {
      headers: csvHeaders,
      rows: csvRows
    };
  }

  /**
   * Clean up old audit events
   */
  static async cleanupAuditEvents(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await AuditEvent.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} audit events older than ${retentionDays} days`);
      return result;
    } catch (error) {
      console.error('Error cleaning up audit events:', error);
      throw new Error('Failed to cleanup audit events');
    }
  }

  /**
   * Log a manual audit event (for specific operations)
   */
  static async logManualEvent(params) {
    return AuditEvent.logEvent(params);
  }
}

module.exports = AuditService;
