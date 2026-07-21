import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getLastResults, getDetailResults } from '../../apiservices/CasionApi'
import ResultModalLayout from '../../components/resultModalLayout'
import CasinoResultBodyByGameType from '../casinoComponents/casinoResultModal/CasinoResultBodyByGameType'

import './style.css'

// Map API win "1"/"2" to display for table (I/E for Super Over 2/3, A/B for others)
const mapWinDisplay = (win, gameType) => {
  const norm = (gameType || '').toLowerCase().trim()
  if (norm === 'superover2' || norm === 'superover3') {
    return win === '1' ? 'I' : win === '2' ? 'E' : win || '-'
  }
  if (norm === 'race20' || norm === 'race17' || norm === 'vrace17' || norm === 'race2') {
    const suitMap = { '1': 'Spade', '2': 'Heart', '3': 'Club', '4': 'Diamond' }
    return suitMap[win] || win || '-'
  }
  return win === '1' ? 'A' : win === '2' ? 'B' : win || '-'
}

// Game type options for select (value => label), same as admin casino dropdown
const CASINO_OPTIONS = [
  { value: 'teen', label: 'Teenpatti 1-day' },
  { value: 'poker', label: 'Poker 1-Day' },
  { value: '3cardj', label: '3 Cards Judgement' },
  { value: 'aaa', label: 'Amar Akbar Anthony' },
  { value: 'ab20', label: 'Andar Bahar' },
  { value: 'abj', label: 'Andar Bahar 2' },
  { value: 'baccarat', label: 'Baccarat' },
  { value: 'baccarat2', label: 'Baccarat 2' },
  { value: 'btable', label: 'Bollywood Casino' },
  { value: 'card32', label: '32 Cards A' },
  { value: 'card32eu', label: '32 Cards B' },
  { value: 'cmatch20', label: 'Cricket Match 20-20' },
  { value: 'cmeter', label: 'Casino Meter' },
  { value: 'cricketv', label: 'Cricket V' },
  { value: 'cricketv2', label: 'Cricket V2' },
  { value: 'cricketv3', label: '5Five Cricket' },
  { value: 'dt20', label: '20-20 Dragon Tiger' },
  { value: 'dt202', label: '20-20 Dragon Tiger 2' },
  { value: 'dt6', label: '1 Day Dragon Tiger' },
  { value: 'dtl20', label: '20-20 D T L' },
  { value: 'lottcard', label: 'lottcard' },
  { value: 'lucky7', label: 'Lucky 7 - A' },
  { value: 'lucky7eu', label: 'Lucky 7 - B' },
  { value: 'poker20', label: '20-20 Poker' },
  { value: 'poker6', label: 'Poker 6 Players' },
  { value: 'teen20', label: '20-20 Teenpatti' },
  { value: 'teen8', label: 'Teenpatti Open' },
  { value: 'teen9', label: 'Teenpatti Test' },
  { value: 'war', label: 'Casino War' },
  { value: 'worli', label: 'Worli Matka' },
  { value: 'worli2', label: 'Instant Worli' },
  { value: 'teen6', label: 'Teenpatti - 2.0' },
  { value: 'queen', label: 'Queen' },
  { value: 'race20', label: 'Race20' },
  { value: 'pop-the-ball', label: 'Pop The Ball' },
  { value: 'lucky7eu2', label: 'Lucky 7 - C' },
  { value: 'superover', label: 'Super Over' },
  { value: 'trap', label: 'The Trap' },
  { value: 'patti2', label: '2 Cards Teenpatti' },
  { value: 'teensin', label: '29Card Baccarat' },
  { value: 'teenmuf', label: 'Muflis Teenpatti' },
  { value: 'race17', label: 'Race to 17' },
  { value: 'teen20b', label: '20-20 Teenpatti B' },
  { value: 'trio', label: 'Trio' },
  { value: 'notenum', label: 'Note Number' },
  { value: 'teen2024', label: 'Teen 20 24' },
  { value: 'kbc', label: 'K.B.C' },
  { value: 'teen120', label: '1 CARD 20-20' },
  { value: 'teen1', label: '1 CARD ONE-DAY' },
  { value: 'vteen20', label: 'V-20-20 Teenpatti' },
  { value: 'vteen', label: 'V-Teenpatti 1-day' },
  { value: 'vdt6', label: 'V-1 Day Dragon Tiger' },
  { value: 'vdt20', label: 'V-20-20 Dragon Tiger' },
  { value: 'vlucky7', label: 'V-Lucky 7 - A' },
  { value: 'vrace17', label: 'V-Race to 17' },
  { value: 'vteenmuf', label: 'V-Muflis Teenpatti' },
  { value: 'vaaa', label: 'V-Amar Akbar Anthony' },
  { value: 'vbtable', label: 'V-Bollywood Casino' },
  { value: 'vbaccarat', label: 'V-Baccarat' },
  { value: 'vtrio', label: 'V-Trio' },
  { value: 'vtrap', label: 'V-The Trap' },
  { value: 'ab3', label: 'ANDAR BAHAR 50 CARDS' },
  { value: 'vdtl20', label: 'V-20-20 D T L' },
  { value: 'aaa2', label: 'Amar Akbar Anthony 2' },
  { value: 'roulette', label: 'roulette' },
  { value: 'race2', label: 'Race to 2nd' },
  { value: 'teen3', label: 'Instant Teenpatti' },
  { value: 'dum10', label: 'Dus ka Dum' },
  { value: 'cmeter1', label: '1 Card Meter' },
  { value: 'teen32', label: 'instant teenpatti 2.0' },
  { value: 'sicbo', label: 'Sic Bo' },
  { value: 'ballbyball', label: 'Ball By Ball' },
  { value: 'roulette1', label: 'roulette1' },
  { value: 'teen33', label: 'Instant Teenpatti 3.0' },
  { value: 'roulette2', label: 'roulette2' },
  { value: 'superover2', label: 'Super Over2' },
  { value: 'sicbo2', label: 'Sic Bo 2' },
  { value: 'roulette3', label: 'roulette3' },
  { value: 'teen41', label: 'Queen top open teenpatti' },
  { value: 'teen42', label: 'Jack top open teenpatti' },
  { value: 'lucky15', label: 'Lucky 15' },
  { value: 'goal', label: 'Goal' },
  { value: 'ab4', label: 'ANDAR BAHAR 150 CARDS' },
  { value: 'superover3', label: 'mini super over' },
  { value: 'ourroullete', label: 'Unique Roulette' },
  { value: 'teen20c', label: '20-20 Teenpatti C' },
  { value: 'btable2', label: 'Bollywood Casino 2' },
  { value: 'teenjoker', label: 'Teenpatti Joker' },
  { value: 'joker1', label: 'Unlimited Joker One Day' },
  { value: 'joker20', label: 'Teenpatti Joker 20-20' },
  { value: 'joker120', label: 'Unlimited Joker 20-20' },
  { value: 'poison20', label: 'Teenpatti Poison 20-20' },
  { value: 'roulette11', label: 'Golden Roulette' },
  { value: 'teenunique', label: 'Unique Teenpatti' },
  { value: 'poison', label: 'Teenpatti Poison One Day' },
  { value: 'roulette12', label: 'Beach Roulette' },
  { value: 'roulette13', label: 'Regular Roulette' },
  { value: 'pteen', label: 'Premium Teenpatti 1-day' },
  { value: 'pteen20', label: 'Premium 20-20 Teenpatti' },
  { value: 'pdt6', label: 'Premium 1 Day Dragon Tiger' },
  { value: 'pdt20', label: 'Premium 20-20 Dragon Tiger' },
  { value: 'plucky7', label: 'Premium Lucky 7' },
  { value: 'pcard32', label: 'Premium 32 Cards' },
  { value: 'pbaccarat', label: 'Premium Baccarat' },
  { value: 'tteen', label: 'Tembo Teenpatti 1-day' },
  { value: 'tteen20', label: 'Tembo 20-20 Teenpatti' },
  { value: 'tdt6', label: 'Tembo 1 Day Dragon Tiger' },
  { value: 'tdt20', label: 'Tembo 20-20 Dragon Tiger' },
  { value: 'tlucky7', label: 'Tembo Lucky 7' },
  { value: 'tcard32', label: 'Tembo 32 Cards' },
  { value: 'tbaccarat', label: 'Tembo Baccarat' },
  { value: 'lucky5', label: 'Lucky 6' },
  { value: 'mogambo', label: 'Mogambo' },
  { value: 'dolidana', label: 'Dolidana' },
  { value: 'teen20v', label: '20-20 Teenpatti VIP' },
  { value: 'worli3', label: 'Matka' },
  { value: 'teen62', label: 'V VIP Teenpatti 1-day' },
]

/**
 * CasinoResultReport Component
 * 
 * Page for viewing casino result reports with filters and export options.
 * URL: /admin/reports/casinoresult or /admin/reports/casinoresult/:gameName (e.g. /admin/reports/casinoresult/pteen)
 */
function CasinoResultReport() {
  const { gameName } = useParams()
  const navigate = useNavigate()
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [searchValue, setSearchValue] = useState('')
  const [gameType, setGameType] = useState(() =>
    gameName && CASINO_OPTIONS.some((o) => o.value === gameName) ? gameName : 'mogambo'
  )
  const [selectedDate, setSelectedDate] = useState('')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const dateInputRef = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState(null)
  const [detailResult, setDetailResult] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Sync gameType from URL when gameName param changes (e.g. View All from game page)
  useEffect(() => {
    if (gameName && CASINO_OPTIONS.some((o) => o.value === gameName)) {
      setGameType(gameName)
    } else if (!gameName) {
      setGameType('mogambo')
    }
  }, [gameName])

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Initialize date to today
  useEffect(() => {
    const today = new Date()
    setSelectedDate(formatDate(today))
  }, [])

  // Initially load data when page loads and when gameType (or URL gameName) changes
  useEffect(() => {
    if (!gameType) return
    let cancelled = false
    setLoading(true)
    getLastResults(gameType)
      .then((response) => {
        if (cancelled) return
        const res = response?.data?.data?.res
        if (Array.isArray(res)) {
          setTableData(res.map((item) => ({ marketId: item.mid, winner: mapWinDisplay(item.win, gameType) })))
        } else setTableData([])
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error loading data:', err)
          setTableData([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [gameType])

  // Handle calendar icon click to open date picker
  const handleCalendarIconClick = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.showPicker?.() || inputRef.current.click()
    }
  }

  // Load list using same API as game pages (CasionApi last-results)
  const handleSubmit = async () => {
    if (!gameType) return
    setLoading(true)
    try {
      const response = await getLastResults(gameType)
      const res = response?.data?.data?.res
      if (Array.isArray(res)) {
        const mappedData = res.map((item) => ({
          marketId: item.mid,
          winner: mapWinDisplay(item.win, gameType),
        }))
        setTableData(mappedData)
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

  // Filter and paginate (lord-style)
  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return tableData
    const q = searchValue.toLowerCase()
    return tableData.filter(
      (row) =>
        String(row.marketId || '').toLowerCase().includes(q) ||
        String(row.winner || '').toLowerCase().includes(q)
    )
  }, [tableData, searchValue])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage))
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, startIndex + entriesPerPage),
    [filteredData, startIndex, entriesPerPage]
  )

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, entriesPerPage, tableData.length])

  // Click Round Id: fetch detail and show modal (lord-style)
  const handleRoundIdClick = async (roundId) => {
    if (!roundId || roundId === 'N/A' || !gameType) return
    setSelectedRoundId(roundId)
    setShowModal(true)
    setModalLoading(true)
    setDetailResult(null)
    try {
      const response = await getDetailResults(gameType, String(roundId))
      const t1 = response?.data?.data?.t1 ?? response?.data?.t1
      if (t1) setDetailResult(t1)
    } catch (error) {
      console.error('Error fetching detail results:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRoundId(null)
    setDetailResult(null)
  }

  const modalTitle = detailResult?.ename || CASINO_OPTIONS.find((o) => o.value === gameType)?.label || 'Result'

  return (
    <Layout title="Casino Result Report - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Casino Result Report
                </h4>
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  <form method="post" className="ajaxFormSubmit" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="row row5">
                      <div className="col-md-2">
                        <label>Date:</label>
                        <div className="mx-datepicker">
                          <div className="mx-input-wrapper">
                            <input 
                              ref={dateInputRef}
                              name="selectedDate" 
                              type="date" 
                              autoComplete="off" 
                              placeholder="" 
                              className="mx-input form-control"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            <i 
                              className="mx-icon-calendar"
                              onClick={() => handleCalendarIconClick(dateInputRef)}
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
                        <label>Game Type:</label>
                        <select
                          className="form-control"
                          value={gameType}
                          onChange={(e) => {
                            const val = e.target.value
                            setGameType(val)
                            navigate(val ? `/admin/reports/casinoresult/${val}` : '/admin/reports/casinoresult', { replace: true })
                          }}
                        >
                          <option value="">Select Casino</option>
                          {CASINO_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
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
                        id="casinoResultReportTbl" 
                        role="table" 
                        aria-busy={loading}
                        aria-colcount="2"
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
                              <div>Market Id</div>
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="2"
                              className="position-relative"
                            >
                              <div>Winner</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="2" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">Loading...</div>
                                </div>
                              </td>
                            </tr>
                          ) : paginatedData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="2" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">No data available in table</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedData.map((row, index) => (
                              <tr key={row.marketId + '-' + index} role="row" className="">
                                <td aria-colindex="1" role="cell" className="">
                                  <button
                                    type="button"
                                    className="btn btn-link p-0 text-primary text-decoration-none"
                                    onClick={() => handleRoundIdClick(row.marketId)}
                                  >
                                    {row.marketId || '-'}
                                  </button>
                                </td>
                                <td aria-colindex="2" role="cell" className="">
                                  {row.winner ?? '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="row pt-3">
                      <div className="col">
                        <ul
                          role="menubar"
                          aria-label="Pagination"
                          className="pagination pagination-rounded mb-0 justify-content-end"
                        >
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            {currentPage === 1 ? (
                              <span className="page-link">«</span>
                            ) : (
                              <button type="button" className="page-link" onClick={() => setCurrentPage(1)} aria-label="First">«</button>
                            )}
                          </li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            {currentPage === 1 ? (
                              <span className="page-link">‹</span>
                            ) : (
                              <button type="button" className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} aria-label="Previous">‹</button>
                            )}
                          </li>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button
                                type="button"
                                className="page-link"
                                onClick={() => setCurrentPage(page)}
                                aria-label={`Page ${page}`}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            {currentPage === totalPages ? (
                              <span className="page-link">›</span>
                            ) : (
                              <button type="button" className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} aria-label="Next">›</button>
                            )}
                          </li>
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            {currentPage === totalPages ? (
                              <span className="page-link">»</span>
                            ) : (
                              <button type="button" className="page-link" onClick={() => setCurrentPage(totalPages)} aria-label="Last">»</button>
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResultModalLayout
        show={showModal}
        onHide={handleCloseModal}
        title={modalTitle}
        roundId={detailResult?.rid || selectedRoundId || 'N/A'}
        matchTime={detailResult?.mtime || 'N/A'}
        loading={modalLoading}
      >
        <CasinoResultBodyByGameType gameType={gameType} detailResult={detailResult} />
      </ResultModalLayout>
    </Layout>
  )
}

export default CasinoResultReport

