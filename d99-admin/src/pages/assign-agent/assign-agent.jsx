import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import './style.css'

/**
 * AssignAgent Component
 * 
 * Page for assigning agents to users.
 */
function AssignAgent() {
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [searchValue, setSearchValue] = useState('')
  
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

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const fromDateInputRef = useRef(null)

  // Initialize dates on component mount
  useEffect(() => {
    const dates = getInitialDates()
    setFromDate(dates.from)
    setToDate(dates.to)
  }, [])

  // Handle calendar icon click to open date picker
  const handleCalendarIconClick = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.showPicker?.() || inputRef.current.click()
    }
  }

  // Sample data - replace with actual API data
  const agents = []

  const handleDownloadCSV = (e) => {
    e.preventDefault()
    // Handle CSV download logic here
    console.log('Download CSV', { fromDate, toDate })
  }

  return (
    <Layout title="Assign Agent - Diamond Admin">
      <div className="">
        <div className="account-list-new">
        

          {/* Assign Agent List Header */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Assign Agent List
                </h4>
                
              </div>
            </div>
          </div>

          <div className="account-list-new">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
               
                  {/* Show Entries and Search */}
                  <div className="row mt-4">
                    <div className="col-sm-12 col-md-6 mb-3">
                      <div id="tickets-table_length" className="dataTables_length">
                        <label className="d-inline-flex align-items-center">
                          Show&nbsp;
                          <select 
                            className="custom-select custom-select-sm"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                          >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                            <option value="500">500</option>
                            <option value="750">750</option>
                            <option value="1000">1000</option>
                          </select>
                          &nbsp;entries
                        </label>
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-6">
                      <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                        <label className="d-inline-flex align-items-center">
                          Search:
                          <input 
                            name="searchagent" 
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
                  <div className="table-responsive mb-0">
                    <div className="table no-footer table-responsive-sm">
                      <table 
                        id="eventsListTbl" 
                        role="table" 
                        aria-busy="false"
                        aria-colcount="6"
                        className="table b-table table-bordered"
                      >
                        <thead role="rowgroup" className="">
                          <tr role="row" className="">
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="1"
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>S.No.</div>
                            
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="2"
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>User Name</div>
                            
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="3"
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>Assign Agent Settings</div>
               
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="4"
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>Mobile Number</div>
                              
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="5"
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>Depo Mobile Number</div>
                           
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="6"
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>First Bonus Status</div>
                            
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {agents.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="6" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            agents.map((agent, index) => (
                              <tr key={agent.id} role="row" className="">
                                <td aria-colindex="1" role="cell" className="">
                                  {index + 1}
                                </td>
                                <td aria-colindex="2" role="cell" className="">
                                  {agent.userName || '-'}
                                </td>
                                <td aria-colindex="3" role="cell" className="">
                                  {agent.assignAgentSettings || '-'}
                                </td>
                                <td aria-colindex="4" role="cell" className="">
                                  {agent.mobileNumber || '-'}
                                </td>
                                <td aria-colindex="5" role="cell" className="">
                                  {agent.depoMobileNumber || '-'}
                                </td>
                                <td aria-colindex="6" role="cell" className="">
                                  {agent.firstBonusStatus || '-'}
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

            {/* User Creation Header */}
            <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  User Creation
                </h4>
                <div className="page-title-right">
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter Form */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <form method="post" data-vv-scope="creation" className="ajaxFormSubmit" onSubmit={handleDownloadCSV}>
                    <div className="row row5">
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
                        <div className="mx-datepicker disabled">
                          <div className="mx-input-wrapper">
                            <input 
                              name="toDate" 
                              type="date" 
                              autoComplete="off" 
                              readOnly
                              disabled
                              placeholder="" 
                              className="mx-input form-control"
                              value={toDate}
                            />
                            <i className="mx-icon-calendar">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
                                <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z"></path>
                              </svg>
                            </i>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 mt-4">
                        <button type="submit" id="loaddata" className="btn btn-primary">
                          Download CSV
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AssignAgent

