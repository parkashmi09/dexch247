import { useEffect, useState, useCallback, useRef } from "react";
import { getAllSportData, getMatchPrivateData } from "../apiservices/SportsApi.js";

/**
 * RAW response dump for "(e)" virtual cricket events.
 *
 * NO betting UI here on purpose — this page just renders the upstream
 * response (event list + a selected match's market/odds data) as raw JSON
 * so the actual UI can be built on top of the real shape.
 *
 * Route: /e-cricket   (sid is cricket = 4)
 */
const CRICKET_SID = 4;
const POLL_MS = 2000;

export default function ECricketRaw() {
  const [list, setList] = useState({ raw: null, events: [] });
  const [listErr, setListErr] = useState(null);
  const [selected, setSelected] = useState(null); // { gmid, ename }
  const [match, setMatch] = useState(null);        // raw getMatchPrivateData response
  const [matchErr, setMatchErr] = useState(null);
  const pollRef = useRef(null);

  // ---- 1) event list (filter to "(e)" virtual matches) ----
  const loadList = useCallback(async () => {
    try {
      const res = await getAllSportData(CRICKET_SID);
      const root = res?.data ?? res ?? {};
      const t1 = Array.isArray(root.t1) ? root.t1 : [];
      const t2 = Array.isArray(root.t2) ? root.t2 : [];
      const all = [...t1, ...t2];
      const events = all.filter((e) => /\(e\)/i.test(e?.ename || ""));
      setList({ raw: res, events });
      setListErr(null);
    } catch (e) {
      setListErr(e?.message || String(e));
    }
  }, []);

  useEffect(() => {
    loadList();
    const id = setInterval(loadList, 5000);
    return () => clearInterval(id);
  }, [loadList]);

  // ---- 2) selected match private data (poll for live odds) ----
  const loadMatch = useCallback(async (gmid) => {
    try {
      const res = await getMatchPrivateData(gmid, CRICKET_SID);
      setMatch(res);
      setMatchErr(null);
    } catch (e) {
      setMatchErr(e?.message || String(e));
    }
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selected?.gmid) return;
    loadMatch(selected.gmid);
    pollRef.current = setInterval(() => loadMatch(selected.gmid), POLL_MS);
    return () => pollRef.current && clearInterval(pollRef.current);
  }, [selected, loadMatch]);

  const pre = {
    background: "#0b0b0b",
    color: "#9fef00",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "12px",
    lineHeight: "1.4",
    overflow: "auto",
    maxHeight: "70vh",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div style={{ padding: "16px", fontFamily: "monospace", color: "#222" }}>
      <h3 style={{ margin: "0 0 8px" }}>(e) Cricket — RAW response dump</h3>
      <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#666" }}>
        sid={CRICKET_SID}. Left = "(e)" events from <code>/user/cricket/all-data</code>.
        Click one → right shows <code>/user/cricket/get-match-private-data</code> raw
        JSON (polling every {POLL_MS}ms).
      </p>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ---- event list ---- */}
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <h4 style={{ margin: "0 0 6px" }}>
            (e) events ({list.events.length}){" "}
            <button onClick={loadList} style={{ fontSize: 11 }}>refresh</button>
          </h4>
          {listErr && <div style={{ color: "red" }}>list error: {listErr}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {list.events.map((e) => (
              <button
                key={e.gmid}
                onClick={() => setSelected({ gmid: e.gmid, ename: e.ename })}
                style={{
                  textAlign: "left",
                  padding: "6px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: selected?.gmid === e.gmid ? "#9fef00" : "#f2f2f2",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              >
                <b>{e.ename}</b>
                <br />
                gmid={e.gmid} · iplay={String(e.iplay)} · {e.stime || ""}
              </button>
            ))}
            {!list.events.length && !listErr && <div>no (e) events right now…</div>}
          </div>

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer", fontSize: 12 }}>full list raw JSON</summary>
            <pre style={pre}>{JSON.stringify(list.raw, null, 2)}</pre>
          </details>
        </div>

        {/* ---- selected match raw ---- */}
        <div style={{ flex: "2 1 420px", minWidth: 320 }}>
          <h4 style={{ margin: "0 0 6px" }}>
            match private data {selected ? `— ${selected.ename} (gmid=${selected.gmid})` : "(select an event)"}
          </h4>
          {matchErr && <div style={{ color: "red" }}>match error: {matchErr}</div>}
          <pre style={pre}>
            {selected
              ? JSON.stringify(match, null, 2)
              : "// click an (e) event on the left"}
          </pre>
        </div>
      </div>
    </div>
  );
}
