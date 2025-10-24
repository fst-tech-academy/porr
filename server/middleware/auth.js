const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token with organisation info
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate('organisationId', 'name email settings.isActive subscription.plan');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Check organisation status for non-super-admin users
      if (user.role !== 'super_admin' && user.organisationId) {
        if (!user.organisationId.settings.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Your organisation account is deactivated'
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
          .select('-password')
          .populate('organisationId', 'name email settings.isActive subscription.plan');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Organisation context middleware - ensures data isolation
const organisationContext = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Super admin can access all data
  if (req.user.role === 'super_admin') {
    req.organisationId = null; // No filtering for super admin
    return next();
  }

  // Other users can only access their organisation's data
  if (!req.user.organisationId) {
    return res.status(403).json({
      success: false,
      message: 'User must be assigned to an organisation'
    });
  }

  req.organisationId = req.user.organisationId._id || req.user.organisationId;
  next();
};

// Organisation feature access middleware
const checkOrganisationFeature = (feature) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super admin has access to all features
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user's organisation has the feature enabled
    if (req.user.organisationId && req.user.organisationId.settings && req.user.organisationId.settings.features) {
      if (!req.user.organisationId.settings.features[feature]) {
        return res.status(403).json({
          success: false,
          message: `Feature '${feature}' is not enabled for your organisation`
        });
      }
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  organisationContext,
  checkOrganisationFeature
};
