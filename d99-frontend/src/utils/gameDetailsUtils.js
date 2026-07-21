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

// ---------------------------------------------------------------------------
// Racing feed time (IST wall-clock, no zone marker)
// ---------------------------------------------------------------------------
// The feed sends `stime` as "7/22/2026 1:44:00 AM" — Indian wall-clock with NO
// timezone marker. `new Date(stime)` resolves it in the VIEWER's timezone, so
// the countdown and the betting window were only correct for users in India.
// Parse the parts explicitly and subtract the +05:30 offset for a true instant.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

function parseFeedIstParts(stime) {
  if (!stime) return null;
  const m = String(stime).trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );
  if (!m) return null;
  const [, mo, day, yr, hhRaw, mi, ss, ampm] = m;
  let hh = Number(hhRaw);
  if (ampm) {
    const up = ampm.toUpperCase();
    if (up === "PM" && hh !== 12) hh += 12;
    if (up === "AM" && hh === 12) hh = 0;
  }
  return { year: Number(yr), month: Number(mo), day: Number(day), hour: hh, minute: Number(mi), second: Number(ss || 0) };
}

/** Feed IST string → epoch ms. Falls back to Date parsing for other shapes. */
export function parseFeedIstTime(stime) {
  const p = parseFeedIstParts(stime);
  if (!p) {
    const d = new Date(stime);
    return isNaN(d) ? null : d.getTime();
  }
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - IST_OFFSET_MS;
}

/**
 * Display a feed time as the RACECARD time — the IST parts reformatted, with
 * NO timezone conversion, so every viewer sees what the racecard says.
 *   "7/22/2026 2:21:00 AM" → "22/07/2026 02:21:00"
 */
export function formatFeedIstTime(stime) {
  const p = parseFeedIstParts(stime);
  if (!p) return formatStime(stime);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(p.day)}/${pad(p.month)}/${p.year} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
}

// ---------------------------------------------------------------------------
// Horse racing betting window (sid=10 only)
// ---------------------------------------------------------------------------
// A horse race accepts bets only in the final N minutes before the off.
// Greyhound (65) is NOT affected. The server enforces this authoritatively
// (placeBet STEP 4.55) — this is the UI half so the user is told why.
export const RACE_BET_WINDOW_MINUTES = 5;

/** Minutes until the off; negative once it has started, null if unparseable. */
export function minutesUntilRaceStart(stime) {
  const ms = parseFeedIstTime(stime);
  if (ms == null) return null;
  return (ms - Date.now()) / 60000;
}

/**
 * Is this race inside the betting window? Only horse racing (10) is gated.
 * An unreadable/unknown time FAILS OPEN — same as the server, so the UI never
 * blocks a bet the API would have accepted.
 */
export function isRaceBettingOpen(stime, sid) {
  if (String(sid) !== "10") return true;
  const mins = minutesUntilRaceStart(stime);
  if (mins == null) return true;
  return mins <= RACE_BET_WINDOW_MINUTES;
}

/**
 * Racing boards nest country → venue → race, so the flat `gmid` lookup used
 * for other sports finds nothing and the banner has no data. Walk the tree.
 * Returns { race, venue, country } or null.
 */
export function findRaceInBoard(board, gmid) {
  const data = board?.data ?? board;
  const roots = [...(data?.t1 || []), ...(data?.t2 || [])];
  const want = String(gmid);

  const walk = (node, country, venue) => {
    if (!node || typeof node !== "object") return null;
    if (String(node.gmid ?? "") === want) return { race: node, venue, country };
    const kids = Array.isArray(node.children) ? node.children : [];
    for (const kid of kids) {
      // A country node carries `cname`, a venue node carries `ename`.
      const hit = walk(kid, node.cname || country, node.cname ? undefined : (node.ename || venue));
      if (hit) return hit;
    }
    return null;
  };

  for (const root of roots) {
    const hit = walk(root, undefined, undefined);
    if (hit) return hit;
  }
  return null;
}

// ---------------------------------------------------------------------------
// COMBINED (dutched) betting
// ---------------------------------------------------------------------------

/**
 * Combined price for a set of runners:  1 / Σ(1 / oddsᵢ)
 *
 *   back 38 and 2.72 → 1 / (1/38 + 1/2.72) = 2.538 → 2.54
 *
 * Same formula for back and lay. Returns null when fewer than 2 usable prices
 * or the result is below the 1.01 minimum (the caller shows "-").
 */
export function calcCombinedOdds(oddsList) {
  const valid = (oddsList || [])
    .map((o) => Number(o))
    .filter((o) => Number.isFinite(o) && o > 1);
  if (valid.length < 2) return null;
  const inv = valid.reduce((sum, o) => sum + 1 / o, 0);
  if (inv <= 0) return null;
  const combined = Math.round((1 / inv) * 100) / 100;
  return combined >= 1.01 ? combined : null;
}

/**
 * Split a stake across runners in proportion to implied probability, so the
 * return is the same whichever selected runner wins (dutching):
 *
 *   stakeᵢ = total × (1/oddsᵢ) / Σ(1/oddsⱼ)
 *
 *   100 across 2.74 and 30 → 91.63 and 8.37
 *   check: 91.63 × 2.74 = 251.07 ≈ 8.37 × 30 = 251.10 ✔
 *
 * Each part is rounded to 2 dp and the rounding remainder is given to the
 * LARGEST leg, so the parts sum to EXACTLY the typed total — the user is never
 * charged more than they entered.
 */
export function splitCombinedStake(total, oddsList) {
  const t = Number(total);
  const valid = (oddsList || []).map((o) => Number(o));
  if (!Number.isFinite(t) || t <= 0) return valid.map(() => 0);
  if (valid.some((o) => !Number.isFinite(o) || o <= 1)) return valid.map(() => 0);

  const inv = valid.map((o) => 1 / o);
  const sumInv = inv.reduce((a, b) => a + b, 0);
  const parts = inv.map((i) => Math.round((t * i / sumInv) * 100) / 100);

  const remainder = Math.round((t - parts.reduce((a, b) => a + b, 0)) * 100) / 100;
  if (remainder !== 0 && parts.length) {
    let biggest = 0;
    parts.forEach((p, i) => { if (p > parts[biggest]) biggest = i; });
    parts[biggest] = Math.round((parts[biggest] + remainder) * 100) / 100;
  }
  return parts;
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

const CASHOUT_EPS = 0.01;

// Best executable price object for one runner on the given side. Prefers the
// named best tier (back1/lay1); otherwise max-odds back / min-odds lay across
// tiers whose odds > 1 (a 0/`-` rung is not a price). Returns the full rung so
// the caller can read `size`, or null.
export function pickBestPriceObj(runner, otype) {
  const side = (runner?.odds || []).filter(
    (o) => String(o?.otype || "").toLowerCase() === otype && Number(o?.odds) > 1
  );
  if (!side.length) return null;
  const named = side.find((o) => String(o?.oname || "").toLowerCase() === `${otype}1`);
  if (named) return named;
  return otype === "back"
    ? side.reduce((a, b) => (Number(b.odds) > Number(a.odds) ? b : a))
    : side.reduce((a, b) => (Number(b.odds) < Number(a.odds) ? b : a));
}

/** Backward-compatible: just the best price as a number, or null. */
export function pickBestPrice(runner, otype) {
  const o = pickBestPriceObj(runner, otype);
  const v = Number(o?.odds);
  return v > 1 && isFinite(v) ? v : null;
}

// Exposure walk mirroring the backend placeBet math (spec §8.2):
//   mult = percent ? odds/100 : odds-1
//   BACK sel: sel += stake·mult ; other -= stake
//   LAY  sel: sel -= stake·mult ; other += stake
function projectCashout(vals, higherIdx, lowerIdx, betType, selIsHigher, odds, stake, usePercent) {
  const mult = usePercent ? odds / 100 : odds - 1;
  const next = [...vals];
  const sel = selIsHigher ? higherIdx : lowerIdx;
  const other = selIsHigher ? lowerIdx : higherIdx;
  if (betType === "back") {
    next[sel] = vals[sel] + stake * mult;
    next[other] = vals[other] - stake;
  } else {
    next[sel] = vals[sel] - stake * mult;
    next[other] = vals[other] + stake;
  }
  return Math.min(next[0], next[1]);
}

/**
 * Compute ONE hedge bet that balances a 2-runner book (spec §8).
 *
 * `exposures` may be the raw API rows OR a page-level exposure map — either way
 * per-runner exposure is read through getExposureForSelection, which scopes to
 * the market mid and prefers selection_id over free-text names.
 *
 * Candidates (LAY higher / BACK lower) are projected, sorted safest-first, and
 * the FIRST that neither worsens the book nor breaks the max is returned.
 * There is deliberately NO min-stake gate — a computed hedge of 99.02 on a
 * min-100 market is valid (spec §8.5). Returns {ok:false, reason} otherwise.
 */
export function buildMarketCashout(market, marketType, exposures) {
  const sections = market?.section;
  if (!sections || sections.length !== 2 || !market?.mname) {
    return { ok: false, reason: "invalid_market" };
  }

  // Percent scale, not "is it Tied": Bookmaker / Bookmaker 2 / Tied all quote
  // percent (gtype match1) and all need divisor = odds/100 + 1. Keying this off
  // the rendering label sent Bookmaker cashouts through the decimal divisor,
  // producing a hedge stake that did not balance the book.
  const usePercent = getOddsFormat(market) === "percent" || isTiedMarket(market);

  const vals = sections.map((s) => Number(getExposureForSelection(exposures, s, market.mid) || 0));

  if (vals.every((v) => Math.abs(v) < CASHOUT_EPS)) return { ok: false, reason: "no_position" };
  if (Math.abs(vals[0] - vals[1]) < CASHOUT_EPS) return { ok: false, reason: "already_balanced" };

  const higherIdx = vals[0] >= vals[1] ? 0 : 1; // drain the higher-exposure runner
  const lowerIdx = 1 - higherIdx;
  const diff = vals[higherIdx] - vals[lowerIdx];
  const worstBefore = Math.min(...vals);

  const candidates = [];

  // PRIMARY — LAY the higher-exposure runner
  const layObj = pickBestPriceObj(sections[higherIdx], "lay");
  if (layObj) {
    const odds = Number(layObj.odds);
    const divisor = usePercent ? odds / 100 + 1 : odds;
    const stake = Math.round(Math.max(0, diff / divisor) * 100) / 100;
    if (stake > 0) {
      candidates.push({
        betType: "lay",
        runner: sections[higherIdx],
        odds,
        size: Number(layObj.size) || 0,
        stake,
        worstAfter: projectCashout(vals, higherIdx, lowerIdx, "lay", true, odds, stake, usePercent),
      });
    }
  }

  // FALLBACK — BACK the lower-exposure runner
  const backObj = pickBestPriceObj(sections[lowerIdx], "back");
  if (backObj) {
    const odds = Number(backObj.odds);
    const divisor = usePercent ? odds / 100 + 1 : odds;
    const stake = Math.round(Math.max(0, diff / divisor) * 100) / 100;
    if (stake > 0) {
      candidates.push({
        betType: "back",
        runner: sections[lowerIdx],
        odds,
        size: Number(backObj.size) || 0,
        stake,
        worstAfter: projectCashout(vals, higherIdx, lowerIdx, "back", false, odds, stake, usePercent),
      });
    }
  }

  if (!candidates.length) return { ok: false, reason: "no_odds" };

  // Safest-first (highest resulting floor), then take the first that passes.
  candidates.sort((a, b) => b.worstAfter - a.worstAfter);
  const maxStake = Number(market.maxb) > 0 ? Number(market.maxb) : Number(market.max) || 0;

  let lastReject = { ok: false, reason: "no_odds" };
  for (const c of candidates) {
    if (c.worstAfter + CASHOUT_EPS < worstBefore) {
      lastReject = { ok: false, reason: "worsens" };
      continue;
    }
    if (maxStake > 0 && c.stake > maxStake) {
      lastReject = { ok: false, reason: "above_max", max: maxStake };
      continue;
    }
    return { ok: true, ...c };
  }
  return lastReject;
}

/**
 * Whether the Cashout button should be enabled (spec §8.1): the market is a
 * 2-runner match/match1 hedge target AND the user holds a non-zero book on at
 * least one runner. 3-way and fancy markets are excluded — the 2-runner hedge
 * engine cannot balance them.
 */
export function hasCashoutPosition(market, exposures) {
  const sections = market?.section || [];
  if (sections.length !== 2) return false;
  const gt = String(market?.gtype || "").toLowerCase();
  const mn = String(market?.mname || "").toLowerCase();
  const eligible =
    gt === "match" || gt === "match1" || /match[\s_]*odds|tied|bookmaker/.test(mn);
  if (!eligible) return false;
  return sections.some(
    (s) => Math.abs(Number(getExposureForSelection(exposures, s, market.mid) || 0)) > 0.01
  );
}

/** Cashout reject reason → user-facing toast (reference wording, spec §8.6). */
export function cashoutToastMessage(reason) {
  switch (reason) {
    case "no_position":
      return "No active bets to cashout";
    case "already_balanced":
      return "You are not eligible for cashout!";
    case "no_odds":
    case "worsens":
      return "You are not eligible for cashout";
    case "above_max":
      return "Cashout stake above the market limit";
    case "invalid_market":
      return "Cashout not available for this market";
    default:
      return "Cashout not available";
  }
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
