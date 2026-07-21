import { useState, useCallback, forwardRef } from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/layout/Layout.jsx";
import { getLivecasinoHistory } from "../apiservices/livecasinoApi.js";

function pad(n) { return String(n).padStart(2, "0"); }
function fmtDateTime(d) {
  const dt = new Date(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}
function fmtNum(v) {
  const n = Number(v);
  if (isNaN(n)) return v;
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div className="mb-2 custom-datepicker" onClick={onClick} ref={ref}>
    <input type="text" className="form-control" readOnly value={value} />
    <i className="far fa-calendar"></i>
  </div>
));

const CASINO_TYPES = [
  { value: "ezugi", label: "Ezugi" },
  { value: "ss", label: "Super Spade" },
  { value: "qt", label: "Slot 3 | Holi" },
  { value: "evo", label: "Evolution" },
  { value: "cockfight", label: "CockFight" },
  { value: "ludo", label: "Ludo Classic" },
  { value: "pop-the-ball", label: "PopTheBall" },
  { value: "binary", label: "Binary" },
  { value: "tgs", label: "Slot 2" },
  { value: "slot", label: "Slot" },
  { value: "tgslive", label: "LuckyStreak" },
  { value: "rummy", label: "Rummy" },
  { value: "ludo-lands", label: "Ludo Lands" },
  { value: "vivo", label: "vivo gaming" },
  { value: "snakes-and-ladders", label: "snakes and ladders" },
  { value: "bc", label: "Creedroomz" },
  { value: "smart", label: "Smart Soft" },
  { value: "astar", label: "Astar Game" },
  { value: "ds", label: "Dragoon soft" },
  { value: "tembo", label: "Tembo" },
  { value: "av", label: "Spribe" },
  { value: "bcslot", label: "Pascal Game | Popok" },
  { value: "lottery", label: "Lottery" },
  { value: "scratch", label: "Scratch" },
  { value: "darwin", label: "Darwin" },
  { value: "pg", label: "Pocket Game" },
  { value: "bet", label: "Bet Core" },
  { value: "jilli", label: "Jili" },
  { value: "win", label: "Red Carat" },
  { value: "gemini1", label: "Gemini" },
  { value: "amigo", label: "Amigo" },
  { value: "egt", label: "EGT" },
  { value: "studio21", label: "Studio 21" },
  { value: "beon", label: "Beon Game" },
  { value: "king", label: "King Midas" },
  { value: "avnew", label: "Aviator" },
];

export default function LiveCasinoBets() {
  const today = new Date();
  const user = useSelector((s) => s.user.user);

  const [reportType, setReportType] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [casinoType, setCasinoType] = useState("");
  const [entries, setEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [goToPage, setGoToPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async (pg) => {
    setLoading(true);
    try {
      const params = {
        userid: user?.user_id,
        status: reportType || undefined,
        vendor: casinoType || undefined,
        page: pg,
        limit: entries,
      };
      const res = await getLivecasinoHistory(params);
      if (res?.success) {
        const rows = Array.isArray(res.data) ? res.data : res.data?.rows || [];
        setData(rows);
        setTotalRecords(res.data?.total || res.total || rows.length);
      } else {
        setData([]);
        setTotalRecords(0);
      }
      setHasFetched(true);
    } catch {
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, reportType, casinoType, entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setGoToPage(1);
    fetchData(1);
  };

  const filtered = searchTerm.trim()
    ? data.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(totalRecords / entries));

  return (
    <Layout variant="report-page">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Live Casino Bets</h4>
        </div>
        <div className="card-body">
          <div className="report-form">
            <form className="row row5" onSubmit={handleSubmit}>
              <div className="col-lg-2 col-md-3 col-6">
                <div className="mb-2 input-group position-relative">
                  <select
                    className="form-select"
                    name="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="" disabled>Select Report Type</option>
                    <option value="sattled">Settled</option>
                    <option value="un-sattled">Un-Settled</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-2 col-md-3 col-6">
                <DatePicker
                  selected={selectedDate}
                  onChange={(d) => { if (d) setSelectedDate(d); }}
                  dateFormat="dd/MM/yyyy"
                  maxDate={today}
                  customInput={<CustomDateInput />}
                  popperPlacement="bottom-start"
                />
              </div>
              <div className="col-lg-2 col-md-3 col-12">
                <div className="mb-2 input-group position-relative">
                  <select
                    className="form-select"
                    name="type"
                    value={casinoType}
                    onChange={(e) => setCasinoType(e.target.value)}
                  >
                    <option value="" disabled>Select Casino Type</option>
                    {CASINO_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 d-grid">
                <button type="submit" className="btn btn-primary btn-block">Submit</button>
              </div>
            </form>

            <div className="row row10 mt-2 justify-content-between">
              <div className="col-lg-2 col-6">
                <div className="mb-2 input-group position-relative">
                  <span className="me-2">Show</span>
                  <select
                    className="form-select"
                    value={entries}
                    onChange={(e) => { setEntries(Number(e.target.value)); setPage(1); }}
                  >
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
                  <input
                    type="search"
                    className="form-control"
                    placeholder={`${totalRecords} records...`}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 table-responsive">
              <table role="table" className="table table-bordered table-striped">
                <thead>
                  <tr role="row">
                    <th colSpan="1" role="columnheader" className="game-name">Game Name</th>
                    <th colSpan="1" role="columnheader" className="report-type">Type</th>
                    <th colSpan="1" role="columnheader" className="report-amount text-end">Amount</th>
                    <th colSpan="1" role="columnheader" className="report-amount text-end">Total</th>
                    <th colSpan="1" role="columnheader" className="report-date">Date</th>
                    <th colSpan="1" role="columnheader">Round Id</th>
                    <th colSpan="1" role="columnheader">Transaction Id</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {loading && (
                    <tr role="row"><td colSpan="7" className="text-center"><i className="fa fa-spinner fa-spin"></i></td></tr>
                  )}
                  {!loading && hasFetched && filtered.length === 0 && (
                    <tr role="row"><td role="cell" colSpan="7" className="text-center text-muted">No records found</td></tr>
                  )}
                  {!loading && filtered.map((item, i) => (
                    <tr role="row" key={item.id || i}>
                      <td role="cell" className="game-name">{item.game_name || item.gameName || "-"}</td>
                      <td role="cell" className="report-type">{item.type || item.status || "-"}</td>
                      <td role="cell" className="report-amount text-end">{fmtNum(item.amount || 0)}</td>
                      <td role="cell" className="report-amount text-end">{fmtNum(item.total || item.balance || 0)}</td>
                      <td role="cell" className="report-date">{item.createdAt ? fmtDateTime(item.createdAt) : item.date || "-"}</td>
                      <td role="cell">{item.round_id || item.roundId || "-"}</td>
                      <td role="cell">{item.transaction_id || item.transactionId || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasFetched && data.length > 0 && (
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
    </Layout>
  );
}
