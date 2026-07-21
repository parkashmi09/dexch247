import { useEffect, useState } from "react";
import { getAllSportData } from "../apiservices/SportsApi.js";

/**
 * Fetches horse/greyhound racing board data (sid=10 or sid=65).
 *
 * The API returns a different shape from regular sports:
 *   payload.data.data.t1 → Array of country objects:
 *     { cid, cname, children: [ { ename, gmid?, children: [ { gmid, stime, ename } ] } ] }
 *
 * Returns { countries, loading, error, refetch }
 * where `countries` is the raw t1 array.
 */
export function useRacingBoard(sid) {
  const [state, setState] = useState({ countries: [], loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    getAllSportData(sid)
      .then((payload) => {
        if (cancelled) return;
        const inner = payload?.data;
        if (!inner?.success) {
          throw new Error(inner?.msg || "No data found");
        }
        const t1 = Array.isArray(inner?.data?.t1) ? inner.data.t1 : [];
        setState({ countries: t1, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          countries: [],
          loading: false,
          error: err?.message || "Failed to load racing data",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [sid, nonce]);

  return {
    countries: state.countries,
    loading: state.loading,
    error: state.error,
    refetch: () => setNonce((n) => n + 1),
  };
}
