/**
 * Role Hierarchy Middleware
 * Implements security hierarchy to prevent privilege escalation
 */

// Define role hierarchy (higher number = higher privilege)
const ROLE_HIERARCHY = {
  'viewer': 1,
  'officer': 2,
  'manager': 3,
  'admin': 4,
  'super_admin': 5
};

/**
 * Get role level for comparison
 */
const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Check if a user can create a user with the specified role
 */
const canCreateRole = (creatorRole, targetRole) => {
  const creatorLevel = getRoleLevel(creatorRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Users can only create users with equal or lower privilege
  return targetLevel <= creatorLevel;
};

/**
 * Check if a user can edit a user with the specified role
 */
const canEditRole = (editorRole, targetRole) => {
  const editorLevel = getRoleLevel(editorRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Users can only edit users with equal or lower privilege
  return targetLevel <= editorLevel;
};

/**
 * Check if a user can delete a user with the specified role
 */
const canDeleteRole = (deleterRole, targetRole) => {
  const deleterLevel = getRoleLevel(deleterRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Users can only delete users with equal or lower privilege
  return targetLevel <= deleterLevel;
};

/**
 * Get allowed roles for a user to create/edit
 */
const getAllowedRoles = (userRole) => {
  const userLevel = getRoleLevel(userRole);
  return Object.keys(ROLE_HIERARCHY).filter(role => 
    getRoleLevel(role) <= userLevel
  );
};

/**
 * Middleware to validate role creation permissions
 */
const validateRoleCreation = (req, res, next) => {
  const { role } = req.body;
  const creatorRole = req.user.role;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Role is required'
    });
  }

  if (!canCreateRole(creatorRole, role)) {
    return res.status(403).json({
      success: false,
      message: `You cannot create users with role '${role}'. Your role '${creatorRole}' does not have sufficient privileges.`,
      allowedRoles: getAllowedRoles(creatorRole)
    });
  }

  next();
};

/**
 * Middleware to validate role editing permissions
 */
const validateRoleEdit = (req, res, next) => {
  const { role } = req.body;
  const editorRole = req.user.role;
  const targetUserId = req.params.id;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Role is required'
    });
  }

  if (!canEditRole(editorRole, role)) {
    return res.status(403).json({
      success: false,
      message: `You cannot assign role '${role}' to users. Your role '${editorRole}' does not have sufficient privileges.`,
      allowedRoles: getAllowedRoles(editorRole)
    });
  }

  next();
};

/**
 * Middleware to validate user deletion permissions
 */
const validateUserDeletion = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const targetUserId = req.params.id;
    const deleterRole = req.user.role;

    // Get target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!canDeleteRole(deleterRole, targetUser.role)) {
      return res.status(403).json({
        success: false,
        message: `You cannot delete users with role '${targetUser.role}'. Your role '${deleterRole}' does not have sufficient privileges.`
      });
    }

    // Prevent self-deletion
    if (targetUserId === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    console.error('User deletion validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during validation'
    });
  }
};

/**
 * Middleware to validate user viewing permissions
 */
const validateUserViewing = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const targetUserId = req.params.id;
    const viewerRole = req.user.role;

    // Get target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only view users with equal or lower privilege
    if (!canEditRole(viewerRole, targetUser.role)) {
      return res.status(403).json({
        success: false,
        message: `You cannot view users with role '${targetUser.role}'. Your role '${viewerRole}' does not have sufficient privileges.`
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    console.error('User viewing validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during validation'
    });
  }
};

module.exports = {
  ROLE_HIERARCHY,
  getRoleLevel,
  canCreateRole,
  canEditRole,
  canDeleteRole,
  getAllowedRoles,
  validateRoleCreation,
  validateRoleEdit,
  validateUserDeletion,
  validateUserViewing
};
