import { useState, useEffect, useCallback, forwardRef } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../../components/layout/Layout.jsx";
import { getLastResults, getDetailResults } from "../../apiservices/CasionApi.js";
import { CasinoResultModal } from "../../components/casino/common/tableLayout/index.jsx";
import { CASINO_TYPES, mapWinValue } from "../../components/casino/tables/tableCasinoUtils.js";

// Worli/Matka last-results carry only `win:"0"` (no real result) — the winning
// pana/ank lives in detail-results (rdesc = "pana#single"). Fetch detail per row
// for these games so the Winner column shows the actual result, not "0".
const WORLI_FAMILY = new Set(["worli", "worli2", "worli3"]);
function worliResultLabel(detail) {
  const t1 = detail?.data?.data?.t1 || detail?.data?.t1 || null;
  if (!t1) return null;
  const rdesc = String(t1.rdesc || "").trim();          // "238#3"
  if (rdesc.includes("#")) {
    const [pana, single] = rdesc.split("#");
    return single !== undefined && single !== "" ? `${pana.trim()}-${single.trim()}` : pana.trim();
  }
  return t1.winnat ? String(t1.winnat) : null;
}

function pad(n) { return String(n).padStart(2, "0"); }
function formatDate(d) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; }

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div className="mb-2 custom-datepicker" onClick={onClick} ref={ref}>
    <input type="text" className="form-control" readOnly value={value} />
    <i className="far fa-calendar"></i>
  </div>
));

export default function CasinoResultsPage() {
  const { type: urlType } = useParams();
  const [selectedType, setSelectedType] = useState(urlType || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState({ show: false, mid: "", gameType: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [goToPage, setGoToPage] = useState(1);
  const [winById, setWinById] = useState({}); // mid -> real result label (worli family)

  const today = new Date();

  const fetchData = useCallback(async (type) => {
    if (!type) return;
    setLoading(true);
    try {
      const data = await getLastResults(type);
      const resArray = data?.data?.data?.res || data?.data?.res || data?.data || [];
      setResults(Array.isArray(resArray) ? resArray : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedType) fetchData(selectedType);
  }, [selectedType, fetchData]);

  // clear resolved-winner cache when the game type changes
  useEffect(() => { setWinById({}); }, [selectedType]);

  const gameName = CASINO_TYPES.find((t) => t.value === selectedType)?.label || selectedType;

  const filteredResults = searchTerm.trim()
    ? results.filter((r) => String(r.mid || "").includes(searchTerm) || String(r.win || "").toLowerCase().includes(searchTerm.toLowerCase()))
    : results;
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / entries));
  const startIdx = (page - 1) * entries;
  const pagedResults = filteredResults.slice(startIdx, startIdx + entries);

  // For Worli/Matka: resolve the real winner (pana-single) per displayed row from
  // detail-results, since last-results only carries win:"0". Keyed by the visible
  // mids so it refetches on page change but not on every render.
  const pagedMidsKey = pagedResults.map((r) => r.mid).join(",");
  useEffect(() => {
    if (!WORLI_FAMILY.has(selectedType)) return;
    const missing = pagedResults
      .map((r) => String(r.mid || ""))
      .filter((mid) => mid && winById[mid] === undefined);
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      const pairs = await Promise.all(
        missing.map(async (mid) => {
          try {
            return [mid, worliResultLabel(await getDetailResults(selectedType, mid))];
          } catch {
            return [mid, null];
          }
        })
      );
      if (cancelled) return;
      setWinById((prev) => {
        const next = { ...prev };
        for (const [mid, label] of pairs) next[mid] = label;
        return next;
      });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagedMidsKey, selectedType]);

  return (
    <Layout variant="report-page">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Casino Results</h4>
        </div>
        <div className="card-body">
          <div className="report-form">
            <form className="row row5">
              <div className="col-lg-2 col-md-3 col-5">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => { setSelectedDate(date); setPage(1); }}
                  dateFormat="dd/MM/yyyy"
                  maxDate={today}
                  customInput={<CustomDateInput />}
                  popperPlacement="bottom-start"
                />
              </div>
              <div className="col-lg-2 col-md-3 col-7">
                <div className="mb-2 input-group position-relative">
                  <select
                    className="form-select"
                    name="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="" disabled>Select Casino Type</option>
                    {CASINO_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 d-grid">
                <button type="button" className="btn btn-primary btn-block" onClick={() => fetchData(selectedType)}>Submit</button>
              </div>
            </form>
            <div className="row row10 mt-2 justify-content-between">
              <div className="col-lg-2 col-6">
                <div className="mb-2 input-group position-relative">
                  <span className="me-2">Show</span>
                  <select className="form-select" value={entries} onChange={(e) => { setEntries(Number(e.target.value)); setPage(1); }}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                  </select>
                  <span className="ms-2">Entries</span>
                </div>
              </div>
              <div className="col-lg-2 col-6">
                <div className="mb-2 input-group position-relative">
                  <span className="me-2">Search:</span>
                  <input type="search" className="form-control" placeholder={`${results.length} records...`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="round-id">Round ID</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="2" className="text-center"><i className="fa fa-spinner fa-spin"></i></td></tr>
                )}
                {!loading && pagedResults.length === 0 && (
                  <tr><td colSpan="2" className="text-center">No results found</td></tr>
                )}
                {!loading && pagedResults.map((r, i) => (
                  <tr
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => setResultModal({ show: true, mid: String(r.mid || ""), gameType: selectedType })}
                  >
                    <td className="round-id">{r.mid || "-"}</td>
                    <td>{r.winnat || winById[String(r.mid)] || mapWinValue(r.win, selectedType)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredResults.length > 0 && (
            <div className="custom-pagination mt-2">
              <div
                className={page === 1 ? "disabled" : ""}
                onClick={() => page > 1 && setPage(1)}
              >First</div>
              <div
                className={page === 1 ? "disabled" : ""}
                onClick={() => page > 1 && setPage((p) => p - 1)}
              >Previous</div>
              <div
                className={page === totalPages ? "disabled" : ""}
                onClick={() => page < totalPages && setPage((p) => p + 1)}
              >Next</div>
              <div
                className={page === totalPages ? "disabled" : ""}
                onClick={() => page < totalPages && setPage(totalPages)}
              >Last</div>
              <div>
                <span className="me-2">Page <b>{page} of {totalPages}</b></span>
                <span className="me-2">| Go to Page</span>
                <input
                  className="form-control"
                  type="number"
                  value={goToPage}
                  min={1}
                  max={totalPages}
                  onChange={(e) => setGoToPage(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const p = Math.max(1, Math.min(totalPages, goToPage));
                      setPage(p);
                      setGoToPage(p);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "", gameType: "" })}
        gameId={resultModal.gameType}
        gameType={resultModal.gameType}
        mid={resultModal.mid}
        title={`${gameName} Result`}
      />
    </Layout>
  );
}
