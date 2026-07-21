
import rules from '../rules/rule.js';

/**
 * Enforces role-based or power-based access.
 * @param {string} action - The action name (must exist in rule.js)
 */
 const authorize = (action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user context' });
      }

      const { actor, role, permissions } = req.user;

      // 🟢 OWNER: always allow
      if (actor?.type === 'OWNER') {
        return next();
      }

      // 🟣 EXECUTIVE: permission-based only
      if (actor?.type === 'EXECUTIVE') {
        if (!permissions || permissions[action] !== true) {
          console.warn(`🚫 Executive blocked | action=${action}`);
          return res.status(403).json({
            message: 'Forbidden: Executive does not have permission'
          });
        }
        return next();
      }

      // 🔵 STAFF / USER: role-based rules
      const allowedRoles = rules[action];
      if (!allowedRoles) {
        console.warn(`⚠️ No rule defined for action: ${action}`);
        return res.status(403).json({
          message: 'Access denied. Rule not configured.'
        });
      }

      if (!allowedRoles.includes(role)) {
        console.warn(`🚫 Access blocked for ${role} on ${action}`);
        return res.status(403).json({
          message: 'Forbidden: Insufficient privileges'
        });
      }

      next();
    } catch (err) {
      console.error('❌ ruleMiddleware error:', err);
      return res.status(500).json({
        message: 'Server error in authorization middleware'
      });
    }
  };
};



import Staff from '../model/admin/Staff.js';

const HIERARCHY = {
  OWNER: 0,
  COMPANY: 1,
  SUPERADMIN: 2,
  ADMIN: 3,
  SUPERMASTER: 4,
  MASTER: 5,
  BETTOR: 6,
  USER: 6 // Alias for BETTOR
};

/**
 * Middleware to enforce hierarchy checks.
 * Ensures the creator has a higher rank (lower level number) than the role they are creating.
 */
const validateHierarchy = (req, res, next) => {
  try {
    // 1. Identify Creator's Role
    // Check multiple possible paths for role/user_type
    const rawCreatorRole = req.user?.role || 
                           req.user?.user?.role || 
                           req.user?.user_type || 
                           req.user?.user?.user_type || 
                           "";
    const creatorRole = rawCreatorRole.toUpperCase();
    const creatorLevel = HIERARCHY[creatorRole] ?? 99;

    // 2. Identify Target Role
    // Default to 'USER' if not specified (e.g. create-under-parent often implies USER)
    let targetRole = req.body.role ? req.body.role.toUpperCase() : 'USER';
    
    // Handle edge case where 'BETTOR' might be sent as 'USER' or vice versa
    if (targetRole === 'BETTOR') targetRole = 'USER';

    const targetLevel = HIERARCHY[targetRole] ?? 99;

    // 3. Enforce Hierarchy
    // Creator must have a strictly lower level number (higher rank)
    if (creatorLevel >= targetLevel) {
      console.warn(`🚫 Hierarchy Violation: ${creatorRole} (${creatorLevel}) tried to create ${targetRole} (${targetLevel})`);
      return res.status(403).json({ 
        message: `Forbidden: You cannot create a ${targetRole}. Your role (${creatorRole}) is not high enough.` 
      });
    }

    next();
  } catch (err) {
    console.error('❌ validateHierarchy error:', err);
    res.status(500).json({ message: 'Server error in hierarchy validation' });
  }
};

/**
 * Middleware to verify parent existence.
 * - If OWNER: parent_id is null.
 * - If STAFF: verifies staff exists and sets parent_id to logged-in user's ID.
 */
const validateParent = async (req, res, next) => {
  try {
    const rawCreatorRole = req.user?.role || 
                           req.user?.user?.role || 
                           req.user?.user_type || 
                           req.user?.user?.user_type || 
                           "";
    const creatorRole = rawCreatorRole.toUpperCase();
    // Fix: ID is stored in account.id or actor.id, not directly on req.user
    const creatorId = req.user?.account?.id || req.user?.actor?.id || req.user?.id;

    if (creatorRole === 'OWNER') {
      // Owner has no parent
      req.body.parent_id = null;
      req.body.parent_owner_id = creatorId; // ✅ Set parent_owner_id to Owner's ID
      req.parentStaff = null;
      return next();
    }

    // For Staff, they are the parent of the new user/staff
    if (!creatorId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found' });
    }

    const parentStaff = await Staff.findByPk(creatorId);
    if (!parentStaff) {
      return res.status(400).json({ message: 'Parent staff not found' });
    }

    // Attach parent info and force parent_id to be the creator
    req.parentStaff = parentStaff;
    req.body.parent_id = creatorId;
    req.body.parent_owner_id = parentStaff.parent_owner_id; // ✅ Inherit parent_owner_id from parent staff
    
    next();
  } catch (err) {
    console.error('❌ validateParent error:', err);
    res.status(500).json({ message: 'Server error in parent validation' });
  }
};

export { authorize, validateHierarchy, validateParent };