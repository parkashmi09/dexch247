import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Assuming api service exists
import './ActivityLog.css'; // We'll create this or reuse styles

const ActivityLog = ({ userId, userType }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logType, setLogType] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    setStartDate(weekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        startDate,
        endDate,
        logType: logType === 'All' ? '' : logType,
        userId,
        userType,
        page,
        limit,
      };

      const response = await api.get('/admin/activity-logs', { params });
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.totalPages);
        setTotalRecords(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchLogs();
    }
  }, [page, limit]); // Fetch on page/limit change. Filter change requires manual submit as per UI pattern usually, but we can auto-fetch too.
  // The reference UI has a "Submit" button, so we should probably wait for that for filters.

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on filter submit
    fetchLogs();
  };

  return (
    <div className="activity-log-container">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">Activity Log</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row align-items-end mb-3">
            <div className="col-md-3">
              <label>From Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label>To Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label>Log Type</label>
              <select
                className="form-control"
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
              >
                <option value="">Select Log Type</option>
                <option value="LOGIN">Login</option>
                <option value="UPDATE_ACCOUNT">Change Password/Status</option>
              </select>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </div>
          </div>
        </form>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            Show
            <select
              className="custom-select custom-select-sm mx-2"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            Entries
          </div>
          <div>
            Search: <input type="text" className="form-control form-control-sm d-inline-block w-auto" placeholder="0 records..." disabled />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Date</th>
                <th>IP Address</th>
                <th>Browser Detail</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No data available in table</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.username}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.ip_address}</td>
                    <td>{log.browser_detail}</td>
                    <td>{log.action}</td>
                    <td>{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
