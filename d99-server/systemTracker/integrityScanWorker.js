/**
 * integrityScanWorker.js — always-on System Tracker scanner.
 *
 * Runs the set-based scan on an interval so wallet/exposure/settlement drift is
 * caught automatically even when no mother-admin has the panel open. The bell just
 * reads the cached `integrity_alerts` table; this worker is what keeps it fresh.
 *
 * Run as its own pm2 app (see systemTracker/ecosystem.config.cjs). Interval is
 * env-tunable (INTEGRITY_SCAN_INTERVAL_MS, default 10 min). Set-based scan finishes
 * in ms on a healthy DB, so a 10-min cadence is essentially free.
 */

import sequelize from '../config/db.js';
import { scanAllUsers, ensureTable } from './scanner.js';

const INTERVAL_MS = Number(process.env.INTEGRITY_SCAN_INTERVAL_MS) || 10 * 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start() {
  try {
    await sequelize.authenticate();
    await ensureTable();
    console.log(`[integrity] scan worker started — every ${INTERVAL_MS} ms`);
  } catch (e) {
    console.error('[integrity] DB connect failed:', e.message);
    process.exit(1);
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const t0 = Date.now();
    try {
      const r = await scanAllUsers();
      const ms = Date.now() - t0;
      if (r.flaggedUsers > 0) console.warn(`[integrity] ${r.flaggedUsers} flagged user(s), ${r.totalFindings} finding(s) in ${ms}ms`);
      else console.log(`[integrity] clean — scanned in ${ms}ms @ ${r.scannedAt}`);
    } catch (e) {
      console.error('[integrity] scan error:', e.message);
    }
    await sleep(INTERVAL_MS);
  }
}

start();
