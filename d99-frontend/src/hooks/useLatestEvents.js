import { useEffect, useState } from "react";
import { fetchSportRows } from "./useSportsData.js";

// Hot-events strip picks, driven by the same prefetched home-board data
// (no extra API calls). Order + per-sport caps match the reference site:
// football first, multiple cricket matches, then tennis / table tennis.
const PICKS = [
  { sid: 1, max: 1 }, // Football
  { sid: 4, max: 3 }, // Cricket
  { sid: 8, max: 1 }, // Table Tennis
  { sid: 2, max: 1 }, // Tennis (only fills in when cricket has < 3)
];

// Reference strip always shows at most 5 events total
const MAX_EVENTS = 5;

// stime comes as "6/4/2026 5:30:00 PM"
function startsToday(g) {
  const t = new Date(g.stime || "");
  if (isNaN(t.getTime())) return false;
  const now = new Date();
  return (
    t.getFullYear() === now.getFullYear() &&
    t.getMonth() === now.getMonth() &&
    t.getDate() === now.getDate()
  );
}

/**
 * Builds the latest-events (hot / in-play) top bar from the shared
 * useSportsData cache — reuses the prefetch fired on home load.
 *
 * Rule (reverse-engineered from the reference site): per sport take
 * matches open for betting (gscode === 1) that are live or start today,
 * live first then by start time; fall back to any in-play match.
 */
export function useLatestEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const results = await Promise.all(
        PICKS.map(({ sid, max }) =>
          fetchSportRows(sid)
            .then((rows) => {
              const named = rows.filter((g) => g.ename?.trim());
              const hot = named
                .filter((g) => g.gscode === 1 && (g.iplay || startsToday(g)))
                .sort((a, b) => {
                  const aPlay = a.iplay ? 0 : 1;
                  const bPlay = b.iplay ? 0 : 1;
                  if (aPlay !== bPlay) return aPlay - bPlay;
                  return new Date(a.stime || 0) - new Date(b.stime || 0);
                });
              const picked = hot.length > 0 ? hot : named.filter((g) => g.iplay);
              return picked.slice(0, max);
            })
            .catch(() => [])
        )
      );
      if (cancelled) return;

      // Flatten + dedupe by gmid, cap at 5 like the reference
      const seen = new Set();
      const flat = results.flat().filter((g) => {
        if (!g.gmid || seen.has(g.gmid)) return false;
        seen.add(g.gmid);
        return true;
      });
      setEvents(flat.slice(0, MAX_EVENTS));
    }

    build();
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}
