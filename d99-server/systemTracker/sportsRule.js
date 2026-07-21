/**
 * sportsRule.js — PURE sports betting rulebook for jmd-exch (System Tracker).
 *
 * Constants + math ONLY. No DB, no app-model imports, no side effects. This is the
 * single source of truth for sports liability / winnings / exposure / settlement so
 * the integrity tracker (and ideally placement + the settlement worker) all share
 * the exact same formulas and cannot drift apart.
 *
 * Reverse-engineered from the LIVE engines (quoted file:line in comments):
 *   Frontend (placement math/validations):
 *     d99-frontend.old/src/utils/sportsBetUtil.js  (calculateSingleBetPL :9-46)
 *     d99-frontend.old/src/components/sportsPlaceBet/SportsPlaceBet.js (live place path)
 *     d99-frontend.old/src/utils/realUserUtils.js  (placebet payload)
 *   Backend (settlement):
 *     d99-server/sportsbet/betresult/settlementv2.js  (pm2: jmd-sports-settlement-worker)
 *     d99-server/sportsbet/betresult/customMarketResolvers.js
 *   Exposure rollup (already two-shape):
 *     d99-server/helper/netExposureHelper.js
 *
 * CONVENTION SWITCH (the crux): FANCY/TIED_MATCH always use paise odds (÷100);
 * BOOKMAKER uses paise ÷100 ONLY when odds >= 10, else decimal; everything else
 * (MATCH_ODDS) uses decimal odds (odds-1).  (sportsBetUtil.js:18,25,37)
 */

'use strict';

/* =============================================================================
 * 1. CONSTANTS
 * ===========================================================================*/

// Commission is DISABLED in the live settlement engine: calculateCommission() is
// fully commented out and PLATFORM_COMMISSION_PERCENT is never read
// (settlementv2.js:1302-1313). Wins credit GROSS. Keep 0 + assert no commission rows.
export const COMMISSION_PERCENT = 0;

// Stake/odds bounds (SportsPlaceBet.js: defaults :229-230; odds clamp :468-471,572)
export const MIN_STAKE_DEFAULT = 100;
export const MAX_STAKE_DEFAULT = 100000;
export const ODDS_MIN = 1.01;
export const ODDS_MAX = 1000;

// Bookmaker switches to paise (÷100) odds only at/above this odds value
// (sportsBetUtil.js:25 `&& o >= 10`).
export const BOOKMAKER_PERCENT_ODDS_THRESHOLD = 10;

// result_status strings on a SportsBet row that mean void/refund (no win/loss).
// Two refund paths use two spellings — recognize BOTH:
//   settlement worker initiateRefund -> 'refund'   (settlementv2.js:1252, per-bet ledger row)
//   admin voidResult                 -> 'refunded' (mannualSettle/controller.js:482, market-level refund)
export const VOID_RESULT_STATUSES = ['refund', 'refunded', 'void', 'cancelled', 'cancel'];

// Upstream declared-result tokens that force a refund (settlementv2.js:781,857-859,
// 471-477,546-551).
export const VOID_RESULT_TOKENS = ['suspended', 'cancelled', 'your_request_is_invalid', 'void'];

// Terminal bet statuses (idempotency guard settles only open/manual; settlementv2.js:741).
export const SETTLE_FROM_STATUSES = ['open', 'manual'];

// Ledger reasons (credits_ledger.reason) used by the SPORTS money path. Casing is
// lowercase for sports (contrast: casino uses BET_WIN/BET_LOSS uppercase).
export const LEDGER = {
  PLACED: 'bet_placed',        // written at placement (blocks liability in cash)
  EXPOSURE_RELEASE: 'exposure_release',
  SETTLEMENT: 'settlement',    // the ONLY P/L-moving sports row (settlementv2.js:1602,1770,2053)
  REFUND: 'refund',            // void reversal (settlementv2.js:1231)
};
export const SETTLEMENT_REASONS = [LEDGER.SETTLEMENT]; // rows that move profit_loss

/* =============================================================================
 * 2. MARKET CLASSIFICATION  (two shapes that aggregate in OPPOSITE directions)
 *    team markets  -> ONE outcome wins -> bets hedge -> exposure = MIN (worst-case)
 *    fancy/lines   -> each line is its own yes/no market -> losses ADD -> SUM
 * ===========================================================================*/

// game_type values seen across placement payload + settlement + exposure rows.
//   placement payload game_type: MATCH | BOOKMAKER | FANCY   (realUserUtils.js:17)
//   settlement group keys:       MO | BM | BO (team)  vs  FAN (fancy)
//   exposure/UI marketType:      MATCH_ODDS | BOOKMAKER | TIED_MATCH | NORMAL | INNINGS
export const TEAM_GAME_TYPES = ['MATCH', 'MO', 'BM', 'BO', 'BOOKMAKER', 'MATCH_ODDS', 'BOOKMAKER2'];
export const FANCY_GAME_TYPES = ['FAN', 'FANCY'];

function lc(s) { return String(s == null ? '' : s).toLowerCase(); }

// A market is "fancy-shaped" (independent yes/no line, SUM exposure) when it is a
// FANCY/TIED_MATCH market, game_type FAN, or category '1'. Everything else (match
// odds / bookmaker) is team-shaped (hedge, MIN).
export function isFancyMarket(ctx = {}) {
  // accept both camelCase (rulebook callers) and snake_case (raw DB rows)
  const marketType = ctx.marketType ?? ctx.market_type;
  const gameType = ctx.gameType ?? ctx.game_type;
  const category = ctx.category;
  const mt = lc(marketType);
  if (category === '1' || category === 1) return true;
  if (FANCY_GAME_TYPES.includes(String(gameType || '').toUpperCase())) return true;
  if (mt === 'fancy' || mt === 'tied_match' || mt === 'normal') return true;
  // run-line / session sub-markets carry their raw name
  return /fancy|session|over by over|khado|meter|oddeven|wicket|overs line|tied match/.test(mt);
}

export function isTeamMarket(ctx = {}) { return !isFancyMarket(ctx); }

// Bookmaker quotes paise odds only when odds >= 10 (sportsBetUtil.js:25).
export function isBookmakerPercent(marketType, odds) {
  return lc(marketType).includes('bookmaker') && Number(odds) >= BOOKMAKER_PERCENT_ODDS_THRESHOLD;
}

// TIED_MATCH and FANCY always use paise odds (÷100). (SportsPlaceBet.js:31)
export function usesPaiseOdds(marketType, odds) {
  const mt = lc(marketType);
  if (mt === 'fancy' || mt === 'tied_match') return true;
  return isBookmakerPercent(marketType, odds);
}

// Normalize bet side: back≡yes, lay≡no (SportsPlaceBet.js:108,114).
export function normBetType(t) {
  const x = lc(t);
  if (x === 'yes') return 'back';
  if (x === 'no') return 'lay';
  return x; // 'back' | 'lay'
}
export function isBack(t) { return normBetType(t) === 'back'; }
export function isLay(t) { return normBetType(t) === 'lay'; }

// Case/space-insensitive name match used everywhere a selection is compared to a
// declared winner (settlementv2.js normalize() :761 etc.).
export function normName(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim().replace(/[^\w ]/g, '');
}

/* =============================================================================
 * 3. CORE PER-BET P/L  — mirrors calculateSingleBetPL (sportsBetUtil.js:9-46)
 *    Returns { profit, loss, exposure } for one bet. profit = potential winnings,
 *    loss = amount lost if it loses, exposure = liability blocked at placement.
 * ===========================================================================*/
export function singleBetPL(stake, odds, betType, marketType) {
  const s = Number(stake) || 0;
  const o = Number(odds) || 0;
  if (s <= 0 || o < ODDS_MIN) return { profit: 0, loss: 0, exposure: 0 };

  const side = normBetType(betType);

  // FANCY / TIED_MATCH — paise odds (sportsBetUtil.js:18-22; SportsPlaceBet.js:31)
  if (lc(marketType) === 'fancy' || lc(marketType) === 'tied_match') {
    // single-bet view is non-directional; Yes/No netting handled in fancy exposure
    return { profit: (s * o) / 100, loss: s, exposure: s };
  }

  // BOOKMAKER paise (odds >= 10) (sportsBetUtil.js:25-34)
  if (isBookmakerPercent(marketType, o)) {
    const val = (o / 100) * s;
    return side === 'back'
      ? { profit: val, loss: s, exposure: s }
      : { profit: s, loss: val, exposure: val };
  }

  // Decimal-odds markets — MATCH_ODDS, low-odds bookmaker, default (sportsBetUtil.js:37-45)
  return side === 'back'
    ? { profit: (o - 1) * s, loss: s, exposure: s }
    : { profit: s, loss: (o - 1) * s, exposure: (o - 1) * s };
}

// Liability/exposure blocked at placement for one bet.
export function liabilityOf(marketType, betType, stake, odds) {
  return singleBetPL(stake, odds, betType, marketType).exposure;
}
// Gross potential winnings for one bet on a win.
export function winningsOf(marketType, betType, stake, odds) {
  return singleBetPL(stake, odds, betType, marketType).profit;
}

/* =============================================================================
 * 4. SETTLEMENT PREDICATES & PAYOUT  — mirrors settlementv2.js
 * ===========================================================================*/

// Team market (MATCH_ODDS / Bookmaker) win test. back wins iff selection==winner;
// lay wins iff selection!=winner. Returns null when the winner is unknown.
// (moBmBetWinCredit :1337-1346; resolveMobmWinner :761-840)
export function betWins(betType, selectionName, winnerName) {
  if (winnerName == null || winnerName === '') return null;
  const sel = normName(selectionName);
  const win = normName(winnerName);
  if (!sel) return null;
  return isBack(betType) ? sel === win : sel !== win;
}

// Team market per-bet WIN credit (the report/User-increment value). NOTE the actual
// wallet delta for MO/BM is computed at MARKET level from exposures, not here
// (settlementv2.js:1496); this is the odds×stake winnings only.
// BACK win = (odds-1)*stake; LAY win = stake; loser = 0. (moBmBetWinCredit :1342-1344)
export function moBmWinCredit(betType, selectionName, winnerName, stake, odds) {
  const won = betWins(betType, selectionName, winnerName);
  if (won == null) return null;
  if (!won) return 0;
  const s = Number(stake) || 0, o = Number(odds) || 0;
  return isBack(betType) ? Math.max(0, (o - 1) * s) : Math.max(0, s);
}

// Fancy / run-line win test. The "line" is the bet's odds column.
// YES wins when numericResult >= line; NO wins when numericResult < line.
// oddeven: YES=even, NO=odd. Returns null when result is missing/non-numeric —
// GUARD EXPLICITLY: settlementv2.js has NO null guard so null coerces to 0 and
// silently settles YES=loss / NO=win (integrity flag #1). (settlementv2.js:926-993)
export function fancyWins(marketType, betType, line, numericResult) {
  const side = normBetType(betType);
  if (side !== 'back' && side !== 'lay') return null;
  const yes = side === 'back';
  const mt = lc(marketType);

  // Explicit missing-result guard FIRST — Number(null/undefined/'') === 0 is finite,
  // so it would silently settle (YES=loss, NO=win). This is exactly the live gotcha
  // (settlementv2.js has no such guard). Treat missing result as "cannot decide".
  if (numericResult == null || numericResult === '') return null;

  if (mt === 'oddeven') {
    const r = Number(numericResult);
    if (!Number.isFinite(r)) return null;
    const even = r % 2 === 0;
    return yes ? even : !even;
  }

  // run-line: numeric result vs line
  const r = Number(numericResult);
  const ln = Number(line);
  if (!Number.isFinite(r) || !Number.isFinite(ln)) return null; // missing result -> can't decide
  return yes ? r >= ln : r < ln;
}

// Fancy per-bet settlement netamount (signed) — mirrors settlementv2.js:1904-1922.
// Two regimes: "decimal" fancy markets (TIED_MATCH/OVER_UNDER/oddeven/fancy1/…) use
// (odds-1); run-line markets use size/100. Pass usePaiseSize=true for run-lines.
//   win:  yes -> +stake*(odds-1)  | no -> +stake          (decimal regime)
//         yes -> +stake*size/100  | no -> +stake          (run-line regime)
//   loss: yes -> -stake           | no -> -stake*odds      (decimal regime)
//         yes -> -stake           | no -> -stake*size/100  (run-line regime)
export function fancyNetAmount({ won, betType, stake, odds, size, usePaiseSize }) {
  const s = Number(stake) || 0;
  const yes = isBack(betType);
  const mult = usePaiseSize ? (Number(size) || 0) / 100 : (Number(odds) || 0) - (yes ? 1 : 0);
  if (won) return yes ? s * (usePaiseSize ? (Number(size) || 0) / 100 : (Number(odds) || 0) - 1) : s;
  return yes ? -s : -s * (usePaiseSize ? (Number(size) || 0) / 100 : (Number(odds) || 0));
}

/* =============================================================================
 * 5. EXPOSURE MODEL  — TWO shapes. Misclassifying is the #1 false-positive source.
 *    team markets -> per-runner net, worst-case = abs(min(perRunner))  (HEDGE/MIN)
 *    fancy        -> per line worst = abs(min(Yes,No)); SUM across lines (INDEPENDENT)
 *    This mirrors SportsPlaceBet.js:699-711 and the backend rollup
 *    netExposureHelper.calculateNetExposure (sports MIN per (match,game_type,event),
 *    casino/independent additive SUM).
 * ===========================================================================*/

// Team market (MATCH_ODDS / Bookmaker): re-derive each runner's net P/L if that
// runner wins, then worst-case = |min over runners| (capped at 0 loss side).
// bets: [{ selectionName, betType, stake, odds, marketType }]; runners: [name,...]
// (calculateMatchOddsResults sportsBetUtil.js:82-132)
export function computeTeamMarketExposure(bets, runners) {
  const perRunner = {};
  for (const team of runners) {
    const t = normName(team);
    let net = 0;
    for (const b of bets || []) {
      if (!b) continue;
      const { profit, loss } = singleBetPL(b.stake, b.odds, b.betType, b.marketType);
      const onTeam = normName(b.selectionName ?? b.teamName) === t;
      if (isBack(b.betType)) net += onTeam ? profit : -loss;
      else net += onTeam ? -loss : profit;
    }
    perRunner[team] = round2(net);
  }
  const min = Object.keys(perRunner).length ? Math.min(...Object.values(perRunner)) : 0;
  return { perRunner, worst: Math.min(0, min) }; // worst <= 0 (a liability)
}

// Fancy: each distinct line (selection) is its own yes/no market. Per line,
// worst = min(YesNet, NoNet); SUM the (negative) line-worsts across lines.
// bets grouped by line key (e.g. fancy_name/selection). (calculateFancyResults :145-163)
export function computeFancyExposure(betsByLine) {
  let total = 0;
  const perLine = {};
  for (const [line, bets] of Object.entries(betsByLine || {})) {
    let yesNet = 0, noNet = 0;
    for (const b of bets || []) {
      const s = Number(b.stake) || 0, o = Number(b.odds) || 0;
      const paise = usesPaiseOdds(b.marketType, o);
      const win = paise ? (s * o) / 100 : (o - 1) * s;
      if (isBack(b.betType)) { yesNet += win; noNet -= s; }
      else { noNet += win; yesNet -= s; }
    }
    const worst = Math.min(0, yesNet, noNet);
    perLine[line] = { yesNet: round2(yesNet), noNet: round2(noNet), worst: round2(worst) };
    total += worst; // SUM — independent lines add
  }
  return { perLine, worst: round2(total) };
}

function round2(n) { return Number((Number(n) || 0).toFixed(2)); }

/* =============================================================================
 * 6. PLACEMENT VALIDATIONS  (SportsPlaceBet.js handleSubmit :739-1057)
 * ===========================================================================*/
// Returns an array of human-readable violation strings ([] = valid).
export function validatePlacement({ stake, odds, betType, minStake, maxStake } = {}) {
  const errors = [];
  const s = Number(stake), o = Number(odds);
  const min = Number(minStake) > 0 ? Number(minStake) : MIN_STAKE_DEFAULT;
  const max = Number(maxStake) > 0 ? Number(maxStake) : MAX_STAKE_DEFAULT;
  if (!(s > 0)) errors.push('Stake must be > 0');
  else if (s < min || s > max) errors.push('Check min and max bet limit');
  if (!Number.isFinite(o) || o < ODDS_MIN) errors.push(`Odds must be a number ≥ ${ODDS_MIN}`);
  else if (o > ODDS_MAX) errors.push(`Odds must be ≤ ${ODDS_MAX}`);
  if (!['back', 'lay', 'yes', 'no'].includes(lc(betType))) errors.push('Invalid bet type');
  return errors;
}

/* =============================================================================
 * 7. PER-BET INTEGRITY RULES  (structural settlement invariants for the tracker)
 *    Each settled, non-void SPORTS bet is checked against its ledger + result.
 * ===========================================================================*/
export const RULES = [
  { key: 'settlementMissing',   severity: 'high',   label: 'Closed/won-loss bet has a settlement ledger row' },
  { key: 'settlementDuplicate', severity: 'high',   label: 'Closed bet has exactly one active settlement row (no double-settle)' },
  { key: 'statusMismatch',      severity: 'high',   label: 'result_status agrees with the settlement ledger row' },
  { key: 'commissionScope',     severity: 'high',   label: 'No commission charged (commission disabled in live engine)' },
  { key: 'voidRefundOnly',      severity: 'high',   label: 'A refunded bet has a refund ledger row and no win/loss P/L row' },
  { key: 'wrongResult',         severity: 'review', label: 'Win/loss matches the declared result (team) / run-line (fancy)' },
];

export function isVoid(bet) {
  return VOID_RESULT_STATUSES.includes(lc(bet && bet.result_status));
}

/**
 * checkBet — run structural per-bet rules. Pure: caller supplies the raw rows.
 * @param bet            raw SportsBet row { id, bet_type, selection_name, market_type,
 *                       game_type, category, stake_amount, odds, size, status, result_status }
 * @param settlementRows active credits_ledger rows for this bet_id with reason in
 *                       {settlement, refund, commission} (already de-reversed by caller)
 * @param result         { winnerName, numericResult } declared result for the market/line
 * @returns array of { key, severity, label, detail }
 */
export function checkBet(bet, settlementRows = [], result = {}) {
  const out = [];
  const push = (key, detail) => {
    const r = RULES.find((x) => x.key === key);
    out.push({ key, severity: r ? r.severity : 'high', label: r ? r.label : key, detail });
  };
  const status = lc(bet.status);
  const rstatus = lc(bet.result_status);
  const settle = settlementRows.filter((r) => lc(r.reason) === LEDGER.SETTLEMENT);
  const refunds = settlementRows.filter((r) => lc(r.reason) === LEDGER.REFUND);
  const commissions = settlementRows.filter((r) => lc(r.reason) === 'commission' || Number(r.commission) > 0);

  // void / refund path
  if (isVoid(bet)) {
    // Hard invariant: a void must NEVER carry a win/loss settlement row (booking P/L on a refund).
    if (settle.length > 0) push('voidRefundOnly', `voided bet ${bet.id} also has ${settle.length} settlement row(s)`);
    // The settlement-worker void ('refund') writes a per-bet refund ledger row, so its absence
    // is a genuine anomaly. The admin void ('refunded') refunds once per market (aggregate row on
    // a representative bet) — verified at market level + by wallet money-conservation — so don't
    // require a per-bet refund row for it here.
    if (rstatus === 'refund' && refunds.length === 0) push('voidRefundOnly', `bet ${bet.id} result_status=refund but no refund ledger row`);
    return out; // void bets skip win/loss checks
  }

  // only settled bets get the win/loss invariants
  const isSettled = status === 'closed' || rstatus === 'won' || rstatus === 'loss';
  if (!isSettled) return out;

  if (settle.length === 0) push('settlementMissing', `closed bet ${bet.id} has no settlement ledger row`);
  if (settle.length > 1) push('settlementDuplicate', `bet ${bet.id} has ${settle.length} active settlement rows`);
  if (commissions.length > 0) push('commissionScope', `bet ${bet.id} carries commission (must be 0 — disabled in live engine)`);

  // statusMismatch: result_status vs the settlement row's profit/loss sign
  if (settle.length === 1) {
    const row = settle[0];
    const net = Number(row.netamount);
    const ledgerSaysWon = Number.isFinite(net) ? net > 0 : Number(row.profit) > 0;
    if ((rstatus === 'won') !== ledgerSaysWon && (rstatus === 'won' || rstatus === 'loss')) {
      push('statusMismatch', `bet ${bet.id} result_status=${rstatus} but ledger netamount=${row.netamount}`);
    }
  }

  // wrongResult (review): independent re-derivation of win/loss vs declared result
  const fancy = isFancyMarket(bet);
  let derivedWon;
  if (fancy) derivedWon = fancyWins(bet.market_type, bet.bet_type, bet.odds, result.numericResult);
  else derivedWon = betWins(bet.bet_type, bet.selection_name, result.winnerName);
  if (derivedWon != null && (rstatus === 'won' || rstatus === 'loss')) {
    const claimWon = rstatus === 'won';
    if (derivedWon !== claimWon) {
      push('wrongResult', `bet ${bet.id}: declared result implies ${derivedWon ? 'WON' : 'LOSS'} but result_status=${rstatus}`);
    }
  }
  return out;
}

/* =============================================================================
 * 8. KNOWN GOTCHAS carried from the live engines (enforce in the tracker)
 *   1. Run-line fancy has NO null guard on numericResult: null coerces to 0 →
 *      YES auto-loses, NO auto-wins. fancyWins() returns null instead — flag it.
 *   2. resolveFancyWinner returns undefined when bet_type ∉ {yes,no} → downstream crash.
 *   3. fancy1/TiedMatch/BothTeamsToScore have &&/|| precedence bugs (some branches
 *      win regardless of bet_type) — re-derive independently, don't trust the engine.
 *   4. resolveMobmWinner ambiguous fallback → 'SUSPENDED' (silent refund); 'no result'
 *      /abandoned → 'The Draw' (not refund).
 *   5. Commission is DEAD — there must be no commission rows / commission>0.
 *   6. Refund touches ONLY wallet.cash (reverses placement ledger); it does NOT move
 *      inr_balance or users.profit/net_win/net_loss. (settlementv2.js:1227-1228)
 *   7. MO/BM wallet delta = |mostNegExposure| + winnerExposure (exposure math), NOT
 *      odds×stake. Model exposures, not just the per-bet credit. (settlementv2.js:1496)
 *   8. FAN credits cash TWICE by design in one txn: exposure release (+|exposure|)
 *      AND net P/L (+netamount). (settlementv2.js:1958-1966 then :2005)
 *   9. Wallets.profit_loss is a derived hook column: profit_loss = inr_balance −
 *      cash_received (Wallet.js:9-14) — verify, don't double-maintain.
 * ===========================================================================*/

export default {
  COMMISSION_PERCENT, MIN_STAKE_DEFAULT, MAX_STAKE_DEFAULT, ODDS_MIN, ODDS_MAX,
  BOOKMAKER_PERCENT_ODDS_THRESHOLD, VOID_RESULT_STATUSES, VOID_RESULT_TOKENS,
  SETTLE_FROM_STATUSES, LEDGER, SETTLEMENT_REASONS, TEAM_GAME_TYPES, FANCY_GAME_TYPES,
  isFancyMarket, isTeamMarket, isBookmakerPercent, usesPaiseOdds, normBetType, isBack,
  isLay, normName, singleBetPL, liabilityOf, winningsOf, betWins, moBmWinCredit,
  fancyWins, fancyNetAmount, computeTeamMarketExposure, computeFancyExposure,
  validatePlacement, RULES, isVoid, checkBet,
};
