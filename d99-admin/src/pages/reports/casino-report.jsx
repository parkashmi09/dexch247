import { useState } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Layout from '../../components/Layout'
import './style.css'
import { useSelector } from 'react-redux'

/**
 * CasinoReport Component
 * 
 * Page for viewing casino reports with filters and export options.
 */
function CasinoReport() {
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [searchValue, setSearchValue] = useState('')
  const [casinoType, setCasinoType] = useState('')
  const [selectOption, setSelectOption] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, token, role, isAuthenticated } = useSelector((state) => state.auth)

  // Handle Submit button click
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Get token based on active role (following app pattern)
      const activeRole = localStorage.getItem('activeRole')
      let token = null

      if (activeRole === 'owner') {
        token = localStorage.getItem('ownerToken')
      } else if (activeRole === 'staff') {
        token = localStorage.getItem('staffToken')
      } else {
        token = localStorage.getItem('token')
      }

      // Get username from stored user object (if available)
      let username = user?.username || ''


      // Map activeRole to uppercase role expected by API
      const roleForPayload = activeRole === 'owner' ? 'OWNER' : activeRole === 'staff' ? 'STAFF' : (activeRole || '').toUpperCase()

      const payload = {
        role: roleForPayload,
        username: "diamond99_owner",
        type: casinoType,
        vendor: selectValue
      }

      const response = await axios.post(
        'https://api.dexch247.com/api/admin/reports/casino-report',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )

      if (response && response.data && response.data.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((item) => ({
          id: item.id,
          gameName: item.game_name || item.game_name || '-',
          type: item.transaction_type || item.game_type || '-',
          amount: item.amount != null ? parseFloat(item.amount).toFixed(2) : '-',
          total: item.amount != null ? parseFloat(item.amount).toFixed(2) : '-',
          date: item.timestamp ? formatTimestamp(item.timestamp) : '-',
          roundId: item.serial_number || item.round_id || '-',
          transactionId: item.external_transaction_id || item.transaction_id || '-'
        }))

        setTableData(mapped)
      } else {
        setTableData([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()
    const exportRows = [['Game Name', 'Type', 'Amount', 'Total', 'Date', 'Round Id', 'Transaction Id'],
    ...tableData.map(row => [
      row.gameName || '-',
      row.type || '-',
      row.amount || '-',
      row.total || '-',
      row.date || '-',
      row.roundId || '-',
      row.transactionId || '-'
    ])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exportRows), 'Report')
    XLSX.writeFile(wb, `CasinoReport_${casinoType || 'Report'}.xlsx`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape')
    doc.setFontSize(16)
    doc.text('Casino Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`Type: ${casinoType || 'All'}`, 14, 22)
    doc.text(`Vendor: ${selectValue || 'All'}`, 14, 28)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34)

    autoTable(doc, {
      head: [['Game Name', 'Type', 'Amount', 'Total', 'Date', 'Round Id', 'Transaction Id']],
      body: tableData.map(row => [
        row.gameName || '-',
        row.type || '-',
        row.amount || '-',
        row.total || '-',
        row.date || '-',
        row.roundId || '-',
        row.transactionId || '-'
      ]),
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [44, 62, 80] },
    })

    doc.save(`CasinoReport_${casinoType || 'Report'}.pdf`)
  }

  // Helper: format ISO timestamp to DD/MM/YYYY (or local date)
  const formatTimestamp = (ts) => {
    try {
      const d = new Date(ts)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch (e) {
      return ts
    }
  }

  return (
    <Layout title="Casino Report - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Casino Report
                </h4>
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

          <div className="card">
            <div className="card-body-casino">
              {/* Filter Form */}
              <div className="row">
                <div className="col-12">
                  <div className="">
                    <div className="">
                      <form method="post" className="ajaxFormSubmit" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="row row5">
                          <div className="col-md-2">
                            {/* <label>Select Casino Type:</label> */}
                            <select
                              className="form-control"
                              value={casinoType}
                              onChange={(e) => setCasinoType(e.target.value)}
                            >
                              <option value="">Select Casino Type</option>
                              <option value="SettleBet">Settled Bets</option>
                              <option value="Unsettlebet">UnSettled Bets</option>

                            </select>
                          </div>
                          <div className="col-md-2">
                            {/* <label>Select option:</label> */}
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Select option"
                              value={selectOption}
                              onChange={(e) => setSelectOption(e.target.value)}
                            />
                          </div>
                          <div className="col-md-2">
                            {/* <label>Select:</label> */}
                            <select
                              className="form-control"
                              value={selectValue}
                              onChange={(e) => setSelectValue(e.target.value)}
                            >
                              <option value="">Select</option>
                              <option value="2j">2j</option>
                              <option value="Ag">Ag</option>
                              <option value="bgaming">bgaming</option>
                              <option value="BigTimeGaming">BigTimeGaming</option>
                              <option value="BNG">BNG</option>
                              <option value="CQ9">CQ9</option>
                              <option value="EazyGaming">EazyGaming</option>
                              <option value="esports">esports</option>
                              <option value="evolution">evolution</option>
                              <option value="Evoplay">Evoplay</option>
                              <option value="ezugi">ezugi</option>
                              <option value="hacksaw">hacksaw</option>
                              <option value="ideal">ideal</option>
                              <option value="JDBGaming">JDBGaming</option>
                              <option value="jili">jili</option>
                              <option value="km">km</option>
                              <option value="lobby">lobby</option>
                              <option value="microgaming">microgaming</option>
                              <option value="netent">netent</option>
                              <option value="NextSpin">NextSpin</option>
                              <option value="PgsGaming">PgsGaming</option>
                              <option value="pgsoft">pgsoft</option>
                              <option value="Playson">Playson</option>
                              <option value="Playtech">Playtech</option>
                              <option value="pragmatic">pragmatic</option>
                              <option value="pragmaticlive">pragmaticlive</option>
                              <option value="Rich88">Rich88</option>
                              <option value="Skywind">Skywind</option>
                              <option value="sports">sports</option>
                              <option value="spribe">spribe</option>

                            </select>
                          </div>
                          <div className="col-md-2 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary">
                              Submit
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
                            id="casinoReportTbl"
                            role="table"
                            aria-busy={loading}
                            aria-colcount="7"
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
                                  <div>Game Name</div>
                                </th>
                                <th
                                  role="columnheader"
                                  scope="col"
                                  tabIndex="0"
                                  aria-colindex="2"
                                  className="position-relative"
                                >
                                  <div>Type</div>
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
                                <th
                                  role="columnheader"
                                  scope="col"
                                  tabIndex="0"
                                  aria-colindex="4"
                                  className="position-relative text-right"
                                >
                                  <div>Total</div>
                                </th>
                                <th
                                  role="columnheader"
                                  scope="col"
                                  tabIndex="0"
                                  aria-colindex="5"
                                  className="position-relative"
                                >
                                  <div>Date</div>
                                </th>
                                <th
                                  role="columnheader"
                                  scope="col"
                                  tabIndex="0"
                                  aria-colindex="6"
                                  className="position-relative"
                                >
                                  <div>Round Id</div>
                                </th>
                                <th
                                  role="columnheader"
                                  scope="col"
                                  tabIndex="0"
                                  aria-colindex="7"
                                  className="position-relative"
                                >
                                  <div>Transaction Id</div>
                                </th>
                              </tr>
                            </thead>
                            <tbody role="rowgroup">
                              {loading ? (
                                <tr role="row" className="b-table-empty-row">
                                  <td colSpan="7" role="cell" className="">
                                    <div role="alert" aria-live="polite">
                                      <div className="text-center my-2">Loading...</div>
                                    </div>
                                  </td>
                                </tr>
                              ) : tableData.length === 0 ? (
                                <tr role="row" className="b-table-empty-row">
                                  <td colSpan="7" role="cell" className="">
                                    <div role="alert" aria-live="polite">
                                      <div className="text-center my-2">No data available in table</div>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                tableData.map((row, index) => (
                                  <tr key={row.id || index} role="row" className="">
                                    <td aria-colindex="1" role="cell" className="">
                                      {row.gameName || '-'}
                                    </td>
                                    <td aria-colindex="2" role="cell" className="">
                                      {row.type || '-'}
                                    </td>
                                    <td aria-colindex="3" role="cell" className="text-right">
                                      {row.amount || '-'}
                                    </td>
                                    <td aria-colindex="4" role="cell" className="text-right">
                                      {row.total || '-'}
                                    </td>
                                    <td aria-colindex="5" role="cell" className="">
                                      {row.date || '-'}
                                    </td>
                                    <td aria-colindex="6" role="cell" className="">
                                      {row.roundId || '-'}
                                    </td>
                                    <td aria-colindex="7" role="cell" className="">
                                      {row.transactionId || '-'}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <div className="row pt-3">
                        <div className="col">
                          <div className="dataTables_paginate paging_simple_numbers float-right">
                            <ul className="pagination pagination-rounded mb-0">
                              <ul
                                role="menubar"
                                aria-label="Pagination"
                                className="pagination dataTables_paginate paging_simple_numbers my-0 b-pagination justify-content-end"
                              >
                                <li role="presentation" className="page-item disabled">
                                  <span role="menuitem" aria-label="Go to first page" className="page-link">«</span>
                                </li>
                                <li role="presentation" className="page-item disabled">
                                  <span role="menuitem" aria-label="Go to previous page" className="page-link">‹</span>
                                </li>
                                <li role="presentation" className="page-item active">
                                  <button
                                    role="menuitemradio"
                                    type="button"
                                    aria-label="Go to page 1"
                                    className="page-link"
                                  >
                                    1
                                  </button>
                                </li>
                                <li role="presentation" className="page-item disabled">
                                  <span role="menuitem" aria-label="Go to next page" className="page-link">›</span>
                                </li>
                                <li role="presentation" className="page-item disabled">
                                  <span role="menuitem" aria-label="Go to last page" className="page-link">»</span>
                                </li>
                              </ul>
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
        </div>
      </div>
    </Layout>
  )
}

export default CasinoReport

