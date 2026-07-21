// ---------------------------------------------------------------------------
// BOOKIE FAVOUR — spec §4
//
// One law: the bookie never executes a deal worse than its own current rate.
//   price moved in the user's FAVOUR → bet stands, at the NEW (better) price
//   price moved AGAINST the user     → reject, they never accepted that price
//
//   X = price the user clicked (captured when the slip opened)
//   E = price the user typed in (manual bets only)
//   Y = live price when the buffer ends — the executed price, ALWAYS
//
// Three entry points, never mixed. `finalOdds` is always Y — never X, never E.
// ---------------------------------------------------------------------------

import { TOASTS } from "./sportsBetRules.js";

export const EPS = 0.001;

const isBackSide = (betType) => betType === "back" || betType === "yes";

/** Markets where the auto (unedited) favour check applies at all — spec §4.2. */
const AUTO_CHECK_MNAMES = /^(match_odds|match odds|winner|bookmaker|bookmaker 2)$/i;

export function autoCheckApplies(market) {
  return AUTO_CHECK_MNAMES.test(String(market?.mname || "").trim());
}

/**
 * Gate 1 — instant, runs BEFORE the buffer and before any network call.
 * The user may only ask for a price that is equal to or worse for themselves
 * than the one on offer; asking for a better price is an unmatched bet, which
 * this frontend never places.
 */
export function manualBetGate({ betType, selectedOdds, editedOdds }) {
  const X = Number(selectedOdds);
  const E = Number(editedOdds);
  if (!Number.isFinite(X) || !Number.isFinite(E)) return { accept: true };
  const ok = isBackSide(betType) ? E <= X + EPS : E >= X - EPS;
  return ok
    ? { accept: true }
    : { accept: false, reason: TOASTS.UNMATCHED_NOT_ALLOWED };
}

/**
 * Gate 2 — after the buffer. E is the user's LIMIT, not the execution price:
 * "E tak bhi chalega". If the live price still satisfies that limit the bet is
 * placed at the live price Y.
 */
export function manualBetLiveCheck({ betType, editedOdds, liveOdds }) {
  const E = Number(editedOdds);
  const Y = Number(liveOdds);
  if (!Number.isFinite(Y)) return { accept: true, finalOdds: E };
  const ok = isBackSide(betType) ? Y >= E - EPS : Y <= E + EPS;
  return ok
    ? { accept: true, finalOdds: Y }
    : { accept: false, reason: TOASTS.UNMATCHED_NOT_ALLOWED, finalOdds: Y };
}

/**
 * Auto path — the user never touched the price. Accept when the market has not
 * moved against them; execute at the live price (which may be better than what
 * they clicked). Markets outside the auto-check list are pass-through, but they
 * are all odds-locked so the buffer leaves Y === X anyway.
 */
export function autoBetCheck({ market, betType, selectedOdds, currentOdds }) {
  const X = Number(selectedOdds);
  const Y = Number(currentOdds);
  if (!Number.isFinite(Y)) return { accept: true, finalOdds: X };
  if (!autoCheckApplies(market)) return { accept: true, finalOdds: Y };
  const ok = isBackSide(betType) ? Y >= X - EPS : Y <= X + EPS;
  return ok
    ? { accept: true, finalOdds: Y }
    : { accept: false, reason: TOASTS.BET_NOT_CONFIRM_ODDS_CHANGE, finalOdds: Y };
}
