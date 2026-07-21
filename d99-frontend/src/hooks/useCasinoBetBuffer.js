import { getCasinoGameDetails } from "../apiservices/CasionApi.js";

const BUFFER_MS = 2000;
const CHECK_INTERVAL_MS = 500;

/**
 * Buffer period before placing bet — monitors odds changes and suspension.
 * Returns { ok, latestOdds, reason } after BUFFER_MS.
 *
 * @param {string} gameType - e.g. "superover"
 * @param {object} selectedBetData - the item being bet on
 * @param {number} originalOdds - odds at time of click
 * @param {string} betType - "back" or "lay"
 */
export async function runBetBuffer(gameType, selectedBetData, originalOdds, betType) {
  const selSid = selectedBetData._parentSid || selectedBetData.sid;
  const selName = selectedBetData.nat || "";
  let latestOdds = originalOdds;
  let suspended = false;
  let suspendReason = "";

  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const res = await getCasinoGameDetails(gameType);
        const raw = res?.data?.data || res?.data || {};
        const t1 = raw?.t1?.[0] || raw?.t1 || {};
        const t2 = Array.isArray(raw?.t2) ? raw.t2 : [];
        const lt = t1?.lt ?? 0;

        // Find the item in t2 markets (for superover-style games)
        let currentItem = null;
        for (const market of t2) {
          const sections = market.section || [];
          currentItem = sections.find((s) => s.sid === selSid) || sections.find((s) => s.nat === selName);
          if (currentItem) break;
        }

        // Also check sub array (for standard games)
        if (!currentItem) {
          const sub = raw?.sub || [];
          currentItem = sub.find((s) => s.sid === selSid) || sub.find((s) => s.nat === selName);
        }

        if (!currentItem) return;

        const gs = (currentItem.gstatus || "").toUpperCase();
        if (gs === "SUSPENDED" || gs === "BALL RUNNING" || currentItem.gstatus === "0") {
          suspended = true;
          suspendReason = "Bet Not Confirm Reason Game Suspended.";
          clearInterval(interval);
          resolve();
          return;
        }

        if (gs !== "OPEN" && gs !== "ACTIVE" && lt <= 1) {
          suspended = true;
          suspendReason = "Bet Not Confirm Reason Game Suspended.";
          clearInterval(interval);
          resolve();
          return;
        }

        // Check odds from nested odds array or direct fields
        let currentOdds;
        const nestedSid = selectedBetData._parentSid ? selectedBetData.sid : null;
        if (nestedSid && Array.isArray(currentItem.odds)) {
          const nestedOdd = currentItem.odds.find((o) => o.sno === nestedSid || o.sid === nestedSid);
          currentOdds = betType === "lay" ? (parseFloat(nestedOdd?.l) || 0) : (parseFloat(nestedOdd?.b) || 0);
        } else {
          // For superover markets, odds are in odds array with otype
          const backOdd = currentItem.odds?.find?.((o) => o.otype === "back");
          const layOdd = currentItem.odds?.find?.((o) => o.otype === "lay");
          if (backOdd || layOdd) {
            currentOdds = betType === "lay" ? (parseFloat(layOdd?.odds) || 0) : (parseFloat(backOdd?.odds) || 0);
          } else {
            currentOdds = betType === "lay" ? (parseFloat(currentItem.l) || 0) : (parseFloat(currentItem.b) || 0);
          }
        }

        if (currentOdds > 0 && Math.abs(currentOdds - originalOdds) > 0.001) {
          const isFavorable = betType === "back" ? currentOdds >= originalOdds : currentOdds <= originalOdds;
          if (isFavorable) {
            latestOdds = currentOdds;
          } else {
            suspended = true;
            suspendReason = "Odds changed. Please try again.";
            clearInterval(interval);
            resolve();
            return;
          }
        }
      } catch { /* ignore */ }
    }, CHECK_INTERVAL_MS);

    setTimeout(() => { clearInterval(interval); resolve(); }, BUFFER_MS);
  });

  return { ok: !suspended, latestOdds, reason: suspendReason };
}
