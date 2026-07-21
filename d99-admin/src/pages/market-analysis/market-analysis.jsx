import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getMarketAnalysis } from '../../services/api'
import loaderGif from '../../assets/loader.gif'
import './style.css'

/** Format API date string to DD/MM/YYYY HH:mm:ss */
function formatEventDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${day}/${month}/${year} ${h}:${m}:${s}`
}

/**
 * Transform API response to UI shape.
 * Supports two formats:
 * 1) event.markets = [{ name, rows: [{ label, value }] }] – use as-is.
 * 2) event.bets = [...] – group by market_type, build rows from bet fields.
 */
function transformMarketAnalysisData(data) {
  if (!data || !Array.isArray(data)) return []
  return data.map((event) => {
    const eventName = event.match_title || `${event.team_one || ''} vs ${event.team_two || ''}`.trim() || 'Match'
    const firstBet = event.bets && event.bets[0]
    const eventDate = event.event_date ? formatEventDate(event.event_date) : (firstBet ? formatEventDate(firstBet.created_at) : '')

    let markets
    if (Array.isArray(event.markets) && event.markets.length > 0 && event.markets[0].rows) {
      markets = event.markets.map((m) => ({
        name: m.name || m.market_name || 'Market',
        rows: (m.rows || []).map((r) => ({
          label: r.label ?? r.selection_name ?? r.run_name ?? '-',
          value: String(r.value ?? r.odds ?? '0.00'),
        })),
      }))
    } else {
      const betsByMarket = (event.bets || []).reduce((acc, bet) => {
        const key = bet.market_type || 'Other'
        if (!acc[key]) acc[key] = []
        acc[key].push(bet)
        return acc
      }, {})
      markets = Object.entries(betsByMarket).map(([name, bets]) => ({
        name,
        rows: bets.map((b) => ({
          label: `${b.selection_name || '-'} @ ${b.odds || '-'}`,
          value: `${b.stake_amount || '0'} / ${b.liability || '0'}`,
        })),
      }))
    }

    return {
      eventName,
      eventDate,
      sportId: String(event.sport_id ?? event.sportId ?? ''),
      eventId: String(event.eventid ?? event.eventId ?? ''),
      marketId: event.market_id ?? event.marketId ?? '0',
      markets,
    }
  })
}

/**
 * Market Analysis Component
 *
 * Displays market analysis data from API.
 */
function MarketAnalysis() {
  const [searchValue, setSearchValue] = useState('')
  const [marketAnalysisList, setMarketAnalysisList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMarketAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMarketAnalysis()
      if (res && res.success && Array.isArray(res.data)) {
        setMarketAnalysisList(transformMarketAnalysisData(res.data))
      } else {
        setMarketAnalysisList([])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load market analysis')
      setMarketAnalysisList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketAnalysis()
  }, [])

  const filteredList = useMemo(() => {
    if (!searchValue.trim()) return marketAnalysisList
    const q = searchValue.trim().toLowerCase()
    return marketAnalysisList.filter((e) => e.eventName.toLowerCase().includes(q))
  }, [marketAnalysisList, searchValue])

  const handleRefresh = () => {
    fetchMarketAnalysis()
  }

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value)
  }

  return (
    <Layout title="Market Analysis - Diamond Admin">
      {/* Full Page Diamond Loader */}
      {loading && (
        <div style={{
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
        }} />
      )}
      <div className="listing-grid">
        <div className="market-analysis">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Market Analysis
                  <i
                    className="fas fa-sync-alt ml-2"
                    style={{ cursor: 'pointer', fontSize: '1rem' }}
                    onClick={handleRefresh}
                    title="Refresh"
                  />
                </h4>
                <div className="page-title-right">
                  <input
                    type="text"
                    name="searchMarktetText"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search Event"
                    className="form-control"
                    style={{ maxWidth: '250px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="market-analysis-container">
              <div className="market-analysis-content p-4" style={{ height: '150px' }}>
              </div>
            </div>
          ) : error ? (
            <div className="market-analysis-container">
              <div className="market-analysis-content p-4 text-center text-danger">
                <i className="fas fa-exclamation-circle fa-2x" />
                <p className="mt-2 mb-0">{error}</p>
              </div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="market-analysis-container">
              <div className="market-analysis-title">
                <div>No events found</div>
              </div>
            </div>
          ) : (
            filteredList.map((event, idx) => (
              <div key={idx} className="market-analysis-container">
                <div className="market-analysis-title">
                  <div>
                    <Link
                      to={`/game-details/${encodeURIComponent(event.sportId)}/${encodeURIComponent(event.eventId)}`}
                      className="ma-link"
                    >
                      {event.eventName}
                    </Link>
                  </div>
                  <div>{event.eventDate}</div>
                </div>
                <div className="market-analysis-content">
                  <div className="row row5">
                    {event.markets.map((market, midx) => (
                      <div key={midx} className="col-lg-4">
                        <div className="market-analysis-content-detail">
                          <table className="table">
                            <thead>
                              <tr>
                                <th colSpan={2}>{market.name}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {market.rows.map((row, ridx) => (
                                <tr key={ridx}>
                                  <td>{row.label}</td>
                                  <td className="text-right">{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

export default MarketAnalysis

