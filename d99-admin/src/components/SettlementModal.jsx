import { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { declareResult, voidBet } from '../services/api'
import styles from './SportsViewMoreBetsModal/SportsViewMoreBetsModal.module.css'

/**
 * SettlementModal – Declare result (2 or 3 outcome) or Void confirmation.
 * Uses same modal layout as SportsViewMoreBetsModal (overlay, header with close button).
 * Props: show, onHide, mode ('declare' | 'void'), match (row data), onSubmit
 */
function SettlementModal({ show, onHide, mode, match, onSubmit }) {
  const counts = match?.counts ?? 2
  const totalBets = match?.totalBets ?? 0
  const isThreeWay = counts >= 3 || totalBets >= 3
  const teamOne = match?.teamOne ?? 'Team 1'
  const teamTwo = match?.teamTwo ?? 'Team 2'
  const matchTitle = match?.matchTitle || `${teamOne} vs ${teamTwo}`

  const [selectedOutcome, setSelectedOutcome] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (show) {
      setSelectedOutcome(null)
      setSubmitting(false)
    }
  }, [show, mode])

  const handleSubmit = async () => {
    if (mode === 'declare' && selectedOutcome == null) return
    setSubmitting(true)
    try {
      if (mode === 'void') {
        await voidBet({
          eventid: match.eventId,
          match_id: match.matchId,
          market_type: match.marketType,
          gametype: match.gameType || 'MO'
        })
        await onSubmit?.({ success: true })
      } else {
        const wName = selectedOutcome === 'teamOne' ? teamOne
          : selectedOutcome === 'teamTwo' ? teamTwo
            : 'Draw'
        const payload = {
          eventid: match.eventId,
          match_id: match.matchId,
          match_title: matchTitle,
          game_type: match.gameType,
          market_type: match.marketType,
          winnerName: wName
        }
        await declareResult(payload)
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
  const selectedDisplay =
    selectedOutcome === 'teamOne' ? teamOne
      : selectedOutcome === 'teamTwo' ? teamTwo
        : selectedOutcome === 'draw' ? 'Draw' : null
  const canSubmit = mode === 'void' || selectedOutcome != null
  const isSubmitDisabled = !canSubmit || submitting

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
            <div className="mb-3 font-weight-bold">{matchTitle}</div>

            {mode === 'declare' && (
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

export default SettlementModal
