import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Container, Row, Col, Card, Badge, Accordion, Table, Form, Button,
  Spinner, InputGroup, ListGroup, Tab, Tabs,
} from 'react-bootstrap'
import {
  FiSearch, FiCheckCircle, FiXCircle, FiInfo, FiShield, FiCreditCard,
  FiTrendingUp, FiTarget, FiClock, FiAlertTriangle, FiActivity, FiGrid, FiZap,
} from 'react-icons/fi'
import Layout from '../../components/Layout'
import { searchTrackedUsers, getUserReport } from '../../apiservices/systemTrackerApi'
import './style.css'

const money = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const Money = ({ v, sign }) => {
  const n = Number(v)
  const cls = n < 0 ? 'st-neg' : (sign && n > 0 ? 'st-pos' : '')
  return <span className={cls}>{sign && n > 0 ? '+' : ''}{money(v)}</span>
}

const CAT_ICON = { wallet: FiCreditCard, pnl: FiTrendingUp, exposure: FiTarget, sports: FiActivity, casino: FiGrid, jsgames: FiZap }

function StatusBadge({ rule }) {
  if (rule.info) return <Badge bg={rule.pass ? 'light' : 'warning'} text={rule.pass ? 'dark' : undefined} className="st-pill">{rule.pass ? 'advisory' : 'review'}</Badge>
  if (rule.count != null && rule.count > 0) return <Badge bg="danger" className="st-pill">{rule.count} issue{rule.count > 1 ? 's' : ''}</Badge>
  return rule.pass
    ? <Badge bg="success" className="st-pill"><FiCheckCircle /> pass</Badge>
    : <Badge bg="danger" className="st-pill"><FiXCircle /> fail</Badge>
}

// one rule row: concept label + 3 columns (expected / actual / difference) + status,
// with an optional nested sub-list (market-wise breakdown / offending bets).
function RuleRow({ rule }) {
  const [open, setOpen] = useState(false)
  const hasSubs = rule.subs && rule.subs.length > 0
  const isMoney = rule.count == null // settlement rules use counts, not money
  return (
    <div className={`st-rule ${!rule.pass && !rule.info ? 'st-rule-bad' : ''}`}>
      <div className="st-rule-main" onClick={() => hasSubs && setOpen(!open)} style={{ cursor: hasSubs ? 'pointer' : 'default' }}>
        <div className="st-rule-label">
          {hasSubs && <span className={`st-caret ${open ? 'open' : ''}`}>▸</span>}
          {rule.label}
        </div>
        {isMoney ? (
          <div className="st-rule-cols">
            <span className="st-col"><em>expected</em><b><Money v={rule.expected} /></b></span>
            <span className="st-col"><em>actual</em><b><Money v={rule.actual} /></b></span>
            <span className="st-col"><em>difference</em><b className={Number(rule.diff) ? 'st-neg' : 'st-pos'}><Money v={rule.diff} /></b></span>
            <StatusBadge rule={rule} />
          </div>
        ) : (
          <StatusBadge rule={rule} />
        )}
      </div>
      {hasSubs && open && (
        <div className="st-subs">
          <Table size="sm" className="mb-0">
            <tbody>
              {rule.subs.map((s, i) => (
                <tr key={i} className={s.pass === false ? 'st-sub-bad' : ''}>
                  <td className="st-sub-label">{s.label}</td>
                  {s.note ? <td colSpan={3} className="st-sub-note">{s.note}</td> : <>
                    <td className="text-end"><Money v={s.expected} /></td>
                    <td className="text-end"><Money v={s.actual} /></td>
                    <td className="text-end"><Money v={s.diff} /></td>
                  </>}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default function SystemTracker() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const boxRef = useRef(null)
  // wallet history — date range only (it's a full wallet passbook, not a bet filter)
  const [fFrom, setFFrom] = useState('')
  const [fTo, setFTo] = useState('')

  const load = useCallback(async (idOrName) => {
    if (!idOrName) return
    setLoading(true); setError(''); setShowDrop(false)
    try {
      const data = await getUserReport(idOrName)
      if (data.success === false || data.found === false) { setError(data.error || 'Account not found'); setReport(null) }
      else setReport(data)
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load report'); setReport(null)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { const u = params.get('user'); if (u) { setQuery(u); load(u) } }, []) // eslint-disable-line

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try { const d = await searchTrackedUsers(query.trim()); setResults(d.results || []); setShowDrop(true) } catch { /* */ }
    }, 220)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const pick = (u) => { const v = u.username || String(u.user_id); setQuery(v); setParams({ user: v }); load(v) }
  const snap = report?.snapshot

  const RESULT_VARIANT = { won: 'success', lost: 'danger', loss: 'danger', void: 'secondary', refund: 'warning', pending: 'light' }
  const tally = report?.walletTally
  // money-integrity categories stay as accordions; settlement (sports/casino) goes in tabs
  const SETTLE_KEYS = ['sports', 'casino', 'jsgames']
  const integrityCats = (report?.categories || []).filter((c) => !SETTLE_KEYS.includes(c.key))
  const settleCats = (report?.categories || []).filter((c) => SETTLE_KEYS.includes(c.key))
  const fromT = fFrom ? new Date(fFrom + 'T00:00:00').getTime() : null
  const toT = fTo ? new Date(fTo + 'T23:59:59').getTime() : null
  const filteredHistory = (report?.history || []).filter((h) => {
    if (h.opening) return true // always show the opening balance row
    const t = h.ts ? new Date(h.ts).getTime() : null
    if (fromT && t != null && t < fromT) return false
    if (toT && t != null && t > toT) return false
    return true
  })

  const STATS = snap ? [
    { label: 'Total Balance', val: snap.total_balance, icon: FiCreditCard },
    { label: 'Available Balance', val: snap.available_balance, icon: FiCreditCard },
    { label: 'Locked (exposure)', val: snap.locked_exposure, icon: FiTarget },
    { label: 'Profit / Loss', val: snap.profit_loss, icon: FiTrendingUp, sign: true },
    { label: 'Net Exposure', val: snap.net_exposure, icon: FiTarget },
  ] : []

  return (
    <Layout>
      <Container fluid className="st-page">
        <div className="st-title"><h4><FiShield /> System Tracker <small>wallet · P&amp;L · exposure integrity</small></h4></div>

        {/* search */}
        <Card className="st-card st-search-card">
          <Card.Body>
            <div ref={boxRef} className="st-search">
              <InputGroup>
                <InputGroup.Text><FiSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search user / staff / owner — username or id (min 2 chars)…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => results.length && setShowDrop(true)}
                  onKeyDown={(e) => e.key === 'Enter' && load(query.trim())}
                />
                <Button variant="primary" onClick={() => load(query.trim())}>Verify</Button>
              </InputGroup>
              {showDrop && results.length > 0 && (
                <ListGroup className="st-drop">
                  {results.map((u) => (
                    <ListGroup.Item action key={`${u.kind}-${u.user_id}`} onClick={() => pick(u)}>
                      <b>{u.username || u.user_id}</b> <span className="text-muted">#{u.user_id} · {u.role}</span>
                      <Badge bg={u.kind === 'user' ? 'info' : u.kind === 'owner' ? 'dark' : 'secondary'} className="float-end">{u.kind}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </Card.Body>
        </Card>

        {loading && <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>}
        {error && <Card className="st-card mt-3"><Card.Body className="text-danger d-flex align-items-center gap-2"><FiXCircle /> {error}</Card.Body></Card>}

        {!loading && report && snap && (
          <>
            {/* verdict banner */}
            <div className={`st-verdict-banner ${report.allPass ? 'ok' : 'bad'}`}>
              {report.allPass ? <FiCheckCircle /> : <FiXCircle />}
              <div>
                <div className="st-vb-title">{report.allPass ? 'All integrity checks pass' : 'Integrity issue detected'}</div>
                <div className="st-vb-sub">{snap.username} <span className="text-muted">#{snap.user_id} · {snap.role}</span> <Badge bg={snap.kind === 'user' ? 'info' : 'dark'}>{snap.kind}</Badge></div>
              </div>
            </div>

            {/* snapshot stat cards */}
            <Row className="st-stats">
              {STATS.map((s) => {
                const Ic = s.icon
                return (
                  <Col xs={6} md={4} lg key={s.label}>
                    <div className="st-stat"><div className="st-stat-ic"><Ic /></div>
                      <div><div className="st-stat-label">{s.label}</div><div className="st-stat-val"><Money v={s.val} sign={s.sign} /></div></div>
                    </div>
                  </Col>
                )
              })}
            </Row>

            {/* money-integrity categories → sub-rules accordion */}
            <div className="st-section-label">Money integrity</div>
            <Accordion alwaysOpen defaultActiveKey={integrityCats.map((_, i) => String(i))} className="st-cats">
              {integrityCats.map((cat, i) => {
                const Ic = CAT_ICON[cat.key] || FiShield
                return (
                  <Accordion.Item eventKey={String(i)} key={cat.key} className={!cat.pass ? 'st-cat-bad' : ''}>
                    <Accordion.Header>
                      <span className="st-cat-head"><Ic className="st-cat-ic" /> {cat.label}</span>
                      <span className="st-cat-badge">
                        {cat.pass ? <Badge bg="success"><FiCheckCircle /> clean</Badge> : <Badge bg="danger"><FiXCircle /> issue</Badge>}
                      </span>
                    </Accordion.Header>
                    <Accordion.Body className="p-0">
                      {cat.rules.map((r, j) => <RuleRow key={j} rule={r} />)}
                      {cat.rules.length === 0 && <div className="p-3 text-muted">No bets in this category.</div>}
                    </Accordion.Body>
                  </Accordion.Item>
                )
              })}
            </Accordion>

            {/* settlement → Sports / Casino tabs */}
            {settleCats.length > 0 && <div className="st-section-label">Settlement &amp; results</div>}
            {settleCats.length > 0 && (
              <Card className="st-card st-settle-card">
                <Card.Header className="st-card-head"><FiTarget className="st-cat-ic" /> Settlement</Card.Header>
                <Card.Body className="p-0">
                  <Tabs defaultActiveKey={settleCats[0].key} className="st-settle-tabs" mountOnEnter>
                    {settleCats.map((cat) => {
                      const Ic = CAT_ICON[cat.key] || FiShield
                      return (
                        <Tab key={cat.key} eventKey={cat.key} title={
                          <span className="st-tab-title">
                            <Ic /> {cat.label}
                            {typeof cat.betCount === 'number' && <span className="st-tab-count">{cat.betCount}</span>}
                            {cat.pass
                              ? <Badge bg="success" pill className="st-tab-badge"><FiCheckCircle /></Badge>
                              : <Badge bg="danger" pill className="st-tab-badge"><FiXCircle /></Badge>}
                          </span>
                        }>
                          {cat.rules.map((r, j) => <RuleRow key={j} rule={r} />)}
                          {cat.rules.length === 0 && <div className="p-3 text-muted">No {cat.label.toLowerCase()} bets for this account.</div>}
                        </Tab>
                      )
                    })}
                  </Tabs>
                </Card.Body>
              </Card>
            )}

            {/* full wallet passbook — opening → every movement → running balance */}
            <Card className="st-card mt-3">
              <Card.Header className="st-card-head st-hist-head">
                <span><FiClock /> Wallet History <Badge bg="secondary">{filteredHistory.length}/{report.historyCount}</Badge></span>
                <div className="st-hist-filters">
                  <span className="st-date-lbl">From</span>
                  <Form.Control size="sm" type="date" value={fFrom} max={fTo || undefined} onChange={(e) => setFFrom(e.target.value)} />
                  <span className="st-date-lbl">To</span>
                  <Form.Control size="sm" type="date" value={fTo} min={fFrom || undefined} onChange={(e) => setFTo(e.target.value)} />
                  {(fFrom || fTo) && <Button size="sm" variant="outline-secondary" onClick={() => { setFFrom(''); setFTo('') }}>Clear</Button>}
                </div>
              </Card.Header>

              {/* tally banner — hard money conservation (every rupee accounted) */}
              {tally && (
                <div className={`st-tally ${tally.reconciles ? 'ok' : 'bad'}`}>
                  {tally.reconciles ? <FiCheckCircle /> : <FiAlertTriangle />}
                  <span className="st-tally-eq">
                    Total <b><Money v={tally.total} /></b> = Available <b><Money v={tally.available} /></b> + Locked <b><Money v={tally.locked} /></b>
                  </span>
                  <span className="st-tally-verdict">
                    {tally.reconciles ? 'Tally OK — every rupee accounted' : `Discrepancy: ${tally.diff} unaccounted`}
                  </span>
                </div>
              )}

              <Card.Body className="p-0">
                <Table hover responsive className="st-hist mb-0">
                  <thead><tr><th>Time</th><th>Result</th><th>Description</th><th className="text-end">Amount</th><th className="text-end">In / Out</th><th className="text-end">Balance</th></tr></thead>
                  <tbody>
                    {filteredHistory.map((h) => (
                      <tr key={h.id} className={h.opening ? 'st-row-open' : ((h.tallyBreak || h.payoutMismatch) ? 'st-row-bad' : (h.cash ? 'st-row-cash' : ''))}>
                        <td className="st-mono st-nowrap">{h.ts ? new Date(h.ts).toLocaleString() : (h.opening ? 'Account start' : '')}</td>
                        <td>{h.result
                          ? <Badge bg={RESULT_VARIANT[(h.result || '').toLowerCase()] || 'secondary'} text={/light/.test(RESULT_VARIANT[(h.result || '').toLowerCase()] || '') ? 'dark' : undefined} className="st-result-badge">{h.result}</Badge>
                          : <span className="st-muted">—</span>}</td>
                        <td>
                          <div className="st-desc">{h.description}</div>
                          {!h.opening && (
                            <div className="st-desc-tags">
                              {h.bet_id && !h.live && <span className="badge st-betid me-1">bet #{h.bet_id}</span>}
                              {h.betType && <span className={`badge st-bt ${/back|yes/i.test(h.betType) ? 'back' : 'lay'} me-1`}>{h.betType}</span>}
                              {/* live casino: provider · game · session */}
                              {h.live && h.provider && <span className="badge st-prov me-1">{h.provider}</span>}
                              {h.live && h.gameName && <span className="badge st-game me-1">{h.gameName}</span>}
                              {h.live && h.sessionId && <span className="badge st-betid me-1">session {h.sessionId}</span>}
                              {/* table casino / sports: game/market · round · selection */}
                              {!h.live && h.gameTag && <span className="badge st-game me-1">{h.gameTag}</span>}
                              {h.roundId && <span className="badge st-round me-1">round {h.roundId}</span>}
                              {h.selection && <span className="badge st-sel me-1">{h.selection}</span>}
                              {h.settledResult && <Badge bg="dark" className="me-1">result: {h.settledResult}</Badge>}
                              {h.category && !h.cash && <Badge bg={h.category === 'SPORTS' ? 'primary' : h.category === 'LIVE' ? 'warning' : 'dark'} text={h.category === 'LIVE' ? 'dark' : undefined} className="me-1">{h.category === 'LIVE' ? 'LIVE CASINO' : h.category === 'CASINO' ? 'TABLE CASINO' : h.category}</Badge>}
                              <Badge bg={/deposit|^add|win/i.test(h.reason) ? 'success' : /withdraw|loss/i.test(h.reason) ? 'danger' : /refund/i.test(h.reason) ? 'warning' : /exposure_release/i.test(h.reason) ? 'info' : 'secondary'} text={/refund/i.test(h.reason) ? 'dark' : undefined} className="me-1">{h.reason}</Badge>
                              {h.profitBook && <Badge bg="info" className="me-1">profit book</Badge>}
                              {h.manual && <Badge bg="warning" text="dark" className="me-1">manual settle</Badge>}
                              {h.payoutMismatch && <Badge bg="danger" className="me-1">payout mismatch</Badge>}
                              {h.noResult && !h.payoutMismatch && <Badge bg="light" text="dark" className="me-1 st-faint">re-verify N/A</Badge>}
                            </div>
                          )}
                        </td>
                        <td className="text-end st-mono"><Money v={h.amount} /></td>
                        <td className="text-end st-mono">{h.opening ? <span className="st-muted">—</span> : <Money v={h.walletDelta} sign />}</td>
                        <td className="text-end st-mono"><Money v={h.closing} /></td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && <tr><td colSpan={6} className="text-center text-muted p-3">No wallet movements in this date range.</td></tr>}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </Layout>
  )
}
