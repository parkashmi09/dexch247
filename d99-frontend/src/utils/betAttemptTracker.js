// ─── Anti-spam guard for bet submits (spec §6.6) ────────────────────────────
// Max MAX_ATTEMPTS submit ATTEMPTS per market inside a rolling WINDOW_MS. A
// blocked attempt is not recorded, so the window reopens by itself once the
// oldest attempt ages out. Module-level, so the count survives panel reopen.

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 4;

const attemptsByMarket = new Map();

export function registerBetAttempt(marketKey) {
  const key = String(marketKey || "unknown");
  const now = Date.now();
  const recent = (attemptsByMarket.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attemptsByMarket.set(key, recent);
    return false;
  }
  recent.push(now);
  attemptsByMarket.set(key, recent);
  return true;
}

export function resetBetAttempts() {
  attemptsByMarket.clear();
}
