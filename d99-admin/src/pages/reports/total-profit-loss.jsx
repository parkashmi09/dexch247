import { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Layout from '../../components/Layout'
import { getTotalProfitLoss } from '../../services/api'
import userService from '../../services/userService'
import loaderGif from '../../assets/loader.gif'

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z" />
  </svg>
)
import './style.css'

/**
 * Total Profit Loss – report with Sports, Casino, Third Party tables.
 * Filters: Search By Client Name, Date Range, Type. Buttons: Load, Reset, Excel, PDF.
 */
function TotalProfitLoss() {
  const [reportType, setReportType] = useState('0') // 0 All, 2 Sports, 3 Casino, 4 Third Party
  const [clientSearch, setClientSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [sportsData, setSportsData] = useState([])
  const [casinoData, setCasinoData] = useState([])
  const [thirdPartyData, setThirdPartyData] = useState([])
  const [sportsTotal, setSportsTotal] = useState('0.00')
  const [casinoTotal, setCasinoTotal] = useState('0.00')
  const [thirdPartyTotal, setThirdPartyTotal] = useState('0.00')
  const [clientOptions, setClientOptions] = useState([])
  const fromDateRef = useRef(null)
  const toDateRef = useRef(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await userService.getAllDetails(1, 500)
        if (res?.success && Array.isArray(res.data)) {
          setClientOptions(res.data.map(u => u.username).filter(Boolean))
        }
      } catch (err) {
        console.error('Failed to load client list:', err)
      }
    }
    fetchClients()
  }, [])

  const openDatePicker = (ref) => {
    if (ref?.current) ref.current.showPicker?.() || ref.current.click()
  }

  const handleLoad = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      const params = {}
      if (clientSearch && clientSearch !== 'all') params.clientName = clientSearch
      if (clientSearch === 'all') params.clientName = 'all'
      if (dateFrom) params.fromDate = dateFrom
      if (dateTo) params.toDate = dateTo
      if (reportType !== '0') params.type = reportType

      const res = await getTotalProfitLoss(params)
      if (res?.success) {
        const s = res.sports || []
        const c = res.casino || []
        const t = res.thirdParty || []
        setSportsData(s)
        setCasinoData(c)
        setThirdPartyData(t)
        setSportsTotal(formatNum(s.reduce((acc, r) => acc + (parseFloat(r.profit_loss) || 0), 0)))
        setCasinoTotal(formatNum(c.reduce((acc, r) => acc + (parseFloat(r.profit_loss) || 0), 0)))
        setThirdPartyTotal(formatNum(t.reduce((acc, r) => acc + (parseFloat(r.profit_loss) || 0), 0)))
      }
    } catch (err) {
      console.error('Failed to load profit loss:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = (e) => {
    e?.preventDefault()
    setClientSearch('')
    setDateFrom('')
    setDateTo('')
    setReportType('0')
    setTableSearch('')
    setSportsData([])
    setCasinoData([])
    setThirdPartyData([])
    setSportsTotal('0.00')
    setCasinoTotal('0.00')
    setThirdPartyTotal('0.00')
  }

  const formatNum = (val) => {
    const n = parseFloat(val)
    return Number.isNaN(n) ? '0.00' : Number(n).toFixed(2)
  }

  const hasData = sportsData.length > 0 || casinoData.length > 0 || thirdPartyData.length > 0

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()
    if (sportsData.length > 0) {
      const rows = [['Event Name', 'Game Type', 'Opening', 'Closing', 'Profit/Loss'],
        ...sportsData.map(r => [r.event_name, r.game_type, formatNum(r.opening), formatNum(r.closing), formatNum(r.profit_loss)]),
        ['', '', '', 'Total Profit/Loss', sportsTotal]]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sports')
    }
    if (casinoData.length > 0) {
      const rows = [['Casino Name', 'Opening', 'Closing', 'Profit/Loss'],
        ...casinoData.map(r => [r.casino_name, formatNum(r.opening), formatNum(r.closing), formatNum(r.profit_loss)]),
        ['', '', 'Total Profit/Loss', casinoTotal]]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Casino')
    }
    if (thirdPartyData.length > 0) {
      const rows = [['Third Party Name', 'Opening', 'Closing', 'Profit/Loss'],
        ...thirdPartyData.map(r => [r.third_party_name, formatNum(r.opening), formatNum(r.closing), formatNum(r.profit_loss)]),
        ['', '', 'Total Profit/Loss', thirdPartyTotal]]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Third Party')
    }
    XLSX.writeFile(wb, 'total-profit-loss.xlsx')
  }

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape')
    let startY = 15
    if (sportsData.length > 0) {
      doc.text('Sports Report', 14, startY)
      autoTable(doc, {
        head: [['Event Name', 'Game Type', 'Opening', 'Closing', 'Profit/Loss']],
        body: [
          ...sportsData.map(r => [r.event_name, r.game_type, formatNum(r.opening), formatNum(r.closing), formatNum(r.profit_loss)]),
          [{ content: 'Total Profit/Loss', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: sportsTotal, styles: { fontStyle: 'bold' } }]
        ],
        startY: startY + 5,
        styles: { fontSize: 8 },
      })
      startY = doc.lastAutoTable.finalY + 10
    }
    if (casinoData.length > 0) {
      doc.text('Casino Report', 14, startY)
      autoTable(doc, {
        head: [['Casino Name', 'Opening', 'Closing', 'Profit/Loss']],
        body: [
          ...casinoData.map(r => [r.casino_name, formatNum(r.opening), formatNum(r.closing), formatNum(r.profit_loss)]),
          [{ content: 'Total Profit/Loss', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: casinoTotal, styles: { fontStyle: 'bold' } }]
        ],
        startY: startY + 5,
        styles: { fontSize: 8 },
      })
      startY = doc.lastAutoTable.finalY + 10
    }
    if (thirdPartyData.length > 0) {
      doc.text('Third Party Report', 14, startY)
      autoTable(doc, {
        head: [['Third Party Name', 'Opening', 'Closing', 'Profit/Loss']],
        body: [
          ...thirdPartyData.map(r => [r.third_party_name, formatNum(r.opening), formatNum(r.closing), formatNum(r.profit_loss)]),
          [{ content: 'Total Profit/Loss', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: thirdPartyTotal, styles: { fontStyle: 'bold' } }]
        ],
        startY: startY + 5,
        styles: { fontSize: 8 },
      })
    }
    doc.save('total-profit-loss.pdf')
  }

  return (
    <Layout title="Total Profit Loss - Diamond Admin">
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
                <h4 className="mb-0 font-size-18">Total Profit Loss</h4>
                <div className="page-title-right" />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="report-form mb-3">
                    <form method="post" className="ajaxFormSubmit" onSubmit={handleLoad}>
                      <div className="row row5">
                        <div className="col-lg-3">
                          <div className="form-group">
                            <label htmlFor="tpl-client">Search By Client Name</label>
                            <select
                              id="tpl-client"
                              className="form-control"
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                            >
                              <option value="">Select option</option>
                              <option value="all">All</option>
                              {clientOptions.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <label>From Date</label>
                          <div className="mx-datepicker">
                            <div className="mx-input-wrapper">
                              <input
                                ref={fromDateRef}
                                type="date"
                                autoComplete="off"
                                placeholder=""
                                className="mx-input form-control"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                              />
                              <i
                                className="mx-icon-calendar"
                                onClick={() => openDatePicker(fromDateRef)}
                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                                role="button"
                                aria-label="Open calendar"
                              >
                                <CalendarIcon />
                              </i>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <label>To Date</label>
                          <div className="mx-datepicker">
                            <div className="mx-input-wrapper">
                              <input
                                ref={toDateRef}
                                type="date"
                                autoComplete="off"
                                placeholder=""
                                className="mx-input form-control"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                              />
                              <i
                                className="mx-icon-calendar"
                                onClick={() => openDatePicker(toDateRef)}
                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                                role="button"
                                aria-label="Open calendar"
                              >
                                <CalendarIcon />
                              </i>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-2">
                          <div className="form-group">
                            <label>Type</label>
                            <select
                              className="form-control"
                              value={reportType}
                              onChange={(e) => setReportType(e.target.value)}
                            >
                              <option value="0">All</option>
                              <option value="2">Sports Report</option>
                              <option value="3">Casino Report</option>
                              <option value="4">Third Party Casino Report</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="row row5">
                        <div className="col-lg-3">
                          <button type="submit" id="loaddata" className="btn btn-primary">
                            Load
                          </button>
                          <button type="button" id="reset" className="btn btn-light ml-2" onClick={handleReset}>
                            Reset
                          </button>
                          <button type="button" className={`btn btn-success ml-2${hasData ? '' : ' disabled'}`} disabled={!hasData} onClick={handleExportExcel}>
                            <i className="fas fa-file-excel" />
                          </button>
                          <button type="button" className={`btn btn-danger ml-2${hasData ? '' : ' disabled'}`} disabled={!hasData} onClick={handleExportPDF}>
                            <i className="fas fa-file-pdf" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="row">
                    <div className="col-6" />
                    <div className="col-6 text-right">
                      <div id="tickets-table_filter" className="dataTables_filter text-md-right">
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

                  <div className="profitLoss">
                    <div className="table-responsive mb-0">
                      <div>
                        <div style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Sports Report</div>
                        <div className="table no-footer table-hover table-responsive-sm">
                          <table role="table" aria-busy={loading} aria-colcount={5} className="table b-table table-bordered" id="tpl-sports-tbl">
                            <thead role="rowgroup" className="">
                              <tr role="row" className="">
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={1} aria-sort="none" className="position-relative"><div>Event Name</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={2} aria-sort="none" className="position-relative"><div>Game Type</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={3} aria-sort="none" className="position-relative text-right"><div>Opening</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={4} aria-sort="none" className="position-relative text-right"><div>Closing</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={5} aria-sort="none" className="position-relative text-right"><div>Profit/Loss</div><span className="sr-only"> (Click to sort ascending)</span></th>
                              </tr>
                            </thead>
                        <tbody role="rowgroup">
                          {sportsData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="5" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            sportsData.map((row, idx) => (
                              <tr key={row.id || idx} role="row" className="">
                                <td role="cell">{row.event_name || '-'}</td>
                                <td role="cell">{row.game_type || '-'}</td>
                                <td role="cell" className="text-right">{formatNum(row.opening)}</td>
                                <td role="cell" className="text-right">{formatNum(row.closing)}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.profit_loss) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.profit_loss)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot role="rowgroup" className="">
                          <tr>
                            <td colSpan="4" className="text-right"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right"><strong>{sportsTotal}</strong></td>
                          </tr>
                        </tfoot>
                          </table>
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Casino Report</div>
                        <div className="table table-hover table-responsive-sm">
                          <table role="table" aria-busy={loading} aria-colcount={4} className="table b-table table-bordered" id="tpl-casino-tbl">
                            <thead role="rowgroup" className="">
                              <tr role="row" className="">
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={1} aria-sort="none" className="position-relative"><div>Casino Name</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={2} aria-sort="none" className="position-relative text-right"><div>Opening</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={3} aria-sort="none" className="position-relative text-right"><div>Closing</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={4} aria-sort="none" className="position-relative text-right"><div>Profit/Loss</div><span className="sr-only"> (Click to sort ascending)</span></th>
                              </tr>
                            </thead>
                        <tbody role="rowgroup">
                          {casinoData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="4" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            casinoData.map((row, idx) => (
                              <tr key={row.id || idx} role="row" className="">
                                <td role="cell">{row.casino_name || '-'}</td>
                                <td role="cell" className="text-right">{formatNum(row.opening)}</td>
                                <td role="cell" className="text-right">{formatNum(row.closing)}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.profit_loss) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.profit_loss)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot role="rowgroup" className="">
                          <tr>
                            <td colSpan="3" className="text-right"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right"><strong>{casinoTotal}</strong></td>
                          </tr>
                        </tfoot>
                          </table>
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Third Party Report</div>
                        <div className="table no-footer table-hover table-responsive-sm">
                          <table role="table" aria-busy={loading} aria-colcount={4} className="table b-table table-bordered" id="tpl-thirdparty-tbl">
                            <thead role="rowgroup" className="">
                              <tr role="row" className="">
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={1} aria-sort="none" className="position-relative"><div>Third Party Name</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={2} aria-sort="none" className="position-relative text-right"><div>Opening</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={3} aria-sort="none" className="position-relative text-right"><div>Closing</div><span className="sr-only"> (Click to sort ascending)</span></th>
                                <th role="columnheader" scope="col" tabIndex={0} aria-colindex={4} aria-sort="none" className="position-relative text-right"><div>Profit/Loss</div><span className="sr-only"> (Click to sort ascending)</span></th>
                              </tr>
                            </thead>
                        <tbody role="rowgroup">
                          {thirdPartyData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="4" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">There are no records to show</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            thirdPartyData.map((row, idx) => (
                              <tr key={row.id || idx} role="row" className="">
                                <td role="cell">{row.third_party_name || '-'}</td>
                                <td role="cell" className="text-right">{formatNum(row.opening)}</td>
                                <td role="cell" className="text-right">{formatNum(row.closing)}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.profit_loss) < 0 ? 'text-danger' : 'text-success'}`}>{formatNum(row.profit_loss)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot role="rowgroup" className="">
                          <tr>
                            <td colSpan="3" className="text-right"><strong>Total Profit/Loss</strong></td>
                            <td className="text-right"><strong>{thirdPartyTotal}</strong></td>
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
        </div>
      </div>
    </Layout>
  )
}

export default TotalProfitLoss
