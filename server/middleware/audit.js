const AuditEvent = require('../models/AuditEvent');

// Helper function to extract safe body keys (avoiding sensitive data)
const extractSafeBodyKeys = (body) => {
  if (!body || typeof body !== 'object') return [];
  
  const sensitiveFields = [
    'password', 'token', 'creditCard', 'ssn', 'secret', 
    'emailVerificationToken', 'resetPasswordToken', 'accessToken'
  ];
  
  return Object.keys(body).filter(key => 
    !sensitiveFields.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )
  );
};

// Helper function to determine entity type from URL
const determineEntityType = (url) => {
  if (url.includes('/users')) return 'User';
  if (url.includes('/sims') || url.includes('/sim-cards')) return 'SimCard';
  if (url.includes('/auth')) return 'Auth';
  if (url.includes('/dashboard')) return 'Dashboard';
  if (url.includes('/upload')) return 'File';
  return 'System';
};

// Helper function to determine action from HTTP method and URL
const determineAction = (method, url, statusCode) => {
  // Handle auth-specific actions
  if (url.includes('/auth/login')) return statusCode === 200 ? 'LOGIN' : 'AUTH_FAILED';
  if (url.includes('/auth/logout')) return 'LOGOUT';
  if (url.includes('/forgot-password')) return 'AUTH_FAILED';
  
  // Handle file operations
  if (url.includes('/upload')) return 'UPLOAD';
  if (url.includes('/download') || url.includes('/export')) return 'DOWNLOAD';
  if (url.includes('/import')) return 'IMPORT';
  
  // Handle CRUD operations
  switch (method) {
    case 'GET':
      if (url.includes('/export')) return 'EXPORT';
      if (url.includes('/search') || url.includes('?search=')) return 'SEARCH';
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'CREATE';
  }
};

// Helper function to determine severity based on action and status code
const determineSeverity = (action, statusCode, entityType) => {
  // Critical operations
  if (action === 'DELETE' && ['User'].includes(entityType)) return 'HIGH';
  if (action === 'AUTH_FAILED') return 'HIGH';
  if (statusCode >= 500) return 'CRITICAL';
  if (statusCode >= 400) return 'MEDIUM';
  
  // Data management operations
  if (['CREATE', 'UPDATE'].includes(action)) return 'MEDIUM';
  if (action === 'DELETE') return 'HIGH';
  
  return 'LOW';
};

// Helper function to determine category
const determineCategory = (action, entityType, statusCode) => {
  if (['LOGIN', 'LOGOUT', 'AUTH_FAILED'].includes(action)) return 'SECURITY';
  if (['CREATE', 'UPDATE', 'DELETE'].includes(action)) return 'DATA_MANAGEMENT';
  if (statusCode >= 500) return 'SYSTEM';
  if (entityType === 'User') return 'USER_MANAGEMENT';
  return 'OPERATIONAL';
};

// Main audit middleware
const auditMiddleware = () => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Override res.send to capture response data
    let responseLoaded = false;
    res.send = function(body) {
      if (!responseLoaded) {
        responseLoaded = true;
        logAuditEvent(req, res, startTime, body);
      }
      return originalSend.call(this, body);
    };

    // Handle stream end for cases where send might not be called
    res.on('finish', () => {
      if (!responseLoaded) {
        logAuditEvent(req, res, startTime);
        responseLoaded = true;
      }
    });

    next();
  };
};

// Function to log audit event
async function logAuditEvent(req, res, startTime, responseBody = null) {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Extract IP address
    const ipAddress = req.ip || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress ||
                     req.headers['x-forwarded-for'] ||
                     req.headers['x-real-ip'] ||
                     'unknown';

    // Determine audit parameters
    const entityType = determineEntityType(req.url);
    const action = determineAction(req.method, req.url, res.statusCode);
    const severity = determineSeverity(action, res.statusCode, entityType);
    const category = determineCategory(action, entityType, res.statusCode);
    
    // Extract entity ID from URL params
    const pathParts = req.url.split('/').filter(part => part);
    const entityId = pathParts.find(part => /^[0-9a-fA-F]{24}$/.test(part)) || 
                    (req.params?.id) ||
                    null;
    
    // Generate description
    const entityName = getEntityName(req.body, entityId, action);
    const description = `${action} ${entityType.toLowerCase()}${entityName ? ` "${entityName}"` : ''}` +
                       `${req.user ? ` by ${req.user.firstName} ${req.user.lastName}` : ''}` +
                       ` (${res.statusCode})`;

    // Parse response message
    let responseMessage = res.statusMessage || 'OK';
    try {
      if (responseBody && typeof responseBody === 'string') {
        const parsed = JSON.parse(responseBody);
        responseMessage = parsed.message || responseMessage;
      } else if (responseBody && responseBody.message) {
        responseMessage = responseBody.message;
      }
    } catch (e) {
      // Ignore parsing errors
    }

    // Determine tags
    const tags = [];
    if (res.statusCode >= 400) tags.push('error');
    if (duration > 1000) tags.push('slow-request');
    if (req.method !== 'GET') tags.push('modification');

    // Log the audit event
    await AuditEvent.logEvent({
      user: req.user,
      organisationId: req.user?.organisationId,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userName: req.user ? {
        firstName: req.user.firstName,
        lastName: req.user.lastName
      } : undefined,
      action,
      entityType,
      entityId,
      entityName,
      changes: null, // Will be set manually for specific operations
      requestData: {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        bodyKeys: extractSafeBodyKeys(req.body),
        ipAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        timestamp: new Date(startTime)
      },
      responseData: {
        statusCode: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        message: responseMessage,
        duration,
        timestamp: new Date(endTime)
      },
      severity,
      category,
      description,
      tags
    });

  } catch (error) {
    console.error('Audit middleware error:', error);
  }
}

// Helper function to get entity name
function getEntityName(body, entityId, action) {
  if (body?.name) return body.name;
  if (body?.title) return body.title;
  if (body?.firstName && body?.lastName) return `${body.firstName} ${body.lastName}`;
  if (body?.propertyId) return body.propertyId;
  if (body?.email) return body.email;
  return entityId;
}

module.exports = { auditMiddleware };
