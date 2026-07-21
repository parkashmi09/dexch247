import { getAllSportData } from "../apiservices/SportsApi.js";

// The four sports the home board serves (the backend 404s on other ids).
// Cricket=4, Football=1, Tennis=2, Table Tennis=8.
export const HOME_SPORT_IDS = [4, 1, 2, 8];

// Module-level cache shared by useLiveBoard + useLatestEvents:
//   promises — in-flight / settled fetches (dedupes concurrent callers)
//   values   — last successfully parsed rows per sport (sync access)
const promises = new Map();
const values = new Map();

function parseRows(payload, sid) {
  // Response shape (verified against live backend):
  //   payload.data.data.t1 — upcoming matches
  //   payload.data.data.t2 — live / virtual matches
  const inner = payload?.data;
  if (!inner?.success) {
    throw new Error(inner?.msg || "No data found");
  }
  const t1 = Array.isArray(inner?.data?.t1) ? inner.data.t1 : [];
  const t2 = Array.isArray(inner?.data?.t2) ? inner.data.t2 : [];
  const merged = [...t2, ...t1];

  // Prefer rows whose etid matches the requested sid; fall back to the
  // full list if none do.
  const filtered = merged.filter((g) => g.etid === sid);
  return filtered.length > 0 ? filtered : merged;
}

/**
 * Fetch (or reuse the cached fetch of) the live-board rows for a sport.
 * Pass `force` to bypass the cache and revalidate.
 */
export function fetchSportRows(sid, force = false) {
  if (force || !promises.has(sid)) {
    const p = getAllSportData(sid)
      .then((payload) => {
        const rows = parseRows(payload, sid);
        values.set(sid, rows);
        return rows;
      })
      .catch((err) => {
        // Drop the failed promise so the next caller retries.
        if (promises.get(sid) === p) promises.delete(sid);
        throw err;
      });
    promises.set(sid, p);
  }
  return promises.get(sid);
}

/** Last successfully fetched rows for a sport (sync), or null. */
export function peekSportRows(sid) {
  return values.get(sid) || null;
}

/** Kick off all home-board sport fetches in parallel (fire and forget). */
export function prefetchHomeSports() {
  HOME_SPORT_IDS.forEach((sid) => {
    fetchSportRows(sid).catch(() => {});
  });
}
