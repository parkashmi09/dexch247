/**
 * resultFeed.js — System Tracker result resolver (Tier 2, on-demand only).
 *
 * The live result feed (AVRKHUB /get_result) is the ONLY complete, retained source of
 * settled results: every market for an event, with winnerName for team markets (MO/BM)
 * and winnerId (the numeric line result) for fancy markets. The local
 * sports_bet_result_cache is transient (purged), and sports_settlement_report only
 * stores team markets — so fancy results are otherwise unavailable. We fetch the feed
 * per event (short timeout, in-memory cache) purely to DISPLAY what result each bet was
 * settled against; it is never used for any money calculation, and the per-user verifier
 * degrades gracefully (no badge) if the feed is unreachable.
 */

import https from 'https';

const BASE = process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in';
const TTL_MS = 10 * 60 * 1000; // settled results are static; cache aggressively
const cache = new Map(); // eventid -> { ts, index }

// Canonical market-name key so a bet's fancy_name matches the feed's marketName despite
// suffixes/casing: "10 over runs AUS(PAK vs AUS)adv" -> "10 OVER RUNS AUS".
export const normMarket = (s) => String(s || '')
  .toUpperCase()
  .replace(/\(.*?\)/g, ' ')        // drop "(PAK vs AUS)" style suffixes
  .replace(/\b(ADV|BHAV)\b/g, ' ') // drop noise words
  .replace(/[^A-Z0-9]+/g, ' ')
  .trim().replace(/\s+/g, ' ');

function fetchEvent(eventid, sid = '4') {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    try {
      const req = https.get(`${BASE}/get_result?gmid=${encodeURIComponent(eventid)}&sid=${sid}`,
        { timeout: 8000 }, (res) => {
          let d = '';
          res.on('data', (c) => { d += c; if (d.length > 12e6) { try { req.destroy(); } catch { /* */ } finish(null); } });
          res.on('end', () => { try { finish(JSON.parse(d)); } catch { finish(null); } });
        });
      req.on('error', () => finish(null));
      req.on('timeout', () => { try { req.destroy(); } catch { /* */ } finish(null); });
    } catch { finish(null); }
  });
}

// { team: winnerName|null, fancy: { [normMarket]: winnerId } } — empty on any failure.
export async function getEventResultIndex(eventid) {
  const k = String(eventid);
  const c = cache.get(k);
  if (c && (Date.now() - c.ts) < TTL_MS) return c.index;
  const data = await fetchEvent(k);
  const index = { team: null, fancy: {} };
  for (const m of (Array.isArray(data?.markets) ? data.markets : [])) {
    if (m.winnerId != null && m.marketName) index.fancy[normMarket(m.marketName)] = m.winnerId;
    const isTeam = /BOOKMAKER|MATCH/i.test(m.mname || '') || /MATCH/i.test(m.gtype || '');
    if (isTeam && m.winnerName && !/no result/i.test(String(m.winnerName))) index.team = m.winnerName;
  }
  cache.set(k, { ts: Date.now(), index });
  return index;
}

export default { getEventResultIndex, normMarket };
