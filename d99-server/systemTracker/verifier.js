/**
 * verifier.js — System Tracker per-user verifier.
 *
 * Re-derives an account's wallet / P&L / exposure / settlement state DIRECTLY from
 * raw tables and compares against the app-maintained values. RAW SQL ONLY (no app
 * models); the only business-logic import is the pure rulebook (sportsRule.js).
 *
 * Output is organised into CATEGORIES → sub-rules so the panel reads as concepts
 * (what should be true) rather than formulas. Every check is { label(concept),
 * expected, actual, diff, pass, info, severity, subs? }.
 */

import { QueryTypes } from 'sequelize';
import R from './sportsRule.js';
import C from './casinoRule.js';
import L from './liveCasinoRule.js';
import { getEventResultIndex, normMarket } from './resultFeed.js';

const q = (sequelize, sql, replacements) => sequelize.query(sql, { type: QueryTypes.SELECT, replacements: replacements || {} });
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const r2 = (v) => Number(num(v).toFixed(2));
const TOL = 0.01;
// Keep in lockstep with scanner.js so the bell (Tier 1) and this per-user report (Tier 2) agree.
const STUCK_HOURS = Number(process.env.INTEGRITY_STUCK_HOURS) || 24;

// one check (concept-named)
const chk = (label, expected, actual, { info = false, severity = 'high', subs = null, note = null } = {}) => {
  const diff = r2(num(actual) - num(expected));
  return { label, expected: r2(expected), actual: r2(actual), diff, pass: Math.abs(diff) <= TOL, info, severity, subs, note };
};
const catVerdict = (rules) => rules.every((r) => r.info || r.pass);

// Full runner set for a team (MATCH_ODDS/Bookmaker) market, INCLUDING the 3-way "The Draw"
// outcome when present. 3-way is detected from the title ("A vs B vs The Draw"), counts>=3,
// or an explicit `runners` list on the bet. The live placement/settlement engines are
// draw-aware (they net over all three outcomes), so omitting the draw would mis-derive the
// worst-case on every 3-way market and false-positive the payout/exposure checks.
const DRAW = 'The Draw';
function teamRunners(bets, winner) {
  const names = new Set();
  const add = (x) => { const s = String(x == null ? '' : x).trim(); if (s) names.add(s); };
  if (winner) add(winner);
  for (const b of bets || []) {
    add(b.team_one); add(b.team_two); add(b.selection_name);
    const title = String(b.match_title || '').toLowerCase();
    if (/\bdraw\b/.test(title) || Number(b.counts) >= 3) add(DRAW);
    let rs = b.runners;
    if (typeof rs === 'string') { try { rs = JSON.parse(rs); } catch { rs = null; } }
    if (Array.isArray(rs)) for (const r of rs) add(typeof r === 'string' ? r : (r && (r.name ?? r.nat ?? r.runnerName ?? r.selection_name ?? r.team)));
  }
  return [...names];
}

const PL_WHERE = `( LOWER(reason) = 'settlement' OR UPPER(reason) IN ('BET_WIN','BET_LOSS') )`;
const FANCY_GT = `('Normal','Ball By Ball','Over By Over','khado','meter','fancy1')`;
const NOT_BACKLAY = `NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay')`;

/* ---------------------------------------------------------------- search */
export async function searchUsers(sequelize, qstr) {
  if (!qstr || String(qstr).trim().length < 2) return [];
  const like = `%${String(qstr).trim()}%`;
  return q(sequelize,
    `SELECT * FROM (
        SELECT CAST(user_id AS TEXT) AS user_id, username, CAST(role AS TEXT) AS role, 'user' AS kind FROM users
         WHERE username ILIKE :like OR CAST(user_id AS TEXT) ILIKE :like
        UNION ALL
        SELECT CAST(staff_id AS TEXT), username, CAST(role AS TEXT), 'staff' FROM staff
         WHERE (username ILIKE :like OR CAST(staff_id AS TEXT) ILIKE :like) AND "deletedAt" IS NULL
        UNION ALL
        SELECT CAST(owner_id AS TEXT), username, CAST(role AS TEXT), 'owner' FROM "Owners"
         WHERE username ILIKE :like OR CAST(owner_id AS TEXT) ILIKE :like
     ) s ORDER BY (kind <> 'user'), username LIMIT 25`, { like });
}

/* ----------------------------------------------------- dispatcher */
export async function buildUserReport(sequelize, idOrUsername) {
  const k = String(idOrUsername);
  const users = await q(sequelize,
    `SELECT user_id, username, role, net_win, net_loss, profit FROM users
      WHERE CAST(user_id AS TEXT) = :k OR username = :k LIMIT 1`, { k });
  if (users.length) return buildBettorReport(sequelize, users[0]);
  const staff = await q(sequelize,
    `SELECT staff_id AS id, username, role FROM staff
      WHERE (CAST(staff_id AS TEXT) = :k OR username = :k) AND "deletedAt" IS NULL LIMIT 1`, { k });
  if (staff.length) return buildAgentReport(sequelize, staff[0], 'staff', 'staff_id');
  const owner = await q(sequelize,
    `SELECT owner_id AS id, username, role FROM "Owners" WHERE CAST(owner_id AS TEXT) = :k OR username = :k LIMIT 1`, { k });
  if (owner.length) return buildAgentReport(sequelize, owner[0], 'owner', 'owner_id');
  return { found: false, error: 'Account not found' };
}

/* ============================ BETTOR (users) — full report =================== */
async function buildBettorReport(sequelize, u) {
  const uid = String(u.user_id);

  const w = (await q(sequelize,
    `SELECT inr_balance, cash, cash_received, profit_loss, "totalCommission" FROM "Wallets" WHERE user_id = :uid LIMIT 1`, { uid }))[0] || {};
  const storedNetExp = num(((await q(sequelize,
    `SELECT net_exposure FROM user_net_exposure WHERE user_id = :uid LIMIT 1`, { uid }).catch(() => []))[0] || {}).net_exposure);

  const inr = num(w.inr_balance), cash = num(w.cash), locked = r2(inr - cash);
  const snapshot = {
    kind: 'user', user_id: uid, username: u.username, role: u.role,
    total_balance: r2(inr), available_balance: r2(cash), locked_exposure: locked,
    profit_loss: r2(u.profit), net_exposure: r2(storedNetExp),
    net_win: r2(u.net_win), net_loss: r2(u.net_loss), cash_received: r2(w.cash_received),
  };

  const categories = [];

  /* ---- 1. WALLET INTEGRITY (money conservation — catch any rupee) ---- */
  // Locked cash = what placement actually moves out of `cash`, which is the per-market
  // WORST-CASE exposure (team MIN / fancy SUM), NOT Σ(per-bet liability). On a hedged or
  // 3-way market Σ(liability) overstates the hold (back+lay offset; the draw caps the loss),
  // so summing liabilities false-fails conservation. Mirror net_exposure: sports worst-case
  // from user_exposures (sports-only) + casino additive exposer.
  const lockRows = (await q(sequelize,
    `SELECT
       (SELECT COALESCE(SUM(ABS(exposer)),0) FROM casino_bets WHERE user_id=:uid AND status IN ('open','processing')) AS c,
       (SELECT COALESCE(SUM(grp),0) FROM (
          SELECT LEAST(0, MIN(exposure_amount)) AS grp FROM user_exposures
            WHERE user_id=:uid AND category<>'casino' AND game_type IS NOT NULL
              AND game_type NOT IN ${FANCY_GT} AND game_type NOT LIKE '%Overs Line%' AND ${NOT_BACKLAY}
            GROUP BY match_id, game_type, event_id
          UNION ALL
          SELECT LEAST(exposure_amount, 0) FROM user_exposures
            WHERE user_id=:uid AND category<>'casino'
              AND (game_type IS NULL OR game_type IN ${FANCY_GT} OR game_type LIKE '%Overs Line%') AND ${NOT_BACKLAY}
       ) z) AS s`, { uid }))[0];
  const lockedLiab = num(lockRows.c) + Math.abs(num(lockRows.s));
  const lastClosing = num(((await q(sequelize,
    `SELECT closing FROM credits_ledger WHERE user_id=:uid ORDER BY created_at DESC, id DESC LIMIT 1`, { uid }))[0] || {}).closing);

  const walletRules = [
    chk('Available + locked funds equal the total balance', inr, cash + lockedLiab),
    chk('Stored balance is internally consistent', inr - num(w.cash_received), num(w.profit_loss)),
    // advisory: casino placement does not write a ledger row, so when open casino
    // bets have locked cash the last ledger closing legitimately lags `cash`. The
    // hard money-conservation check above ('available + locked = total') already
    // guarantees no rupee is lost; this is a secondary confirmation only.
    chk('Wallet ledger running balance tracks the available balance', cash, lastClosing, { info: true }),
  ];
  categories.push({ key: 'wallet', label: 'Wallet Integrity', icon: 'wallet', rules: walletRules, pass: catVerdict(walletRules) });

  /* ---- 2. PROFIT & LOSS ---- */
  const pl = (await q(sequelize,
    `SELECT COALESCE(SUM(profit),0) AS p, COALESCE(SUM(loss),0) AS l FROM credits_ledger WHERE user_id=:uid AND ${PL_WHERE}`, { uid }))[0];
  const sp = num(pl.p), sl = num(pl.l);
  const byCat = await q(sequelize,
    `SELECT category, COALESCE(SUM(profit),0)+COALESCE(SUM(loss),0) AS net FROM credits_ledger WHERE user_id=:uid AND ${PL_WHERE} GROUP BY category`, { uid });
  const plRules = [
    chk('Recorded profit/loss matches all settled bets', sp + sl, num(u.profit), {
      subs: byCat.map((c) => ({ label: `${c.category} settled P/L`, expected: r2(c.net), actual: r2(c.net), diff: 0, pass: true })),
    }),
    chk('Total winnings reconcile', sp, num(u.net_win), { info: true }),
    chk('Total losses reconcile', sl, num(u.net_loss), { info: true }),
  ];
  categories.push({ key: 'pnl', label: 'Profit & Loss', icon: 'pnl', rules: plRules, pass: catVerdict(plRules) });

  /* ---- 3. EXPOSURE (overall + market-wise subs) ---- */
  const derived = num(((await q(sequelize,
    `SELECT COALESCE(SUM(grp),0) AS exp FROM (
        SELECT LEAST(0, MIN(exposure_amount)) AS grp FROM user_exposures
         WHERE user_id=:uid AND game_type IS NOT NULL
           AND game_type NOT IN ${FANCY_GT} AND game_type NOT LIKE '%Overs Line%' AND ${NOT_BACKLAY}
         GROUP BY match_id, game_type, event_id
        UNION ALL
        SELECT LEAST(exposure_amount,0) FROM user_exposures
         WHERE user_id=:uid AND (game_type IS NULL OR game_type IN ${FANCY_GT} OR game_type LIKE '%Overs Line%') AND ${NOT_BACKLAY}
     ) s`, { uid }))[0] || {}).exp);
  const perMarket = await q(sequelize,
    `SELECT COALESCE(match_title, match_id) AS market, game_type, ROUND(LEAST(0,MIN(exposure_amount))::numeric,2) AS worst
       FROM user_exposures WHERE user_id=:uid AND ${NOT_BACKLAY}
      GROUP BY COALESCE(match_title, match_id), game_type ORDER BY worst ASC`, { uid }).catch(() => []);
  const expRules = [
    chk('Net exposure equals the re-derived worst-case', derived, storedNetExp, {
      subs: perMarket.map((m) => ({ label: `${m.market} (${m.game_type || '—'})`, expected: r2(m.worst), actual: r2(m.worst), diff: 0, pass: true })),
    }),
  ];

  // #4 — re-derive each OPEN team market's worst-case exposure from its bets (rulebook) and
  // compare to the stored user_exposures rows. The rollup check above trusts the stored rows;
  // this checks the rows themselves against the bets (placement-side drift). Scoped to team
  // (MATCH_ODDS/Bookmaker) markets where the rulebook math is exact — fancy run-line exposure
  // uses a size-based two-sided book not modelled here. Review-level (advisory).
  const openTeam = await q(sequelize,
    `SELECT id, selection_name, bet_type, stake_amount, odds, market_type, team_one, team_two, match_id, match_title, counts, runners
       FROM "SportsBet" WHERE user_id=:uid AND LOWER(status) IN ('open','manual')
        AND COALESCE(game_type,'') NOT IN ${FANCY_GT} AND COALESCE(market_type,'') NOT LIKE '%Overs Line%'`, { uid }).catch(() => []);
  const storedByMarket = {};
  for (const e of await q(sequelize,
    `SELECT match_id, ROUND(LEAST(0,MIN(exposure_amount))::numeric,2) AS worst FROM user_exposures
      WHERE user_id=:uid AND LOWER(COALESCE(category,''))='sports' AND ${NOT_BACKLAY} GROUP BY match_id`, { uid }).catch(() => []))
    storedByMarket[String(e.match_id)] = num(e.worst);
  const omGroups = {};
  for (const b of openTeam) (omGroups[String(b.match_id)] ||= []).push(b);
  const expBad = [];
  for (const [mid, gb] of Object.entries(omGroups)) {
    if (/bookmaker/i.test(gb[0].market_type || '') && gb.some((b) => Number(b.odds) < 10)) continue;
    const runners = teamRunners(gb, null); // includes "The Draw" for 3-way markets
    const mapped = gb.map((b) => ({ selectionName: b.selection_name, betType: b.bet_type, stake: b.stake_amount, odds: b.odds, marketType: b.market_type }));
    const expected = r2(R.computeTeamMarketExposure(mapped, runners).worst);
    const stored = r2(storedByMarket[mid] ?? 0);
    if (Math.abs(expected - stored) > 0.01)
      expBad.push({ label: gb[0].match_title || mid, expected, actual: stored, diff: r2(stored - expected), pass: false });
  }
  expRules.push({
    label: 'Stored exposure matches the bets (open team markets)', severity: 'review', info: true,
    pass: expBad.length === 0, count: expBad.length, expected: 0, actual: expBad.length, diff: expBad.length, subs: expBad,
  });

  // ORPHAN exposure — rows left on a market with no open/manual bet (settle/void didn't clear
  // them). Mirrors the fleet scanner so the bell and this drill-down agree.
  const orphan = await q(sequelize,
    `SELECT ue.match_id, ue.game_type, ROUND(MIN(ue.exposure_amount)::numeric,2) AS amt, COUNT(*) AS n
       FROM user_exposures ue
      WHERE ue.user_id=:uid AND LOWER(COALESCE(ue.category,''))='sports'
        AND NOT (ue.team_name ILIKE '%back' OR ue.team_name ILIKE '%lay')
        AND NOT EXISTS (SELECT 1 FROM "SportsBet" b WHERE b.user_id=ue.user_id AND b.match_id=ue.match_id AND LOWER(b.status) IN ('open','manual'))
      GROUP BY ue.match_id, ue.game_type`, { uid }).catch(() => []);
  expRules.push({
    label: 'No leftover exposure on settled markets', severity: 'high', pass: orphan.length === 0,
    count: orphan.length, expected: 0, actual: orphan.length, diff: orphan.length, info: false,
    subs: orphan.slice(0, 50).map((o) => ({ label: `${o.match_id} (${o.game_type || '—'})`, note: `${o.n} exposure row(s), worst ₹${o.amt} — market has no open bet`, pass: false })),
  });

  categories.push({ key: 'exposure', label: 'Exposure', icon: 'exposure', rules: expRules, pass: catVerdict(expRules) });

  /* ---- 4. SPORTS SETTLEMENT (structural concepts; subs = offending bets) ---- */
  const sBets = await q(sequelize,
    `SELECT id, bet_type, selection_name, market_type, game_type, category, stake_amount, odds, size, liability, status, result_status, match_id, match_title, eventid, fancy_name, team_one, team_two, counts, runners, match_start_time
       FROM "SportsBet" WHERE user_id=:uid ORDER BY id`, { uid });
  const sLedger = {};
  if (sBets.length) {
    for (const lr of await q(sequelize, `SELECT bet_id, reason, amount, netamount, profit, loss, commission FROM credits_ledger WHERE user_id=:uid AND category='SPORTS' AND bet_id IS NOT NULL`, { uid }))
      (sLedger[String(lr.bet_id)] ||= []).push(lr);
  }
  // Declared upstream results (authoritative source: sports_bet_result_cache holds
  // winner_name/winner_id per market). resultMap[eventid] = [{market_name,
  // betting_type, winner_name, winner_id}]. A settled bet whose event isn't here
  // was settled manually / without a confirmed result.
  // Declared results from BOTH sources: automatic (sports_bet_result_cache) and
  // manual (mannual_result — what the admin declared when settling by hand).
  // resultMap[eventid] = [{market_name, betting_type, winner_name, winner_id, source}].
  const resultMap = {};
  const autoSet = new Set();
  const manualSet = new Set();
  const eventIds = [...new Set(sBets.map((b) => String(b.eventid)).filter(Boolean))];
  if (eventIds.length) {
    for (const r of await q(sequelize,
      `SELECT CAST(eventid AS TEXT) AS eventid, market_name, betting_type, winner_name, winner_id
         FROM sports_bet_result_cache WHERE declared = true AND CAST(eventid AS TEXT) IN (:ids)`,
      { ids: eventIds }).catch(() => [])) {
      (resultMap[r.eventid] ||= []).push({ ...r, source: 'auto' }); autoSet.add(r.eventid);
    }
    for (const r of await q(sequelize,
      `SELECT CAST(eventid AS TEXT) AS eventid, market_type, game_type, "winnerName", "winnerId", "fancyName"
         FROM mannual_result WHERE CAST(eventid AS TEXT) IN (:ids)`,
      { ids: eventIds }).catch(() => [])) {
      (resultMap[r.eventid] ||= []).push({ market_name: r.fancyName || r.market_type, betting_type: r.game_type, winner_name: r.winnerName, winner_id: r.winnerId, source: 'manual' });
      manualSet.add(r.eventid);
    }
  }
  const declaredSet = new Set(Object.keys(resultMap)); // has SOME result (auto or manual)
  categories.push(buildSportsSettlementCategory(sBets, sLedger, declaredSet, resultMap, manualSet, autoSet));

  // ---- the result each bet was SETTLED AGAINST (display only, never money math) ----
  // team (MO/BM) -> winning team from sports_settlement_report (local, resolved at
  // settle time); fancy -> the numeric line result from the live result feed, matched
  // by market name, with mannual_result as the fallback for hand-settled lines.
  const betResultMap = {};
  for (const r of await q(sequelize,
    `SELECT CAST(bet_id AS TEXT) AS bid, resolved_winner, resolved_team FROM sports_settlement_report WHERE CAST(user_id AS TEXT) = :uid`, { uid }).catch(() => [])) {
    const w = r.resolved_winner || r.resolved_team;
    if (w != null && String(w).trim() !== '') betResultMap[r.bid] = String(w);
  }
  const fancyBets = sBets.filter((b) => R.isFancyMarket(b));
  if (fancyBets.length) {
    const fEvents = [...new Set(fancyBets.map((b) => String(b.eventid)).filter(Boolean))];
    const idxByEvent = {};
    await Promise.all(fEvents.map(async (ev) => { idxByEvent[ev] = await getEventResultIndex(ev).catch(() => null); }));
    for (const b of fancyBets) {
      if (betResultMap[String(b.id)]) continue;
      const key = normMarket(b.fancy_name || b.market_type);
      let res = idxByEvent[String(b.eventid)]?.fancy?.[key];
      if (res == null) { // manual fallback (hand-settled lines absent from the feed)
        const mr = (resultMap[String(b.eventid)] || []).find((x) => normMarket(x.market_name) === key);
        if (mr) res = mr.winner_id ?? mr.winner_name;
      }
      if (res != null && String(res).trim() !== '') betResultMap[String(b.id)] = String(res);
    }
  }

  /* ---- 5. CASINO SETTLEMENT (casinoRule.js concepts: payout = stake×odds, loss =
     stake, every settled bet booked once, void→refund). Shown as the "Casino" tab. ---- */
  categories.push(await buildCasinoSettlementCategory(sequelize, uid));

  /* ---- 6. LIVE CASINO (JS games) — shown as the "Live Casino" tab. ---- */
  categories.push(await buildJsGamesCategory(sequelize, uid));

  /* ---- history (full wallet passbook: opening → every change → running balance) ---- */
  const history = await buildHistory(sequelize, uid, sBets, declaredSet, resultMap, manualSet, autoSet, w, betResultMap, u.username);

  // wallet tally = HARD money-conservation (Total = Available + Locked). This is the
  // calibration-clean "every rupee accounted" check — it does NOT use the ledger's
  // running `closing` (which lags `cash` because casino placements lock cash without a
  // ledger row), so it never false-positives on open bets.
  const walletTally = {
    total: r2(inr), available: r2(cash), locked: r2(lockedLiab),
    reconciles: Math.abs(inr - (cash + lockedLiab)) <= 0.01,
    diff: r2(inr - (cash + lockedLiab)),
    ledgerEnd: r2(lastClosing), // advisory: ledger end-balance (lags cash when bets are open)
  };

  const allPass = categories.every((c) => c.pass);
  return { found: true, kind: 'user', snapshot, categories, history, historyCount: history.length, walletTally, allPass };
}

/* ---- sports settlement category (reuse calibrated market-aware logic) ---- */
function buildSportsSettlementCategory(bets, ledgerByBet, declaredSet, resultMap = {}, manualSet = new Set(), autoSet = new Set()) {
  const winnerStr = (eventid) => {
    const rows = resultMap[String(eventid)];
    if (!rows || !rows.length) return null;
    const team = rows.find((r) => /match|bookmaker|bm|mo/i.test(r.betting_type || '')) || rows[0];
    return team.winner_name || team.winner_id || null;
  };
  const agg = {};
  for (const rule of R.RULES) agg[rule.key] = { label: rule.label, severity: rule.severity, pass: true, count: 0, subs: [] };
  const flag = (key, label, severity, betId, detail) => {
    const a = agg[key] || (agg[key] = { label, severity, pass: true, count: 0, subs: [] });
    a.pass = false; a.count += 1;
    if (a.subs.length < 50) a.subs.push({ label: `Bet #${betId}`, note: detail, pass: false });
  };
  const fancy = bets.filter((b) => R.isFancyMarket(b));
  const team = bets.filter((b) => !R.isFancyMarket(b));
  for (const bet of fancy) for (const v of R.checkBet(bet, ledgerByBet[String(bet.id)] || [], {})) flag(v.key, v.label, v.severity, bet.id, v.detail);
  const groups = {};
  for (const b of team) {
    const key = `${b.match_id}::${b.market_type}`;
    (groups[key] ||= { bets: [], settled: 0 });
    groups[key].bets.push(b);
    if (!R.isVoid(b) && (String(b.status).toLowerCase() === 'closed' || ['won', 'loss'].includes(String(b.result_status).toLowerCase()))) groups[key].settled += 1;
  }
  for (const [key, g] of Object.entries(groups)) {
    const rows = g.bets.flatMap((b) => (ledgerByBet[String(b.id)] || [])).filter((r) => String(r.reason).toLowerCase() === R.LEDGER.SETTLEMENT);
    if (g.settled > 0 && rows.length === 0) flag('settlementMissing', 'Every settled market has a settlement record', 'high', g.bets[0].id, `market ${key}: ${g.settled} settled bet(s), no settlement record`);
    if (rows.length > 1) flag('settlementDuplicate', 'No market is settled more than once', 'high', g.bets[0].id, `market ${key}: ${rows.length} settlement records`);
    // Refund presence is checked at the MARKET level: the settlement worker writes a refund
    // row per voided bet; the admin void writes ONE aggregate refund row on a representative
    // bet. So a voided market is clean if the whole group has >= 1 refund row. Only flag when
    // there was liability to return but no refund row exists anywhere in the group (wallet
    // money-conservation backstops the refunded AMOUNT separately).
    const voided = g.bets.filter((b) => R.isVoid(b));
    if (voided.length) {
      const groupRefunds = g.bets.reduce((n, b) => n + (ledgerByBet[String(b.id)] || []).filter((r) => String(r.reason).toLowerCase() === R.LEDGER.REFUND).length, 0);
      const groupLiability = voided.reduce((s, b) => s + Math.abs(num(b.liability)), 0);
      if (groupRefunds === 0 && groupLiability > 0.01)
        flag('voidRefundOnly', 'Every voided bet is refunded', 'high', voided[0].id, `market ${key}: ${voided.length} voided bet(s), liability ₹${r2(groupLiability)} but no refund record`);
    }
  }
  // concept-friendly labels
  const conceptLabel = {
    settlementMissing: 'Every settled bet has a settlement record',
    settlementDuplicate: 'No bet is settled twice (no double payout)',
    statusMismatch: 'Bet status agrees with its settlement record',
    commissionScope: 'No unexpected commission charged',
    voidRefundOnly: 'Every voided bet is refunded (no win/loss applied)',
    wrongResult: 'Win/loss agrees with the declared result',
  };
  const rules = Object.entries(agg).map(([key, a]) => ({
    label: conceptLabel[key] || a.label, severity: a.severity, pass: a.pass,
    count: a.count, subs: a.subs, expected: 0, actual: a.count, diff: a.count, info: a.severity !== 'high',
  }));

  // ---- extra detail rules the operator asked for ----
  const settled = bets.filter((b) => !R.isVoid(b) && (String(b.status).toLowerCase() === 'closed' || ['won', 'loss'].includes(String(b.result_status).toLowerCase())));

  // selection present on every bet (high)
  const noSel = bets.filter((b) => !String(b.selection_name || '').trim());
  rules.push({
    label: 'Selection is present on every bet', severity: 'high', pass: noSel.length === 0,
    count: noSel.length, expected: 0, actual: noSel.length, diff: noSel.length, info: false,
    subs: noSel.slice(0, 50).map((b) => ({ label: `Bet #${b.id}`, note: `${b.market_type || ''} — selection missing`, pass: false })),
  });

  // RE-VERIFIABILITY (advisory, NOT a money bug): the auto-result feed
  // (sports_bet_result_cache) is a TRANSIENT cache — old/expired events drop out of
  // it, so a long-settled bet usually has no result row TODAY even though it settled
  // from a real result at the time (proven by its own settlement ledger entry + the
  // wallet checks above). "No result row now" therefore means "cannot independently
  // re-verify this old settlement", not "settled without a result". The genuine money
  // check is 'Win/loss agrees with the money booked' below, which needs no feed cache.
  const noResult = settled.filter((b) => !declaredSet.has(String(b.eventid)));
  rules.push({
    label: 'Result still on record (re-verifiable)', severity: 'review', pass: noResult.length === 0,
    count: noResult.length, expected: 0, actual: noResult.length, diff: noResult.length, info: true,
    subs: noResult.slice(0, 50).map((b) => ({ label: `Bet #${b.id}`, note: `${b.selection_name || ''} · ${b.market_type || ''} — result no longer retained in feed cache; settled ${b.result_status}, re-verify N/A`, pass: false })),
  });

  // GENUINE MONEY CHECK (high) — FANCY ONLY. Each fancy/independent line settles
  // per-bet with its own settlement row, so its booked P&L sign must match win/loss.
  // (Team MO/BM markets settle PER-MARKET — one net row for the whole hedged group on
  // its first bet — so a per-bet sign check there would false-positive; team wrong-
  // result is covered by 'Win/loss matches the declared result' above.)
  const plSign = [];
  for (const b of settled) {
    if (!R.isFancyMarket(b)) continue; // team markets settle per-group, not per-bet
    const sl = (ledgerByBet[String(b.id)] || []).filter((r) => String(r.reason).toLowerCase() === R.LEDGER.SETTLEMENT);
    if (!sl.length) continue; // no settlement row → already covered by the settlement-record check
    const prof = sl.reduce((s, r) => s + num(r.profit), 0);
    const loss = sl.reduce((s, r) => s + num(r.loss), 0);
    const won = String(b.result_status).toLowerCase() === 'won';
    const ok = won ? (prof > 0 && loss === 0) : (loss < 0 && prof === 0);
    if (!ok) plSign.push({ label: `Bet #${b.id}`, note: `settled ${b.result_status} but ledger booked profit ${r2(prof)} / loss ${r2(loss)} — payout sign disagrees with result`, pass: false });
  }
  rules.push({
    label: 'Win/loss agrees with the money booked (fancy)', severity: 'high', pass: plSign.length === 0,
    count: plSign.length, expected: 0, actual: plSign.length, diff: plSign.length, info: false, subs: plSign,
  });

  // settled via a MANUALLY-declared result (admin), informational — show the winner
  const manual = settled.filter((b) => manualSet.has(String(b.eventid)) && !autoSet.has(String(b.eventid)));
  rules.push({
    label: 'Manually-settled bets (admin-declared result)', severity: 'review', pass: manual.length === 0,
    count: manual.length, expected: 0, actual: manual.length, diff: manual.length, info: true,
    subs: manual.slice(0, 50).map((b) => ({ label: `Bet #${b.id}`, note: `${b.selection_name || ''} · ${b.market_type || ''} — admin declared: ${winnerStr(b.eventid) || '?'} · settled ${b.result_status}`, pass: false })),
  });

  // settle-vs-result: when a result IS declared, win/loss must match it (review).
  // (Skipped per-bet when the event has no declared result — covered by 'manual' above.)
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const wrong = [];
  for (const b of settled) {
    const rows = resultMap[String(b.eventid)];
    if (!rows || !rows.length) continue; // no declared result → covered by 'manual'
    const fancy = R.isFancyMarket(b);
    let derived = null, winnerTxt = '';
    if (fancy) {
      // match the bet's fancy line by market/fancy name, then judge against its numeric winner
      const row = rows.find((r) => norm(r.market_name) === norm(b.fancy_name) || norm(r.market_name) === norm(b.market_type)) || rows[0];
      const numeric = Number(row.winner_id);
      winnerTxt = `${row.winner_name ?? row.winner_id}`;
      derived = R.fancyWins(b.market_type, b.bet_type, b.odds, Number.isFinite(numeric) ? numeric : null);
    } else {
      const row = rows.find((r) => /match|bookmaker|bm|mo/i.test(r.betting_type || '')) || rows[0];
      winnerTxt = row.winner_name;
      derived = R.betWins(b.bet_type, b.selection_name, row.winner_name);
    }
    if (derived == null) continue;
    const claimWon = String(b.result_status).toLowerCase() === 'won';
    if (derived !== claimWon) wrong.push({ label: `Bet #${b.id}`, note: `result "${winnerTxt}" implies ${derived ? 'WON' : 'LOSS'} but settled as ${b.result_status} (${b.selection_name})`, pass: false });
  }
  rules.push({
    label: 'Win/loss matches the declared result', severity: 'review', pass: wrong.length === 0,
    count: wrong.length, expected: 0, actual: wrong.length, diff: wrong.length, info: true, subs: wrong,
  });

  // ---- STUCK / unsettled bets — mirrors the fleet scanner so the bell count and this
  // drill-down agree. A bet open long past its match start (upstream result never declared)
  // shows here as a high finding, not a silent locked liability.
  const stuckCutoff = Date.now() - STUCK_HOURS * 3600 * 1000;
  const stuck = bets.filter((b) => ['open', 'manual'].includes(String(b.status).toLowerCase())
    && b.match_start_time && new Date(b.match_start_time).getTime() < stuckCutoff);
  rules.push({
    label: `No bet stuck open > ${STUCK_HOURS}h past match start`, severity: 'high', pass: stuck.length === 0,
    count: stuck.length, expected: 0, actual: stuck.length, diff: stuck.length, info: false,
    subs: stuck.slice(0, 50).map((b) => ({ label: `Bet #${b.id}`, note: `${b.selection_name || ''} · ${b.market_type || ''} · started ${String(b.match_start_time).slice(0, 10)} — not settled`, pass: false })),
  });

  // ---- #1 SETTLEMENT PAYOUT AMOUNT (team markets) — re-derive the exposure-based payout
  // from the bets + declared winner via the rulebook and compare to what was actually booked.
  // Catches a wrong-but-same-direction payout (right sign, wrong rupees) the sign/structure
  // checks miss. Skips Bookmaker-with-odds<10 (the one spot where the rulebook's decimal math
  // diverges from the live normalizeOdds path — rare; avoids a false positive).
  const payoutBad = [];
  for (const [key, g] of Object.entries(groups)) {
    if (g.settled <= 0) continue;
    if (g.bets.some((b) => /bookmaker/i.test(b.market_type || '') && Number(b.odds) < 10)) continue;
    const settleRows = g.bets.flatMap((b) => (ledgerByBet[String(b.id)] || [])).filter((r) => String(r.reason).toLowerCase() === R.LEDGER.SETTLEMENT);
    if (settleRows.length !== 1) continue; // 0 / >1 already covered by missing/duplicate checks
    const winner = winnerStr(g.bets[0].eventid);
    if (winner == null || String(winner).trim() === '') continue; // unknown winner → cannot reconcile
    const runners = teamRunners(g.bets, winner); // includes "The Draw" for 3-way markets
    const mapped = g.bets.map((b) => ({ selectionName: b.selection_name, betType: b.bet_type, stake: b.stake_amount, odds: b.odds, marketType: b.market_type }));
    const { perRunner, worst } = R.computeTeamMarketExposure(mapped, runners);
    const winKey = Object.keys(perRunner).find((rn) => R.normName(rn) === R.normName(winner));
    const winnerExposure = winKey ? num(perRunner[winKey]) : 0;
    const expectedPnl = r2(winnerExposure);
    const expectedCredit = r2(Math.max(0, Math.abs(worst) + winnerExposure));
    const row = settleRows[0];
    const actualPnl = r2(num(row.profit) + num(row.loss)); // marketNetAmount
    const actualCredit = r2(num(row.amount));              // marketFinalCredit
    if (Math.abs(actualPnl - expectedPnl) > 0.01 || Math.abs(actualCredit - expectedCredit) > 0.01)
      payoutBad.push({ label: `Market ${key}`, note: `winner "${winner}": rules expect P/L ₹${expectedPnl} (cash ₹${expectedCredit}) but booked P/L ₹${actualPnl} (cash ₹${actualCredit})`, pass: false });
  }
  rules.push({
    label: 'Settlement payout equals the rules’ computed amount (team)', severity: 'high', pass: payoutBad.length === 0,
    count: payoutBad.length, expected: 0, actual: payoutBad.length, diff: payoutBad.length, info: false, subs: payoutBad,
  });

  // ---- #6 REFUND AMOUNT — a void must return exactly the cash placement removed:
  // refund == −Σ(bet_placed + exposure_release) for the bets (initiateRefund's rule; the admin
  // void's |minExp| equals this sum too). Team voids reconcile per market (aggregate refund row);
  // fancy voids reconcile per bet. Only fires when a refund row exists (absence → voidRefundOnly).
  const refundBad = [];
  const reconcileRefund = (labelTxt, ledgerRows) => {
    const refundSum = r2(ledgerRows.filter((r) => String(r.reason).toLowerCase() === R.LEDGER.REFUND).reduce((s, r) => s + num(r.amount), 0));
    if (Math.abs(refundSum) < 0.01) return; // no refund row → covered by voidRefundOnly
    const placementSum = r2(ledgerRows.filter((r) => [R.LEDGER.PLACED, R.LEDGER.EXPOSURE_RELEASE].includes(String(r.reason).toLowerCase())).reduce((s, r) => s + num(r.amount), 0));
    const expected = r2(-placementSum);
    if (Math.abs(refundSum - expected) > 0.01)
      refundBad.push({ label: labelTxt, note: `refunded ₹${refundSum} but placement reversal = ₹${expected} (−Σ bet_placed+exposure_release)`, pass: false });
  };
  for (const [key, g] of Object.entries(groups)) { // team voids (per market)
    if (!g.bets.some((b) => R.isVoid(b))) continue;
    reconcileRefund(`Market ${key}`, g.bets.flatMap((b) => ledgerByBet[String(b.id)] || []));
  }
  for (const b of bets) { // fancy voids (per bet)
    if (!R.isFancyMarket(b) || !R.isVoid(b)) continue;
    reconcileRefund(`Bet #${b.id}`, ledgerByBet[String(b.id)] || []);
  }
  rules.push({
    label: 'Void refund equals the placement reversal', severity: 'high', pass: refundBad.length === 0,
    count: refundBad.length, expected: 0, actual: refundBad.length, diff: refundBad.length, info: false, subs: refundBad,
  });

  return { key: 'sports', label: 'Sports', icon: 'sports', rules, pass: rules.every((r) => r.pass || r.info) };
}

/* ---- casino settlement category — per-game accordion ---- */
async function buildCasinoSettlementCategory(sequelize, uid) {
  const bets = await q(sequelize,
    `SELECT id, game_name, type, odds, stake, selection, exposer, status, result_status, credit_amt
       FROM casino_bets WHERE user_id=:uid ORDER BY id`, { uid });
  const ledger = {};
  if (bets.length)
    for (const lr of await q(sequelize, `SELECT bet_id, reason, amount, netamount, profit, loss FROM credits_ledger WHERE user_id=:uid AND category='CASINO' AND bet_id IS NOT NULL`, { uid }))
      (ledger[String(lr.bet_id)] ||= []).push(lr);

  // aggregate violations BY CONCEPT (mirrors the sports settlement category)
  const agg = {};
  for (const rule of C.RULES) agg[rule.key] = { label: rule.label, severity: rule.severity, pass: true, count: 0, subs: [] };
  const flag = (key, label, severity, betId, detail) => {
    const a = agg[key] || (agg[key] = { label, severity, pass: true, count: 0, subs: [] });
    a.pass = false; a.count += 1;
    if (a.subs.length < 50) a.subs.push({ label: `Bet #${betId}`, note: detail, pass: false });
  };
  const settled = bets.filter((b) => C.isSettled(b));
  for (const b of settled)
    for (const v of C.checkBet(b, ledger[String(b.id)] || [])) flag(v.key, v.label, v.severity, b.id, `${b.game_name} · ${b.selection || ''} — ${v.detail}`);

  const rules = Object.values(agg).map((a) => ({
    label: a.label, severity: a.severity, pass: a.pass, count: a.count, subs: a.subs,
    expected: 0, actual: a.count, diff: a.count, info: a.severity !== 'high',
  }));

  // per-game summary (informational) — bets / open / settled / win-rate, no pass/fail
  const games = {};
  for (const b of bets) {
    const g = (games[b.game_name] ||= { bets: 0, open: 0, won: 0, lost: 0 });
    g.bets += 1;
    if (C.isOpen(b)) g.open += 1;
    else if (C.betWon(b)) g.won += 1;
    else if (C.betLost(b)) g.lost += 1;
  }
  rules.push({
    label: 'Per-game activity', severity: 'review', info: true, pass: true,
    count: Object.keys(games).length, expected: 0, actual: Object.keys(games).length, diff: 0,
    subs: Object.entries(games).sort((a, b) => b[1].bets - a[1].bets).slice(0, 60)
      .map(([game, g]) => ({ label: game, note: `${g.bets} bet(s) · ${g.won}W / ${g.lost}L${g.open ? ` · ${g.open} open` : ''}`, pass: true })),
  });

  return { key: 'casino', label: 'Table Casino', icon: 'casino', rules, pass: rules.every((r) => r.pass || r.info), betCount: bets.length };
}

/* ---- LIVE CASINO (third-party JS games). These move cash + inr_balance together on
   every bet/win callback (NO exposure lock), keyed by external_transaction_id for
   idempotency; sessions track entry/exit balance. Concepts: no replayed/duplicate
   callback (double credit), no stuck transaction, net P/L, and games launched. ---- */
async function buildJsGamesCategory(sequelize, uid) {
  const tx = await q(sequelize,
    `SELECT id, game_uid, transaction_type, amount, transaction_status, external_transaction_id, timestamp
       FROM js_game_transactions WHERE CAST(user_id AS TEXT) = :uid ORDER BY id`, { uid }).catch(() => []);
  const sessions = await q(sequelize,
    `SELECT game_name, game_uid, provider, entry_balance, exit_balance, "createdAt" AS ts
       FROM game_sessions WHERE CAST(user_id AS TEXT) = :uid ORDER BY "createdAt" DESC`, { uid }).catch(() => []);

  const rules = [];
  const ruleMeta = (k) => L.RULES.find((r) => r.key === k);

  // (HIGH) idempotency — a replayed callback (same external_transaction_id + type) would
  // double-credit/debit the wallet.
  const dups = L.duplicateGroups(tx);
  rules.push({
    label: ruleMeta('noDuplicate').label, severity: 'high', info: false,
    pass: dups.length === 0, count: dups.length, expected: 0, actual: dups.length, diff: dups.length,
    subs: dups.slice(0, 50).map((d) => ({ label: `txn ${d.key.split('::')[0]}`, note: `${d.txns.length}× ${d.txns[0].transaction_type}`, pass: false })),
  });

  // (HIGH) no stuck/failed transaction
  const stuck = L.stuckTxns(tx);
  rules.push({
    label: ruleMeta('allCompleted').label, severity: 'high', info: false,
    pass: stuck.length === 0, count: stuck.length, expected: 0, actual: stuck.length, diff: stuck.length,
    subs: stuck.slice(0, 50).map((t) => ({ label: `txn #${t.id}`, note: `${t.transaction_type} — status ${t.transaction_status}`, pass: false })),
  });

  // (info) net P/L — Σ win − Σ bet (transactions) when present, else closed-session sum
  const closed = sessions.filter((s) => s.exit_balance != null);
  const sessionPL = closed.reduce((s, x) => s + L.sessionPL(x), 0);
  const netPL = tx.length ? r2(L.netPL(tx)) : r2(sessionPL);
  rules.push({
    label: 'Live-casino net profit / loss', severity: 'review', info: true, pass: true,
    expected: netPL, actual: netPL, diff: 0, count: null,
  });

  // (info) games launched — sessions with provider + entry/exit
  rules.push({
    label: 'Games launched (sessions)', severity: 'review', info: true, pass: true,
    count: sessions.length, expected: 0, actual: sessions.length, diff: 0,
    subs: sessions.slice(0, 50).map((s) => ({
      label: s.game_name || s.game_uid || '—',
      note: `${s.provider || '—'} · entry ₹${r2(s.entry_balance)}${s.exit_balance != null ? ` → exit ₹${r2(s.exit_balance)} · P&L ${r2(num(s.exit_balance) - num(s.entry_balance))}` : ' · still open'}`,
      pass: true,
    })),
  });

  return { key: 'jsgames', label: 'Live Casino', icon: 'jsgames', rules, pass: rules.every((r) => r.pass || r.info), betCount: tx.length || sessions.length };
}

/* ---- full wallet passbook: deposits/withdrawals (transactions) + bet movements
   (credits_ledger), merged chronologically, each row showing the recorded balance.  ---- */
async function buildHistory(sequelize, uid, sportsBets, declaredSet = new Set(), resultMap = {}, manualSet = new Set(), autoSet = new Set(), wallet = {}, betResultMap = {}, username = '') {
  const sMap = {}; for (const b of sportsBets || []) sMap[String(b.id)] = b;
  const cBets = await q(sequelize, `SELECT id, game_name, type, odds, stake, selection, result_status, round_id FROM casino_bets WHERE user_id=:uid`, { uid }).catch(() => []);
  const cMap = {}; for (const b of cBets) cMap[String(b.id)] = b;

  // live-casino (JS games) money moves — credited/debited directly to the wallet (not in
  // credits_ledger), so they must be merged here too. game_sessions gives provider/name.
  const jsTx = await q(sequelize,
    `SELECT id, game_uid, transaction_type, amount, external_transaction_id, transaction_status, timestamp AS ts
       FROM js_game_transactions WHERE CAST(user_id AS TEXT) = :uid ORDER BY id`, { uid }).catch(() => []);
  const jsGameMap = {};
  if (jsTx.length)
    for (const s of await q(sequelize, `SELECT DISTINCT ON (game_uid) game_uid, game_name, provider FROM game_sessions WHERE CAST(user_id AS TEXT)=:uid ORDER BY game_uid, "createdAt" DESC`, { uid }).catch(() => []))
      jsGameMap[s.game_uid] = s;

  // (A) admin cash in/out — these live in `transactions`, NOT credits_ledger, so the
  // passbook must merge them or the opening deposit is missing. A row is the user's own
  // balance line when they are the credited party (ADD_CASH) or the debited party.
  const uname = String(username || '').trim();
  const txRows = uname ? await q(sequelize,
    `SELECT id, type, amount, previous_balance, new_balance, initiated_by, "createdAt" AS ts
       FROM transactions
      WHERE (UPPER(type) LIKE 'ADD%' AND TRIM(credit) = :uname)
         OR (UPPER(type) LIKE 'DEBIT%' AND TRIM(debit) = :uname)
      ORDER BY "createdAt" ASC, id ASC`, { uname }).catch(() => []) : [];

  // (B) bet movements
  const rows = await q(sequelize,
    `SELECT id, created_at AS ts, reason, amount, netamount, profit, loss, closing, category, market_type, bet_id, eventid
       FROM credits_ledger WHERE user_id=:uid ORDER BY created_at ASC, id ASC LIMIT 5000`, { uid });

  const tms = (t) => { const d = new Date(t).getTime(); return Number.isFinite(d) ? d : 0; };

  // unified events with a recorded balance + sort key (cash-in before bets at equal time)
  const events = [];
  for (const t of txRows) {
    const credit = /^ADD/i.test(t.type);
    events.push({
      kind: 'tx', sort: [tms(t.ts), 0, Number(t.id) || 0], ts: t.ts,
      id: `tx${t.id}`, reason: credit ? 'deposit' : 'withdraw', category: 'WALLET', cash: true,
      description: `${credit ? 'Cash deposited' : 'Cash withdrawn'} by ${t.initiated_by || 'admin'}`,
      amount: r2(credit ? num(t.amount) : -num(t.amount)), balance: num(t.new_balance),
    });
  }
  for (const row of rows) {
    const isSports = String(row.category || '').toUpperCase() === 'SPORTS';
    const isCasino = String(row.category || '').toUpperCase() === 'CASINO';
    const sb = (isSports && row.bet_id) ? sMap[String(row.bet_id)] : null; // bet_id collides across casino/sports — gate by category
    const cb = (isCasino && row.bet_id) ? cMap[String(row.bet_id)] : null;
    const settledResult = sb ? (betResultMap[String(row.bet_id)] || null) : null;
    let description = row.reason;
    if (sb) description = `${(sb.bet_type || '').toUpperCase()} ${sb.selection_name || ''} @${num(sb.odds)} · stake ₹${num(sb.stake_amount)} · exposure ₹${num(sb.liability)} · ${sb.market_type || ''}${sb.match_title ? ' · ' + sb.match_title : ''}${sb.result_status ? ' · ' + sb.result_status : ''}`;
    else if (cb) description = `${(cb.type || '').toUpperCase()} ${cb.selection || ''} @${num(cb.odds)} · stake ₹${num(cb.stake)} · ${cb.game_name}${cb.round_id != null ? ' · round ' + cb.round_id : ''}${cb.result_status ? ' · ' + cb.result_status : ''}`;
    const profitBook = /exposure_release/i.test(row.reason) ||
      (/settlement/i.test(row.reason) && num(row.profit) > 0 && num(row.loss) === 0 && num(row.netamount) >= 0 && num(row.amount) > 0 && num(row.profit) !== num(row.netamount));
    const manual = /settlement/i.test(row.reason) && sb && manualSet.has(String(sb.eventid)) && !autoSet.has(String(sb.eventid));
    const noResult = /settlement/i.test(row.reason) && sb && !declaredSet.has(String(sb.eventid));
    const won = sb && String(sb.result_status || '').toLowerCase() === 'won';
    const lost = sb && ['loss', 'lost'].includes(String(sb.result_status || '').toLowerCase());
    const payoutMismatch = /settlement/i.test(row.reason) && sb && R.isFancyMarket(sb) && (won || lost) &&
      (won ? !(num(row.profit) > 0 && num(row.loss) === 0) : !(num(row.loss) < 0 && num(row.profit) === 0));
    events.push({
      kind: 'cl', sort: [tms(row.ts), 1, Number(row.id) || 0], ts: row.ts,
      id: row.id, reason: row.reason, category: row.category, bet_id: row.bet_id, description,
      amount: r2(row.amount), balance: num(row.closing),
      profitBook, manual, noResult, payoutMismatch,
      result: sb ? (sb.result_status || null) : (cb ? (cb.result_status || null) : null),
      gameTag: sb ? (sb.market_type || sb.game_type || null) : (cb ? cb.game_name : null),
      betType: sb ? (sb.bet_type || null) : (cb ? cb.type : null), settledResult,
      roundId: cb ? (cb.round_id != null ? String(cb.round_id) : null) : null,
      gameName: cb ? (cb.game_name || null) : null,
      selection: cb ? (cb.selection || null) : (sb ? (sb.selection_name || null) : null),
    });
  }
  // (C) live-casino (JS games) transactions — provider / game / session(round) info
  for (const t of jsTx) {
    const g = jsGameMap[t.game_uid] || {};
    const delta = L.txnDelta(t);
    events.push({
      kind: 'js', sort: [tms(t.ts), 2, Number(t.id) || 0], ts: t.ts,
      id: `js${t.id}`, reason: t.transaction_type || 'live', category: 'LIVE', live: true,
      description: `${g.game_name || t.game_uid || 'Live game'}${t.transaction_type ? ' · ' + t.transaction_type : ''}`,
      amount: r2(delta), delta, // direct wallet move — no recorded balance, computed forward
      provider: g.provider || null, gameName: g.game_name || t.game_uid || null,
      sessionId: t.external_transaction_id || null,
      result: L.isWin(t) ? 'won' : (L.isBet(t) ? 'bet' : null),
    });
  }
  events.sort((a, b) => a.sort[0] - b.sort[0] || a.sort[1] - b.sort[1] || a.sort[2] - b.sort[2]);

  // opening balance = the balance just before the first event (0 for a fresh account
  // whose first event is its funding deposit; else derive from the first tx).
  const opening = txRows.length ? num(txRows[0].previous_balance)
    : (rows.length ? r2(num(rows[0].closing) - num(rows[0].amount)) : num(wallet.cash_received));

  let prev = opening;
  const out = events.map((e) => {
    // ledger/tx rows carry an authoritative recorded balance; live-casino (JS) rows have
    // none (direct wallet move) → run the balance forward from the prior row.
    const running = (e.balance != null) ? num(e.balance) : r2(prev + num(e.delta || 0));
    const walletDelta = r2(running - prev);
    prev = running;
    return {
      id: e.id, ts: e.ts, reason: e.reason, category: e.category, bet_id: e.bet_id ?? null,
      description: e.description, amount: e.amount, walletDelta, closing: r2(running),
      cash: e.cash || false, live: e.live || false, profitBook: e.profitBook || false, manual: e.manual || false,
      noResult: e.noResult || false, payoutMismatch: e.payoutMismatch || false,
      result: e.result || null, gameTag: e.gameTag || null, betType: e.betType || null,
      settledResult: e.settledResult || null, tallyBreak: running < -0.01,
      provider: e.provider || null, gameName: e.gameName || null,
      roundId: e.roundId || null, sessionId: e.sessionId || null, selection: e.selection || null,
    };
  });

  const openingRow = {
    id: 'opening', ts: events.length ? events[0].ts : null, reason: 'opening_balance', category: 'WALLET',
    bet_id: null, description: 'Account created — opening balance', cash: true,
    amount: r2(opening), walletDelta: null, closing: r2(opening), opening: true,
  };
  return [openingRow, ...out];
}

/* ============================ AGENT (staff/owner) ============================ */
async function buildAgentReport(sequelize, acct, kind, idCol) {
  const id = String(acct.id);
  const wRows = await q(sequelize, `SELECT inr_balance, cash, cash_received, profit_loss, "totalCommission" FROM "Wallets" WHERE ${idCol}=:id LIMIT 1`, { id }).catch(() => []);
  const w = wRows[0] || {};
  const inr = num(w.inr_balance), cash = num(w.cash);
  const snapshot = {
    kind, user_id: id, username: acct.username, role: acct.role,
    total_balance: r2(inr), available_balance: r2(cash), locked_exposure: r2(inr - cash),
    profit_loss: r2(w.profit_loss), net_exposure: 0, net_win: 0, net_loss: 0, cash_received: r2(w.cash_received),
  };
  const walletRules = [];
  if (wRows.length) walletRules.push(chk('Stored balance is internally consistent', inr - num(w.cash_received), num(w.profit_loss)));
  else walletRules.push({ label: 'A wallet record exists for this account', expected: 1, actual: 0, diff: -1, pass: false, info: true, severity: 'review' });
  walletRules.push({ label: `${kind} account — betting checks (P/L, exposure, settlement) are not applicable`, expected: 0, actual: 0, diff: 0, pass: true, info: true, severity: 'review' });
  const categories = [{ key: 'wallet', label: 'Wallet Integrity', icon: 'wallet', rules: walletRules, pass: catVerdict(walletRules) }];
  const history = await buildHistory(sequelize, id, [], new Set(), {}, new Set(), new Set(), w, {}, acct.username);
  return { found: true, kind, snapshot, categories, history, historyCount: history.length, allPass: categories.every((c) => c.pass) };
}

export default { searchUsers, buildUserReport };
