import { useState, useEffect } from 'react'
import { Button, Form } from 'react-bootstrap'
import { declareResult, voidBet } from '../services/api'
import styles from './SportsViewMoreBetsModal/SportsViewMoreBetsModal.module.css'

const MARKETS_FOR_FANCY = [
  '1st Innings 6 Overs Line', '2nd Innings 6 Overs Line', '3rd Innings 6 Overs Line',
  '1st Innings 50 Overs Line', '2nd Innings 50 Overs Line', '3rd Innings 50 Overs Line',
  '1st Innings 40 Overs Line', '2nd Innings 40 Overs Line', '3rd Innings 40 Overs Line',
  '1st Innings 30 Overs Line', '2nd Innings 30 Overs Line', '3rd Innings 30 Overs Line',
  '1st Innings 20 Overs Line', '2nd Innings 20 Overs Line', '3rd Innings 20 Overs Line',
  '1st Innings 10 Overs Line', '2nd Innings 10 Overs Line', '3rd Innings 10 Overs Line',
  'Over By Over', 'Ball By Ball', 'Normal', 'khado', 'meter', 'fancy1', 'oddeven'
]

/**
 * FancySettlementModal – Declare (Winner id or Team/Draw selection) or Void.
 * Props: show, onHide, mode ('declare' | 'void'), row { matchTitle, marketType, matchId, eventId, counts, bets?, selectionName, ... }, onSubmit
 */
function FancySettlementModal({ show, onHide, mode, row, onSubmit }) {
  const matchTitle = row?.matchTitle ?? ''
  const marketType = row?.marketType ?? ''
  const counts = row?.counts ?? 1
  const firstBet = row?.bets?.[0]
  const useTeamSelection = mode === 'declare' && !MARKETS_FOR_FANCY.includes(marketType) && counts >= 2
  const isBinaryFancy = mode === 'declare' && ['fancy1', 'oddeven'].includes(marketType)
  const isThreeWay = counts >= 3
  const teamOne = row?.teamOne || firstBet?.teamOne || 'Team 1'
  const teamTwo = row?.teamTwo || firstBet?.teamTwo || 'Team 2'

  const [winnerId, setWinnerId] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (show) {
      setWinnerId('')
      setSelectedOutcome(null)
      setSubmitting(false)
    }
  }, [show, mode, row])

  const selectedDisplay =
    selectedOutcome === 'teamOne' ? teamOne
      : selectedOutcome === 'teamTwo' ? teamTwo
        : selectedOutcome === 'draw' ? 'Draw' : null

  const handleSubmit = async () => {
    if (mode === 'declare') {
      if (useTeamSelection && selectedOutcome == null) return
      if (!useTeamSelection && !winnerId.trim()) return
    }
    setSubmitting(true)
    try {
      if (mode === 'void') {
        const payload = {
          eventid: row.eventId,
          match_id: row.matchId,
          market_type: marketType,
          gametype: row.gameType || 'FAN'
        }
        if (MARKETS_FOR_FANCY.includes(marketType)) {
          payload.selection_name = row.selectionName
        }
        await voidBet(payload)
        await onSubmit?.({ success: true })
      } else {
        const common = {
          eventid: row.eventId,
          match_id: row.matchId,
          match_title: row.matchTitle,
          game_type: row.gameType || 'FAN',
          market_type: marketType
        }
        if (useTeamSelection) {
          const wName = selectedOutcome === 'teamOne' ? teamOne
            : selectedOutcome === 'teamTwo' ? teamTwo
              : 'Draw'
          await declareResult({ ...common, winnerName: wName })
        } else {
          if (['fancy1', 'oddeven'].includes(marketType)) {
            await declareResult({
              ...common,
              winnerName: winnerId.trim(),
              fancyName: row.selectionName
            })
          } else if (MARKETS_FOR_FANCY.includes(marketType)) {
            await declareResult({
              ...common,
              winnerId: winnerId.trim(),
              fancyName: row.selectionName
            })
          } else {
            await declareResult({
              ...common,
              winnerName: winnerId.trim()
            })
          }
        }
        await onSubmit?.({ success: true })
      }
      onHide?.()
    } catch (e) {
      console.error(e)
      alert(e.response?.data?.error || e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'void' ? 'Void Match' : 'Declare Result'
  const isDeclareReady = useTeamSelection ? selectedOutcome != null : winnerId.trim() !== ''
  const isSubmitDisabled = (mode === 'declare' && !isDeclareReady) || submitting

  if (!show) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalDialogSmall}>
        <div className={styles.viewMoreModalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>{title}</h5>
            <button type="button" className={styles.closeButton} onClick={onHide} aria-label="Close">
              &times;
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className="mb-3 font-weight-bold">
              {marketType ? `${marketType} — ${matchTitle}` : matchTitle}
            </div>

            {mode === 'declare' && useTeamSelection && (
              <>
                {isThreeWay ? (
                  <>
                    <div className="d-flex justify-content-between gap-2 mb-2">
                      <Button
                        variant={selectedOutcome === 'teamOne' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setSelectedOutcome('teamOne')}
                      >
                        {teamOne}
                      </Button>
                      <Button
                        variant={selectedOutcome === 'draw' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setSelectedOutcome('draw')}
                      >
                        Draw
                      </Button>
                      <Button
                        variant={selectedOutcome === 'teamTwo' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setSelectedOutcome('teamTwo')}
                      >
                        {teamTwo}
                      </Button>
                    </div>
                    <div className="small text-muted">
                      {selectedDisplay != null ? `Result: ${selectedDisplay}` : 'Select Team 1, Draw, or Team 2'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                      <Button
                        variant={selectedOutcome === 'teamOne' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setSelectedOutcome('teamOne')}
                      >
                        {teamOne}
                      </Button>
                      <span className="small">VS</span>
                      <Button
                        variant={selectedOutcome === 'teamTwo' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setSelectedOutcome('teamTwo')}
                      >
                        {teamTwo}
                      </Button>
                    </div>
                    <div className="small text-muted">
                      {selectedDisplay != null ? `Result: ${selectedDisplay}` : 'Select winner'}
                    </div>
                  </>
                )}
              </>
            )}

            {mode === 'declare' && !useTeamSelection && (
              <Form.Group className="mb-2">
                <Form.Label className="small">
                  {isBinaryFancy ? 'Winner Name' : 'Winner id'}
                </Form.Label>
                {isBinaryFancy ? (
                  <div className="d-flex gap-2">
                    <Button
                      variant={winnerId === 'Yes' ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => setWinnerId('Yes')}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={winnerId === 'No' ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => setWinnerId('No')}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    value={winnerId}
                    onChange={(e) => setWinnerId(e.target.value)}
                    placeholder="Enter winner id"
                    size="sm"
                  />
                )}
              </Form.Group>
            )}

            {mode === 'void' && (
              <p className="text-muted small mb-0">
                Do you really want to cancel or refund the bets? All stakes will be refunded to the users. This action cannot be undone.
              </p>
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={onHide}>
                Cancel
              </Button>
              <Button
                variant={mode === 'void' ? 'danger' : 'primary'}
                size="sm"
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting...' : mode === 'void' ? 'Confirm Void' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FancySettlementModal
