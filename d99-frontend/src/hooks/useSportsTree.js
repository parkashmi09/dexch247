import { useEffect, useState } from "react";
import { getSportsTree } from "../apiservices/SportsApi.js";

// Returns { sports (t1), racing (t2), loading, error }.
// API shape: payload.data.data.data.t1 / t2
export function useSportsTree() {
  const [state, setState] = useState({
    sports: [],
    racing: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    getSportsTree()
      .then((payload) => {
        if (cancelled) return;
        const inner = payload?.data?.data?.data ?? payload?.data?.data ?? {};
        const t1 = Array.isArray(inner.t1) ? inner.t1 : [];
        const t2 = Array.isArray(inner.t2) ? inner.t2 : [];
        setState({ sports: t1, racing: t2, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ sports: [], racing: [], loading: false, error: err?.message || "Failed" });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
