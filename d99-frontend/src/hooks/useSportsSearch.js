import { useEffect, useState } from "react";
import { getAllSportData } from "../apiservices/SportsApi.js";

// Sports the all-data endpoint serves with a flat t1/t2 list (verified
// against the live backend — other ids 404 or return a nested race tree).
const SEARCH_SPORTS = [
  { id: 4, name: "Cricket" },
  { id: 1, name: "Football" },
  { id: 2, name: "Tennis" },
  { id: 8, name: "Table Tennis" },
];

/**
 * Debounced multi-sport match search shared by the header SearchBox and
 * the mobile sidebar search. Returns `{ groups, searched }` where groups
 * is `[{ sportName, events }]`.
 */
export function useSportsSearch(query) {
  const [groups, setGroups] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query) {
      setGroups([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        const responses = await Promise.all(
          SEARCH_SPORTS.map((sport) =>
            getAllSportData(sport.id)
              .then((payload) => ({ sport, payload }))
              .catch(() => ({ sport, payload: null }))
          )
        );
        if (cancelled) return;

        const q = query.toLowerCase();
        const seen = new Set();
        const grouped = [];

        responses.forEach(({ sport, payload }) => {
          const inner = payload?.data;
          const t1 = Array.isArray(inner?.data?.t1) ? inner.data.t1 : [];
          const t2 = Array.isArray(inner?.data?.t2) ? inner.data.t2 : [];

          const events = [...t2, ...t1].filter((ev) => {
            const name = ev.ename || ev.name;
            if (!name || !ev.gmid || seen.has(ev.gmid)) return false;
            if (!name.toLowerCase().includes(q)) return false;
            seen.add(ev.gmid);
            return true;
          });

          if (events.length > 0) {
            grouped.push({
              sportName: sport.name,
              events: events.map((ev) => ({ ...ev, etid: ev.etid || sport.id })),
            });
          }
        });

        setGroups(grouped);
        setSearched(true);
      } catch {
        if (!cancelled) {
          setGroups([]);
          setSearched(true);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { groups, searched };
}
