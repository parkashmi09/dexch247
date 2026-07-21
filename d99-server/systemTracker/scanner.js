/**
 * scanner.js — System Tracker system-wide scanner (Tier 1, set-based).
 *
 * Re-expresses the calibration-clean wallet/exposure invariants as ONE aggregate
 * SQL each that returns only the offending users across the WHOLE users table.
 * Cost ≈ (#checks) queries regardless of user count. Findings are persisted to
 * `integrity_alerts` (UNIQUE(user_id,check_key)) and auto-resolved when a later
 * scan no longer sees them. The mother-admin bell reads the cached table; the
 * background worker re-runs scanAllUsers() on an interval.
 *
 * ONLY calibration-clean checks live here (per System Tracker §10). The deep
 * per-bet settlement rules stay in the on-demand per-user verifier (Tier 2).
 */

import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';

const sel = (sql, replacements) => sequelize.query(sql, { type: QueryTypes.SELECT, replacements: replacements || {} });
const run = (sql, replacements) => sequelize.query(sql, { replacements: replacements || {} });

// Settlement P/L ledger predicate (sports 'settlement' + casino BET_WIN/BET_LOSS).
const PL_WHERE = `( LOWER(reason) = 'settlement' OR UPPER(reason) IN ('BET_WIN','BET_LOSS') )`;
// Fancy/independent exposure game_types (everything else team -> MIN/hedge).
const FANCY_GT = `('Normal','Ball By Ball','Over By Over','khado','meter','fancy1')`;
const NOT_BACKLAY = `NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay')`;
// A bet open this many hours past its match start with no settlement is "stuck"
// (e.g. upstream result never declared — the AVRKHUB-400 / spelling-mismatch cases).
// Tuned high enough not to flag long-format matches still in play. Env-tunable.
const STUCK_HOURS = Number(process.env.INTEGRITY_STUCK_HOURS) || 24;

// Each check returns: user_id, username, role, detail (SQL-built with the numbers).
export const CHECKS = [
  {
    key: 'walletDerivation', severity: 'high',
    label: 'Wallet profit_loss = inr_balance − cash_received',
    sql: `
      SELECT CAST(w.user_id AS TEXT) AS user_id, u.username, u.role,
        'profit_loss ' || ROUND(COALESCE(w.profit_loss,0)::numeric,2)
        || ' ≠ inr_balance−cash_received ' || ROUND((COALESCE(w.inr_balance,0)-COALESCE(w.cash_received,0))::numeric,2) AS detail
      FROM "Wallets" w
      JOIN users u ON CAST(u.user_id AS TEXT) = CAST(w.user_id AS TEXT)
      WHERE ABS(COALESCE(w.profit_loss,0) - (COALESCE(w.inr_balance,0) - COALESCE(w.cash_received,0))) > 0.01`,
  },
  {
    key: 'plConsistency', severity: 'high',
    label: 'users.profit = Σ(profit)+Σ(loss) of settlement ledger rows',
    sql: `
      SELECT CAST(u.user_id AS TEXT) AS user_id, u.username, u.role,
        'users.profit ' || ROUND(COALESCE(u.profit,0)::numeric,2)
        || ' ≠ ledger Σ(profit+loss) ' || ROUND(COALESCE(l.pl,0)::numeric,2) AS detail
      FROM users u
      LEFT JOIN (
        SELECT CAST(user_id AS TEXT) AS user_id,
               SUM(COALESCE(profit,0)) + SUM(COALESCE(loss,0)) AS pl
        FROM credits_ledger WHERE ${PL_WHERE}
        GROUP BY CAST(user_id AS TEXT)
      ) l ON l.user_id = CAST(u.user_id AS TEXT)
      WHERE ABS(COALESCE(u.profit,0) - COALESCE(l.pl,0)) > 0.01`,
  },
  {
    key: 'exposure', severity: 'high',
    label: 'net_exposure = market-aware worst-case (team MIN / fancy SUM)',
    sql: `
      SELECT CAST(u.user_id AS TEXT) AS user_id, u.username, u.role,
        'net_exposure ' || ROUND(COALESCE(ne.net_exposure,0)::numeric,2)
        || ' ≠ derived ' || ROUND(COALESCE(d.exp,0)::numeric,2) AS detail
      FROM users u
      LEFT JOIN user_net_exposure ne ON CAST(ne.user_id AS TEXT) = CAST(u.user_id AS TEXT)
      LEFT JOIN (
        SELECT user_id, SUM(grp) AS exp FROM (
          SELECT CAST(user_id AS TEXT) AS user_id, LEAST(0, MIN(exposure_amount)) AS grp
            FROM user_exposures
           WHERE game_type IS NOT NULL
             AND game_type NOT IN ${FANCY_GT} AND game_type NOT LIKE '%Overs Line%' AND ${NOT_BACKLAY}
           GROUP BY CAST(user_id AS TEXT), match_id, game_type, event_id
          UNION ALL
          SELECT CAST(user_id AS TEXT) AS user_id, LEAST(exposure_amount, 0) AS grp
            FROM user_exposures
           WHERE ( game_type IS NULL OR game_type IN ${FANCY_GT}
                   OR game_type LIKE '%Overs Line%' ) AND ${NOT_BACKLAY}
        ) x GROUP BY user_id
      ) d ON d.user_id = CAST(u.user_id AS TEXT)
      WHERE ABS(COALESCE(ne.net_exposure,0) - COALESCE(d.exp,0)) > 0.01`,
  },
  {
    // WALLET CONSERVATION — total balance must equal available cash + actually-locked funds.
    // Locked = per-market WORST-CASE exposure (team MIN / fancy SUM) + casino additive exposer:
    // exactly what placement removes from `cash`. NOT Σ(per-bet liability), which overstates
    // hedged/3-way markets (back+lay offset; the draw caps the loss). Catches any rupee that
    // drifts out of conservation, fleet-wide.
    key: 'walletConservation', severity: 'high',
    label: 'Total balance = available + locked (worst-case) funds',
    sql: `
      SELECT CAST(w.user_id AS TEXT) AS user_id, u.username, u.role,
        'total ' || ROUND(w.inr_balance::numeric,2) || ' ≠ available ' || ROUND(w.cash::numeric,2)
          || ' + locked ' || ROUND(L.locked::numeric,2) || ' (off ' || ROUND((w.inr_balance-(w.cash+L.locked))::numeric,2) || ')' AS detail
      FROM "Wallets" w
      JOIN users u ON CAST(u.user_id AS TEXT) = CAST(w.user_id AS TEXT)
      CROSS JOIN LATERAL (
        SELECT (SELECT COALESCE(SUM(ABS(exposer)),0) FROM casino_bets WHERE user_id=w.user_id AND status IN ('open','processing'))
             + ABS(COALESCE((SELECT SUM(grp) FROM (
                 SELECT LEAST(0,MIN(exposure_amount)) AS grp FROM user_exposures
                  WHERE user_id=w.user_id AND category<>'casino' AND game_type IS NOT NULL
                    AND game_type NOT IN ${FANCY_GT} AND game_type NOT LIKE '%Overs Line%' AND ${NOT_BACKLAY}
                  GROUP BY match_id, game_type, event_id
                 UNION ALL
                 SELECT LEAST(exposure_amount,0) FROM user_exposures
                  WHERE user_id=w.user_id AND category<>'casino'
                    AND (game_type IS NULL OR game_type IN ${FANCY_GT} OR game_type LIKE '%Overs Line%') AND ${NOT_BACKLAY}
               ) z),0)) AS locked
      ) L
      WHERE ABS(w.inr_balance-(w.cash+L.locked)) > 0.01`,
  },
  {
    key: 'missingSelection', severity: 'high',
    label: 'Every bet has a selection',
    sql: `
      SELECT x.user_id, u.username, u.role, COUNT(*) || ' bet(s) with no selection' AS detail
      FROM (
        SELECT CAST(user_id AS TEXT) AS user_id FROM "SportsBet" WHERE COALESCE(selection_name,'') = ''
        UNION ALL
        SELECT CAST(user_id AS TEXT) FROM casino_bets WHERE COALESCE(selection,'') = ''
      ) x JOIN users u ON CAST(u.user_id AS TEXT) = x.user_id
      GROUP BY x.user_id, u.username, u.role`,
  },
  {
    // Unpaid winnings — MARKET-AWARE. MO/BM (team) markets settle PER-MARKET: the whole
    // (user, match, market) group gets ONE net settlement row on its first bet, so a
    // per-bet check would false-positive on every other winning bet in the group (the
    // exact trap §10 warns about). So: a TEAM group is unpaid only if it has winning
    // bets AND zero settlement rows in the ENTIRE group; FANCY bets settle per-bet, so
    // a won fancy bet with no own settlement row is genuinely unpaid.
    key: 'unpaidWin', severity: 'high',
    label: 'Winning bets are paid out',
    sql: `
      SELECT x.user_id, u.username, u.role,
        SUM(x.n)::int || ' winning bet(s)/market(s) with no payout recorded' AS detail
      FROM (
        SELECT g.uid AS user_id, g.won_bets AS n
        FROM (
          SELECT CAST(b.user_id AS TEXT) AS uid, b.match_id, b.market_type,
                 COUNT(*) FILTER (WHERE LOWER(b.result_status)='won') AS won_bets,
                 COUNT(*) FILTER (WHERE LOWER(l.reason)='settlement' AND l.category='SPORTS') AS settle_rows
          FROM "SportsBet" b
          LEFT JOIN credits_ledger l ON CAST(l.bet_id AS TEXT)=CAST(b.id AS TEXT) AND l.category='SPORTS'
          WHERE COALESCE(b.game_type,'') NOT IN ${FANCY_GT} AND LOWER(b.status)='closed'
          GROUP BY 1,2,3
        ) g WHERE g.won_bets > 0 AND g.settle_rows = 0
        UNION ALL
        SELECT CAST(b.user_id AS TEXT) AS user_id, 1 AS n
        FROM "SportsBet" b
        WHERE b.game_type IN ${FANCY_GT} AND LOWER(b.result_status)='won'
          AND NOT EXISTS (SELECT 1 FROM credits_ledger l
            WHERE l.category='SPORTS' AND LOWER(l.reason)='settlement' AND CAST(l.bet_id AS TEXT)=CAST(b.id AS TEXT))
      ) x JOIN users u ON CAST(u.user_id AS TEXT) = x.user_id
      GROUP BY x.user_id, u.username, u.role`,
  },
  {
    // STUCK / never-settled bets — open long past match start with no result. Catches the
    // upstream-result-missing cases (AVRKHUB 400, market_type spelling mismatches) where the
    // settlement pipeline is healthy but has nothing declared to act on.
    key: 'stuckUnsettled', severity: 'high',
    label: `No bet stays open > ${STUCK_HOURS}h past match start (stuck settlement)`,
    sql: `
      SELECT CAST(b.user_id AS TEXT) AS user_id, u.username, u.role,
        COUNT(*) || ' bet(s) open since ' || TO_CHAR(MIN(b.match_start_time),'YYYY-MM-DD') || ' — not settled' AS detail
      FROM "SportsBet" b
      JOIN users u ON CAST(u.user_id AS TEXT) = CAST(b.user_id AS TEXT)
      WHERE LOWER(b.status) IN ('open','manual')
        AND b.match_start_time IS NOT NULL
        AND b.match_start_time < (now() - INTERVAL '${STUCK_HOURS} hours')
      GROUP BY CAST(b.user_id AS TEXT), u.username, u.role`,
  },
  {
    // ORPHAN exposure — exposure rows left behind on a market that has NO open/manual bet
    // (settlement/void should have cleared them). Silently inflates net_exposure / locked cash.
    key: 'orphanExposure', severity: 'high',
    label: 'Settled markets leave no leftover exposure',
    sql: `
      SELECT CAST(ue.user_id AS TEXT) AS user_id, u.username, u.role,
        COUNT(*) || ' exposure row(s) on fully-settled market(s) — not cleared' AS detail
      FROM user_exposures ue
      JOIN users u ON CAST(u.user_id AS TEXT) = CAST(ue.user_id AS TEXT)
      WHERE LOWER(COALESCE(ue.category,'')) = 'sports'
        AND NOT (ue.team_name ILIKE '%back' OR ue.team_name ILIKE '%lay')
        AND NOT EXISTS (
          SELECT 1 FROM "SportsBet" b
           WHERE CAST(b.user_id AS TEXT) = CAST(ue.user_id AS TEXT)
             AND b.match_id = ue.match_id
             AND LOWER(b.status) IN ('open','manual'))
      GROUP BY CAST(ue.user_id AS TEXT), u.username, u.role`,
  },
  // NOTE 1: a per-bet "win/loss vs booked P&L sign" check is intentionally NOT here —
  // MO/BM settle per-MARKET (one net row for a hedged back+lay group), so the row on
  // the group's first bet is the GROUP net, not that bet's P&L. A per-bet sign check
  // false-positives on hedged groups. Wrong-result detection for team markets lives in
  // the market-aware per-user verifier; the fancy-only per-bet sign check is there too.
  // NOTE 2: manual-settle / no-declared-result is informational, shown only in the
  // per-user wallet history (description + 'manual settle' badge), never the bell.
];

export async function ensureTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS integrity_alerts (
      id           SERIAL PRIMARY KEY,
      user_id      TEXT NOT NULL,
      username     TEXT,
      role         TEXT,
      check_key    TEXT NOT NULL,
      label        TEXT,
      detail       TEXT,
      severity     TEXT DEFAULT 'high',
      detected_at  TIMESTAMPTZ DEFAULT now(),
      updated_at   TIMESTAMPTZ DEFAULT now(),
      resolved_at  TIMESTAMPTZ,
      UNIQUE (user_id, check_key)
    )`);
}

/** Run all set-based checks, upsert findings, auto-resolve passers. */
export async function scanAllUsers() {
  await ensureTable();
  const ts = new Date();
  let totalFindings = 0;
  const flagged = new Set();

  for (const check of CHECKS) {
    try {
      const rows = await sel(check.sql);
      for (const r of rows) {
        totalFindings += 1;
        flagged.add(r.user_id);
        await run(
          `INSERT INTO integrity_alerts
             (user_id, username, role, check_key, label, detail, severity, detected_at, updated_at, resolved_at)
           VALUES (:user_id, :username, :role, :check_key, :label, :detail, :severity, :ts, :ts, NULL)
           ON CONFLICT (user_id, check_key) DO UPDATE SET
             username = EXCLUDED.username, role = EXCLUDED.role, label = EXCLUDED.label,
             detail = EXCLUDED.detail, severity = EXCLUDED.severity, updated_at = :ts,
             detected_at = CASE WHEN integrity_alerts.resolved_at IS NULL
                                THEN integrity_alerts.detected_at ELSE :ts END,
             resolved_at = NULL`,
          { user_id: r.user_id, username: r.username || null, role: r.role || null,
            check_key: check.key, label: check.label, detail: r.detail || null,
            severity: check.severity, ts }
        );
      }
    } catch (e) {
      console.error(`[integrity] check ${check.key} failed:`, e.message); // one bad check must not abort the scan
    }
  }

  // auto-resolve: any active row not refreshed in this scan now passes
  await run(`UPDATE integrity_alerts SET resolved_at = :ts, updated_at = :ts
             WHERE resolved_at IS NULL AND updated_at < :ts`, { ts });

  return { scannedAt: ts.toISOString(), totalFindings, flaggedUsers: flagged.size };
}

/** Read the cached table grouped per user (instant — no scan). */
export async function getActiveAlerts() {
  await ensureTable();
  const rows = await sel(
    `SELECT user_id, username, role, check_key, label, detail, severity, detected_at
       FROM integrity_alerts WHERE resolved_at IS NULL
      ORDER BY user_id, check_key`);
  const byUser = new Map();
  for (const r of rows) {
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, { user_id: r.user_id, username: r.username, role: r.role, issues: [] });
    byUser.get(r.user_id).issues.push({ key: r.check_key, label: r.label, detail: r.detail, severity: r.severity, since: r.detected_at });
  }
  const lastScanRows = await sel(`SELECT MAX(updated_at) AS last FROM integrity_alerts`);
  return {
    count: byUser.size,
    totalIssues: rows.length,
    users: Array.from(byUser.values()),
    lastScan: lastScanRows[0] ? lastScanRows[0].last : null,
  };
}

export default { CHECKS, ensureTable, scanAllUsers, getActiveAlerts };
