/**
 * permissionMiddleware.js
 * ---------------------------------------------------------------------------
 * requirePermission(key) — the REAL enforcement of the executive permission
 * map. Attach it to any business route that an executive should only reach
 * when granted the matching feature flag.
 *
 *   router.post("/withdraw", authMiddleware, requirePermission("withdraw"), handler)
 *   router.get ("/users",    authMiddleware, requirePermission("userList"), handler)
 *   router.post("/x", authMiddleware, requirePermission(["deposit","withdraw"]), handler) // any-of
 *
 * Owners and staff are NOT executives, so they bypass every check (next()).
 * Only EXECUTIVE actors are gated, against the `permissions` object that the
 * auth middleware refreshes from the DB on every request.
 *
 * The matching frontend gate lives in d99-admin/src/utils/permissions.js and
 * MUST use byte-identical key strings.
 */
const requirePermission = (key) => (req, res, next) => {
  const actorType = req.user?.actor?.type;

  // Owners / staff (and anyone not an executive) bypass entirely.
  if (actorType !== "EXECUTIVE") return next();

  const permissions = req.user?.permissions || {};

  const allowed = Array.isArray(key)
    ? key.some((k) => !!permissions[k]) // any-of
    : !!permissions[key];

  if (!allowed) {
    return res.status(403).json({
      success: false,
      message: `Permission denied: requires '${Array.isArray(key) ? key.join("' or '") : key}'`
    });
  }

  return next();
};

export default requirePermission;
export { requirePermission };
