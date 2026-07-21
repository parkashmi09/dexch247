import { useState } from 'react'
import './style.css'
import UserBookModal from '../../UserBookModal'

/**
 * TiedMatch Component
 *
 * Displays TIED_MATCH markets from API data.
 * Maps data from marketsData prop filtered by mname === "TIED_MATCH"
 */
function TiedMatch({ onBetLockClick, marketsData = [], exposureData = {}, eventId }) {
  const [showUserBook, setShowUserBook] = useState(false)
  // Helper function to convert odds (handle both decimal and multiplied formats)
  const convertOdds = (oddsValue) => {
    if (!oddsValue || oddsValue <= 0) return 0
    // If odds are > 100, they're likely multiplied by 100, so divide
    if (oddsValue > 100) {
      return parseFloat((oddsValue / 100).toFixed(2))
    }
    return parseFloat(oddsValue.toFixed(2))
  }

  // Transform API data to component format
  const transformTiedMatchData = () => {
    // Find TIED_MATCH market from API data
    const tiedMatchMarket = marketsData.find(market => {
      const mname = market.mname || market.marketName || market.name
      return mname === 'TIED_MATCH'
    })

    if (!tiedMatchMarket || !tiedMatchMarket.section || !Array.isArray(tiedMatchMarket.section)) {
      return null
    }

    const marketStatus = tiedMatchMarket.status || ''
    
    // Transform sections (Yes and No)
    const transformSection = (section) => {
      const backOdds = []
      const layOdds = []
      const backAmounts = []
      const layAmounts = []

      // Sort odds by tier (tno: 0, 1, 2)
      const sortedOdds = [...(section.odds || [])].sort((a, b) => a.tno - b.tno)

      sortedOdds.forEach(odd => {
        const oddsValue = convertOdds(odd.odds)
        const amount = odd.size || 0

        if (odd.otype === 'back') {
          backOdds.push(oddsValue)
          backAmounts.push(amount)
        } else if (odd.otype === 'lay') {
          layOdds.push(oddsValue)
          layAmounts.push(amount)
        }
      })

      // Ensure we have 3 tiers (pad with 0 if needed)
      while (backOdds.length < 3) {
        backOdds.push(0)
        backAmounts.push(0)
      }
      while (layOdds.length < 3) {
        layOdds.push(0)
        layAmounts.push(0)
      }

      const sectionGstatus = section.gstatus || ''
      const isSuspended = sectionGstatus.toUpperCase() === 'SUSPENDED' || marketStatus.toUpperCase() === 'SUSPENDED'

      return {
        name: section.nat || section.name || '',
        backOdds: [backOdds[0] || 0, backOdds[1] || 0, backOdds[2] || 0],
        layOdds: [layOdds[0] || 0, layOdds[1] || 0, layOdds[2] || 0],
        backAmounts: [backAmounts[0] || 0, backAmounts[1] || 0, backAmounts[2] || 0],
        layAmounts: [layAmounts[0] || 0, layAmounts[1] || 0, layAmounts[2] || 0],
        gstatus: sectionGstatus, // Use gstatus from API for suspended state
        isSuspended: isSuspended
      }
    }

    return {
      maxBet: tiedMatchMarket.maxb || 1,
      section1: tiedMatchMarket.section[0] ? transformSection(tiedMatchMarket.section[0]) : null,
      section2: tiedMatchMarket.section[1] ? transformSection(tiedMatchMarket.section[1]) : null
    }
  }

  const marketData = marketsData.length > 0 ? transformTiedMatchData() : null

  // Don't render component if no data available
  if (!marketData || !marketData.section1) {
    return null
  }

  return (
    <div className="bet-table match-odds-table">
      <div className="bet-table-header">
        <div className="nation-name" data-toggle="collapse" data-target="#market0" aria-expanded="true">
          <span title="TIED_MATCH">TIED_MATCH</span>
        </div>
        <div className="float-right">
          <a 
            href="javascript:void(0)" 
            className="btn btn-back"
            onClick={(e) => {
              e.preventDefault()
              if (onBetLockClick) {
                onBetLockClick('TiedMatch')
              }
            }}
          >
            Bet Lock
          </a>
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
        </div>
      </div>

      <div id="market0" className="bet-table-body collapse show" data-title="OPEN">
        {/* Header Row */}
        <div className="bet-table-row bet-table-row-top">
          <div className="text-right nation-name">
            <span className="max-bet">
              <span className="max-bet-text" title={`Max : ${marketData?.maxBet || 1}`}>{marketData?.maxBet || 1}</span>
            </span>
          </div>
          <div className="back bl-title d-none-mobile">Back</div>
          <div className="lay bl-title d-none-mobile">Lay</div>
          <div className="bl-box-empty"></div>
          <div className="bl-box-empty"></div>
        </div>

        {/* Yes Row */}
        <div className={`bet-table-row ${marketData.section1.isSuspended ? 'suspendedtext' : ''}`} data-title={marketData.section1.isSuspended ? "SUSPENDED" : (marketData.section1.gstatus || "ACTIVE")}>
          <div className="nation-name d-none-mobile">
            <p>{marketData.section1.name}</p>
            <p className={`mb-0 float-left ${exposureData[marketData.section1.name] >= 0 ? 'text-green' : 'text-red'}`}>
              {exposureData[marketData.section1.name] || 0}
            </p>
            <p className="mb-0 float-right d-none">0</p>
          </div>
          <div className="bl-box back back2">
            <span className="d-block odds">{marketData.section1.backOdds[0] > 0 ? marketData.section1.backOdds[0].toFixed(2) : '0'}</span>
            <span className="d-block">{marketData.section1.backAmounts[0] || '0'}</span>
          </div>
          <div className="bl-box back back1">
            <span className="d-block odds">{marketData.section1.backOdds[1] > 0 ? marketData.section1.backOdds[1].toFixed(2) : '0'}</span>
            <span className="d-block">{marketData.section1.backAmounts[1] || '0'}</span>
          </div>
          <div className="bl-box back back">
            <span className="d-block odds">{marketData.section1.backOdds[2] > 0 ? marketData.section1.backOdds[2].toFixed(2) : '0'}</span>
            <span className="d-block">{marketData.section1.backAmounts[2] || '0'}</span>
          </div>
          <div className="bl-box lay lay">
            <span className="d-block odds">{marketData.section1.layOdds[0] > 0 ? marketData.section1.layOdds[0].toFixed(2) : '0'}</span>
            <span className="d-block">{marketData.section1.layAmounts[0] || '0'}</span>
          </div>
          <div className="bl-box lay lay1">
            <span className="d-block odds">{marketData.section1.layOdds[1] > 0 ? marketData.section1.layOdds[1].toFixed(2) : '0'}</span>
            <span className="d-block">{marketData.section1.layAmounts[1] || '0'}</span>
          </div>
          <div className="bl-box lay lay2">
            <span className="d-block odds">{marketData.section1.layOdds[2] > 0 ? marketData.section1.layOdds[2].toFixed(2) : '0'}</span>
            <span className="d-block">{marketData.section1.layAmounts[2] || '0'}</span>
          </div>
        </div>

        {/* No Row */}
        {marketData.section2 && (
          <div className={`bet-table-row ${marketData.section2.isSuspended ? 'suspendedtext' : ''}`} data-title={marketData.section2.isSuspended ? "SUSPENDED" : (marketData.section2.gstatus || "ACTIVE")}>
          <div className="nation-name d-none-mobile">
              <p>{marketData.section2.name}</p>
            <p className={`mb-0 float-left ${exposureData[marketData.section2.name] >= 0 ? 'text-green' : 'text-red'}`}>
              {exposureData[marketData.section2.name] || 0}
            </p>
            <p className="mb-0 float-right d-none">0</p>
          </div>
          <div className="bl-box back back2">
              <span className="d-block odds">{marketData.section2.backOdds[0] > 0 ? marketData.section2.backOdds[0].toFixed(2) : '0'}</span>
              <span className="d-block">{marketData.section2.backAmounts[0] || '0'}</span>
          </div>
          <div className="bl-box back back1">
              <span className="d-block odds">{marketData.section2.backOdds[1] > 0 ? marketData.section2.backOdds[1].toFixed(2) : '0'}</span>
              <span className="d-block">{marketData.section2.backAmounts[1] || '0'}</span>
          </div>
          <div className="bl-box back back">
              <span className="d-block odds">{marketData.section2.backOdds[2] > 0 ? marketData.section2.backOdds[2].toFixed(2) : '0'}</span>
              <span className="d-block">{marketData.section2.backAmounts[2] || '0'}</span>
          </div>
          <div className="bl-box lay lay">
              <span className="d-block odds">{marketData.section2.layOdds[0] > 0 ? marketData.section2.layOdds[0].toFixed(2) : '0'}</span>
              <span className="d-block">{marketData.section2.layAmounts[0] || '0'}</span>
          </div>
          <div className="bl-box lay lay1">
              <span className="d-block odds">{marketData.section2.layOdds[1] > 0 ? marketData.section2.layOdds[1].toFixed(2) : '0'}</span>
              <span className="d-block">{marketData.section2.layAmounts[1] || '0'}</span>
          </div>
          <div className="bl-box lay lay2">
              <span className="d-block odds">{marketData.section2.layOdds[2] > 0 ? marketData.section2.layOdds[2].toFixed(2) : '0'}</span>
              <span className="d-block">{marketData.section2.layAmounts[2] || '0'}</span>
            </div>
          </div>
        )}
      </div>

      <UserBookModal 
        show={showUserBook} 
        onHide={() => setShowUserBook(false)} 
        matchId={eventId} 
        marketName="TIED_MATCH"
        initialRunners={[marketData.section1.name, marketData.section2?.name].filter(n => n)}
      />
    </div>
  )
}

export default TiedMatch


