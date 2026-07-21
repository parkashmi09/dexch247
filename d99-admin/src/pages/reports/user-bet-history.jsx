import { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { API_ENDPOINTS } from '../../config/api'
import { searchByUsername } from '../../services/api'
import loaderGif from '../../assets/loader.gif'
import './style.css'

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z" />
  </svg>
)

/**
 * UserBetHistory Component
 *
 * Reports → User Bet History page.
 * Lets an admin search a user from THEIR downline (autocomplete is already
 * hierarchy-filtered server-side via /admin/search-by-username) and view all
 * past sports bets for that user from the SportsBet table.
 */
function UserBetHistory() {
  // Form state
  const [clientSearch, setClientSearch] = useState('')
  const [selectedUsername, setSelectedUsername] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [betType, setBetType] = useState('all')
  const [status, setStatus] = useState('all')

  // Suggestions
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)

  // Table state
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [summary, setSummary] = useState({ by_event: [], totals: null, by_match: [], match_totals: null })
  const [activeTab, setActiveTab] = useState('bet') // 'bet' | 'market' | 'event'
  const [tableSearch, setTableSearch] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

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
    setSelectedUsername('') // reset selection when typing
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
    setSelectedUsername(username)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const fetchData = async (page = 1) => {
    const usernameToUse = selectedUsername || clientSearch
    if (!usernameToUse || !usernameToUse.trim()) {
      setErrorMsg('Please select a user from the downline')
      setTableData([])
      setTotalRecords(0)
      setTotalPages(0)
      return
    }
    setErrorMsg('')
    setLoading(true)
    try {
      const params = {
        username: usernameToUse,
        page,
        limit: entriesPerPage,
      }
      if (dateFrom) params.fromDate = dateFrom
      if (dateTo) params.toDate = dateTo
      if (betType && betType !== 'all') params.betType = betType
      if (status && status !== 'all') params.status = status

      const response = await api.get(API_ENDPOINTS.REPORTS.USER_BET_HISTORY, { params })
      if (response.data && response.data.success) {
        setTableData(response.data.data || [])
        setSummary(response.data.summary || { by_event: [], totals: null, by_match: [], match_totals: null })
        const pg = response.data.pagination || {}
        setTotalPages(pg.totalPages || 0)
        setTotalRecords(pg.total || 0)
        setCurrentPage(pg.page || 1)
        if (response.data.message) setErrorMsg(response.data.message)
      } else {
        setTableData([])
        setSummary({ by_event: [], totals: null, by_match: [], match_totals: null })
        setTotalPages(0)
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error loading user bet history:', error)
      const msg = error?.response?.data?.message || 'Failed to fetch bet history'
      setErrorMsg(msg)
      setTableData([])
      setSummary({ by_event: [], totals: null })
      setTotalPages(0)
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = (e) => {
    e?.preventDefault()
    fetchData(1)
  }

  const handleReset = (e) => {
    e?.preventDefault()
    setClientSearch('')
    setSelectedUsername('')
    setDateFrom('')
    setDateTo('')
    setBetType('all')
    setStatus('all')
    setTableSearch('')
    setTableData([])
    setTotalPages(0)
    setTotalRecords(0)
    setCurrentPage(1)
    setErrorMsg('')
  }

  const formatNum = (val) => {
    const n = parseFloat(val)
    return Number.isNaN(n) ? '0.00' : Number(n).toFixed(2)
  }

  const formatDateTime = (val) => {
    if (!val) return '-'
    try {
      return new Date(val).toLocaleString()
    } catch {
      return val
    }
  }

  const hasData = activeTab === 'bet' ? tableData.length > 0 :
                 activeTab === 'market' ? (summary.by_event && summary.by_event.length > 0) :
                 activeTab === 'event' ? (summary.by_match && summary.by_match.length > 0) : false

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()
    let exportRows = []
    const fileName = `UserBetHistory_${selectedUsername || clientSearch || 'Report'}_${activeTab}`

    if (activeTab === 'bet') {
      exportRows = [['#', 'Event', 'Market', 'Selection', 'Type', 'Odds', 'Stake', 'Exposure', 'Debit', 'Credit', 'Released', 'P/L', 'Closing Bal', 'Result', 'Place Date'],
        ...tableData.map((row, idx) => [
          idx + 1,
          row.match_title || '-',
          row.market_type || row.fancy_name || row.category || '-',
          row.selection_name || '-',
          (row.bet_type || '').toUpperCase(),
          row.odds || '-',
          formatNum(row.stake_amount),
          row.exposure_held != null ? formatNum(row.exposure_held) : '-',
          row.debit != null ? formatNum(row.debit) : '-',
          row.credit != null ? formatNum(row.credit) : '-',
          (row.refund != null && row.refund > 0) ? formatNum(row.refund) : '-',
          computeBetPL(row) != null ? formatNum(computeBetPL(row)) : '-',
          row.closing_balance != null ? formatNum(row.closing_balance) : '-',
          row.result_status || '-',
          formatDateTime(row.created_at)
        ])]
    } else if (activeTab === 'market') {
      exportRows = [['Event', 'Market', 'Bets (W/L/P)', 'Total Stake', 'Realized P/L', 'Released', 'Locked', 'Net Wallet Impact'],
        ...summary.by_event.map(ev => [
          ev.match_title || '-',
          ev.market_type || ev.game_type || '-',
          `${ev.won_count}W / ${ev.loss_count}L / ${ev.pending_count}P`,
          formatNum(ev.total_stake),
          formatNum(ev.total_pl),
          ev.total_released > 0 ? formatNum(ev.total_released) : '-',
          ev.total_locked < 0 ? formatNum(ev.total_locked) : '-',
          formatNum(ev.net_wallet_impact)
        ])]
    } else if (activeTab === 'event') {
      exportRows = [['Event', 'Markets', 'Bets (W/L/P)', 'Total Stake', 'Realized P/L', 'Released', 'Locked', 'Net Wallet Impact'],
        ...summary.by_match.map(ev => [
          ev.match_title || '-',
          ev.market_count || '-',
          `${ev.won_count}W / ${ev.loss_count}L / ${ev.pending_count}P`,
          formatNum(ev.total_stake),
          formatNum(ev.total_pl),
          ev.total_released > 0 ? formatNum(ev.total_released) : '-',
          ev.total_locked < 0 ? formatNum(ev.total_locked) : '-',
          formatNum(ev.net_wallet_impact)
        ])]
    }

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exportRows), 'Report')
    XLSX.writeFile(wb, `${fileName}.xlsx`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape')
    const fileName = `UserBetHistory_${selectedUsername || clientSearch || 'Report'}_${activeTab}`

    doc.setFontSize(16)
    doc.text('User Bet History', 14, 15)
    doc.setFontSize(10)
    doc.text(`User: ${selectedUsername || clientSearch || 'N/A'}`, 14, 22)
    doc.text(`Report Type: ${activeTab.toUpperCase()} WISE`, 14, 28)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34)

    let head = []
    let body = []

    if (activeTab === 'bet') {
      head = [['#', 'Event', 'Market', 'Selection', 'Type', 'Odds', 'Stake', 'Exp.', 'Debit', 'Credit', 'Rel.', 'P/L', 'Bal', 'Status', 'Date']]
      body = tableData.map((row, idx) => [
        idx + 1,
        row.match_title || '-',
        row.market_type || row.fancy_name || '-',
        row.selection_name || '-',
        (row.bet_type || '').toUpperCase(),
        row.odds || '-',
        formatNum(row.stake_amount),
        row.exposure_held != null ? formatNum(row.exposure_held) : '-',
        row.debit != null ? formatNum(row.debit) : '-',
        row.credit != null ? formatNum(row.credit) : '-',
        (row.refund != null && row.refund > 0) ? formatNum(row.refund) : '-',
        computeBetPL(row) != null ? formatNum(computeBetPL(row)) : '-',
        row.closing_balance != null ? formatNum(row.closing_balance) : '-',
        row.result_status || '-',
        formatDateTime(row.created_at)
      ])
    } else if (activeTab === 'market') {
      head = [['Event', 'Market', 'Bets (W/L/P)', 'Total Stake', 'Realized P/L', 'Released', 'Locked', 'Net Impact']]
      body = summary.by_event.map(ev => [
        ev.match_title || '-',
        ev.market_type || ev.game_type || '-',
        `${ev.won_count}W / ${ev.loss_count}L / ${ev.pending_count}P`,
        formatNum(ev.total_stake),
        formatNum(ev.total_pl),
        ev.total_released > 0 ? formatNum(ev.total_released) : '-',
        ev.total_locked < 0 ? formatNum(ev.total_locked) : '-',
        formatNum(ev.net_wallet_impact)
      ])
    } else if (activeTab === 'event') {
      head = [['Event', 'Markets', 'Bets (W/L/P)', 'Total Stake', 'Realized P/L', 'Released', 'Locked', 'Net Impact']]
      body = summary.by_match.map(ev => [
        ev.match_title || '-',
        ev.market_count || '-',
        `${ev.won_count}W / ${ev.loss_count}L / ${ev.pending_count}P`,
        formatNum(ev.total_stake),
        formatNum(ev.total_pl),
        ev.total_released > 0 ? formatNum(ev.total_released) : '-',
        ev.total_locked < 0 ? formatNum(ev.total_locked) : '-',
        formatNum(ev.net_wallet_impact)
      ])
    }

    autoTable(doc, {
      head,
      body,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [44, 62, 80] },
    })

    doc.save(`${fileName}.pdf`)
  }

  // Client-side filter on visible page
  const filteredData = tableSearch
    ? tableData.filter(row =>
        Object.values(row).some(v =>
          String(v || '').toLowerCase().includes(tableSearch.toLowerCase())
        )
      )
    : tableData

  const totalStake = filteredData.reduce(
    (s, r) => s + (parseFloat(r.stake_amount) || 0), 0
  )
  const totalDebit = filteredData.reduce(
    (s, r) => s + (parseFloat(r.debit) || 0), 0
  )
  const totalCredit = filteredData.reduce(
    (s, r) => s + (parseFloat(r.credit) || 0), 0
  )
  const totalRefund = filteredData.reduce(
    (s, r) => s + (parseFloat(r.refund) || 0), 0
  )

  // P/L is computed authoritatively on the backend (handles all three odds
  // conventions: decimal MO, BM bps, fancy session size-based, plus the
  // proper lay vs back math). Frontend just reads `profit_loss` from the
  // API response — never recompute locally, otherwise bookmaker bps bets
  // (e.g. odds "42" meaning 1.42) get treated as decimal odds and produce
  // wildly inflated values like 4100 instead of 42.
  const computeBetPL = (row) => {
    const status = (row.result_status || '').toString().toLowerCase()
    const isSettled = ['won','win','loss','lost','lose','refund','refunded','void','cancelled'].includes(status)
    if (!isSettled) return null
    if (row.profit_loss == null) return null
    const v = parseFloat(row.profit_loss)
    return Number.isFinite(v) ? v : null
  }

  const totalPL = filteredData.reduce(
    (s, r) => s + (computeBetPL(r) || 0), 0
  )

  // Back / Yes  → blue badge
  // Lay  / No   → pinkish badge
  // For fancy bets bet_type is stored literally as "yes"/"no"
  // (sportbetscontroller.js: finalBetType conversion).
  const renderBetTypeBadge = (row) => {
    const t = (row.bet_type || '').toString().toLowerCase()
    const isBackLike = t === 'back' || t === 'yes'
    const isLayLike = t === 'lay' || t === 'no'
    const baseStyle = {
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      lineHeight: 1.4,
    }
    let style = { ...baseStyle, background: '#e2e6ea', color: '#495057' }
    if (isBackLike) style = { ...baseStyle, background: '#cfe2ff', color: '#0a58ca' }
    else if (isLayLike) style = { ...baseStyle, background: '#fbd5e3', color: '#b02a5b' }
    return <span style={style}>{(row.bet_type || '-').toString().toUpperCase()}</span>
  }

  return (
    <Layout title="User Bet History - Diamond Admin">
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
                <h4 className="mb-0 font-size-18">User Bet History</h4>
                <div className="page-title-right">
                  <button
                    type="button"
                    className={`btn btn-success btn-sm ml-2 ${hasData ? '' : 'disabled'}`}
                    disabled={!hasData}
                    onClick={handleExportExcel}
                    title="Export to Excel"
                  >
                    <i className="fas fa-file-excel mr-1" /> Excel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-danger btn-sm ml-2 ${hasData ? '' : 'disabled'}`}
                    disabled={!hasData}
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
                        {/* Client Search (downline only) */}
                        <div style={{ width: '220px' }}>
                          <div className="form-group mb-0" style={{ position: 'relative' }} ref={suggestionsRef}>
                            <label htmlFor="ubh-client" className="mb-1 fw-medium" style={{ fontSize: '12px' }}>
                              Search Downline User
                            </label>
                            <input
                              id="ubh-client"
                              type="text"
                              className="form-control"
                              placeholder="Type username..."
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
                            <div
                              className="mx-input-wrapper d-flex align-items-center"
                              style={{
                                position: 'relative',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                background: '#fff',
                                height: '34px',
                                padding: '0 8px'
                              }}
                            >
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

                        {/* Bet Type */}
                        <div style={{ width: '120px' }}>
                          <label className="mb-1 fw-medium" style={{ fontSize: '12px' }}>Bet Type</label>
                          <select
                            className="form-control"
                            style={{ height: '34px', fontSize: '13px' }}
                            value={betType}
                            onChange={(e) => setBetType(e.target.value)}
                          >
                            <option value="all">All</option>
                            <option value="back">Back</option>
                            <option value="lay">Lay</option>
                          </select>
                        </div>

                        {/* Result Status */}
                        <div style={{ width: '140px' }}>
                          <label className="mb-1 fw-medium" style={{ fontSize: '12px' }}>Result Status</label>
                          <select
                            className="form-control"
                            style={{ height: '34px', fontSize: '13px' }}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="win">Win</option>
                            <option value="loss">Loss</option>
                            <option value="void">Void</option>
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary px-3 fw-medium" style={{ height: '34px', borderRadius: '4px', fontSize: '13px' }}>
                            Load
                          </button>
                          <button type="button" className="btn btn-light px-3 fw-medium" onClick={handleReset} style={{ height: '34px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                            Reset
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-warning py-2 mb-2" style={{ fontSize: '13px' }}>
                      {errorMsg}
                    </div>
                  )}

                  {/* Show Entries and Search */}
                  <div className="row w-100">
                    <div className="col-6">
                      <div className="dataTables_length">
                        <label className="d-inline-flex align-items-center">
                          Show&nbsp;
                          <select
                            className="custom-select custom-select-sm"
                            value={entriesPerPage}
                            onChange={(e) => {
                              setEntriesPerPage(Number(e.target.value))
                              setCurrentPage(1)
                            }}
                          >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="75">75</option>
                            <option value="100">100</option>
                          </select>
                          &nbsp;entries
                        </label>
                      </div>
                    </div>
                    <div className="col-6 text-right">
                      <div className="dataTables_filter text-md-right">
                        <label className="d-inline-flex align-items-center">
                          Search:
                          <input
                            type="search"
                            placeholder="Search..."
                            className="form-control ml-1 form-control"
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tab navigation: Bet Wise | Market Wise | Event Wise */}
                  <div className="mt-3 mb-2">
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <a
                          href="javascript:void(0)"
                          className={`nav-link ${activeTab === 'bet' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); setActiveTab('bet') }}
                        >
                          Bet Wise
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="javascript:void(0)"
                          className={`nav-link ${activeTab === 'market' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); setActiveTab('market') }}
                        >
                          Market Wise
                          {summary.by_event && summary.by_event.length > 0 && (
                            <span className="badge badge-light ml-1">{summary.by_event.length}</span>
                          )}
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="javascript:void(0)"
                          className={`nav-link ${activeTab === 'event' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); setActiveTab('event') }}
                        >
                          Event Wise
                          {summary.by_match && summary.by_match.length > 0 && (
                            <span className="badge badge-light ml-1">{summary.by_match.length}</span>
                          )}
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* === MARKET WISE TAB === */}
                  {activeTab === 'market' && (
                    <div className="table-responsive mb-0 report-table">
                      <table className="table b-table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Market</th>
                            <th className="text-center">Bets (W/L/P)</th>
                            <th className="text-right">Total Stake</th>
                            <th className="text-right">Realized P/L</th>
                            <th className="text-right" title="Hedge release at placement (informational)">Released</th>
                            <th className="text-right" title="Currently locked for pending bets in this group">Locked</th>
                            <th className="text-right">Net Wallet Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!summary.by_event || summary.by_event.length === 0) ? (
                            <tr><td colSpan="8" className="text-center">No markets to summarize</td></tr>
                          ) : (
                            summary.by_event.map((ev, idx) => {
                              const counts = `${ev.won_count}W / ${ev.loss_count}L / ${ev.pending_count}P${ev.refund_count ? ` / ${ev.refund_count}R` : ''}`
                              const plClass = ev.total_pl > 0 ? 'text-success' : ev.total_pl < 0 ? 'text-danger' : ''
                              const netClass = ev.net_wallet_impact > 0 ? 'text-success' : ev.net_wallet_impact < 0 ? 'text-danger' : ''
                              return (
                                <tr key={idx}>
                                  <td>{ev.match_title || '-'}</td>
                                  <td>{ev.market_type || ev.game_type || '-'}</td>
                                  <td className="text-center">{counts}</td>
                                  <td className="text-right">{formatNum(ev.total_stake)}</td>
                                  <td className={`text-right ${plClass}`} style={{ fontWeight: 600 }}>{formatNum(ev.total_pl)}</td>
                                  <td className="text-right">{ev.total_released > 0 ? formatNum(ev.total_released) : '-'}</td>
                                  <td className="text-right">{ev.total_locked < 0 ? formatNum(ev.total_locked) : '-'}</td>
                                  <td className={`text-right ${netClass}`} style={{ fontWeight: 600 }}>{formatNum(ev.net_wallet_impact)}</td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                        {summary.totals && summary.by_event && summary.by_event.length > 0 && (
                          <tfoot>
                            <tr style={{ background: '#f8f9fa', fontWeight: 700 }}>
                              <td colSpan="2">TOTAL</td>
                              <td className="text-center">
                                {summary.totals.won_count}W / {summary.totals.loss_count}L / {summary.totals.pending_count}P
                                {summary.totals.refund_count ? ` / ${summary.totals.refund_count}R` : ''}
                              </td>
                              <td className="text-right">{formatNum(summary.totals.total_stake)}</td>
                              <td className={`text-right ${summary.totals.total_pl > 0 ? 'text-success' : summary.totals.total_pl < 0 ? 'text-danger' : ''}`}>
                                {formatNum(summary.totals.total_pl)}
                              </td>
                              <td className="text-right">{summary.totals.total_released > 0 ? formatNum(summary.totals.total_released) : '-'}</td>
                              <td className="text-right">{summary.totals.total_locked < 0 ? formatNum(summary.totals.total_locked) : '-'}</td>
                              <td className={`text-right ${summary.totals.net_wallet_impact > 0 ? 'text-success' : summary.totals.net_wallet_impact < 0 ? 'text-danger' : ''}`}>
                                {formatNum(summary.totals.net_wallet_impact)}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}

                  {/* === EVENT WISE TAB === */}
                  {activeTab === 'event' && (
                    <div className="table-responsive mb-0 report-table">
                      <table className="table b-table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th className="text-center">Markets</th>
                            <th className="text-center">Bets (W/L/P)</th>
                            <th className="text-right">Total Stake</th>
                            <th className="text-right">Realized P/L</th>
                            <th className="text-right" title="Hedge release at placement (informational)">Released</th>
                            <th className="text-right" title="Currently locked for pending bets in this event">Locked</th>
                            <th className="text-right">Net Wallet Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!summary.by_match || summary.by_match.length === 0) ? (
                            <tr><td colSpan="8" className="text-center">No events to summarize</td></tr>
                          ) : (
                            summary.by_match.map((ev, idx) => {
                              const counts = `${ev.won_count}W / ${ev.loss_count}L / ${ev.pending_count}P${ev.refund_count ? ` / ${ev.refund_count}R` : ''}`
                              const plClass = ev.total_pl > 0 ? 'text-success' : ev.total_pl < 0 ? 'text-danger' : ''
                              const netClass = ev.net_wallet_impact > 0 ? 'text-success' : ev.net_wallet_impact < 0 ? 'text-danger' : ''
                              return (
                                <tr key={idx}>
                                  <td>{ev.match_title || '-'}</td>
                                  <td className="text-center">{ev.market_count || '-'}</td>
                                  <td className="text-center">{counts}</td>
                                  <td className="text-right">{formatNum(ev.total_stake)}</td>
                                  <td className={`text-right ${plClass}`} style={{ fontWeight: 600 }}>{formatNum(ev.total_pl)}</td>
                                  <td className="text-right">{ev.total_released > 0 ? formatNum(ev.total_released) : '-'}</td>
                                  <td className="text-right">{ev.total_locked < 0 ? formatNum(ev.total_locked) : '-'}</td>
                                  <td className={`text-right ${netClass}`} style={{ fontWeight: 600 }}>{formatNum(ev.net_wallet_impact)}</td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                        {summary.match_totals && summary.by_match && summary.by_match.length > 0 && (
                          <tfoot>
                            <tr style={{ background: '#f8f9fa', fontWeight: 700 }}>
                              <td>TOTAL</td>
                              <td className="text-center">-</td>
                              <td className="text-center">
                                {summary.match_totals.won_count}W / {summary.match_totals.loss_count}L / {summary.match_totals.pending_count}P
                                {summary.match_totals.refund_count ? ` / ${summary.match_totals.refund_count}R` : ''}
                              </td>
                              <td className="text-right">{formatNum(summary.match_totals.total_stake)}</td>
                              <td className={`text-right ${summary.match_totals.total_pl > 0 ? 'text-success' : summary.match_totals.total_pl < 0 ? 'text-danger' : ''}`}>
                                {formatNum(summary.match_totals.total_pl)}
                              </td>
                              <td className="text-right">{summary.match_totals.total_released > 0 ? formatNum(summary.match_totals.total_released) : '-'}</td>
                              <td className="text-right">{summary.match_totals.total_locked < 0 ? formatNum(summary.match_totals.total_locked) : '-'}</td>
                              <td className={`text-right ${summary.match_totals.net_wallet_impact > 0 ? 'text-success' : summary.match_totals.net_wallet_impact < 0 ? 'text-danger' : ''}`}>
                                {formatNum(summary.match_totals.net_wallet_impact)}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}

                  {/* === BET WISE TAB === */}
                  {activeTab === 'bet' && (
                  <div className="table-responsive mb-0 report-table">
                    <div className="table no-footer table-responsive-sm">
                      <table
                        role="table"
                        aria-busy={loading}
                        aria-colcount={14}
                        className="table b-table table-striped table-bordered"
                      >
                        <thead role="rowgroup">
                          <tr role="row">
                            <th>#</th>
                            <th>Event</th>
                            <th>Market</th>
                            <th>Selection</th>
                            <th>Type</th>
                            <th className="text-right">Odds</th>
                            <th className="text-right">Stake</th>
                            <th className="text-right">Exposure</th>
                            <th className="text-right">Debit</th>
                            <th className="text-right">Credit</th>
                            <th className="text-right" title="Cash released back at placement when this bet hedged earlier exposure">Released</th>
                            <th className="text-right">P/L</th>
                            <th className="text-right">Closing Bal</th>
                            <th>Result</th>
                            <th>Place Date</th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr><td colSpan="15" className="text-center my-2">Loading...</td></tr>
                          ) : filteredData.length === 0 ? (
                            <tr><td colSpan="15" className="text-center mb-0">No bets found</td></tr>
                          ) : (
                            filteredData.map((row, idx) => {
                              const pl = computeBetPL(row)
                              // Released = cash returned to wallet that is NOT a win credit:
                              //   • hedge release at placement (lay against existing back, etc.)
                              //   • stake refund on void/cancel
                              // Always show when > 0, even for settled bets, so the
                              // historical hedge release stays visible alongside the bet's P/L.
                              const showReleased = row.refund != null && row.refund > 0
                              return (
                                <tr key={row.id || idx}>
                                  <td>{(currentPage - 1) * entriesPerPage + idx + 1}</td>
                                  <td>{row.match_title || '-'}</td>
                                  <td>{row.market_type || row.fancy_name || row.category || '-'}</td>
                                  <td>{row.selection_name || '-'}</td>
                                  <td>{renderBetTypeBadge(row)}</td>
                                  <td className="text-right">{row.odds || '-'}</td>
                                  <td className="text-right">{formatNum(row.stake_amount)}</td>
                                  <td className="text-right">{row.exposure_held != null ? formatNum(row.exposure_held) : '-'}</td>
                                  <td className="text-right">{row.debit != null ? formatNum(row.debit) : '-'}</td>
                                  <td className="text-right">{row.credit != null ? formatNum(row.credit) : '-'}</td>
                                  <td className="text-right">{showReleased ? formatNum(row.refund) : '-'}</td>
                                  <td className="text-right" style={{ fontWeight: 600 }}>
                                    {pl != null ? formatNum(pl) : '-'}
                                  </td>
                                  <td className="text-right">{row.closing_balance != null ? formatNum(row.closing_balance) : '-'}</td>
                                  <td>{row.result_status || '-'}</td>
                                  <td>{formatDateTime(row.created_at)}</td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                        {filteredData.length > 0 && (
                          <tfoot role="rowgroup">
                            <tr>
                              <td colSpan="6" className="text-right"><strong>Page Totals</strong></td>
                              <td className="text-right"><strong>{formatNum(totalStake)}</strong></td>
                              <td className="text-right">-</td>
                              <td className="text-right"><strong>{formatNum(totalDebit)}</strong></td>
                              <td className="text-right"><strong>{formatNum(totalCredit)}</strong></td>
                              <td className="text-right"><strong>{formatNum(totalRefund)}</strong></td>
                              <td className="text-right"><strong>{formatNum(totalPL)}</strong></td>
                              <td colSpan="3" className="text-right">
                                <strong>Total Records: {totalRecords}</strong>
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                  )}

                  {/* Pagination — only for Bet Wise tab */}
                  {activeTab === 'bet' && totalPages > 1 && (
                    <div className="row pt-3 mt-3 mb-3">
                      <div className="col">
                        <div className="dataTables_paginate paging_simple_numbers float-right">
                          <ul className="pagination pagination-rounded mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => fetchData(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                              >
                                ‹
                              </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(p => Math.abs(p - currentPage) <= 3 || p === 1 || p === totalPages)
                              .map((page, i, arr) => (
                                <li
                                  key={page}
                                  className={`page-item ${currentPage === page ? 'active' : ''}`}
                                >
                                  {i > 0 && page - arr[i - 1] > 1 && (
                                    <span className="page-link">…</span>
                                  )}
                                  <button
                                    className="page-link"
                                    onClick={() => fetchData(page)}
                                  >
                                    {page}
                                  </button>
                                </li>
                              ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => fetchData(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                              >
                                ›
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default UserBetHistory
