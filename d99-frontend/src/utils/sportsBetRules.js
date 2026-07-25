// ---------------------------------------------------------------------------
// Sports betting rules — derived from SPORTS_EXCHANGE_MASTER_SPEC.md
// (D:\Developer\tenexch-new\docs). This module holds the *money* rules:
// which scale a market's `odds` field is on, what game_type/category the
// backend expects, the stake/odds bounds and the ODI/T20 rate cap.
//
// IMPORTANT (spec §3.3): `detectMarketType()` in gameDetailsUtils.js is a
// RENDERING label only. Never derive payload fields or P/L math from it — use
// the helpers here, which key off the raw feed (`gtype` / `mname`).
// ---------------------------------------------------------------------------

/** Exact toast strings (spec §6.9) — do not reword. */
export const TOASTS = {
  ENTER_VALID_STAKE: "Enter a valid stake amount",
  SERVER_ERROR: "Server Error",
  BET_NOT_VALID: "Bet Not Valid..",
  MIN_BET_LIMIT: "Check Minimum Bet Limit.",
  MAX_BET_LIMIT: "Check Maximum Bet Limit2.",
  RATE_OVER_LIMIT: "Bet Not Accept Rate Over 4.00 on Oneday and T20",
  GAME_NOT_ACTIVE: "Bet Not Confirm Reason Game Not Active.",
  // MATCH_ODDS maxb:1 kill-switch — exact reference text, trailing "2" included.
  GAME_NOT_ACTIVE_2: "Game Not Active2.",
  // Cashout hedge stake outside the market's Min/Max header range.
  BET_NOT_CONFIRM_RANGE: "Bet Not Confirm Reason Min and Max Bet Range Not Valid.",
  INVALID_BET: "Invalid bet",
  BALL_RUNNING: "Ball Running",
  ODDS_CHANGED: "Odds changed",
  BET_NOT_CONFIRM_ODDS_CHANGE: "Bet not confirm Odds change",
  CHECK_BALANCE: "Bet Not Confirm Check Balance.",
  MULTIPLE_BET_NOT_ALLOWED: "Multiple Bet Not Allowed On Same Time AND Same Market.",
  UNMATCHED_NOT_ALLOWED: "Unmatched bet not allowed.",
  BET_PLACED: "Bet placed Successfully",
  BET_CANCELLED: "Bet cancelled successfully",
  NETWORK_ERROR: "Network error",
  GENERIC_ERROR: "Something went wrong",
};

export const GLOBAL_MIN_STAKE = 100;
export const MAX_STAKE_FALLBACK = 100000;
export const RATE_CAP = 4.0;
export const BET_BUFFER_SECONDS = 10;
export const FANCY_BUFFER_SECONDS = 3;

const lower = (v) => String(v ?? "").trim().toLowerCase();

/** gtype families that are session/fancy style (never decimal team markets). */
const FANCY_GTYPES = new Set([
  "fancy",
  "fancy1",
  "fancy2",
  "fancy3",
  "khado",
  "meter",
  "oddeven",
  "cricketcasino",
]);

/** `odds` is a run LINE here, not a price — the rate lives in `size` (spec §2.2). */
const LINE_GTYPES = new Set(["fancy", "fancy2", "fancy3", "khado", "meter"]);

export function isTiedMarket(market) {
  return /tied/.test(lower(market?.mname));
}

export function isBookmakerMarket(market) {
  const mn = lower(market?.mname);
  return lower(market?.gtype) === "match1" && !isTiedMarket(market)
    ? true
    : /bookmaker/.test(mn) || /^bm\b/.test(mn);
}

export function isFancyMarket(market) {
  return FANCY_GTYPES.has(lower(market?.gtype));
}

/**
 * Which scale the market's `odds` field carries (spec §2 / §3.4).
 *   'decimal' → profit = stake × (odds − 1)      (gtype `match`, oddeven, fancy1, cricketcasino)
 *   'percent' → profit = stake × odds / 100      (gtype `match1`: Bookmaker, Bookmaker 2, Tied)
 *   'line'    → `odds` is a run line, rate is in `size` (gtype fancy/fancy2/khado/meter)
 */
export function getOddsFormat(market) {
  const gt = lower(market?.gtype);
  if (gt === "match1") return "percent";
  if (LINE_GTYPES.has(gt)) return "line";
  return "decimal";
}

/**
 * `game_type` the server expects (spec §3.1). It maps BOOKMAKER→BM, FANCY→FAN.
 * Tied Match is deliberately sent as FANCY so the server accepts sub-1 odds and
 * routes to its dedicated Tied branch — while `market_type` stays the raw mname.
 */
export function getGameType(market) {
  const gt = lower(market?.gtype);
  // Only the PERCENT (gtype match1) Tied Match takes the FANCY route. The feed
  // also ships an exchange "TIED_MATCH" on gtype `match` quoting real decimal
  // odds (100 / 190) — routing that one to FANCY would have the server read
  // 100 as a percentage.
  if (gt === "match1") return isTiedMarket(market) ? "FANCY" : "BOOKMAKER";
  if (FANCY_GTYPES.has(gt)) return "FANCY";
  return "MATCH";
}

/** Session-style markets bet as yes/no rather than back/lay. */
export function isFancyCategory(market) {
  return isFancyMarket(market) || (isTiedMarket(market) && lower(market?.gtype) === "match1");
}

/** `category`: '1' for fancy/tied, '0' for Match Odds / Bookmaker (spec §3.1). */
export function getBetCategory(market) {
  return isFancyCategory(market) ? "1" : "0";
}

/**
 * Only `gtype: 'match'` markets let the user move the price. Everything else is
 * odds-locked, which also means the buffer must not rewrite their odds (§6.4).
 */
export function isOddsLocked(market) {
  return lower(market?.gtype) !== "match";
}

/**
 * Stake limits chain (spec §3.5). Note `??` cannot be used here: the feed sends
 * literal 0 for "no limit" on MATCH_ODDS runners, and 0 must fall through to the
 * next source rather than win.
 */
export function getStakeLimits(market, runner, { isCashout = false } = {}) {
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };
  const min = isCashout
    ? 0
    : Math.max(GLOBAL_MIN_STAKE, n(runner?.min) || n(market?.min) || 0);
  const maxb = n(market?.maxb);
  let max = maxb > 0 ? maxb : n(runner?.max) || n(market?.max) || 0;
  if (max === 0) max = MAX_STAKE_FALLBACK;
  return { min, max };
}

/**
 * Valid odds range (spec §6.2). Percent markets quote 0.75 / 1000 / 1250 and
 * line markets quote raw run totals, so the 1.01–1000 decimal window only
 * applies to `gtype: 'match'`.
 *
 * Deviation from spec: bounds are inclusive here. The spec's strict `>` would
 * reject a legitimately clicked 1.01 price.
 */
export function getOddsBounds(market) {
  const fmt = getOddsFormat(market);
  if (fmt === "decimal") return { min: 1.01, max: 1000 };
  return { min: 0, max: 100000 };
}

/** Odds usable as a bet price at all — used to enable the Submit button. */
export function isOddsInRange(market, odds) {
  const o = Number(odds);
  if (!Number.isFinite(o) || o <= 0) return false;
  const { min, max } = getOddsBounds(market);
  return o >= min && o <= max;
}

const MULTI_DAY_RE = /test|ashes|first-class|county champ|sheffield shield|ranji|plunket/i;

/** Cricket only; multi-day formats are exempt from the rate cap (spec §6.5). */
export function isLimitedOvers(sid, eventName) {
  if (Number(sid) !== 4) return false;
  return !MULTI_DAY_RE.test(String(eventName || ""));
}

/** MATCH_ODDS over-rate cap: no ODI/T20 match-odds bet above 4.00 (spec §6.5). */
export function isRateCapped({ sid, market, eventName, odds }) {
  if (!isLimitedOvers(sid, eventName)) return false;
  const mn = lower(market?.mname);
  const isMatchOdds = mn === "match_odds" || mn === "match odds" || mn === "winner";
  if (!isMatchOdds) return false;
  return Number(odds) > RATE_CAP;
}
