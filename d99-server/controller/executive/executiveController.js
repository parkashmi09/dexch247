import bcrypt from "bcryptjs";
import Executive from "../../model/Executive.js";

/**
 * ADMIN-TIER PERMISSION KEYS
 * ---------------------------------------------------------------------------
 * Keys in this list may ONLY be granted by an OWNER (or top-tier staff role).
 * They are stripped from any incoming `permissions` payload when the caller is
 * not allowed to grant them — defence in depth alongside the frontend hiding.
 *
 * jmd-exch currently has no tier distinction between privilege keys, so this is
 * intentionally EMPTY (every privileged account may grant every key, matching
 * the existing create-account UI). To make a key owner-only, add its string
 * here AND hide its checkbox behind `isOwnerOrSuperAdmin()` on the frontend.
 * Keep this list byte-identical with the frontend registry.
 */
const ADMIN_TIER = [];

/* ───────────────────────── guard helpers ───────────────────────── */

/**
 * Block any caller that must never manage executives (executives themselves,
 * front-site users, or agent-role staff). Returns true if it already sent a
 * 403 response — callers should `return` immediately when it does.
 */
const denyNonAdmins = (req, res) => {
  const { actor, role } = req.user || {};

  if (actor?.type === "EXECUTIVE") {
    res.status(403).json({
      success: false,
      message: "Executives are not allowed to manage executives"
    });
    return true;
  }

  if (actor?.type === "USER") {
    res.status(403).json({
      success: false,
      message: "Users are not allowed to manage executives"
    });
    return true;
  }

  if (role === "AGENT") {
    res.status(403).json({
      success: false,
      message: "Agents are not allowed to manage executives"
    });
    return true;
  }

  return false;
};

/**
 * Load an executive by :id and assert it belongs to the calling account
 * (parent_type + parent_id). Returns the row, or null after sending a 404/403.
 */
const findOwnedExecutive = async (req, res) => {
  const { account } = req.user;
  const { id } = req.params;

  const executive = await Executive.findByPk(id);
  if (!executive) {
    res.status(404).json({ success: false, message: "Executive not found" });
    return null;
  }

  if (
    executive.parent_type !== account.type ||
    executive.parent_id !== account.id
  ) {
    res.status(403).json({
      success: false,
      message: "You do not have access to this executive"
    });
    return null;
  }

  return executive;
};

/** True only for accounts allowed to grant admin-tier keys. */
const callerCanGrantAdminTier = (req) => {
  const { account, role } = req.user || {};
  return (
    account?.type === "OWNER" ||
    ["OWNER", "COMPANY", "SUPERADMIN"].includes(role)
  );
};

/** Strip admin-tier keys from a permissions object unless the caller may grant them. */
const sanitizePermissionsForCaller = (req, permissions) => {
  const clean = { ...(permissions || {}) };
  if (!callerCanGrantAdminTier(req)) {
    for (const key of ADMIN_TIER) delete clean[key];
  }
  return clean;
};

/** Shape an executive row for API responses (never leak the password hash). */
const publicExecutive = (exec) => ({
  id: exec.id,
  username: exec.username,
  email: exec.email,
  role: exec.role,
  parent_type: exec.parent_type,
  parent_id: exec.parent_id,
  permissions: exec.permissions,
  active: exec.active,
  createdAt: exec.createdAt
});

/* ───────────────────────── handlers ───────────────────────── */

/**
 * CREATE EXECUTIVE
 * POST /executive/create
 */
export const createExecutive = async (req, res) => {
  try {
    if (denyNonAdmins(req, res)) return;

    const { account, role } = req.user;
    const { username, email, password, permissions = {} } = req.body;

    // 1️⃣ Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // 2️⃣ Check duplicate username
    const existing = await Executive.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Executive username already exists"
      });
    }

    // 3️⃣ Strip admin-tier keys the caller isn't allowed to grant
    const cleanPermissions = sanitizePermissionsForCaller(req, permissions);

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Parent = caller's account, role = caller's role
    const executive = await Executive.create({
      parent_type: account.type, // OWNER or STAFF
      parent_id: account.id,
      username,
      email: email || null,
      password: hashedPassword,
      role,
      permissions: cleanPermissions,
      active: true
    });

    return res.status(201).json({
      success: true,
      message: "Executive created successfully",
      executive: publicExecutive(executive)
    });
  } catch (error) {
    console.error("❌ createExecutive error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create executive"
    });
  }
};

/**
 * LIST EXECUTIVES (owned by caller)
 * GET /executive/list
 */
export const getExecutives = async (req, res) => {
  try {
    if (denyNonAdmins(req, res)) return;

    const { account } = req.user;

    const executives = await Executive.findAll({
      where: { parent_type: account.type, parent_id: account.id },
      attributes: [
        "id",
        "username",
        "email",
        "role",
        "permissions",
        "active",
        "createdAt"
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.json({
      success: true,
      count: executives.length,
      executives
    });
  } catch (error) {
    console.error("❌ getExecutives error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch executives"
    });
  }
};

/**
 * UPDATE EXECUTIVE (permissions / email / active)
 * PUT /executive/:id
 * Body: { permissions?, email?, active? } — all optional, permissions merge.
 */
export const updateExecutive = async (req, res) => {
  try {
    if (denyNonAdmins(req, res)) return;

    const executive = await findOwnedExecutive(req, res);
    if (!executive) return;

    const { permissions, email, active } = req.body;

    // Merge incoming perms over existing (partial updates allowed)
    if (permissions && typeof permissions === "object") {
      const merged = { ...(executive.permissions || {}), ...permissions };

      // Caller can't escalate admin-tier keys — freeze them at stored value
      if (!callerCanGrantAdminTier(req)) {
        const stored = executive.permissions || {};
        for (const key of ADMIN_TIER) merged[key] = !!stored[key];
      }

      executive.permissions = merged;
    }

    if (email !== undefined) executive.email = email || null;
    if (active !== undefined) executive.active = !!active;

    await executive.save();

    return res.json({
      success: true,
      message: "Executive updated successfully",
      executive: publicExecutive(executive)
    });
  } catch (error) {
    console.error("❌ updateExecutive error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update executive"
    });
  }
};

/**
 * ENABLE / DISABLE LOGIN (kill switch)
 * PATCH /executive/:id/active
 * Body: { active?: boolean } — omit to toggle.
 */
export const setExecutiveActive = async (req, res) => {
  try {
    if (denyNonAdmins(req, res)) return;

    const executive = await findOwnedExecutive(req, res);
    if (!executive) return;

    const { active } = req.body;
    executive.active = active === undefined ? !executive.active : !!active;
    await executive.save();

    return res.json({
      success: true,
      message: `Executive ${executive.active ? "enabled" : "disabled"}`,
      executive: publicExecutive(executive)
    });
  } catch (error) {
    console.error("❌ setExecutiveActive error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update executive status"
    });
  }
};

/**
 * RESET PASSWORD
 * POST /executive/:id/password
 * Body: { password }
 */
export const changeExecutivePassword = async (req, res) => {
  try {
    if (denyNonAdmins(req, res)) return;

    const executive = await findOwnedExecutive(req, res);
    if (!executive) return;

    const { password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "A password of at least 4 characters is required"
      });
    }

    executive.password = await bcrypt.hash(password, 10);
    await executive.save();

    return res.json({
      success: true,
      message: "Executive password updated successfully"
    });
  } catch (error) {
    console.error("❌ changeExecutivePassword error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
};

/**
 * DELETE EXECUTIVE
 * DELETE /executive/:id
 */
export const deleteExecutive = async (req, res) => {
  try {
    if (denyNonAdmins(req, res)) return;

    const executive = await findOwnedExecutive(req, res);
    if (!executive) return;

    await executive.destroy();

    return res.json({
      success: true,
      message: "Executive deleted successfully"
    });
  } catch (error) {
    console.error("❌ deleteExecutive error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete executive"
    });
  }
};
