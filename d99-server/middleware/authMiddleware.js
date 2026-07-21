

// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import TokenBlacklist from '../model/admin/TokenBlacklist.js';

import User from '../model/user/User.js';
import Staff from '../model/admin/Staff.js';
import Owner from '../model/admin/Owner.js';
import Executive from '../model/Executive.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'Access denied. No token provided.' });

    const token = authHeader.replace('Bearer ', '').trim();

    // 🛑 Prevent "null", "undefined" or empty tokens from hitting jwt.verify
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Access denied. No valid token provided.' });
    }

    const blacklisted = await TokenBlacklist.findOne({ where: { token } });
    if (blacklisted) return res.status(401).json({ error: 'Token invalidated. Please log in again.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach clean, standardized user object
    let actor = decoded.actor;
    let account = decoded.account;

    // 🔄 Backward compatibility (old tokens)
    if (!actor || !account) {
      if (decoded.owner_id) {
        actor = { type: 'OWNER', id: decoded.owner_id };
        account = { type: 'OWNER', id: decoded.owner_id };
      } else if (decoded.staff_id) {
        actor = { type: 'STAFF', id: decoded.staff_id };
        account = { type: 'STAFF', id: decoded.staff_id };
      } else if (decoded.user_id) {
        actor = { type: 'USER', id: decoded.user_id };
        account = { type: 'USER', id: decoded.user_id };
      }
    }

    // ✅ Final unified user object
    req.user = {
      actor,
      account,
      role: decoded.role?.toUpperCase(),
      level: decoded.level || null,
      username: decoded.username || null,
      permissions: decoded.permissions || null
    };

    // 🔒 Executive: re-read the row on EVERY request so "disable now" and
    // permission edits take effect immediately, even on an already-issued
    // token. Executive tokens carry no `sid`, so they must be handled here and
    // NOT fall through to the parent account's single-session check below
    // (that would reject every executive request).
    if (req.user.actor?.type === 'EXECUTIVE') {
      const executive = await Executive.findByPk(req.user.actor.id);
      if (!executive || executive.active === false) {
        return res.status(401).json({ error: 'Executive account is disabled. Access denied.' });
      }
      // Refresh live values from DB (permission edits apply without re-login)
      req.user.permissions = executive.permissions || {};
      req.user.role = (executive.role || req.user.role || '').toUpperCase();
      console.log(
        `✅ Authenticated | actor=EXECUTIVE:${executive.id} | account=${req.user.account.type}:${req.user.account.id} | role=${req.user.role}`
      );
      return next();
    }

    // 🔒 Enforce Active Status Check
   // 🔒 Enforce Active Status Check (based on ACCOUNT, not actor)
if (req.user.account?.type === 'USER') {
  const user = await User.findByPk(req.user.account.id);
  if (!user || user.status !== 'Active') {
    return res.status(401).json({ error: 'Account is inactive. Access denied.' });
  }

  // 🔒 Single-session enforcement: token's session id must match the user's
  // current active login. A newer login on another device overwrites login_id,
  // so this older token stops matching and is rejected.
  if (user.login_id && decoded.sid !== user.login_id) {
    return res.status(401).json({ error: 'Session expired. You have been logged out because your account was used on another device.' });
  }
}

if (req.user.account?.type === 'STAFF') {
  const staff = await Staff.findByPk(req.user.account.id);
  if (!staff || (req.user.role !== 'OWNER' && !staff.active)) {
    return res.status(401).json({ error: 'Account is inactive. Access denied.' });
  }

  // 🔒 Single-session enforcement: a newer login on another device overwrites
  // login_id, so this older token's session id no longer matches.
  if (staff.login_id && decoded.sid !== staff.login_id) {
    return res.status(401).json({ error: 'Session expired. You have been logged out because your account was used on another device.' });
  }
}

if (req.user.account?.type === 'OWNER') {
  const owner = await Owner.findByPk(req.user.account.id);
  // 🔒 Single-session enforcement for owners.
  if (owner && owner.login_id && decoded.sid !== owner.login_id) {
    return res.status(401).json({ error: 'Session expired. You have been logged out because your account was used on another device.' });
  }
}
console.log(
  `✅ Authenticated | actor=${req.user.actor.type}:${req.user.actor.id} | account=${req.user.account.type}:${req.user.account.id} | role=${req.user.role}`
);


// OWNER account → no active check needed

    next();
  } catch (err) {
    console.error('❌ authMiddleware error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or malformed token. Please log in again.' });
  }
};

export default authMiddleware;

