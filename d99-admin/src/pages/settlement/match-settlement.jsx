import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { API_ENDPOINTS } from '../../config/api'
import SettlementModal from '../../components/SettlementModal'

const LIMIT = 100
const DEFAULT_OFFSET = 0

export default function MatchSettlement() {
  const [activeTab, setActiveTab] = useState('MO')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [modalMode, setModalMode] = useState('declare')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await api.get(API_ENDPOINTS.INTERNALSETTLE.MOMATCHES, {
        params: { limit: LIMIT, offset: DEFAULT_OFFSET }
      })
      if (response.data?.success && Array.isArray(response.data.data)) {
        setMatches(response.data.data)
      } else {
        setMatches([])
      }
    } catch (error) {
      if (!silent) console.error('Error fetching MO/BM matches:', error)
      setMatches([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(() => fetchMatches(true), 2000)
    return () => clearInterval(interval)
  }, [])

  const filteredMatches = matches.filter((m) => m.gameType === activeTab)

  const handleDeclare = (row) => {
    setSelectedMatch(row)
    setModalMode('declare')
    setModalShow(true)
  }

  const handleVoid = (row) => {
    setSelectedMatch(row)
    setModalMode('void')
    setModalShow(true)
  }

  const handleSettlementSubmit = async () => {
    setModalShow(false)
    setSelectedMatch(null)
    fetchMatches(true)
  }

  return (
    <Layout title="Match Settlement - Diamond Admin">
      <div className="listing-grid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Match Settlement</h4>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => fetchMatches()}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'MO' ? 'active' : ''}`}
                  onClick={() => setActiveTab('MO')}
                >
                  Match Odds
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'BM' ? 'active' : ''}`}
                  onClick={() => setActiveTab('BM')}
                >
                  Bookmaker
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th className="text-left">Match Title</th>
                        <th className="text-left">Market Type</th>
                        <th className="text-right">Total Bets</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            Loading...
                          </td>
                        </tr>
                      ) : filteredMatches.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            No matches found
                          </td>
                        </tr>
                      ) : (
                        filteredMatches.map((row, index) => (
                          <tr key={`${row.matchId}-${row.eventId}-${row.gameType}-${index}`}>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                              {row.matchTitle ?? `${row.teamOne} vs ${row.teamTwo}`}
                            </td>
                            <td className="font-weight-bold text-truncate" style={{ maxWidth: '150px' }}>
                              {row.marketType}
                            </td>
                            <td className="text-right font-weight-bold">
                              {row.totalBets ?? 0}
                            </td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => handleDeclare(row)}
                                >
                                  Declare
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => handleVoid(row)}
                                >
                                  Void
                                </button>
                              </div>
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

      <SettlementModal
        show={modalShow}
        onHide={() => {
          setModalShow(false)
          setSelectedMatch(null)
        }}
        mode={modalMode}
        match={selectedMatch}
        onSubmit={handleSettlementSubmit}
      />
    </Layout>
  )
}
