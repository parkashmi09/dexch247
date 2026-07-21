/**
 * router.js — System Tracker HTTP routes (per-user verifier; SPORTS phase).
 *
 * Mother-admin (Owner) ONLY. Read-only — diagnoses, never writes money. Gate is a
 * RAW DB read of the requester's account (not a trusted JWT claim), per the System
 * Tracker security rule.
 *
 * Mount (in server.js):
 *   import systemTrackerRoutes from './systemTracker/router.js';
 *   app.use('/api/system-tracker', systemTrackerRoutes);
 *
 * Endpoints (search declared BEFORE the param route so it isn't swallowed):
 *   GET /api/system-tracker/search?q=<>      autocomplete (>=3 chars)
 *   GET /api/system-tracker/:idOrUsername    full per-user integrity report
 */

import express from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { searchUsers, buildUserReport } from './verifier.js';
import { scanAllUsers, getActiveAlerts } from './scanner.js';

const router = express.Router();

// Mother-admin gate: requester must be an active Owner, verified by a RAW read of
// the Owners table (never trust the token's role claim alone).
async function motherAdminOnly(req, res, next) {
  try {
    const actor = req.user?.actor;
    if (!actor || actor.type !== 'OWNER') {
      return res.status(403).json({ success: false, error: 'Mother-admin (Owner) access only' });
    }
    const rows = await sequelize.query(
      `SELECT owner_id, role, account_status FROM "Owners" WHERE owner_id = :id LIMIT 1`,
      { type: QueryTypes.SELECT, replacements: { id: actor.id } }
    );
    const owner = rows[0];
    if (!owner) return res.status(403).json({ success: false, error: 'Owner not found' });
    // account_status is a BOOLEAN in this schema (true = active, stored as 't').
    // Block only on explicitly-inactive values; treat true/'t'/'active'/null as active.
    const st = String(owner.account_status).toLowerCase();
    const inactive = owner.account_status === false || ['f', 'false', '0', 'inactive', 'disabled', 'suspended'].includes(st);
    if (inactive) {
      return res.status(403).json({ success: false, error: 'Owner account is not active' });
    }
    return next();
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

router.use(authMiddleware, motherAdminOnly);

// system-wide scanner: cached alerts (instant) + manual re-scan. Declared BEFORE
// the /:idOrUsername param route so the matcher doesn't swallow them.
router.get('/alerts', async (req, res) => {
  try {
    res.json({ success: true, ...(await getActiveAlerts()) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const summary = await scanAllUsers();
    res.json({ success: true, summary, ...(await getActiveAlerts()) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// autocomplete — MUST be declared before /:idOrUsername
router.get('/search', async (req, res) => {
  try {
    const results = await searchUsers(sequelize, req.query.q);
    res.json({ success: true, results });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// full per-user report
router.get('/:idOrUsername', async (req, res) => {
  try {
    const report = await buildUserReport(sequelize, req.params.idOrUsername);
    if (!report.found) return res.status(404).json({ success: false, ...report });
    res.json({ success: true, ...report });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
