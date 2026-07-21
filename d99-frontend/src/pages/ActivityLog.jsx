import { useState, useEffect, useCallback, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../components/layout/Layout.jsx";
import { getUserActivityLogs } from "../apiservices/ActivityLogService.js";

function pad(n) { return String(n).padStart(2, "0"); }
function toYMD(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fmtDateTime(d) {
  const dt = new Date(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div className="mb-2 custom-datepicker" onClick={onClick} ref={ref}>
    <input type="text" className="form-control" readOnly value={value} />
    <i className="far fa-calendar"></i>
  </div>
));

const LOG_TYPES = [
  { value: "LOGIN", label: "Login" },
  { value: "PASSWORD_CHANGE", label: "Change Password" },
];

export default function ActivityLog() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [logType, setLogType] = useState("");
  const [entries, setEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [goToPage, setGoToPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async (pg) => {
    setLoading(true);
    try {
      const params = {
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        logType,
        page: pg,
        limit: entries,
      };
      const res = await getUserActivityLogs(params);
      if (res.success) {
        setLogs(res.data?.logs || res.data || []);
        setTotalRecords(res.data?.total || res.total || 0);
        setTotalPages(res.data?.totalPages || res.totalPages || 1);
      } else {
        setLogs([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
      setHasFetched(true);
    } catch {
      setLogs([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, logType, entries]);

  useEffect(() => {
    fetchData(page);
  }, [page, entries]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setGoToPage(1);
    fetchData(1);
  };

  const filtered = searchTerm.trim()
    ? logs.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : logs;

  return (
    <Layout variant="report-page">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Activity Log</h4>
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
              <div className="col-lg-2 col-md-3">
                <div className="mb-2 input-group position-relative">
                  <select
                    className="form-select"
                    name="type"
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                  >
                    <option value="">Select Log Type</option>
                    {LOG_TYPES.map((t) => (
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
                    <th colSpan="1" role="columnheader">Username</th>
                    <th colSpan="1" role="columnheader">Date</th>
                    <th colSpan="1" role="columnheader">Ip Address</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {loading && (
                    <tr role="row"><td colSpan="3" className="text-center"><i className="fa fa-spinner fa-spin"></i></td></tr>
                  )}
                  {!loading && hasFetched && filtered.length === 0 && (
                    <tr role="row"><td role="cell" colSpan="3" className="text-center text-muted">No records found</td></tr>
                  )}
                  {!loading && filtered.map((log, i) => (
                    <tr role="row" key={log.id || i}>
                      <td role="cell">{log.username}</td>
                      <td role="cell">{fmtDateTime(log.createdAt)}</td>
                      <td role="cell">{log.ip_address}<i className="fas fa-eye me-2 ms-2"></i></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasFetched && logs.length > 0 && (
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
