import { useEffect, useMemo, useState } from "react";
import { fetchSportRows, peekSportRows } from "./useSportsData.js";

// Fetches the live-board list for a sport id. Backed by the shared
// useSportsData cache (prefetched on home load), so switching tabs shows
// cached rows instantly while a background revalidation refreshes odds.
// Exposes a simple `{ data, loading, error, refetch }` surface.
export function useLiveBoard(sid) {
  const [state, setState] = useState({ data: [], loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Serve cached rows immediately (no spinner on tab switch)…
    const cached = peekSportRows(sid);
    if (cached) {
      setState({ data: cached, loading: false, error: null });
    } else {
      setState((s) => ({ ...s, loading: true, error: null }));
    }

    // …then (re)validate. Force a fresh fetch when we already had data,
    // otherwise reuse any in-flight prefetch promise.
    fetchSportRows(sid, Boolean(cached) || nonce > 0)
      .then((rows) => {
        if (cancelled) return;
        setState({ data: rows, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        if (cached) return; // keep showing stale rows on refresh failure
        setState({
          data: [],
          loading: false,
          error: err?.message || "Failed to load sport data",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [sid, nonce]);

  const sorted = useMemo(
    () =>
      [...state.data].sort((a, b) => {
        // 1. iplay (in-play) first — handle true, 1, "1", etc.
        const aPlay = a.iplay ? 1 : 0;
        const bPlay = b.iplay ? 1 : 0;
        if (bPlay !== aPlay) return bPlay - aPlay;
        // 2. Within same iplay group, sort by stime ascending
        const da = new Date(a.stime || 0);
        const db = new Date(b.stime || 0);
        return da - db;
      }),
    [state.data],
  );

  return {
    data: sorted,
    loading: state.loading,
    error: state.error,
    refetch: () => setNonce((n) => n + 1),
  };
}
