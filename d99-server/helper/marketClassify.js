/**
 * Canonical market classification, shared by placement, settlement and reporting.
 *
 * WHY THIS EXISTS
 * ---------------
 * Bookmaker odds are PERCENTAGES (78 means +78%), while MATCH_ODDS are DECIMAL
 * (1.78 means +78%). The two are told apart by SportsBet.game_type: 'BM' vs 'MO'.
 *
 * The client never sends 'BOOKMAKER' though — GameDetails.jsx only ever sends
 * game_type 'MATCH' or 'FANCY', and identifies a bookmaker market by mname
 * ('Bookmaker') / gtype ('bookmaker', 'match1'). placeBet's only mapping was
 *     if (game_type === "BOOKMAKER") game_type = "BM"
 * which therefore never fired, so every bookmaker bet was stored as 'MO' and its
 * raw percentage odds were then read as decimal odds:
 *     settlementv2.getOdds() skips normalizeOdds() unless game_type === 'BM'
 *     -> a won back at odds 78 paid (78 - 1) * stake instead of stake * 78/100
 * i.e. roughly a 100x overpayment on every settled bookmaker bet.
 *
 * Detection is therefore done on the MARKET identity (market_type / mname /
 * gtype), never on the client-supplied game_type alone. Readers pass historical
 * rows through this too, so bets already stored with the wrong 'MO' tag are
 * still interpreted correctly.
 *
 * NOTE: deliberately does NOT match the 'BM <x> Set Winner' fancy markets —
 * those carry a 'BM ' prefix but are priced through the fancy path, which
 * already applies normalizeOdds() itself.
 */

const lc = (v) => String(v ?? '').trim().toLowerCase();

/**
 * True when the given bet/market is a bookmaker market (percentage-priced).
 *
 * @param {object} o
 * @param {string} [o.game_type]   stored/normalized game type ('BM' | 'MO' | ...)
 * @param {string} [o.market_type] e.g. 'Bookmaker', 'Bookmaker 2'
 * @param {string} [o.mname]       feed market name
 * @param {string} [o.gtype]       feed market gtype
 * @returns {boolean}
 */
export function isBookmakerMarket({ game_type, market_type, mname, gtype } = {}) {
  const gt = lc(game_type);
  if (gt === 'bm' || gt === 'bookmaker') return true;

  // 'bookmaker', 'bookmaker 2', 'bookmaker2' — but not 'bm 1st set winner'
  if (/bookmaker/.test(lc(market_type))) return true;
  if (/bookmaker/.test(lc(mname))) return true;

  const g = lc(gtype);
  if (g === 'bookmaker' || g === 'bookmaker2') return true;

  return false;
}

/**
 * Percentage -> decimal odds, matching sportbetscontroller.normalizeOdds.
 * 78 -> 1.78, 128 -> 2.28, 100 -> 2.0
 */
export function normalizeBookmakerOdds(odds) {
  const o = Number(odds);
  if (!Number.isFinite(o)) return 0;
  if (o > 100) return Math.floor(((o / 100) + 1) * 100) / 100;
  if (o < 100) return Math.floor((1 + (o / 100)) * 100) / 100;
  return 2.0;
}

/**
 * Decimal odds for any bet row, regardless of how game_type was tagged at
 * placement. Use this wherever a payout/liability is computed from odds.
 */
export function decimalOddsFor(bet = {}) {
  const raw = Number(bet.odds ?? bet.price ?? bet.rate ?? 0);
  if (!Number.isFinite(raw)) return 0;
  return isBookmakerMarket(bet) ? normalizeBookmakerOdds(raw) : raw;
}

/** Round to paise, immune to binary-float noise (1.64 - 1 === 0.6399999...). */
export const round2 = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round((v + Number.EPSILON) * 100) / 100;
};

/**
 * Profit RATE for a winning back/yes leg — the single definition every money
 * path must agree on.
 *
 *   bookmaker : odds / 100   (odds are a PERCENTAGE: 64 => +64%)
 *   otherwise : odds - 1     (odds are DECIMAL: 1.64 => +64%)
 *
 * Deliberately computed from the RAW odds rather than
 * `normalizeBookmakerOdds(odds) - 1`. Those are algebraically identical, but the
 * normalize route both truncates (Math.floor to 2dp, so 78.5 -> 1.78 loses the
 * half point) and introduces float error (1.64 - 1 = 0.6399999999999999). Going
 * straight to odds/100 is exact, so placement, settlement and reporting return
 * bit-identical figures instead of drifting in the last decimal.
 */
export function backProfitRate({ odds, game_type, market_type, mname, gtype } = {}) {
  const o = Number(odds);
  if (!Number.isFinite(o)) return 0;
  return isBookmakerMarket({ game_type, market_type, mname, gtype }) ? o / 100 : o - 1;
}

/**
 * Profit on a winning back/yes leg (stake NOT included), rounded to paise.
 * For a lay/no leg this same figure is the liability.
 */
export function backProfit(stake, betLike = {}) {
  return round2(Number(stake) * backProfitRate(betLike));
}

export default {
  isBookmakerMarket,
  normalizeBookmakerOdds,
  decimalOddsFor,
  backProfitRate,
  backProfit,
  round2,
};
