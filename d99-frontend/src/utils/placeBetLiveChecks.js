// ---------------------------------------------------------------------------
// Live checks around a bet submit — spec §5.3 / §6.7
//
// The buffer holds the bet for a few seconds and watches the feed. It makes NO
// accept/reject decision on price: it only reports the last live price (Y), the
// last live size, and whether the market went dead while we waited. All favour
// comparisons happen after it resolves (see bookieFavour.js).
// ---------------------------------------------------------------------------

import { isOddsLocked } from "./sportsBetRules.js";

const BLOCKED_STATUSES = new Set(["SUSPENDED", "BALL RUNNING", "BALLRUNNING", "INACTIVE"]);

const norm = (v) => String(v ?? "").trim().toUpperCase();
const lower = (v) => String(v ?? "").trim().toLowerCase();

function findMarket(markets, marketId) {
  return (markets || []).find((m) => String(m?.mid ?? "") === String(marketId ?? ""));
}

function findRunner(market, selectionId, selectionName) {
  const wantSid = String(selectionId ?? "");
  const wantNat = lower(selectionName);
  return (market?.section || []).find(
    (s) =>
      (wantSid && String(s?.sid ?? "") === wantSid) ||
      (wantNat && lower(s?.nat ?? s?.name) === wantNat)
  );
}

/**
 * Market-level suspension. Deliberately skipped for `gtype: 'match1'` — the
 * feed leaves bookmaker markets stale on `SUSPENDED` while still streaming live
 * odds, so trusting it there would block every bookmaker bet (spec §1.4).
 */
function marketBlocked(market) {
  if (lower(market?.gtype) === "match1") return false;
  return norm(market?.status) === "SUSPENDED";
}

function runnerBlocked(runner) {
  const gs = norm(runner?.gstatus || runner?.status);
  if (!gs) return false;
  return BLOCKED_STATUSES.has(gs);
}

/** Best rung on the given side: prefer tno 0, else the back1/lay1 entry. */
export function bestRung(runner, betType) {
  const isLay = betType === "lay" || betType === "no";
  const want = isLay ? "lay" : "back";
  const all = Array.isArray(runner?.odds) ? runner.odds : [];
  const side = all.filter((o) => lower(o?.otype) === want);
  return (
    side.find((o) => Number(o?.tno) === 0) ||
    side.find((o) => lower(o?.oname) === `${want}1`) ||
    side[0] ||
    null
  );
}

/**
 * Watch the feed for `bufferSeconds`, ticking every 500ms.
 *
 * Skips entirely (returning Y = X immediately) when we have no market/selection
 * to track or the buffer is zero — the downstream favour check then trivially
 * accepts, while suspension, drift, rate cap and balance checks still run.
 *
 * @returns {Promise<{finalOdds:number, finalSize:number, blocked:boolean, reason:string|null}>}
 */
export function monitorOddsBuffer({
  getMarkets,
  market,
  marketId,
  selectionId,
  selectionName,
  betType,
  initialOdds,
  initialSize = 0,
  bufferSeconds = 0,
}) {
  const locked = isOddsLocked(market);
  const base = {
    finalOdds: Number(initialOdds),
    finalSize: Number(initialSize) || 0,
    blocked: false,
    reason: null,
  };

  if (!marketId || !selectionId || !(bufferSeconds > 0)) return Promise.resolve(base);

  return new Promise((resolve) => {
    const state = { ...base };
    const tick = () => {
      const mkt = findMarket(getMarkets(), marketId);
      if (!mkt) return; // feed hiccup — keep waiting, don't kill the bet
      if (marketBlocked(mkt)) {
        state.blocked = true;
        state.reason = "market";
        return;
      }
      const runner = findRunner(mkt, selectionId, selectionName);
      if (!runner) return;
      if (runnerBlocked(runner)) {
        state.blocked = true;
        state.reason = norm(runner?.gstatus) === "BALL RUNNING" ? "ball_running" : "runner";
        return;
      }
      const rung = bestRung(runner, betType);
      const live = Number(rung?.odds);
      if (!rung || !Number.isFinite(live) || live <= 0) {
        state.blocked = true;
        state.reason = "no_price";
        return;
      }
      // Odds-locked markets keep the clicked price; sizes always track live.
      if (!locked) state.finalOdds = live;
      const sz = Number(rung?.size);
      if (Number.isFinite(sz)) state.finalSize = sz;
      state.blocked = false;
      state.reason = null;
    };

    const interval = setInterval(tick, 500);
    tick();
    setTimeout(() => {
      clearInterval(interval);
      resolve(state);
    }, bufferSeconds * 1000);
  });
}

/**
 * Final suspension read, straight after the buffer. Resolves the runner by sid
 * first and name second; when neither resolves we fail OPEN — the server does
 * the authoritative check and a feed gap should not silently eat bets.
 */
export function getFinalSuspensionStatus({ markets, marketId, selectionId, selectionName }) {
  const mkt = findMarket(markets, marketId);
  if (!mkt) return { suspended: false, reason: null };
  if (marketBlocked(mkt)) return { suspended: true, reason: "market" };
  const runner = findRunner(mkt, selectionId, selectionName);
  if (!runner) return { suspended: false, reason: null };
  const gs = norm(runner?.gstatus || runner?.status);
  if (gs === "BALL RUNNING" || gs === "BALLRUNNING") return { suspended: true, reason: "ball_running" };
  if (BLOCKED_STATUSES.has(gs)) return { suspended: true, reason: "runner" };
  return { suspended: false, reason: null };
}

/**
 * Strict drift check for odds-locked markets: the clicked price must still be
 * on the ladder. Fancy feeds reuse `sid` across sessions, so the runner is
 * matched by NAME here. Missing market/runner/tier → fail open.
 */
export function hasFancyDrift({ markets, marketId, selectionName, betType, odds }) {
  const mkt = findMarket(markets, marketId);
  if (!mkt) return false;
  const runner = (mkt.section || []).find((s) => lower(s?.nat ?? s?.name) === lower(selectionName));
  if (!runner) return false;
  const isLay = betType === "lay" || betType === "no";
  const want = isLay ? "lay" : "back";
  const tiers = (runner.odds || [])
    .filter((o) => lower(o?.otype) === want)
    .map((o) => Number(o?.odds))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!tiers.length) return false;
  const X = Number(odds);
  const closest = tiers.reduce((b, c) => (Math.abs(c - X) < Math.abs(b - X) ? c : b));
  return Math.abs(closest - X) > 0.01;
}
