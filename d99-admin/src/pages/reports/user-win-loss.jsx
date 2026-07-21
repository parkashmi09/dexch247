import { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Layout from '../../components/Layout'
import { getUserWinLoss } from '../../services/ReportService'
import { searchByUsername } from '../../services/api'
import loaderGif from '../../assets/loader.gif'

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z" />
  </svg>
)
import './style.css'

function UserWinLoss() {
  const [clientSearch, setClientSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)
  const suggestionsRef = useRef(null)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(today.getDate() - 7)
    setDateFrom(formatDate(weekAgo))
    setDateTo(formatDate(today))
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openDatePicker = (ref) => {
    if (ref?.current) ref.current.showPicker?.() || ref.current.click()
  }

  const handleClientSearchChange = async (e) => {
    const val = e.target.value
    setClientSearch(val)
    if (val.length >= 2) {
      try {
        const res = await searchByUsername(val, 1, 15)
        const results = res?.data?.results || res?.data || []
        if (results.length > 0) {
          setSuggestions(results)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch {
        setSuggestions([])
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectClient = (username) => {
    setClientSearch(username)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (clientSearch && clientSearch !== 'all') {
        params.clientName = clientSearch
      }
      if (dateFrom) params.fromDate = dateFrom
      if (dateTo) params.toDate = dateTo

      const response = await getUserWinLoss(params)
      if (response.success) {
        setTableData(response.data || [])
      } else {
        setTableData([])
      }
    } catch (error) {
      console.error('Error loading user win/loss:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = (e) => {
    e?.preventDefault()
    fetchData()
  }

  const handleReset = (e) => {
    e?.preventDefault()
    setClientSearch('')
    setDateFrom('')
    setDateTo('')
    setTableSearch('')
    setTableData([])
  }

  const formatNum = (val) => {
    const n = parseFloat(val)
    return Number.isNaN(n) ? '0.00' : Number(n).toFixed(2)
  }

  // Filter table data by search input
  const filteredData = tableSearch
    ? tableData.filter(row =>
        (row.username || '').toLowerCase().includes(tableSearch.toLowerCase())
      )
    : tableData

  // Excel export
  const handleExportExcel = () => {
    if (filteredData.length === 0) return
    const wb = XLSX.utils.book_new()
    const exportRows = [['No', 'User Name', 'Casino', 'Sport', 'Third Party', 'Profit/Loss'],
      ...filteredData.map((row, idx) => [
        idx + 1,
        row.username || '-',
        formatNum(row.casino),
        formatNum(row.sport),
        formatNum(row.third_party),
        formatNum(row.profit_loss)
      ])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exportRows), 'Report')
    XLSX.writeFile(wb, 'user-win-loss.xlsx')
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape')
    doc.setFontSize(16)
    doc.text('User Win Loss', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22)

    autoTable(doc, {
      head: [['No', 'User Name', 'Casino', 'Sport', 'Third Party', 'Profit/Loss']],
      body: filteredData.map((row, idx) => [
        idx + 1,
        row.username || '-',
        formatNum(row.casino),
        formatNum(row.sport),
        formatNum(row.third_party),
        formatNum(row.profit_loss)
      ]),
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [44, 62, 80] },
    })

    doc.save('user-win-loss.pdf')
  }

  return (
    <Layout title="User Win Loss - Diamond Admin">
      {loading && (
        <div
          style={{
            display: 'block',
            position: 'fixed',
            zIndex: 9999,
            backgroundImage: `url(${loaderGif})`,
            backgroundColor: '#666',
            opacity: 0.4,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            left: 0,
            bottom: 0,
            right: 0,
            top: 0,
            backgroundSize: '100px 100px'
          }}
        />
      )}
      <div className="listing-grid">
        <div className="account-list-statement">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">User Win Loss</h4>
                <div className="page-title-right">
                  <button
                    type="button"
                    className={`btn btn-success btn-sm ml-2 ${filteredData.length > 0 ? '' : 'disabled'}`}
                    disabled={filteredData.length === 0}
                    onClick={handleExportExcel}
                    title="Export to Excel"
                  >
                    <i className="fas fa-file-excel mr-1" /> Excel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-danger btn-sm ml-2 ${filteredData.length > 0 ? '' : 'disabled'}`}
                    disabled={filteredData.length === 0}
                    onClick={handleExportPDF}
                    title="Export to PDF"
                  >
                    <i className="fas fa-file-pdf mr-1" /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="report-form mb-3">
                    <form method="post" className="ajaxFormSubmit" onSubmit={handleLoad}>
                      <div className="d-flex align-items-end flex-wrap gap-2">
                        {/* Client Search */}
                        <div style={{ width: '200px' }}>
                          <div className="form-group mb-0" style={{ position: 'relative' }} ref={suggestionsRef}>
                            <label htmlFor="uwl-client" className="mb-1 fw-medium" style={{ fontSize: '12px' }}>Search By Client Name</label>
                            <input
                              id="uwl-client"
                              type="text"
                              className="form-control"
                              placeholder="Select option"
                              autoComplete="off"
                              style={{ height: '34px', fontSize: '13px' }}
                              value={clientSearch}
                              onChange={handleClientSearchChange}
                              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                              <ul
                                style={{
                                  position: 'absolute',
                                  zIndex: 1000,
                                  background: '#fff',
                                  border: '1px solid #ddd',
                                  borderRadius: 4,
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                  width: '100%',
                                  listStyle: 'none',
                                  padding: 0,
                                  margin: 0,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}
                              >
                                {suggestions.map((s, i) => (
                                  <li
                                    key={s.user_id || s.staff_id || i}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      borderBottom: '1px solid #eee'
                                    }}
                                    onMouseDown={() => selectClient(s.username)}
                                  >
                                    {s.username}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Date Range Selection */}
                        <div style={{ width: '280px' }}>
                          <label className="mb-1 fw-medium" style={{ fontSize: '12px' }}>Select Date Range</label>
                          <div className="mx-datepicker" style={{ width: '100%' }}>
                            <div className="mx-input-wrapper d-flex align-items-center" style={{ 
                              position: 'relative', 
                              border: '1px solid #ced4da', 
                              borderRadius: '4px', 
                              background: '#fff', 
                              height: '34px',
                              padding: '0 8px'
                            }}>
                              <input
                                type="text"
                                readOnly
                                className="border-0 p-0"
                                style={{ width: '100%', fontSize: '13px', background: 'transparent', cursor: 'pointer', outline: 'none' }}
                                value={`${dateFrom ? dateFrom.split('-').reverse().join('/') : ''} - ${dateTo ? dateTo.split('-').reverse().join('/') : ''}`}
                                onClick={() => openDatePicker(fromDateRef)}
                              />
                              <input
                                ref={fromDateRef}
                                type="date"
                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0, border: 0 }}
                                value={dateFrom}
                                onChange={(e) => {
                                  setDateFrom(e.target.value)
                                  // Auto open to date picker after selecting from date
                                  setTimeout(() => openDatePicker(toDateRef), 100)
                                }}
                              />
                              <input
                                ref={toDateRef}
                                type="date"
                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0, border: 0 }}
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                              />
                              <i
                                className="mx-icon-calendar ml-auto"
                                style={{ position: 'static', transform: 'none', color: '#74788d', cursor: 'pointer', fontSize: '14px' }}
                                onClick={() => openDatePicker(fromDateRef)}
                              >
                                <CalendarIcon />
                              </i>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary px-3 fw-medium" style={{ height: '34px', borderRadius: '4px', fontSize: '13px' }}>
                            Load
                          </button>
                          <button type="button" className="btn btn-light px-3 fw-medium" onClick={handleReset} style={{ height: '34px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                            Reset
                          </button>
                          <button
                            type="button"
                            className={`btn btn-success ${filteredData.length === 0 ? 'disabled' : ''}`}
                            disabled={filteredData.length === 0}
                            onClick={handleExportExcel}
                            style={{ height: '34px', width: '34px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                            title="Export Excel"
                          >
                            <i className="fas fa-file-excel" style={{ fontSize: '14px' }} />
                          </button>
                          <button
                            type="button"
                            className={`btn btn-danger ${filteredData.length === 0 ? 'disabled' : ''}`}
                            disabled={filteredData.length === 0}
                            onClick={handleExportPDF}
                            style={{ height: '34px', width: '34px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                            title="Print PDF"
                          >
                            <i className="fas fa-file-pdf" style={{ fontSize: '14px' }} />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="row">
                    <div className="col-6" />
                    <div className="col-6 text-right">
                      <div className="dataTables_filter text-md-right">
                        <label className="d-inline-flex align-items-center">
                          <input
                            type="search"
                            placeholder="Search..."
                            className="form-control form-control-sm ml-2 form-control"
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive mb-0 mt-4">
                    <div className="table no-footer table-hover table-responsive-sm">
                      <table role="table" aria-busy={loading} aria-colcount={6} className="table b-table table-striped table-bordered" id="uwl-tbl">
                        <thead role="rowgroup" className="">
                          <tr role="row" className="">
                            <th role="columnheader" scope="col" className="position-relative"><div>No</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>User Name</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Casino</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Sport</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Third Party</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Profit/Loss</div></th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {filteredData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="6" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredData.map((row, idx) => (
                              <tr key={row.user_id || idx} role="row" className="">
                                <td role="cell">{idx + 1}</td>
                                <td role="cell">{row.username || '-'}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.casino) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.casino)}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.sport) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.sport)}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.third_party) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.third_party)}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.profit_loss) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.profit_loss)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot role="rowgroup" className="">
                          <tr>
                            <td colSpan="2" className="text-right"><strong>Total</strong></td>
                            <td className="text-right"><strong>{formatNum(filteredData.reduce((s, r) => s + (parseFloat(r.casino) || 0), 0))}</strong></td>
                            <td className="text-right"><strong>{formatNum(filteredData.reduce((s, r) => s + (parseFloat(r.sport) || 0), 0))}</strong></td>
                            <td className="text-right"><strong>{formatNum(filteredData.reduce((s, r) => s + (parseFloat(r.third_party) || 0), 0))}</strong></td>
                            <td className="text-right"><strong>{formatNum(filteredData.reduce((s, r) => s + (parseFloat(r.profit_loss) || 0), 0))}</strong></td>
                          </tr>
                        </tfoot>
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

export default UserWinLoss
