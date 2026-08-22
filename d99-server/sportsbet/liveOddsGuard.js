// ---------------------------------------------------------------------------
// SERVER-SIDE LIVE ODDS GUARD
// ---------------------------------------------------------------------------
// Until this existed, placeBet booked whatever line and rate arrived in the
// request body. GetMatchPrivateData was consulted only for min/max STAKE, so a
// replayed or hand-edited request carrying a stale-but-favourable line was
// accepted verbatim, and a market that had already gone SUSPENDED / BALL
// RUNNING could still be bet into. The frontend does check all of this
// (d99-frontend/src/utils/placeBetLiveChecks.js) — but the client is not a
// trust boundary.
//
// This module re-runs those checks against the live feed, server-side. It
// deliberately mirrors the frontend's field handling and match semantics so the
// two cannot disagree and quietly reject valid bets.
//
// FAIL-OPEN POLICY — matches STEP 4.5 / 4.55 / 4.6 in sportbetscontroller.js:
// when the feed cannot be read, or the market/runner/price ladder is missing,
// the check is SKIPPED, not failed. Betting must survive an upstream outage.
// We only ever reject on positive evidence: a stamp that is provably stale, a
// status that is provably blocked, or a line that is provably off the ladder.
// ---------------------------------------------------------------------------

import CricketService from '../services/CricketService.js';

// --- config ---------------------------------------------------------------
const bool = (v, dflt) =>
  v == null || v === '' ? dflt : !['0', 'false', 'no', 'off'].includes(String(v).toLowerCase());

const CFG = {
  // Master switch for the whole guard.
  enabled:      bool(process.env.LIVE_ODDS_GUARD, true),
  // Reject a bet when the feed's own "last updated" stamp is older than this.
  freshness:    bool(process.env.ODDS_FRESHNESS_CHECK, true),
  maxStaleMs:   (Number(process.env.ODDS_MAX_STALENESS_SEC) || 5) * 1000,
  // When true, a feed with NO recognisable stamp also rejects. Off by default:
  // the upstream field name is not contractual, and a rename must not take
  // betting down. Turn on once feed_updated_ms is confirmed in the logs.
  strictStale:  bool(process.env.ODDS_FRESHNESS_STRICT, false),
  // Reject bets into suspended / ball-running markets.
  suspension:   bool(process.env.ODDS_SUSPENSION_CHECK, true),
  // Reject when the submitted line/rate is not on the live ladder.
  lineMatch:    bool(process.env.ODDS_LINE_CHECK, true),
  // Price tolerance — same 0.01 the frontend's hasFancyDrift() uses.
  tolerance:    Number(process.env.ODDS_LINE_TOLERANCE) || 0.01,
  // Log every decision, not just rejections.
  verbose:      bool(process.env.LIVE_ODDS_GUARD_VERBOSE, false),
};

// Runner/market states that must never accept a bet. Mirrors
// BLOCKED_STATUSES in the frontend's placeBetLiveChecks.js.
const BLOCKED_STATUSES = new Set(['SUSPENDED', 'BALL RUNNING', 'BALLRUNNING', 'INACTIVE', 'CLOSED']);

const norm  = (v) => String(v ?? '').trim().toUpperCase();
const lower = (v) => String(v ?? '').trim().toLowerCase();
// Must reject null/undefined/'' BEFORE Number(), because Number(null) is 0 and
// Number('') is 0. Coercing a missing timestamp to 0 reads as "epoch 1970",
// i.e. infinitely stale, which would refuse every bet the moment upstream
// renamed the field — the exact outage this guard's fail-open policy exists to
// prevent.
const numOrNull = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** A lay-side bet in this codebase is "lay" (team markets) or "no" (fancy). */
const isLaySide = (betType) => ['lay', 'no'].includes(lower(betType));

function findMarket(markets, match_id, mname, market_type) {
  const list = Array.isArray(markets) ? markets : [];
  return (
    list.find((m) => String(m?.mid ?? '') === String(match_id ?? '')) ||
    list.find((m) => norm(m?.mname) === norm(mname || market_type)) ||
    null
  );
}

/**
 * Fancy feeds reuse `sid` across sessions, so NAME is the reliable key there
 * (the frontend's hasFancyDrift makes the same call). Team markets resolve by
 * sid first. Try both orders and take whichever hits.
 */
function findRunner(market, selection_name, selection_id) {
  const sections = Array.isArray(market?.section) ? market.section : [];
  const wantNat = lower(selection_name);
  const wantSid = String(selection_id ?? '');
  return (
    (wantNat && sections.find((s) => lower(s?.nat ?? s?.name) === wantNat)) ||
    (wantSid && sections.find((s) => String(s?.sid ?? '') === wantSid)) ||
    null
  );
}

/**
 * Market-level suspension is deliberately NOT trusted for bookmaker markets
 * (gtype 'match1'): the feed leaves them pinned on SUSPENDED while still
 * streaming live odds, so honouring it would block every bookmaker bet. This
 * is the same carve-out the frontend documents in marketBlocked().
 */
function marketBlocked(market) {
  if (lower(market?.gtype) === 'match1') return false;
  return norm(market?.status) === 'SUSPENDED';
}

function runnerBlockReason(runner) {
  const gs = norm(runner?.gstatus || runner?.status);
  if (!gs) return null;
  if (gs === 'BALL RUNNING' || gs === 'BALLRUNNING') return 'ball_running';
  return BLOCKED_STATUSES.has(gs) ? 'suspended' : null;
}

/** All priced tiers on the bettor's side of the book. */
function sideTiers(runner, betType) {
  const want = isLaySide(betType) ? 'lay' : 'back';
  return (Array.isArray(runner?.odds) ? runner.odds : [])
    .filter((o) => lower(o?.otype) === want)
    .map((o) => ({ odds: numOrNull(o?.odds), size: numOrNull(o?.size) }))
    .filter((o) => o.odds != null && o.odds > 0);
}

/**
 * Verify a bet against the live feed.
 *
 * For FANCY markets `odds` is the RUN LINE and `size` is the rate (bhav) — the
 * same pair the frontend reads off the clicked tier via deriveBetSizes(). Both
 * are checked: the line must still be on the ladder, and the rate must be the
 * one attached to that line.
 *
 * @returns {Promise<{ok:boolean, code?:string, message?:string, detail?:object}>}
 *          ok:true means "accept" — including every skipped/fail-open path.
 */
export async function verifyLiveOdds({
  eventid, sid, match_id, mname, gtype, market_type,
  selection_name, selection_id, bet_type, odds, size,
}) {
  if (!CFG.enabled) return { ok: true, code: 'disabled' };

  // ---- fetch the live book -------------------------------------------------
  let feed;
  try {
    feed = await CricketService.GetMatchPrivateData(eventid, sid);
  } catch (err) {
    console.warn('[liveOddsGuard] feed unreadable — checks skipped (non-blocking):', err.message);
    return { ok: true, code: 'feed_error' };
  }

  const markets = Array.isArray(feed?.data) ? feed.data : [];
  if (!markets.length) {
    console.warn(`[liveOddsGuard] empty feed for gmid=${eventid} — checks skipped`);
    return { ok: true, code: 'feed_empty' };
  }

  // ---- 1. staleness --------------------------------------------------------
  // "Data freshness": now − feed.lastUpdatedAt. Inside the window the market is
  // live and betting is unlocked; beyond it the prices on screen are frozen and
  // the bet is refused. Both sides are absolute epoch ms, so the IST wording in
  // the operator spec is a display concern only — no timezone maths here.
  if (CFG.freshness) {
    const updated = numOrNull(feed?.feed_updated_ms);
    if (updated == null) {
      if (CFG.strictStale) {
        return {
          ok: false,
          code: 'stale_unknown',
          message: 'Bet not accepted — live odds age could not be confirmed',
          detail: { eventid },
        };
      }
      console.warn(
        `[liveOddsGuard] no last-updated stamp on feed for gmid=${eventid} — ` +
        'freshness check skipped (set ODDS_FRESHNESS_STRICT=1 to reject instead)'
      );
    } else {
      // Measure against when the response actually landed, so our own
      // processing time is not charged against the feed's age.
      const at = numOrNull(feed?.fetched_at_ms) ?? Date.now();
      const ageMs = at - updated;
      // A stamp in the future means clock skew upstream, not staleness — a
      // small lead is normal and must not reject.
      if (ageMs > CFG.maxStaleMs) {
        return {
          ok: false,
          code: 'stale_odds',
          message: `Bet not accepted — odds are ${(ageMs / 1000).toFixed(1)}s old (limit ${CFG.maxStaleMs / 1000}s)`,
          detail: { ageMs, limitMs: CFG.maxStaleMs, updated, at },
        };
      }
      if (CFG.verbose) {
        console.log(`[liveOddsGuard] freshness ok gmid=${eventid} age=${(ageMs / 1000).toFixed(2)}s`);
      }
    }
  }

  // ---- 2. locate market / runner -------------------------------------------
  const market = findMarket(markets, match_id, mname, market_type);
  if (!market) {
    console.warn(`[liveOddsGuard] market ${match_id} not in feed for gmid=${eventid} — checks skipped`);
    return { ok: true, code: 'market_missing' };
  }

  if (CFG.suspension && marketBlocked(market)) {
    return {
      ok: false,
      code: 'market_suspended',
      message: 'Bet not accepted — market is suspended',
      detail: { match_id, status: market?.status },
    };
  }

  const runner = findRunner(market, selection_name, selection_id);
  if (!runner) {
    console.warn(`[liveOddsGuard] runner "${selection_name}" not in market ${match_id} — checks skipped`);
    return { ok: true, code: 'runner_missing' };
  }

  if (CFG.suspension) {
    const blocked = runnerBlockReason(runner);
    if (blocked === 'ball_running') {
      return {
        ok: false,
        code: 'ball_running',
        message: 'Bet not accepted — ball running',
        detail: { selection_name, gstatus: runner?.gstatus },
      };
    }
    if (blocked) {
      return {
        ok: false,
        code: 'runner_suspended',
        message: 'Bet not accepted — this selection is suspended',
        detail: { selection_name, gstatus: runner?.gstatus || runner?.status },
      };
    }
  }

  // ---- 3. the submitted line must still be on the ladder --------------------
  if (CFG.lineMatch) {
    const submitted = numOrNull(odds);
    if (submitted == null || submitted <= 0) {
      return {
        ok: false,
        code: 'bad_odds',
        message: 'Bet not accepted — invalid odds',
        detail: { odds },
      };
    }

    const tiers = sideTiers(runner, bet_type);
    if (!tiers.length) {
      console.warn(`[liveOddsGuard] no ${isLaySide(bet_type) ? 'lay' : 'back'} tiers for "${selection_name}" — line check skipped`);
      return { ok: true, code: 'no_tiers' };
    }

    const closest = tiers.reduce((best, t) =>
      Math.abs(t.odds - submitted) < Math.abs(best.odds - submitted) ? t : best
    );

    if (Math.abs(closest.odds - submitted) > CFG.tolerance) {
      return {
        ok: false,
        code: 'line_mismatch',
        message: 'Bet not accepted — odds have changed',
        detail: { submitted, live: closest.odds, ladder: tiers.map((t) => t.odds) },
      };
    }

    // ---- 4. and the rate attached to that line must match -------------------
    // Fancy pays stake × (size ÷ 100), so an unchecked `size` is worth as much
    // to an attacker as an unchecked line. Only enforced when the client sent a
    // rate AND the feed prices one — some markets (oddeven) omit it.
    const submittedRate = numOrNull(size);
    if (submittedRate != null && submittedRate > 0 && closest.size != null && closest.size > 0) {
      if (Math.abs(closest.size - submittedRate) > CFG.tolerance) {
        return {
          ok: false,
          code: 'rate_mismatch',
          message: 'Bet not accepted — rate has changed',
          detail: { submitted: submittedRate, live: closest.size, line: closest.odds },
        };
      }
    }

    if (CFG.verbose) {
      console.log(`[liveOddsGuard] line ok "${selection_name}" ${submitted}@${submittedRate ?? '-'} (live ${closest.odds}@${closest.size ?? '-'})`);
    }
  }

  return { ok: true, code: 'verified' };
}

export const __config = CFG;
export default { verifyLiveOdds };
