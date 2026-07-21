import { useState, useEffect, useCallback } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { API_ENDPOINTS } from '../../config/api'
import './style.css'

/**
 * CurrentBets Component
 * 
 * Page for viewing current bets with Sports and Casino tabs.
 */
function CurrentBets() {
  const [activeTab, setActiveTab] = useState('sports') // 'sports' or 'casino'
  const [betType, setBetType] = useState('all') // 'all', 'back', 'lay'
  const [matchStatus, setMatchStatus] = useState('matched') // 'matched', 'deleted' - only for Sports tab
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [searchValue, setSearchValue] = useState('')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalSoda, setTotalSoda] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0.00)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Handle Load button click
  const handleLoad = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: entriesPerPage,
        search: searchValue,
        gameType: activeTab, // 'sports' or 'casino'
        betType: betType !== 'all' ? betType : undefined,
        // matchStatus is not yet supported by backend fully (only 'open' bets are fetched), 
        // but we can pass it if we implement deleted bets later.
      }

      const response = await api.get(API_ENDPOINTS.REPORTS.CURRENT_BETS, { params })
      
      if (response.data && response.data.success) {
        const bets = response.data.data.map(bet => ({
          id: bet.id,
          eventType: bet.game_type,
          eventName: bet.match_title,
          userName: bet.user?.username,
          mName: bet.category || bet.bet_type, // Market Name
          nation: bet.selection_name,
          userRate: bet.odds,
          amount: bet.stake_amount,
          placeDate: new Date(bet.created_at).toLocaleString(),
        }))

        setTableData(bets)
        setTotalPages(response.data.pagination.totalPages)
        
        // Calculate totals from current page (or backend should return grand totals)
        // For now, summing up current page
        setTotalSoda(bets.length)
        const total = bets.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)
        setTotalAmount(total)
      } else {
        setTableData([])
        setTotalSoda(0)
        setTotalAmount(0)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, betType, entriesPerPage, searchValue, currentPage])

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()
    let exportRows = []
    const fileName = `CurrentBets_${activeTab}`

    if (activeTab === 'sports') {
      exportRows = [['Event Type', 'Event Name', 'User Name', 'M Name', 'Nation', 'User Rate', 'Amount', 'Place Date'],
        ...tableData.map(row => [
          row.eventType || '-',
          row.eventName || '-',
          row.userName || '-',
          row.mName || '-',
          row.nation || '-',
          row.userRate || '-',
          row.amount || '-',
          row.placeDate || '-'
        ])]
    } else {
      exportRows = [['Event Name', 'User Name', 'Nation', 'User Rate', 'Amount', 'Place Date'],
        ...tableData.map(row => [
          row.eventName || '-',
          row.userName || '-',
          row.nation || '-',
          row.userRate || '-',
          row.amount || '-',
          row.placeDate || '-'
        ])]
    }

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exportRows), 'Report')
    XLSX.writeFile(wb, `${fileName}.xlsx`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape')
    const fileName = `CurrentBets_${activeTab}`

    doc.setFontSize(16)
    doc.text('Current Bets', 14, 15)
    doc.setFontSize(10)
    doc.text(`Type: ${activeTab.toUpperCase()}`, 14, 22)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)

    let head = []
    let body = []

    if (activeTab === 'sports') {
      head = [['Event Type', 'Event Name', 'User Name', 'M Name', 'Nation', 'Rate', 'Amount', 'Date']]
      body = tableData.map(row => [
        row.eventType || '-',
        row.eventName || '-',
        row.userName || '-',
        row.mName || '-',
        row.nation || '-',
        row.userRate || '-',
        row.amount || '-',
        row.placeDate || '-'
      ])
    } else {
      head = [['Event Name', 'User Name', 'Nation', 'Rate', 'Amount', 'Date']]
      body = tableData.map(row => [
        row.eventName || '-',
        row.userName || '-',
        row.nation || '-',
        row.userRate || '-',
        row.amount || '-',
        row.placeDate || '-'
      ])
    }

    autoTable(doc, {
      head,
      body,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [44, 62, 80] },
    })

    doc.save(`${fileName}.pdf`)
  }

  // Initial Load
  useEffect(() => {
    handleLoad()
  }, [handleLoad])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, betType, searchValue, entriesPerPage])

  return (
    <Layout title="Current Bets - Diamond Admin">
      <div className="listing-grid report-wrapper">
        {/* Page Title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Current Bets</h4>
              <div className="page-title-right">
                <button
                  type="button"
                  className={`btn btn-success btn-sm ml-2 ${tableData.length > 0 ? '' : 'disabled'}`}
                  disabled={tableData.length === 0}
                  onClick={handleExportExcel}
                  title="Export to Excel"
                >
                  <i className="fas fa-file-excel mr-1" /> Excel
                </button>
                <button
                  type="button"
                  className={`btn btn-danger btn-sm ml-2 ${tableData.length > 0 ? '' : 'disabled'}`}
                  disabled={tableData.length === 0}
                  onClick={handleExportPDF}
                  title="Export to PDF"
                >
                  <i className="fas fa-file-pdf mr-1" /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Sports and Casino */}
        <div className="casino-report-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                href="javascript:void(0)"
                className={`nav-link ${activeTab === 'sports' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab('sports')
                }}
              >
                Sports
              </a>
            </li>
            <li className="nav-item">
              <a
                href="javascript:void(0)"
                className={`nav-link ${activeTab === 'casino' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab('casino')
                }}
              >
                Casino
              </a>
            </li>
          </ul>
        </div>

        {/* Filter Form and Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                {/* Filter Form */}
                <div className="report-form mb-3 row align-items-center modal-chekbox">
                  <div className="col-12">
                    {/* Matched/Deleted - Only for Sports tab */}
                    {activeTab === 'sports' && (
                      <div className="custom-control custom-radio custom-control-inline pl-0 mb-2">
                        <div className="custom-control custom-radio custom-control-inline">
                          <input
                            type="radio"
                            id="match-status-matched"
                            name="matchstatus"
                            value="matched"
                            checked={matchStatus === 'matched'}
                            onChange={(e) => setMatchStatus(e.target.value)}
                            className="custom-control-input"
                          />
                          <label htmlFor="match-status-matched" className="custom-control-label">
                            Matched
                          </label>
                        </div>
                        <div className="custom-control custom-radio custom-control-inline">
                          <input
                            type="radio"
                            id="match-status-deleted"
                            name="matchstatus"
                            value="deleted"
                            checked={matchStatus === 'deleted'}
                            onChange={(e) => setMatchStatus(e.target.value)}
                            className="custom-control-input"
                          />
                          <label htmlFor="match-status-deleted" className="custom-control-label">
                            Deleted
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-6">
                    <div className="custom-control custom-radio custom-control-inline pl-0">
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="soda-all"
                          name="bettype"
                          value="all"
                          checked={betType === 'all'}
                          onChange={(e) => setBetType(e.target.value)}
                          className="custom-control-input"
                        />
                        <label htmlFor="soda-all" className="custom-control-label">
                          All
                        </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="soda-back"
                          name="bettype"
                          value="back"
                          checked={betType === 'back'}
                          onChange={(e) => setBetType(e.target.value)}
                          className="custom-control-input"
                        />
                        <label htmlFor="soda-back" className="custom-control-label">
                          Back
                        </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="soda-lay"
                          name="bettype"
                          value="lay"
                          checked={betType === 'lay'}
                          onChange={(e) => setBetType(e.target.value)}
                          className="custom-control-input"
                        />
                        <label htmlFor="soda-lay" className="custom-control-label">
                          Lay
                        </label>
                      </div>
                    </div>
                    <div className="custom-control-inline">
                      <button
                        title="Refresh Data"
                        type="button"
                        className="btn mr-2 btn-primary"
                        onClick={handleLoad}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                  <div className="col-6 text-right">
                    <div className="custom-control-inline mr-0 mt-1">
                      <h5>
                        Total Soda: <span className="mr-2">{totalSoda}</span> Total Amount: <span>{totalAmount.toFixed(2)}</span>
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Show Entries and Search */}
                <div className="row w-100">
                  <div className="col-6">
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
                          <option value="75">75</option>
                          <option value="100">100</option>
                          <option value="125">125</option>
                          <option value="150">150</option>
                        </select>
                        &nbsp;entries
                      </label>
                    </div>
                  </div>
                  <div className="col-6 text-right">
                    <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                      <label className="d-inline-flex align-items-center">
                        Search:
                        <input
                          type="search"
                          placeholder="Search..."
                          className="form-control ml-1 form-control"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive mb-0 report-table">
                  <div className="table no-footer table-responsive-sm">
                    <table
                      id="eventsListTbl"
                      role="table"
                      aria-busy={loading}
                      aria-colcount={activeTab === 'sports' ? 8 : 6}
                      className="table b-table table-striped table-bordered"
                    >
                      {activeTab === 'sports' ? (
                        <>
                          <colgroup>
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: '200px' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                          </colgroup>
                          <thead role="rowgroup" className="">
                            <tr role="row" className="">
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort="none" className="position-relative">
                                <div>Event Type</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort="none" className="position-relative">
                                <div>Event Name</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="3" aria-sort="none" className="position-relative">
                                <div>User Name</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="4" aria-sort="none" className="position-relative">
                                <div>M Name</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="5" aria-sort="none" className="position-relative">
                                <div>Nation</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="6" aria-sort="none" className="position-relative text-right">
                                <div>User Rate</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="7" aria-sort="none" className="position-relative text-right">
                                <div>Amount</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="8" aria-sort="none" className="position-relative">
                                <div>Place Date</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody role="rowgroup">
                            {loading ? (
                              <tr role="row" className="b-table-empty-row">
                                <td colSpan="8" role="cell" className="">
                                  <div role="alert" aria-live="polite">
                                    <div className="text-center my-2">Loading...</div>
                                  </div>
                                </td>
                              </tr>
                            ) : tableData.length === 0 ? (
                              <tr role="row" className="b-table-empty-row">
                                <td colSpan="8" role="cell" className="">
                                  <div role="alert" aria-live="polite">
                                    <p className="text-center mb-0">No data available in table</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              tableData.map((row, index) => (
                                <tr key={row.id || index} role="row" className="">
                                  <td aria-colindex="1" role="cell" className="">
                                    {row.eventType || '-'}
                                  </td>
                                  <td aria-colindex="2" role="cell" className="">
                                    {row.eventName || '-'}
                                  </td>
                                  <td aria-colindex="3" role="cell" className="">
                                    {row.userName || '-'}
                                  </td>
                                  <td aria-colindex="4" role="cell" className="">
                                    {row.mName || '-'}
                                  </td>
                                  <td aria-colindex="5" role="cell" className="">
                                    {row.nation || '-'}
                                  </td>
                                  <td aria-colindex="6" role="cell" className="text-right">
                                    {row.userRate || '-'}
                                  </td>
                                  <td aria-colindex="7" role="cell" className="text-right">
                                    {row.amount || '-'}
                                  </td>
                                  <td aria-colindex="8" role="cell" className="">
                                    {row.placeDate || '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </>
                      ) : (
                        <>
                          <colgroup>
                            <col style={{ width: '200px' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: 'auto' }} />
                          </colgroup>
                          <thead role="rowgroup" className="">
                            <tr role="row" className="">
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="1" aria-sort="none" className="position-relative">
                                <div>Event Name</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="2" aria-sort="none" className="position-relative">
                                <div>User Name</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="3" aria-sort="none" className="position-relative">
                                <div>Nation</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="4" aria-sort="none" className="position-relative text-right">
                                <div>User Rate</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="5" aria-sort="none" className="position-relative text-right">
                                <div>Amount</div>
                              </th>
                              <th role="columnheader" scope="col" tabIndex="0" aria-colindex="6" aria-sort="none" className="position-relative">
                                <div>Place Date</div>
                              </th>
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
                                    <p className="text-center mb-0">No data available in table</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              tableData.map((row, index) => (
                                <tr key={row.id || index} role="row" className="">
                                  <td aria-colindex="1" role="cell" className="">
                                    {row.eventName || '-'}
                                  </td>
                                  <td aria-colindex="2" role="cell" className="">
                                    {row.userName || '-'}
                                  </td>
                                  <td aria-colindex="3" role="cell" className="">
                                    {row.nation || '-'}
                                  </td>
                                  <td aria-colindex="4" role="cell" className="text-right">
                                    {row.userRate || '-'}
                                  </td>
                                  <td aria-colindex="5" role="cell" className="text-right">
                                    {row.amount || '-'}
                                  </td>
                                  <td aria-colindex="6" role="cell" className="">
                                    {row.placeDate || '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="row pt-3 mt-3 mb-3">
                  <div className="col">
                    <div className="dataTables_paginate paging_simple_numbers float-right">
                      <ul className="pagination pagination-rounded mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            ‹
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            ›
                          </button>
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
    </Layout>
  )
}

export default CurrentBets

