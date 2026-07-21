import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import './style.css'

/**
 * GameReport Component
 * 
 * Page for viewing game reports with filters and export options.
 */
function GameReport() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [type, setType] = useState('All')
  const [additionalFilter, setAdditionalFilter] = useState('All')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const fromDateInputRef = useRef(null)
  const toDateInputRef = useRef(null)

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Initialize dates: fromDate = 23/11/2025, toDate = 30/11/2025
  useEffect(() => {
    const from = new Date(2025, 10, 23) // November 23, 2025 (month is 0-indexed)
    const to = new Date(2025, 10, 30) // November 30, 2025
    setFromDate(formatDate(from))
    setToDate(formatDate(to))
  }, [])

  // Handle calendar icon click to open date picker
  const handleCalendarIconClick = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.showPicker?.() || inputRef.current.click()
    }
  }

  // Handle Game List button click
  const handleGameList = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTableData([])
    } catch (error) {
      console.error('Error loading game list:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Show Game Report button click
  const handleShowGameReport = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTableData([])
    } catch (error) {
      console.error('Error loading game report:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Master Game Report button click
  const handleMasterGameReport = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTableData([])
    } catch (error) {
      console.error('Error loading master game report:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Game Report - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Game Report
                </h4>
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  <form method="post" className="ajaxFormSubmit" onSubmit={(e) => { e.preventDefault(); }}>
                    <div className="row row5">
                      <div className="col-md-2">
                        <label>From</label>
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
                        <label>To</label>
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
                      <div className=" col-md-2 d-flex align-items-end gap-4">
                        <div className="">
                          <label>Type</label>
                          <select
                            style={{ minWidth: '230px' }}
                            className="form-control"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                          >
                            <option value="All">All</option>
                            <option value="Cricket">Cricket</option>
                            <option value="Casino">Casino</option>
                            <option value="Sports">Sports</option>
                          </select>
                        </div>
                        <button
                          style={{ minWidth: '100px' }}
                          type="button"
                          className="btn btn-primary"
                          onClick={handleGameList}
                        >
                          Game List
                        </button>
                      </div>
                    </div>
                    <div className="d-flex align-items-end gap-4 mt-3">
                      <div className="">
                        <select
                          style={{ minWidth: '750px' }}
                          className="form-control"
                          value={additionalFilter}
                          onChange={(e) => setAdditionalFilter(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="Option1">Option 1</option>
                          <option value="Option2">Option 2</option>
                        </select>
                      </div>
                      <div className="col-md-6 d-flex align-items-end gap-2">

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleShowGameReport}
                        >
                          Show Game Report
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleMasterGameReport}
                        >
                          Master Game Report
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
                  {/* Table */}
                  <div className="table-responsive mb-0 mt-4">
                    <div className="table no-footer table-responsive-sm">
                      <table
                        id="gameReportTbl"
                        role="table"
                        aria-busy={loading}
                        aria-colcount="3"
                        className="table b-table table-striped table-bordered"
                      >
                        <thead role="rowgroup" className="">
                          <tr role="row" className="">
                            <th
                              role="columnheader"
                              scope="col"
                              tabIndex="0"
                              aria-colindex="1"
                              className="position-relative"
                            >
                              <div>Sr.No</div>
                            </th>
                            <th
                              role="columnheader"
                              scope="col"
                              tabIndex="0"
                              aria-colindex="2"
                              className="position-relative"
                            >
                              <div>Name</div>
                            </th>
                            <th
                              role="columnheader"
                              scope="col"
                              tabIndex="0"
                              aria-colindex="3"
                              className="position-relative text-right"
                            >
                              <div>Amount</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="3" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">Loading...</div>
                                </div>
                              </td>
                            </tr>
                          ) : tableData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="3" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <p className="text-center mb-0">No data available in table</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            tableData.map((row, index) => (
                              <tr key={row.id || index} role="row" className="">
                                <td aria-colindex="1" role="cell" className="">
                                  {row.srNo || index + 1}
                                </td>
                                <td aria-colindex="2" role="cell" className="">
                                  {row.name || '-'}
                                </td>
                                <td aria-colindex="3" role="cell" className="text-right">
                                  {row.amount || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
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

export default GameReport

