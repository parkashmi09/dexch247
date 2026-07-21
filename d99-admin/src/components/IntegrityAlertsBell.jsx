import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Badge, Spinner } from 'react-bootstrap'
import { FiBell, FiRefreshCw, FiClock, FiCheckCircle, FiX } from 'react-icons/fi'
import { getIntegrityAlerts, runIntegrityScan } from '../apiservices/systemTrackerApi'
import './integrityBell.css'

const POLL_MS = 60000
const STALE_MS = 5 * 60 * 1000

// Mother-admin (owner) notification bell: red badge = flagged-user count; modal lists
// each flagged user + failed checks; "View" deep-links into the System Tracker.
export default function IntegrityAlertsBell() {
  const navigate = useNavigate()
  const [data, setData] = useState({ count: 0, users: [], lastScan: null })
  const [show, setShow] = useState(false)
  const [scanning, setScanning] = useState(false)

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getIntegrityAlerts()
      if (res?.success) {
        setData(res)
        // trigger a scan only if the cache is stale (worker usually keeps it fresh)
        const stale = !res.lastScan || (Date.now() - new Date(res.lastScan).getTime() > STALE_MS)
        if (stale && !scanning) rescan(true)
      }
    } catch { /* ignore (e.g. non-owner 403) */ }
  }, [scanning]) // eslint-disable-line react-hooks/exhaustive-deps

  const rescan = useCallback(async (silent) => {
    if (!silent) setScanning(true)
    try {
      const res = await runIntegrityScan()
      if (res?.success) setData(res)
    } catch { /* ignore */ } finally { if (!silent) setScanning(false) }
  }, [])

  useEffect(() => {
    fetchAlerts()
    const t = setInterval(fetchAlerts, POLL_MS)
    return () => clearInterval(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const view = (u) => { setShow(false); navigate(`/admin/system-tracker?user=${encodeURIComponent(u.username || u.user_id)}`) }

  return (
    <>
      <button className="st-bell header-item" title="Integrity alerts" onClick={() => setShow(true)}>
        <FiBell size={18} />
        {data.count > 0 && <span className="st-bell-badge">{data.count}</span>}
      </button>

      <Modal show={show} onHide={() => setShow(false)} centered size="lg" dialogClassName="st-bell-modal">
        <Modal.Header className="st-bm-head">
          <Modal.Title>
            <FiBell className="me-2" /> Integrity Alerts
            {data.count > 0
              ? <Badge bg="danger" pill className="ms-2">{data.count} flagged</Badge>
              : <Badge bg="success" pill className="ms-2">all clear</Badge>}
          </Modal.Title>
          <button type="button" className="st-bm-close" aria-label="Close" onClick={() => setShow(false)}>
            <FiX size={20} />
          </button>
        </Modal.Header>
        <Modal.Body className="st-bm-body">
          {data.users?.length ? data.users.map((u) => {
            const hasHigh = u.issues.some((i) => i.severity === 'high')
            return (
              <div className={`st-au ${hasHigh ? 'high' : 'review'}`} key={u.user_id}>
                <div className="st-au-bar" />
                <div className="st-au-main">
                  <div className="st-au-top">
                    <div className="st-au-id">
                      <span className="st-au-avatar">{(u.username || String(u.user_id)).slice(0, 1).toUpperCase()}</span>
                      <div>
                        <div className="st-au-name">{u.username || u.user_id}</div>
                        <div className="st-au-meta">#{u.user_id} · {u.role || '—'}</div>
                      </div>
                    </div>
                    <Button size="sm" variant={hasHigh ? 'danger' : 'outline-secondary'} onClick={() => view(u)}>View →</Button>
                  </div>
                  <div className="st-au-issues">
                    {u.issues.map((i) => (
                      <div className="st-au-issue" key={i.key}>
                        <span className={`st-dot ${i.severity}`} />
                        <span className="st-au-issue-label">{i.label}</span>
                        {i.detail && <span className="st-au-issue-detail">{i.detail}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="st-bm-empty">
              <FiCheckCircle />
              <div className="st-bm-empty-title">No integrity issues</div>
              <div className="st-bm-empty-sub">Every account reconciles — wallet, P&amp;L and exposure are intact.</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between st-bm-foot">
          <small className="text-muted"><FiClock className="me-1" />{data.lastScan ? `Last scan ${new Date(data.lastScan).toLocaleString()}` : 'Not scanned yet'}</small>
          <Button size="sm" variant="primary" disabled={scanning} onClick={() => rescan(false)}>
            {scanning ? <Spinner size="sm" animation="border" /> : <><FiRefreshCw className="me-1" /> Re-scan now</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
