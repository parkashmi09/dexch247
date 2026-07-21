import { useState, useEffect } from 'react'
import { getUserExposuresAdmin } from '../services/api'

/** Format number with commas */
function formatNumber(val) {
  if (val == null) return '0.00'
  const num = parseFloat(val)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function UserDetailModal({ user, onClose }) {
  const [exposureData, setExposureData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    const userId = user.user_id || user.staff_id
    if (!userId) return

    setLoading(true)
    getUserExposuresAdmin(userId)
      .then((res) => {
        if (res && res.success && res.exposures) {
          setExposureData(res.exposures)
        } else {
          setExposureData({})
        }
      })
      .catch(() => setExposureData({}))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  // Transform exposure data to the UI format: grouped by match, each match has market-wise rows
  const exposureEntries = Object.entries(exposureData)

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose}></div>
      <div className="modal-dialog modal-big" role="document" style={{ maxWidth: '80%', zIndex: 1050, margin: '1.75rem auto' }}>
        <div className="modal-content" style={{ border: 'none', borderRadius: 0, padding: 0 }}>
          {/* HEADER */}
          <header className="modal-header" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: 0, padding: '12px 16px' }}>
            <h5 className="modal-title" style={{ margin: 0, color: '#fff' }}>Market Analysis</h5>
            <button type="button" className="close" aria-label="Close" onClick={onClose} style={{ color: '#fff', opacity: 1, fontSize: '1.5rem', textShadow: 'none' }}>
              <span aria-hidden="true">&times;</span>
            </button>
          </header>

          {/* BODY */}
          <div className="modal-body" style={{ padding: '1rem', maxHeight: 'calc(100vh - 58px)', overflowX: 'hidden', overflowY: 'auto' }}>
            <div className="search-analysis">
              <div className="row row5">
                {/* GAME DETAIL - col-md-3 */}
                <div className="col-md-3">
                  <div className="block-title"><span>Game Detail</span></div>
                  <div className="analysis-detail">
                    <div className="row row5">
                      <label className="col-md-6"><b>Username</b></label>
                      <div className="col-md-6 text-right"><b title={user.username}>{user.username}</b></div>
                    </div>
                    <div className="row row5">
                      <label className="col-md-6">Account Type</label>
                      <div className="col-md-6 text-right">{user.user_type || 'User'}</div>
                    </div>
                    <div className="row row5">
                      <label className="col-md-6">General</label>
                      <div className="col-md-6 text-right">{formatNumber(user.cash)}</div>
                    </div>
                    <div className="row row5">
                      <label className="col-md-6">Exposure</label>
                      <div className="col-md-6 text-right">{formatNumber(user.total_exposure)}</div>
                    </div>
                    <div className="row row5">
                      <label className="col-md-6">Credit Reference</label>
                      <div className="col-md-6 text-right">{formatNumber(user.cash_received)}</div>
                    </div>
                  </div>
                </div>

                {/* USER LOCK - col-md-4 */}
                <div className="col-md-4">
                  <div className="block-title"><span>User Lock</span></div>
                  <div className="search-analysis-table mb-3">
                    <table className="table" style={{ background: '#3c4146', color: '#fff' }}>
                      <thead>
                        <tr style={{ background: '#3c4146', color: '#fff' }}>
                          <th style={{ color: '#fff' }}>Master Name</th>
                          <th className="text-center" style={{ color: '#fff' }}>User Act</th>
                          <th className="text-center" style={{ color: '#fff' }}>Bet Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ background: '#fff', color: '#333' }}>
                          <td style={{ color: '#333' }}>{user.username || '-'}</td>
                          <td className="text-center">
                            <input type="checkbox" checked={user.status === 'Active' || user.active === true} disabled />
                          </td>
                          <td className="text-center">
                            <input type="checkbox" checked={!user.bet_locked} disabled />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GAME LOCK - col-md-5 */}
                <div className="col-md-5">
                  <div className="block-title"><span>Game Lock</span></div>
                  <div className="search-analysis-table mb-3">
                    <table className="table" style={{ background: '#3c4146', color: '#fff' }}>
                      <thead>
                        <tr style={{ background: '#3c4146', color: '#fff' }}>
                          <th style={{ color: '#fff' }}>S.No.</th>
                          <th style={{ color: '#fff' }}>Master Name</th>
                          <th className="text-center" style={{ color: '#fff' }}>Bet Lock</th>
                          <th style={{ color: '#fff' }}>Event Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="text-center" style={{ background: '#fff', color: '#333' }}>No records found</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* MARKET ANALYSIS DATA */}
              {loading ? (
                <div className="text-center p-3">Loading market analysis...</div>
              ) : exposureEntries.length > 0 ? (
                exposureEntries.map(([matchId, matchData]) => (
                  <div key={matchId} className="market-analysis-container">
                    <div className="market-analysis-title" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <a href="javascript:void(0)" style={{ color: '#fff', textDecoration: 'none' }}>
                          {matchData.match_title || `Match ${matchId}`}
                        </a>
                      </div>
                    </div>
                    <div className="market-analysis-content">
                      <div className="row row5">
                        {Object.entries(matchData.markets || {}).map(([marketName, teams]) => (
                          <div key={marketName} className="col-md-4">
                            <div className="market-analysis-content-detail">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th colSpan={2}>{marketName}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(teams).map(([teamName, amount]) => (
                                    <tr key={teamName}>
                                      <td>{teamName}</td>
                                      <td className="text-right" style={{ color: parseFloat(amount) >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {formatNumber(amount)}
                                      </td>
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
              ) : (
                <div className="text-center p-3" style={{ color: '#888' }}>No active exposures found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
