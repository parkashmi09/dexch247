import { useState, useEffect, useCallback, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/layout/Layout.jsx";
import { getUserAccountStatement } from "../apiservices/UserStatementService.js";
import CasinoResultModal from "../components/casino/common/tableLayout/CasinoResultModal.jsx";
import SportsResultModal from "../components/casino/common/tableLayout/SportsResultModal.jsx";
import { parseCasinoRemark } from "../components/casino/common/casinoRemark.js";

function pad(n) { return String(n).padStart(2, "0"); }
function toYMD(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
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

const REPORT_TYPES = [
  { value: "TRANSACTION", label: "Deposite/Withdraw Reports" },
  { value: "SPORTS", label: "Sport Report" },
  { value: "CASINO", label: "Casino Reports" },
  { value: "THIRD-PARTY-CASINO", label: "Third-Party Casino Reports" },
];

export default function AccountStatement() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [reportType, setReportType] = useState("");
  const [entries, setEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [goToPage, setGoToPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [casinoModal, setCasinoModal] = useState({ show: false, gameType: "", mid: "", title: "" });
  const [sportsModal, setSportsModal] = useState({ show: false });

  const openCasinoResult = (parsed) => {
    setCasinoModal({
      show: true,
      gameType: parsed.gameType,
      mid: parsed.mid,
      title: `${parsed.label} Result`,
    });
  };
  const closeCasinoResult = () => setCasinoModal({ show: false, gameType: "", mid: "", title: "" });

  const openSportsResult = () => setSportsModal({ show: true });
  const closeSportsResult = () => setSportsModal({ show: false });

  const fetchData = useCallback(async (pg) => {
    setLoading(true);
    try {
      const filters = {
        fromDate: toYMD(startDate),
        toDate: toYMD(endDate),
        page: pg,
        limit: entries,
        reportType,
      };
      const result = await getUserAccountStatement(filters);
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setTotalRecords(result.total || result.data.length);
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
  }, [startDate, endDate, entries, reportType]);

  useEffect(() => {
    if (hasFetched) fetchData(page);
  }, [page, entries]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <h4 className="card-title">Account Statement</h4>
        </div>
        <div className="card-body">
          <div className="report-form">
            <form className="row row5" onSubmit={handleSubmit}>
              <div className="col-lg-2 col-md-3 col-6">
                <DatePicker
                  selected={startDate}
                  onChange={(d) => { if (d) setStartDate(d); }}
                  dateFormat="dd/MM/yyyy"
                  maxDate={endDate}
                  customInput={<CustomDateInput />}
                  popperPlacement="bottom-start"
                />
              </div>
              <div className="col-lg-2 col-md-3 col-6">
                <DatePicker
                  selected={endDate}
                  onChange={(d) => { if (d) setEndDate(d); }}
                  dateFormat="dd/MM/yyyy"
                  minDate={startDate}
                  maxDate={today}
                  customInput={<CustomDateInput />}
                  popperPlacement="bottom-start"
                />
              </div>
              <div className="col-lg-3 col-md-4">
                <div className="mb-2 input-group position-relative">
                  <select
                    className="form-select"
                    name="type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="">Select Report Type</option>
                    {REPORT_TYPES.map((t) => (
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
                    <th colSpan="1" role="columnheader" className="report-date">Date</th>
                    <th colSpan="1" role="columnheader" className="report-sr text-end">Sr no</th>
                    <th colSpan="1" role="columnheader" className="report-amount text-end">Credit</th>
                    <th colSpan="1" role="columnheader" className="report-amount text-end">Debit</th>
                    <th colSpan="1" role="columnheader" className="report-amount text-end">Pts</th>
                    <th colSpan="1" role="columnheader">Remark</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {loading && (
                    <tr role="row"><td colSpan="6" className="text-center"><i className="fa fa-spinner fa-spin"></i></td></tr>
                  )}
                  {!loading && hasFetched && filtered.length === 0 && (
                    <tr role="row"><td role="cell" colSpan="6" className="text-center text-muted">No records found</td></tr>
                  )}
                  {!loading && filtered.map((item, i) => {
                    const credit = item.credit && item.credit !== "-" && Number(item.credit) !== 0 ? item.credit : null;
                    const debit = item.debit && item.debit !== "-" && Number(item.debit) !== 0 ? item.debit : null;
                    const closing = Number(item.closing);
                    const ptsClass = closing >= 0 ? "text-success" : "text-danger";
                    const parsedCasino = reportType === "CASINO"
                      ? parseCasinoRemark(item.description || item.fromto)
                      : null;
                    const isSports = reportType === "SPORTS";
                    const clickable = parsedCasino || isSports;
                    return (
                      <tr
                        role="row"
                        key={i}
                        style={clickable ? { cursor: "pointer" } : undefined}
                        onClick={
                          parsedCasino
                            ? () => openCasinoResult(parsedCasino)
                            : isSports
                            ? () => openSportsResult()
                            : undefined
                        }
                      >
                        <td role="cell" className="report-date">{fmtDateTime(item.date)}</td>
                        <td role="cell" className="report-sr text-end">{(page - 1) * entries + i + 1}</td>
                        <td role="cell" className="report-amount text-end">
                          <span role="cell" className={credit ? "text-success" : ""}>{credit ? fmtNum(credit) : ""}</span>
                        </td>
                        <td role="cell" className="report-amount text-end">
                          <span role="cell" className={debit ? "text-danger" : ""}>{debit ? `-${fmtNum(debit)}` : ""}</span>
                        </td>
                        <td role="cell" className="report-amount text-end">
                          <span role="cell" className={ptsClass}>{closing < 0 ? `-${fmtNum(Math.abs(closing))}` : fmtNum(item.closing)}</span>
                        </td>
                        <td role="cell">{item.description || item.fromto || ""}</td>
                      </tr>
                    );
                  })}
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

      <CasinoResultModal
        show={casinoModal.show}
        onHide={closeCasinoResult}
        gameId={casinoModal.gameType}
        gameType={casinoModal.gameType}
        mid={casinoModal.mid}
        title={casinoModal.title}
        betsAddon
      />

      <SportsResultModal
        show={sportsModal.show}
        onHide={closeSportsResult}
        title="Result"
      />
    </Layout>
  );
}
