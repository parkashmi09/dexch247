import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import { getAccountStatement } from '../../services/ReportService'
import { searchByUsername } from '../../services/api'
import './style.css'

/**
 * AccountStatement Component
 * 
 * Page for viewing account statements with filters and export options.
 */
function AccountStatement() {
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [searchValue, setSearchValue] = useState('')
  const [gameName, setGameName] = useState('All')
  const [clientName, setClientName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totals, setTotals] = useState(null)

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const fromDateInputRef = useRef(null)
  const toDateInputRef = useRef(null)

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Initialize dates: fromDate = 7 days ago, toDate = today
  const getInitialDates = () => {
    const today = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(today.getDate() - 7)
    return {
      from: formatDate(weekAgo),
      to: formatDate(today)
    }
  }

  // Initialize dates on component mount
  useEffect(() => {
    const dates = getInitialDates()
    setFromDate(dates.from)
    setToDate(dates.to)
  }, [])

  // Fetch data when dependencies change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchData(currentPage)
    }
  }, [entriesPerPage, currentPage])

  // Handle calendar icon click to open date picker
  const handleCalendarIconClick = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.showPicker?.() || inputRef.current.click()
    }
  }

  // Fetch Data
  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      // Map frontend gameName to backend expectations
      let backendGameName = 'ALL';
      if (gameName === 'Deposit/Withdraw') backendGameName = 'TRANSACTION';
      else if (gameName === 'Sports') backendGameName = 'SPORTS';
      else if (gameName === 'Casino') backendGameName = 'CASINO';
      else if (gameName === 'Third-Party') backendGameName = 'THIRD-PARTY';

      const response = await getAccountStatement({
        reportType: backendGameName,
        clientName,
        fromDate,
        toDate,
        page: page,
        limit: entriesPerPage
      });

      if (response.success) {
        setTableData(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.total || 0);
        setTotals(response.totals || null);
        // Ensure currentPage is synced if backend returns a different page
        if (response.currentPage && response.currentPage !== page) {
            setCurrentPage(response.currentPage);
        }
      } else {
        setTableData([]);
        setTotalPages(1);
        setTotalRecords(0);
        setTotals(null);
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Load button click (Reset to page 1)
  const handleLoad = () => {
    setCurrentPage(1);
    if (currentPage === 1) {
        fetchData(1);
    }
  }

  // Handle Pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  // Handle PDF export (using window.print)
  const handleExportPDF = () => {
    window.print();
  }

  // Handle Excel export (using CSV)
  const handleExportExcel = () => {
    const headers = ["Date", "Credit", "Debit", "Closing", "Description", "From/To"];
    const rows = tableData.map(row => [
      new Date(row.date).toLocaleString().replace(/,/g, ''), // Remove commas to avoid CSV issues
      row.credit !== 0 ? row.credit : '',
      row.debit !== 0 ? row.debit : '',
      row.closing || '-',
      (row.description || '-').replace(/,/g, ' '), // Replace commas in description
      row.fromto || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `account_statement_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Layout title="Account Statement - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Account Statement
                </h4>
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  <form method="post" className="ajaxFormSubmit" onSubmit={(e) => { e.preventDefault(); handleLoad(); }}>
                    <div className="row row5">
                      <div className="col-md-2">
                        <label>Account Type:</label>
                        <select
                          className="form-control"
                          value={gameName}
                          onChange={(e) => setGameName(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="Deposit/Withdraw">Deposit/Withdraw Report</option>
                          <option value="Sports">Sports Report</option>
                          <option value="Casino">Casino Report</option>
                          <option value="Third-Party">Third Party Casino Report</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label>Search By Client Name:</label>
                        <div className="position-relative">
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="Type to search..."
                            value={clientName}
                            onChange={(e) => {
                              setClientName(e.target.value);
                              if (e.target.value.length > 1) {
                                searchByUsername(e.target.value).then(res => {
                                  if (res.success) {
                                    setSuggestions(res.data.results);
                                    setShowSuggestions(true);
                                  }
                                });
                              } else {
                                setSuggestions([]);
                                setShowSuggestions(false);
                              }
                            }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onFocus={() => clientName.length > 1 && setShowSuggestions(true)}
                          />
                          {showSuggestions && suggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                              {suggestions.map((user) => (
                                <li 
                                  key={user.wallet_id} 
                                  className="list-group-item list-group-item-action cursor-pointer"
                                  onMouseDown={(e) => {
                                    // Use onMouseDown to prevent onBlur from firing before click
                                    e.preventDefault();
                                    setClientName(user.username);
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {user.username} {user.user_type ? `(${user.user_type})` : ''}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="col-md-2">
                        <label>From Date:</label>
                        <div className="mx-datepicker">
                          <div className="mx-input-wrapper">
                            <input 
                              ref={fromDateInputRef}
                              name="fromDate" 
                              type="date" 
                              autoComplete="off" 
                              placeholder="" 
                              className="mx-input form-control"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                            />
                            <i 
                              className="mx-icon-calendar"
                              onClick={() => handleCalendarIconClick(fromDateInputRef)}
                              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
                                <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z"></path>
                              </svg>
                            </i>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <label>To Date:</label>
                        <div className="mx-datepicker">
                          <div className="mx-input-wrapper">
                            <input 
                              ref={toDateInputRef}
                              name="toDate" 
                              type="date" 
                              autoComplete="off" 
                              placeholder="" 
                              className="mx-input form-control"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                            />
                            <i 
                              className="mx-icon-calendar"
                              onClick={() => handleCalendarIconClick(toDateInputRef)}
                              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
                                <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z"></path>
                              </svg>
                            </i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row row5 mt-2">
                      <div className="col-md-12">
                        <button type="submit" className="btn btn-primary mr-2">
                          Load
                        </button>
                      
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  {/* Show Entries and Search */}
                  <div className="row mt-4">
                    <div className="col-sm-12 col-md-6">
                      <div className="d-flex align-items-center gap-2">
                      <button 
                          type="button" 
                          className="btn buttons-pdf btn-danger mr-2"
                          onClick={handleExportPDF}
                          disabled={tableData.length === 0}
                        >
                          <i className="far fa-file-pdf mr-1"></i>
                          PDF
                        </button>
                        <button 
                          type="button" 
                          className="btn buttons-excel btn-success"
                          onClick={handleExportExcel}
                          disabled={tableData.length === 0}
                        >
                          <i className="far fa-file-excel mr-1"></i>
                          Excel
                        </button>
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-6">
                      <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                        <label className="d-inline-flex align-items-center">
                          Search:
                          <input 
                            name="search" 
                            type="search" 
                            placeholder="Search..." 
                            className="form-control form-control-sm ml-2 form-control py-1"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-responsive mb-0 mt-4">
                    <div className="table no-footer table-responsive-sm">
                      <table 
                        id="accountStatementTbl" 
                        role="table" 
                        aria-busy={loading}
                        aria-colcount="6"
                        className="table b-table table-striped table-bordered"
                      >
                        <thead role="rowgroup" className="">
                          <tr role="row" className="">
                            <th role="columnheader" scope="col" className="position-relative"><div>Date</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>Credit</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>Debit</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>Closing</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>Description</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>From/To</div></th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="6" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">Loading...</div>
                                </div>
                              </td>
                            </tr>
                          ) : tableData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="6" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">No data available in table</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            tableData
                              .filter(row => 
                                !searchValue || 
                                Object.values(row).some(val => 
                                  String(val).toLowerCase().includes(searchValue.toLowerCase())
                                )
                              )
                              .map((row, index) => (
                              <tr key={row.id || index} role="row" className="">
                                <td aria-colindex="1" role="cell" className="">
                                  {new Date(row.date).toLocaleString() || '-'}
                                </td>
                                <td aria-colindex="2" role="cell" className="" style={{color: 'green'}}>
                                  {row.credit !== 0 ? row.credit : ''}
                                </td>
                                <td aria-colindex="3" role="cell" className="" style={{color: 'red'}}>
                                  {row.debit !== 0 ? row.debit : ''}
                                </td>
                                <td aria-colindex="4" role="cell" className="">
                                  {row.closing || '-'}
                                </td>
                                <td aria-colindex="5" role="cell" className="">
                                  {row.description ? (
                                    <span className="wrape-text">{row.description}</span>
                                  ) : '-'}
                                </td>
                                <td aria-colindex="6" role="cell" className="">
                                  {row.fromto || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {!loading && totals && tableData.length > 0 && (
                          <tfoot>
                            <tr role="row" style={{ fontWeight: 700, borderTop: '2px solid #333' }}>
                              <td role="cell" style={{ textAlign: 'right' }}>Opening: {Number(totals.opening).toFixed(2)}</td>
                              <td role="cell" style={{ color: 'green' }}>{Number(totals.totalCredit).toFixed(2)}</td>
                              <td role="cell" style={{ color: 'red' }}>{Number(totals.totalDebit).toFixed(2)}</td>
                              <td role="cell">{Number(totals.closing).toFixed(2)}</td>
                              <td role="cell" colSpan="2" style={{ textAlign: 'right' }}>
                                Net P/L:&nbsp;
                                <span style={{ color: Number(totals.netPL) >= 0 ? 'green' : 'red' }}>
                                  {Number(totals.netPL).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="row pt-3">
                    <div className="col">
                      <div className="dataTables_paginate paging_simple_numbers float-right">
                        <ul className="pagination pagination-rounded mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(1)}>«</button>
                          </li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>‹</button>
                          </li>
                          
                          <li className="page-item active">
                            <span className="page-link">{currentPage} / {totalPages}</span>
                          </li>

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>›</button>
                          </li>
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(totalPages)}>»</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AccountStatement
