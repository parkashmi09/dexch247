import { useState } from 'react'
import './style.css'
import UserBookModal from '../../UserBookModal'

/**
 * MatchOdds Component
 *
 * Displays betting odds table for different market types.
 * Shows data passed from props.
 * 
 * @param {string} title - Market title (optional, defaults to marketName)
 * @param {string} marketName - Selected market name (e.g., "MATCH_ODDS", "OVER_UNDER_25")
 * @param {Object} marketData - Market data object with team1 and team2 data
 * @param {Function} onBetLockClick - Callback for Bet Lock button
 */
function MatchOdds({ title, marketName, marketData, onBetLockClick, exposureData = {}, eventId }) {
  const [showUserBook, setShowUserBook] = useState(false)

  // Default data fallback if marketData is not provided
  const defaultData = {
    team1: { name: 'Victoria', odds: [{ back: 1.74, lay: 2.06 }, { back: 1.9, lay: 2.12 }, { back: 1.94, lay: 2.34 }], amounts: [{ back: 1, lay: 2 }, { back: 83.02, lay: 11.31 }, { back: 2.07, lay: 185.45 }] },
    team2: { name: 'Western Australia', odds: [{ back: 1.74, lay: 2.06 }, { back: 1.9, lay: 2.12 }, { back: 1.94, lay: 2.86 }], amounts: [{ back: 250.46, lay: 1.95 }, { back: 12.62, lay: 74.4 }, { back: 2.12, lay: 152.03 }] }
  }

  // Determine display title
  const displayTitle = title || marketName || 'MATCH_ODDS'
  
  // Use marketData from props or fallback to default
  const data = marketData || defaultData

  const nameLower = (marketName || '').toLowerCase()
  const isShowUserBook = nameLower.includes('match odds') || nameLower.includes('match_odds') || nameLower.includes('bookmaker')
  
  const runners = []
  if (data.team1?.name) runners.push(data.team1.name)
  if (data.team2?.name) runners.push(data.team2.name)
  if (data.team3?.name) runners.push(data.team3.name)
  if (data.items) data.items.forEach(item => { if (item.label) runners.push(item.label) })

  // Check if this is HT/FT market or multi-column market (special layout)
  const isHTFT = data.type === 'htft' || marketName === 'HT/FT'
  const isMultiColumn = data.type === 'multi-column'

  // Robust detection for Yes/No or 2-outcome markets
  const isYesNo = (() => {
    // 1. Check for exactly 2 runners (Team 1 and Team 2 exist, Team 3 doesn't)
    const hasOnlyTwoRunners = !!data.team1?.name && !!data.team2?.name && !data.team3?.name
    if (!hasOnlyTwoRunners) return false

    // 2. Check for explicit "Yes" and "No" runners
    const t1Name = data.team1.name.toLowerCase()
    const t2Name = data.team2.name.toLowerCase()
    if ((t1Name === 'yes' && t2Name === 'no') || (t1Name === 'no' && t2Name === 'yes')) return true

    // 3. Check for specific 2-outcome market names
    const nameLower = (marketName || '').toLowerCase()
    const isTwoOutcomeMarket = nameLower.includes('both teams to score') || 
                               nameLower.includes('over_under') ||
                               nameLower.includes('over/under')
    
    return isTwoOutcomeMarket
  })()

  // Render HT/FT or multi-column layout
  if ((isHTFT || isMultiColumn) && data.items) {
    return (
      <div className="market-1">
        <div className="bet-table">
          <div className="bet-table-header">
            <span title={displayTitle} data-toggle="collapse" data-target="#market0">
              {displayTitle}
            </span>
            <div className="float-right">
              <span className="max-bet">
                <span title="Max : 1">1</span>
              </span>
              <a 
                href="javascript:void(0)" 
                className="btn btn-back"
                onClick={(e) => {
                  e.preventDefault()
                  if (onBetLockClick) {
                    onBetLockClick(marketName)
                  }
                }}
              >
                Bet Lock
              </a>
              {isShowUserBook && (
                <a 
                  href="javascript:void(0)" 
                  className="btn btn-back"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowUserBook(true)
                  }}
                >
                  User Book
                </a>
              )}
            </div>
          </div>
          <div id="market0" data-title="OPEN" className="bet-table-body collapse show">
            <div className="bet-table-row">
              {data.items.map((item, index) => (
                <div key={index} className={`market-1-item ${item.isSuspended ? 'suspended' : ''}`}>
                  <div>
                    <span>{item.label}</span>
                    <span className={`ml-2 ${exposureData[item.label] >= 0 ? 'text-green' : 'text-red'}`}>
                      {exposureData[item.label] || 0}
                    </span>
                    <span className="ml-2 d-none">0</span>
                  </div>
                  <div className={`bl-box back back ${item.isSuspended ? 'no-val suspended' : ''}`}>
                    <span className="d-block odds">
                      {item.isSuspended || item.odds === null ? '—' : item.odds}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <UserBookModal 
          show={showUserBook} 
          onHide={() => setShowUserBook(false)} 
          matchId={eventId} 
          marketName={marketName}
          initialRunners={runners}
        />
      </div>
    )
  }

  // Standard layout for other markets
  const { team1, team2, team3 } = data

  return (
    <div className="bet-table match-odds-table">
      <div className="bet-table-header">
        <div className="nation-name" data-toggle="collapse" data-target="#market0" aria-expanded="true">
          <span title={displayTitle}>{displayTitle}</span>
        </div>
        <div className="float-right">
          <a 
            href="javascript:void(0)" 
            className="btn btn-back"
            onClick={(e) => {
              e.preventDefault()
              if (onBetLockClick) {
                onBetLockClick(marketName)
              }
            }}
          >
            Bet Lock
          </a>
          {isShowUserBook && (
            <a 
              href="javascript:void(0)" 
              className="btn btn-back"
              onClick={(e) => {
                e.preventDefault()
                setShowUserBook(true)
              }}
            >
              User Book
            </a>
          )}
        </div>
      </div>

      <div id="market0" className="bet-table-body collapse show" data-title="OPEN">
        {/* Header Row */}
        <div className="bet-table-row bet-table-row-top">
          <div className="text-right nation-name">
            <span className="max-bet">
              <span className="max-bet-text" title="Max : 1">1</span>
            </span>
          </div>
          <div className="back bl-title d-none-mobile">Back</div>
          <div className="lay bl-title d-none-mobile">Lay</div>
          {!isYesNo && (
            <>
              <div className="bl-box-empty"></div>
              <div className="bl-box-empty"></div>
            </>
          )}
        </div>

        {/* Team 1 Row */}
        <div className="bet-table-row" data-title="ACTIVE">
          <div className="nation-name d-none-mobile">
            <p>{team1.name}</p>
            <p className={`mb-0 float-left ${exposureData[team1.name] >= 0 ? 'text-green' : 'text-red'}`}>
              {exposureData[team1.name] || 0}
            </p>
            <p className="mb-0 float-right d-none">0</p>
          </div>
          {/* Show 3 back boxes only if NOT Yes/No.
              Back columns render worst -> best (back3, back2, back1) left to
              right, so the best back (tno 0 = odds[0]) sits in the main box
              adjacent to the lay column, matching the user panel / Betfair. */}
          {!isYesNo && (
            <>
              <div className="bl-box back back2">
                <span className="d-block odds">{team1.odds[2].back}</span>
                <span className="d-block">{team1.amounts[2].back}</span>
              </div>
              <div className="bl-box back back1">
                <span className="d-block odds">{team1.odds[1].back}</span>
                <span className="d-block">{team1.amounts[1].back}</span>
              </div>
            </>
          )}
          {/* Main Back Box (best back, tno 0) */}
          <div className="bl-box back back">
            <span className="d-block odds">{team1.odds[0].back}</span>
            <span className="d-block">{team1.amounts[0].back}</span>
          </div>
          {/* Main Lay Box */}
          <div className="bl-box lay lay">
            <span className="d-block odds">{team1.odds[0].lay}</span>
            <span className="d-block">{team1.amounts[0].lay}</span>
          </div>
          {/* Show 2 lay boxes only if NOT Yes/No */}
          {!isYesNo && (
            <>
              <div className="bl-box lay lay1">
                <span className="d-block odds">{team1.odds[1].lay}</span>
                <span className="d-block">{team1.amounts[1].lay}</span>
              </div>
              <div className="bl-box lay lay2">
                <span className="d-block odds">{team1.odds[2].lay}</span>
                <span className="d-block">{team1.amounts[2].lay}</span>
              </div>
            </>
          )}
        </div>

        {/* Team 2 Row */}
        <div className="bet-table-row" data-title="ACTIVE">
          <div className="nation-name d-none-mobile">
            <p>{team2.name}</p>
            <p className={`mb-0 float-left ${exposureData[team2.name] >= 0 ? 'text-green' : 'text-red'}`}>
              {exposureData[team2.name] || 0}
            </p>
            <p className="mb-0 float-right d-none">0</p>
          </div>
          {/* Show 3 back boxes only if NOT Yes/No (worst -> best, back3/back2/back1) */}
          {!isYesNo && (
            <>
              <div className="bl-box back back2">
                <span className="d-block odds">{team2.odds[2].back}</span>
                <span className="d-block">{team2.amounts[2].back}</span>
              </div>
              <div className="bl-box back back1">
                <span className="d-block odds">{team2.odds[1].back}</span>
                <span className="d-block">{team2.amounts[1].back}</span>
              </div>
            </>
          )}
          {/* Main Back Box (best back, tno 0) */}
          <div className="bl-box back back">
            <span className="d-block odds">{team2.odds[0].back}</span>
            <span className="d-block">{team2.amounts[0].back}</span>
          </div>
          {/* Main Lay Box */}
          <div className="bl-box lay lay">
            <span className="d-block odds">{team2.odds[0].lay}</span>
            <span className="d-block">{team2.amounts[0].lay}</span>
          </div>
          {/* Show 2 lay boxes only if NOT Yes/No */}
          {!isYesNo && (
            <>
              <div className="bl-box lay lay1">
                <span className="d-block odds">{team2.odds[1].lay}</span>
                <span className="d-block">{team2.amounts[1].lay}</span>
              </div>
              <div className="bl-box lay lay2">
                <span className="d-block odds">{team2.odds[2].lay}</span>
                <span className="d-block">{team2.amounts[2].lay}</span>
              </div>
            </>
          )}
        </div>

        {/* Team 3 Row - Only show if team3 exists */}
        {team3 && (
          <div className="bet-table-row" data-title="ACTIVE">
            <div className="nation-name d-none-mobile">
              <p>{team3.name}</p>
              <p className={`mb-0 float-left ${exposureData[team3.name] >= 0 ? 'text-green' : 'text-red'}`}>
                {exposureData[team3.name] || 0}
              </p>
              <p className="mb-0 float-right d-none">0</p>
            </div>
            {!isYesNo && (
              <>
                <div className="bl-box back back2">
                  <span className="d-block odds">{team3.odds[2].back}</span>
                  <span className="d-block">{team3.amounts[2].back}</span>
                </div>
                <div className="bl-box back back1">
                  <span className="d-block odds">{team3.odds[1].back}</span>
                  <span className="d-block">{team3.amounts[1].back}</span>
                </div>
              </>
            )}
            <div className="bl-box back back">
              <span className="d-block odds">{team3.odds[0].back}</span>
              <span className="d-block">{team3.amounts[0].back}</span>
            </div>
            <div className="bl-box lay lay">
              <span className="d-block odds">{team3.odds[0].lay}</span>
              <span className="d-block">{team3.amounts[0].lay}</span>
            </div>
            {!isYesNo && (
              <>
                <div className="bl-box lay lay1">
                  <span className="d-block odds">{team3.odds[1].lay}</span>
                  <span className="d-block">{team3.amounts[1].lay}</span>
                </div>
                <div className="bl-box lay lay2">
                  <span className="d-block odds">{team3.odds[2].lay}</span>
                  <span className="d-block">{team3.amounts[2].lay}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <UserBookModal 
        show={showUserBook} 
        onHide={() => setShowUserBook(false)} 
        matchId={eventId} 
        marketName={marketName}
        initialRunners={runners}
      />
    </div>
  )
}

export default MatchOdds
