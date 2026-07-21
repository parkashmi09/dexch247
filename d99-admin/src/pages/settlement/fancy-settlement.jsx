import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { API_ENDPOINTS } from '../../config/api'
import FancySettlementModal from '../../components/FancySettlementModal'

const LIMIT = 100
const DEFAULT_OFFSET = 0

const MARKETS_FOR_FANCY = [
  '1st Innings 6 Overs Line', '2nd Innings 6 Overs Line', '3rd Innings 6 Overs Line',
  '1st Innings 50 Overs Line', '2nd Innings 50 Overs Line', '3rd Innings 50 Overs Line',
  '1st Innings 40 Overs Line', '2nd Innings 40 Overs Line', '3rd Innings 40 Overs Line',
  '1st Innings 30 Overs Line', '2nd Innings 30 Overs Line', '3rd Innings 30 Overs Line',
  '1st Innings 20 Overs Line', '2nd Innings 20 Overs Line', '3rd Innings 20 Overs Line',
  '1st Innings 10 Overs Line', '2nd Innings 10 Overs Line', '3rd Innings 10 Overs Line',
  'Over By Over', 'Ball By Ball', 'Normal', 'khado', 'meter', 'fancy1', 'oddeven'
]

function getOrderedTabKeys(data) {
  if (!data || typeof data !== 'object') return []
  const keysWithData = Object.keys(data).filter(
    (k) => Array.isArray(data[k]) && data[k].length > 0
  )
  const ordered = []
  for (const name of MARKETS_FOR_FANCY) {
    if (keysWithData.includes(name)) ordered.push(name)
  }
  if (keysWithData.includes('others')) ordered.push('others')
  for (const k of keysWithData) {
    if (!ordered.includes(k)) ordered.push(k)
  }
  return ordered
}

export default function FancySettlement() {
  const [fancyData, setFancyData] = useState(null)
  const [tabKeys, setTabKeys] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [modalMode, setModalMode] = useState('declare')
  const [selectedRow, setSelectedRow] = useState(null)

  const fetchFanmatches = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await api.get(API_ENDPOINTS.INTERNALSETTLE.FANMATCHES, {
        params: { limit: LIMIT, offset: DEFAULT_OFFSET }
      })
      if (response.data?.success && response.data.data && typeof response.data.data === 'object') {
        const data = response.data.data
        setFancyData(data)
        const ordered = getOrderedTabKeys(data)
        setTabKeys(ordered)
        setActiveTab((prev) => (ordered.length > 0 && !ordered.includes(prev) ? ordered[0] : prev))
      } else {
        setFancyData({})
        setTabKeys([])
      }
    } catch (error) {
      if (!silent) console.error('Error fetching fancy matches:', error)
      setFancyData({})
      setTabKeys([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchFanmatches()
    const interval = setInterval(() => fetchFanmatches(true), 2000)
    return () => clearInterval(interval)
  }, [])

  const rows = (activeTab && fancyData && Array.isArray(fancyData[activeTab]))
    ? fancyData[activeTab]
    : []

  const handleDeclare = (row) => {
    setSelectedRow({ ...row, marketType: row.marketType || activeTab })
    setModalMode('declare')
    setModalShow(true)
  }

  const handleVoid = (row) => {
    setSelectedRow({ ...row, marketType: row.marketType || activeTab })
    setModalMode('void')
    setModalShow(true)
  }

  const handleSubmit = async () => {
    setModalShow(false)
    setSelectedRow(null)
    fetchFanmatches(true)
  }

  return (
    <Layout title="Fancy Settlement - Diamond Admin">
      <div className="listing-grid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Fancy Settlement</h4>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => fetchFanmatches()}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {tabKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`btn btn-sm ${activeTab === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab(key)}
                >
                  {key}
                </button>
              ))}
            </div>
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
                        <th className="text-left">
                          {MARKETS_FOR_FANCY.includes(activeTab) ? 'Market Name' : 'Market Type'}
                        </th>
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
                      ) : rows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            No matches found
                          </td>
                        </tr>
                      ) : (
                        rows.map((row, index) => (
                          <tr key={`${row.matchId}-${row.eventId}-${index}`}>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                              {row.matchTitle ?? '-'}
                            </td>
                            <td className="font-weight-bold text-truncate" style={{ maxWidth: '180px' }}>
                              {MARKETS_FOR_FANCY.includes(activeTab)
                                ? (row.selectionName || '-')
                                : (row.marketType ?? activeTab ?? '-')}
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

      <FancySettlementModal
        show={modalShow}
        onHide={() => {
          setModalShow(false)
          setSelectedRow(null)
        }}
        mode={modalMode}
        row={selectedRow}
        onSubmit={handleSubmit}
      />
    </Layout>
  )
}
