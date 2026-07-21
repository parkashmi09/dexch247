import { getOddsFormat, isTiedMarket } from "./sportsBetRules.js";

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

export function formatStime(stime) {
  if (!stime) return "";
  try {
    const d = new Date(stime);
    if (isNaN(d)) return stime;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}:${ss}`;
  } catch {
    return stime;
  }
}

export function formatSize(size) {
  if (!size || size <= 0) return "";
  return String(size);
}

export function formatLimit(num) {
  if (!num && num !== 0) return "0";
  const n = Number(num);
  if (n >= 100000) return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return String(n);
}

export function getOddByTier(odds, otype, tno) {
  const found = odds?.find(
    (o) =>
      o.otype?.toLowerCase() === otype.toLowerCase() && Number(o.tno) === tno
  );
  if (!found || !found.odds || Number(found.odds) === 0)
    return { odds: "-", size: "" };
  return { odds: found.odds, size: found.size };
}

/**
 * Derive the price/size fields the backend needs to PRICE a bet.
 *
 * These were previously hardcoded to 0/[] in the place-bet payload, which left
 * the server unable to compute fancy liability at all: it derives
 *   layRisk = stake * lay_size / 100   (a losing "no")
 *   backWin = stake * back_size / 100  (a winning "yes")
 * so a zero size booked zero liability and a lay/no bet cost the user nothing.
 *
 * back_size and lay_size are BOTH set to the size of the tier the user actually
 * clicked — the server only consumes the one matching the bet side, and this
 * matches the reference deployment (a "no" at odds 220 / size 110 must yield
 * liability 110 = stake * 110/100).
 *
 * runner_odds carries the top (back1/lay1) prices. It is the ONLY bhav source
 * for fancy1/oddeven, whose `size` from the feed is market VOLUME (~1000000)
 * rather than a bhav; the server rebuilds the bhav there as (odds - 1) * 100.
 *
 * @param {object} runnerLike a feed runner/section with an `odds` array
 * @param {string} betType    back|lay|yes|no
 * @param {number} oddsNum    the price the user is betting at
 * @returns {{back_size:number, lay_size:number, size:number, runner_odds:Array<{odds:number,oname:string}>}}
 */
export function deriveBetSizes(runnerLike, betType, oddsNum) {
  const all = Array.isArray(runnerLike?.odds) ? runnerLike.odds : [];
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  const typeOf = (o) => String(o?.otype || "").toLowerCase();
  const isLaySide = betType === "lay" || betType === "no";
  const wantType = isLaySide ? "lay" : "back";

  // The tier the user actually clicked = the one on their side whose price
  // matches the slip. Falls back to 0 when the feed can't be matched, which is
  // the pre-existing (safe-but-unpriceable) behaviour rather than a wrong price.
  let size = 0;
  const sideTiers = all.filter((o) => typeOf(o) === wantType && num(o?.odds) > 0);
  if (sideTiers.length) {
    const matched = sideTiers.reduce((b, c) =>
      Math.abs(num(c.odds) - oddsNum) < Math.abs(num(b.odds) - oddsNum) ? c : b
    );
    if (Math.abs(num(matched.odds) - oddsNum) <= 0.01 && num(matched.size) > 0) {
      size = num(matched.size);
    }
  }

  // Top tier per side. Prefer tno===0, but some fancy feeds (oddeven) emit a
  // single back/lay entry with no tno — fall back to the first of each type.
  const topOf = (t) =>
    all.find((o) => typeOf(o) === t && Number(o?.tno) === 0) ||
    all.find((o) => typeOf(o) === t);
  const runner_odds = ["back", "lay"]
    .map((t) => topOf(t))
    .filter((o) => o && num(o.odds) > 0)
    .map((o) => ({ odds: num(o.odds), oname: `${typeOf(o)}1` }));

  return { back_size: size, lay_size: size, size, runner_odds };
}

// ---------------------------------------------------------------------------
// Market type detection
// ---------------------------------------------------------------------------

export const MARKET_TYPE = {
  MATCH_ODDS: "MATCH_ODDS",
  BOOKMAKER: "BOOKMAKER",
  HTFT: "HTFT",
  FOOTBALL_TWOCOL: "FOOTBALL_TWOCOL",
  BOOKMAKER2: "BOOKMAKER2",
  TWOCOL_MATCH: "TWOCOL_MATCH",   // market-2: Tied Match (match1), Score More Runs, etc.
  TIED_MATCH: "TIED_MATCH",
  NORMAL: "NORMAL",
  FANCY1: "FANCY1",
  FANCY2: "FANCY2",               // Overs Line (6-column with Cashout)
  METER: "METER",
  KHADO: "KHADO",
  ODDEVEN: "ODDEVEN",
  OVERBYOVER: "OVERBYOVER",
  BALLBYBALL: "BALLBYBALL",
  CRICKETCASINO: "CRICKETCASINO",  // market-9: single Back column with numbers
  RACING: "RACING",               // market-12: horse racing runner layout
  GREYHOUND: "GREYHOUND",         // market-13: greyhound racing runner layout
  RACING_TOP3: "RACING_TOP3",     // market-12 market-16: Top 3 Finish racing
  MATCH_BET: "MATCH_BET",         // racing MATCH_BET: regular 6-col (market-4)
};

export function detectMarketType(market) {
  const mn = (market.mname || "").trim();
  const mnLower = mn.toLowerCase();
  const gt = (market.gtype || "").toLowerCase();
  const dtype = Number(market.dtype);

  // Racing markets are identified by dtype
  if (dtype === 12) return MARKET_TYPE.RACING;          // MATCH_ODDS horse racing (market-12)
  if (dtype === 13) return MARKET_TYPE.GREYHOUND;       // MATCH_ODDS greyhound (market-13)
  if (dtype === 16) return MARKET_TYPE.RACING_TOP3;     // Top 3 Finish (market-12 market-16)
  if (dtype === 15) return MARKET_TYPE.MATCH_BET;       // MATCH_BET racing (market-4)

  // Also catch by name for safety
  if (mnLower === "top 3 finish") return MARKET_TYPE.RACING_TOP3;
  if (mnLower === "match_bet" || mnLower === "match bet") return MARKET_TYPE.MATCH_BET;

  if (mnLower === "match_odds" || mnLower === "match odds" || mnLower === "winner")
    return MARKET_TYPE.MATCH_ODDS;
  if (mnLower === "tied_match") return MARKET_TYPE.TIED_MATCH;
  if (mnLower === "bookmaker 2") return MARKET_TYPE.BOOKMAKER2;
  if (mnLower.includes("bookmaker") && gt !== "match1") return MARKET_TYPE.BOOKMAKER;
  if (mnLower === "normal") return MARKET_TYPE.NORMAL;
  if (mnLower === "fancy1") return MARKET_TYPE.FANCY1;
  if (mnLower === "meter") return MARKET_TYPE.METER;
  if (mnLower === "khado") return MARKET_TYPE.KHADO;
  if (mnLower === "oddeven") return MARKET_TYPE.ODDEVEN;
  if (mnLower === "over by over") return MARKET_TYPE.OVERBYOVER;
  if (mnLower === "ball by ball") return MARKET_TYPE.BALLBYBALL;

  // gtype-based detection
  if (gt === "cricketcasino") return MARKET_TYPE.CRICKETCASINO;
  if (gt === "fancy2") return MARKET_TYPE.FANCY2;
  if (gt === "fancy") return MARKET_TYPE.NORMAL;
  if (gt === "fancy1") return MARKET_TYPE.FANCY1;
  if (gt === "meter") return MARKET_TYPE.METER;
  if (gt === "oddeven") return MARKET_TYPE.ODDEVEN;

  // match1 gtype with ≤3 runners = two-column market (Bookmaker football/tennis, BM Set Winner, Score More Runs)
  if (gt === "match1" && market.section?.length <= 3) return MARKET_TYPE.TWOCOL_MATCH;

  // HT/FT grid market (9 runners like 1/1, 1/X, 1/2, X/1, etc.)
  if (mnLower === "ht/ft") return MARKET_TYPE.HTFT;

  // Correct Score / large grid markets (many runners, single Back) → market-1 grid
  if (mnLower.includes("correct score") && market.section?.length > 4) return MARKET_TYPE.HTFT;

  // OVER_UNDER markets → 6-column (market-4)
  if (mnLower.startsWith("over_under")) return MARKET_TYPE.MATCH_ODDS;

  // gtype=match but NOT match_odds → 2-column for secondary markets
  // (Game Winner, Point Winner, Race To, Tie Break, Draw No Bet, Both Teams, Period Winner, etc.)
  if (gt === "match" && mnLower !== "match_odds" && mnLower !== "match odds" && mnLower !== "winner") {
    return MARKET_TYPE.FOOTBALL_TWOCOL;
  }

  if (gt === "match") return MARKET_TYPE.MATCH_ODDS;
  return MARKET_TYPE.MATCH_ODDS;
}

// ---------------------------------------------------------------------------
// Fancy market types (no spinner, percentage profit)
// ---------------------------------------------------------------------------

export const FANCY_TYPES = new Set([
  MARKET_TYPE.NORMAL,
  MARKET_TYPE.METER,
  MARKET_TYPE.OVERBYOVER,
  MARKET_TYPE.BALLBYBALL,
  MARKET_TYPE.KHADO,
  MARKET_TYPE.CRICKETCASINO,
]);

export function isFancyType(marketType) {
  return FANCY_TYPES.has(marketType);
}

// ---------------------------------------------------------------------------
// Profit calculation
// ---------------------------------------------------------------------------

// Core profit/loss for a single bet. The scale is derived from the RAW MARKET
// (gtype/mname) via getOddsFormat, never from the rendering label `marketType`
// — `match1` covers Bookmaker, Bookmaker 2 AND Tied Match, and those all quote
// percent while looking structurally identical to decimal markets (spec §2/§7.1).
//
//   percent (gtype match1): back/yes → win=(o/100)·s, lose=s
//                           lay/no   → win=s,         lose=(o/100)·s
//   line    (fancy/khado/meter/fancy2): `o` is a run line and the RATE lives in
//                           `size` → win=s·rate/100, lose=s. Rate defaults to
//                           100 (1.00) when the clicked size isn't known.
//   decimal (match, oddeven, fancy1, cricketcasino): back/yes → win=(o-1)·s
//
// `market` is optional so old callers keep working, but every caller inside the
// app passes it — without it a bookmaker bet is priced as decimal.
export function calcProfitLoss(marketType, betType, odds, stake, market = null, rate = null) {
  const o = Number(odds) || 0;
  const s = Number(stake) || 0;
  if (!o || !s) return { profit: 0, loss: 0 };
  const r2 = (n) => Math.round(n * 100) / 100;
  const back = betType === "back" || betType === "yes";

  const fmt = market
    ? getOddsFormat(market)
    : marketType === MARKET_TYPE.BOOKMAKER || marketType === MARKET_TYPE.BOOKMAKER2
      ? "percent"
      : LEGACY_LINE_TYPES.has(marketType)
        ? "line"
        : "decimal";

  if (fmt === "percent") {
    const v = r2((o / 100) * s); // unfloored — no `>= 10` cutoff (spec §7.1)
    return back ? { profit: v, loss: s } : { profit: s, loss: v };
  }

  if (fmt === "line") {
    const rateNum = Number(rate);
    const usedRate = Number.isFinite(rateNum) && rateNum > 0 ? rateNum : 100;
    const v = r2((s * usedRate) / 100);
    return { profit: v, loss: s };
  }

  const v = r2((o - 1) * s);
  return back ? { profit: v, loss: s } : { profit: s, loss: v };
}

const LEGACY_LINE_TYPES = new Set([
  MARKET_TYPE.NORMAL,
  MARKET_TYPE.METER,
  MARKET_TYPE.OVERBYOVER,
  MARKET_TYPE.KHADO,
  MARKET_TYPE.FANCY2,
]);

export function calcProfit(marketType, betType, odds, stake, market = null, rate = null) {
  return calcProfitLoss(marketType, betType, odds, stake, market, rate).profit;
}

// Projected book the user would hold AFTER this pending bet, per outcome.
// Team markets (Match Odds / Bookmaker / Tied / Odd-Even, ≥2 runners): each runner
// is an outcome → net = existing exposure on that runner (matched by market mid) +
// this bet's contribution (win on the backed runner, lose stake on the others; lay
// is the mirror). Fancy/session single bets → the chosen side's Yes/No win/lose.
// Returns [{ name, total }] or null when there is nothing to show.
export function calcOutcomeProjection({ market, marketType, selectedRunner, betType, odds, stake, exposures, rate = null }) {
  const s = Number(stake) || 0;
  const o = Number(odds) || 0;
  // Percent/line markets legitimately quote below 1.01 (Tied "Yes" @ 0.75), so
  // the decimal floor only applies to decimal markets.
  if (s <= 0 || o <= 0) return null;
  if (getOddsFormat(market) === "decimal" && o < 1.01) return null;

  const r2 = (n) => Number(n.toFixed(2));
  const { profit, loss } = calcProfitLoss(marketType, betType, odds, stake, market, rate);
  const back = betType === "back" || betType === "yes";
  const mid = market?.mid;
  const runners = market?.section || [];
  const selName = (selectedRunner?.nat || selectedRunner?.name || "").trim().toLowerCase();

  const isTeamMarket =
    runners.length >= 2 &&
    (marketType === MARKET_TYPE.MATCH_ODDS ||
      marketType === MARKET_TYPE.TIED_MATCH ||
      marketType === MARKET_TYPE.TWOCOL_MATCH ||
      marketType === MARKET_TYPE.BOOKMAKER ||
      marketType === MARKET_TYPE.BOOKMAKER2 ||
      marketType === MARKET_TYPE.ODDEVEN);

  if (isTeamMarket) {
    return runners.map((r) => {
      const name = (r.nat || r.name || "").trim();
      const onThis = name.toLowerCase() === selName;
      const existing = Number(getExposureForSelection(exposures, r, mid) || 0);
      const cur = onThis ? (back ? profit : -loss) : (back ? -loss : profit);
      return { name, total: r2(existing + cur) };
    });
  }

  // Fancy / session single bet → Yes / No outcome of the chosen side.
  return [
    { name: "Yes", total: r2(back ? profit : -loss) },
    { name: "No", total: r2(back ? -loss : profit) },
  ];
}

// ---------------------------------------------------------------------------
// Cashout calculation
// ---------------------------------------------------------------------------

export function pickBestPrice(runner, otype) {
  const odds = runner?.odds?.filter((o) => o.otype?.toLowerCase() === otype) || [];
  if (!odds.length) return null;
  const best = otype === "back"
    ? odds.reduce((a, b) => ((Number(b.odds) || 0) > (Number(a.odds) || 0) ? b : a))
    : odds.reduce((a, b) => ((Number(b.odds) || 0) < (Number(a.odds) || 0) && Number(b.odds) > 0 ? b : a));
  const v = Number(best?.odds);
  return v && v > 1 && isFinite(v) ? v : null;
}

export function buildMarketCashout(market, marketType, exposures) {
  const sections = market?.section;
  if (!sections || sections.length < 2) return { ok: false, reason: "invalid_market" };

  const mname = (market.mname || "").toLowerCase();
  // Percent scale, not "is it Tied": Bookmaker / Bookmaker 2 / Tied all quote
  // percent (gtype match1) and all need divisor = odds/100 + 1. Keying this off
  // the rendering label used to send Bookmaker cashouts through the decimal
  // divisor, which produced a hedge stake that did not balance the book.
  const usePercent = getOddsFormat(market) === "percent" || isTiedMarket(market);

  // Get exposure per runner
  const exps = {};
  sections.forEach((s) => {
    const name = s.nat || "";
    const found = exposures.find(
      (e) =>
        (e.team_name === name || e.nation === name || e.nat === name) &&
        (String(e.match_id) === String(market.mid) || e.game_type === mname)
    );
    exps[name] = Number(found?.exposure_amount ?? found?.exposure ?? found?.pl ?? 0);
  });

  const names = Object.keys(exps);
  const vals = names.map((n) => exps[n]);

  if (vals.every((v) => Math.abs(v) < 0.01)) return { ok: false, reason: "no_position" };
  if (Math.abs(vals[0] - vals[1]) < 0.01) return { ok: false, reason: "already_balanced" };

  // Determine higher/lower exposure runner
  const higherIdx = vals[0] >= vals[1] ? 0 : 1;
  const lowerIdx = 1 - higherIdx;
  const diff = vals[higherIdx] - vals[lowerIdx];
  const worstBefore = Math.min(...vals);

  const candidates = [];
  const minStake = market.min || 0;
  const maxStake = market.maxb || market.max || Infinity;

  // Strategy 1: LAY the higher-exposure runner
  const layOdds = pickBestPrice(sections[higherIdx], "lay");
  if (layOdds) {
    const divisor = usePercent ? (layOdds / 100 + 1) : layOdds;
    const stake = Math.round(Math.max(0, diff / divisor) * 100) / 100;
    // Project new exposures
    const newH = vals[higherIdx] - stake * (usePercent ? layOdds / 100 : layOdds - 1);
    const newL = vals[lowerIdx] + stake;
    const worstAfter = Math.min(newH, newL);
    if (worstAfter >= worstBefore - 0.01) {
      candidates.push({
        betType: "lay",
        runner: sections[higherIdx],
        odds: layOdds,
        stake,
        worstAfter,
      });
    }
  }

  // Strategy 2: BACK the lower-exposure runner
  const backOdds = pickBestPrice(sections[lowerIdx], "back");
  if (backOdds) {
    const divisor = usePercent ? (backOdds / 100 + 1) : backOdds;
    const stake = Math.round(Math.max(0, diff / divisor) * 100) / 100;
    const newH = vals[higherIdx] - stake;
    const newL = vals[lowerIdx] + stake * (usePercent ? backOdds / 100 : backOdds - 1);
    const worstAfter = Math.min(newH, newL);
    if (worstAfter >= worstBefore - 0.01) {
      candidates.push({
        betType: "back",
        runner: sections[lowerIdx],
        odds: backOdds,
        stake,
        worstAfter,
      });
    }
  }

  if (!candidates.length) return { ok: false, reason: "no_odds" };

  // Pick best candidate (highest worst-case)
  candidates.sort((a, b) => b.worstAfter - a.worstAfter);
  const best = candidates[0];

  if (best.stake < minStake) return { ok: false, reason: "below_min", min: minStake };
  if (best.stake > maxStake) return { ok: false, reason: "above_max", max: maxStake };

  return { ok: true, ...best };
}

// ---------------------------------------------------------------------------
// Quick stakes
// ---------------------------------------------------------------------------

export const SPORTS_QUICK_STAKES = [
  { label: "+1k", value: 1000 },
  { label: "+2k", value: 2000 },
  { label: "+5k", value: 5000 },
  { label: "+10k", value: 10000 },
  { label: "+20k", value: 20000 },
  { label: "+25k", value: 25000 },
  { label: "+50k", value: 50000 },
  { label: "+75k", value: 75000 },
];

// ---------------------------------------------------------------------------
// Exposure helper
// ---------------------------------------------------------------------------

export function getExposureForSelection(exposures, runner, marketMid) {
  if (!exposures || !runner || marketMid == null) return null;
  const arr = Array.isArray(exposures) ? exposures : Object.values(exposures);
  const name = runner.nat || runner.name || "";
  const sid = runner.sid;
  const mid = String(marketMid);
  const found = arr.find((e) => {
    // ALWAYS scope to the market mid (exposure.match_id === market.mid). Selection
    // names repeat across markets (e.g. "0 Number" in the 25-over vs 30-over
    // fancy, "Hampshire W" in Match Odds vs Bookmaker), so matching by name alone
    // bleeds exposure between markets. mid disambiguates.
    if (String(e.match_id) !== mid) return false;
    if (e.team_name && e.team_name === name) return true;
    if (sid && (String(e.selection_id) === String(sid) || String(e.sid) === String(sid))) return true;
    if (e.nation === name || e.nat === name) return true;
    return false;
  });
  if (!found) return null;
  return found.exposure_amount ?? found.exposure ?? found.pl ?? null;
}

// ---------------------------------------------------------------------------
// Initial bet state
// ---------------------------------------------------------------------------

export const INITIAL_BET_STATE = {
  open: false,
  market: null,
  marketType: null,
  runner: null,
  betType: "back",
  odds: "",
  originalOdds: "",
  stake: "",
  // True once the user types/steps the price — that is what routes the submit
  // down the MANUAL (E vs X, then Y vs E) path instead of the AUTO one.
  isUserModifiedOdds: false,
  isCashout: false,
};

// ---------------------------------------------------------------------------
// Odds stepper ladder (spec §6.3) — the tick size depends on the price band.
// ---------------------------------------------------------------------------

const ODDS_TICK_BANDS = [
  [1, 2, 0.01], [2, 3, 0.02], [3, 4, 0.05], [4, 6, 0.1], [6, 10, 0.2],
  [10, 20, 0.5], [20, 30, 1], [30, 50, 2], [50, 100, 5], [100, 1000, 10],
];

function oddsStepFor(value, dir) {
  // At a band boundary a decrement uses the LOWER band's step (2.00 − → 1.99)
  // while an increment uses the upper one (2.00 + → 2.02).
  const x = dir > 0 ? value : value - 0.000001;
  const band = ODDS_TICK_BANDS.find(([lo, hi]) => x >= lo && x < hi);
  if (band) return band[2];
  return x >= 1000 ? 10 : 0.01;
}

export function stepOdds(prevStr, dir) {
  const n = parseFloat(prevStr) || 0;
  const step = oddsStepFor(n, dir);
  const next = Math.max(1.01, Math.min(1000, Math.round((n + dir * step) * 100) / 100));
  return String(Number(next.toFixed(2)));
}
