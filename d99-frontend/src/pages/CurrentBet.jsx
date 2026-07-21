import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/layout/Layout.jsx";
import { getCasinoBetHistory } from "../apiservices/CasionApi.js";
import { getSportsBets } from "../apiservices/SportsApi.js";

function fmtDate(d) {
  const dt = new Date(d);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
}

const SPORT_MAP = { 1: "Football", 2: "Tennis", 4: "Cricket" };
function sportName(row) {
  const sid = row.sport_id || row.sid;
  if (SPORT_MAP[sid]) return SPORT_MAP[sid];
  // Betfair event IDs — guess from match title or game_type
  if (row.market_type === "MATCH_ODDS" || row.market_type === "Bookmaker") {
    return row.match_title?.includes("vs") ? "Football" : "Cricket";
  }
  return "Cricket";
}

export default function CurrentBet() {
  const user = useSelector((s) => s.user.user);
  const userId = user?.user_id || user?.id;

  const [gtype, setGtype] = useState(""); // empty = nothing selected
  const [fetchedType, setFetchedType] = useState(""); // tracks which type current results are for
  const [fetchKey, setFetchKey] = useState(0); // increment to trigger fetch
  const [entries, setEntries] = useState(10);
  const [betFilter, setBetFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  // isSport based on fetched data, not the dropdown (avoids mismatch)
  const isSport = fetchedType === "1";

  // Clear results when dropdown changes so stale data doesn't show
  const handleGtypeChange = (val) => {
    setGtype(val);
    setResults([]);
    setFetchedType("");
    setTotalRecords(0);
    setTotalPages(1);
    setPage(1);
  };

  // Only runs when fetchKey changes (Submit clicked)
  useEffect(() => {
    if (fetchKey === 0 || !gtype) return;
    let cancelled = false;
    const currentType = gtype; // capture at submit time
    setSelectedRows({});
    setSelectAll(false);
    setLoading(true);

    (async () => {
      try {
        if (currentType === "1") {
          const res = await getSportsBets({ page, limit: entries, search, betType: betFilter });
          if (!cancelled && res?.success) {
            setResults(res.data || []);
            setTotalPages(res.pagination?.total_pages || 1);
            setTotalRecords(res.pagination?.total || 0);
            setFetchedType("1");
          } else if (!cancelled) {
            setResults([]);
            setFetchedType("1");
          }
        } else {
          if (!userId) { setLoading(false); return; }
          const res = await getCasinoBetHistory(userId);
          if (!cancelled && res?.success) {
            setResults(res.bets || []);
            setTotalRecords(res.bets?.length || 0);
            setTotalPages(1);
            setFetchedType("2");
          } else if (!cancelled) {
            setResults([]);
            setFetchedType("2");
          }
        }
      } catch {
        if (!cancelled) { setResults([]); setFetchedType(currentType); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!gtype) return;
    setPage(1);
    setFetchKey((k) => k + 1);
  };

  // Filtering for casino (sports filtering is server-side)
  const getFiltered = () => {
    let data = results;
    if (!isSport) {
      if (betFilter !== "all") {
        data = data.filter((r) => r.bet_type === betFilter || r.type === betFilter);
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        data = data.filter((r) =>
          Object.values(r).some((v) => String(v).toLowerCase().includes(q))
        );
      }
      return data.slice(0, entries);
    }
    return data;
  };

  const filtered = getFiltered();
  const totalAmount = filtered.reduce(
    (s, r) => s + parseFloat(r.stake_amount || r.stake || r.amount || 0),
    0
  );
  const displayTotal = isSport ? totalRecords : filtered.length;

  const handleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    const map = {};
    if (next) filtered.forEach((_, i) => { map[i] = true; });
    setSelectedRows(map);
  };

  const handleSelectRow = (idx) => {
    setSelectedRows((prev) => {
      const next = { ...prev };
      if (next[idx]) delete next[idx]; else next[idx] = true;
      return next;
    });
  };

  const goToPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <Layout variant="report-page">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Current Bets</h4>
        </div>
        <div className="card-body">
          <div className="report-form">
            {/* Filter form */}
            <form className="row row5" onSubmit={handleSubmit}>
              <div className="col-lg-2 col-md-3">
                <div className="mb-2 input-group position-relative">
                  <select
                    className="form-select"
                    name="gtype"
                    value={gtype}
                    onChange={(e) => handleGtypeChange(e.target.value)}
                  >
                    <option value="" disabled>Select Report Type</option>
                    <option value="1">Sports</option>
                    <option value="2">Casino</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 d-grid">
                <button type="submit" className="btn btn-primary btn-block">Submit</button>
              </div>
            </form>

            {/* Controls row */}
            <div className="row row5 mt-2 justify-content-between align-items-center">
              <div className="col-lg-2 col-5">
                <div className="mb-2 input-group position-relative">
                  <span className="me-2">Show</span>
                  <select
                    className="form-select"
                    value={entries}
                    onChange={(e) => { setEntries(Number(e.target.value)); setPage(1); }}
                  >
                    {[10, 20, 30, 40, 50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="ms-2">Entries</span>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-7 text-center">
                {["all", "back", "lay"].map((v) => (
                  <div className="form-check form-check-inline" key={v}>
                    <input
                      type="radio"
                      className="form-check-input"
                      id={`filter-${v}`}
                      name="filter"
                      value={v}
                      checked={betFilter === v}
                      onChange={() => { setBetFilter(v); setPage(1); }}
                    />
                    <label className="form-check-label" htmlFor={`filter-${v}`}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  </div>
                ))}
              </div>

              <div className="col-lg-3 col-md-6 text-left col-7">
                <div>
                  Total Bets: <span className="me-2">{displayTotal}</span>
                  Total Amount: <span className="me-2">{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="col-lg-2 col-5">
                <div className="mb-2 input-group position-relative">
                  <span className="me-2">Search:</span>
                  <input
                    type="search"
                    className="form-control"
                    placeholder={`${displayTotal} records...`}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-2 table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th className="report-sport">Sports</th>
                    <th>Event Name</th>
                    <th>Market Name</th>
                    <th>Nation</th>
                    <th className="report-amount text-end">User Rate</th>
                    <th className="report-amount text-end">Amount</th>
                    <th className="report-date">Place Date</th>
                    <th className="report-action">
                      <div className="text-end">
                        <div className="form-check form-check-inline">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            title="Toggle All Current Page Rows Selected"
                            style={{ cursor: "pointer" }}
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center p-3">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="8" className="text-center p-3">No records found</td></tr>
                  ) : (
                    filtered.map((row, idx) => {
                      const betType = row.bet_type || row.type || "";
                      const rowClass = betType === "back" || betType === "yes" ? "back" : betType === "lay" || betType === "no" ? "lay" : "";
                      return (
                        <tr key={row.id || idx} className={rowClass}>
                          {isSport ? (
                            <>
                              <td className="report-sport">{sportName(row)}</td>
                              <td>{row.match_title || "--"}</td>
                              <td>{row.market_type || row.game_type || "--"}</td>
                              <td><span>{row.selection_name || "--"}</span></td>
                              <td className="report-amount text-end">{row.odds || "--"}</td>
                              <td className="report-amount text-end">{row.stake_amount || "--"}</td>
                              <td className="report-date">{row.created_at ? fmtDate(row.created_at) : "--"}</td>
                            </>
                          ) : (
                            <>
                              <td className="report-sport">Casino</td>
                              <td>{row.game_name || "--"}</td>
                              <td>{row.mtype || row.game_name || "--"}</td>
                              <td><span>{row.selection || row.player_name || "--"}</span></td>
                              <td className="report-amount text-end">{row.odds || "--"}</td>
                              <td className="report-amount text-end">{row.stake || "--"}</td>
                              <td className="report-date">{row.created_at ? fmtDate(row.created_at) : "--"}</td>
                            </>
                          )}
                          <td className="report-action">
                            <div className="text-end">
                              <div className="form-check form-check-inline">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  title="Toggle Row Selected"
                                  style={{ cursor: "pointer" }}
                                  checked={!!selectedRows[idx]}
                                  onChange={() => handleSelectRow(idx)}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="custom-pagination mt-2">
              <div className={page === 1 ? "disabled" : ""} onClick={() => goToPage(1)}>First</div>
              <div className={page === 1 ? "disabled" : ""} onClick={() => goToPage(page - 1)}>Previous</div>
              <div className={page === totalPages ? "disabled" : ""} onClick={() => goToPage(page + 1)}>Next</div>
              <div className={page === totalPages ? "disabled" : ""} onClick={() => goToPage(totalPages)}>Last</div>
              <div>
                <span className="me-2">Page <b>{page} of {totalPages}</b></span>
                <span className="me-2">| Go to Page</span>
                <input
                  className="form-control"
                  type="number"
                  value={page}
                  min={1}
                  max={totalPages}
                  onChange={(e) => goToPage(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
