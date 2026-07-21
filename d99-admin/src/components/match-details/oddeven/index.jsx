import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import './style.css'

/**
 * OddEven Component
 *
 * Displays oddeven markets from API data.
 * Maps data from marketsData prop filtered by mname === "oddeven"
 */
function OddEven({ onBetLockClick, marketsData = [], exposureData = {} }) {
  const [showRunAmountModal, setShowRunAmountModal] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState('')
  const [runAmountData, setRunAmountData] = useState([])

  // Helper function to format amount (convert to K if >= 1000)
  const formatAmount = (amount) => {
    if (!amount || amount === 0) return '0'
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toString()
  }

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
  const transformOddEvenData = () => {
    // Find oddeven market from API data
    const oddEvenMarket = marketsData.find(market => {
      const mname = market.mname || market.marketName || market.name
      return mname === 'oddeven'
    })

    if (!oddEvenMarket || !oddEvenMarket.section || !Array.isArray(oddEvenMarket.section)) {
      return []
    }

    const marketStatus = oddEvenMarket.status || ''
    
    // Transform each section to component format
    // Each section represents one row with Odd/Even options
    return oddEvenMarket.section.map((section, index) => {
      // Find back and lay odds (tno: 0 is the best price)
      const backOdd = section.odds?.find(odd => odd.otype === 'back' && odd.tno === 0) ||
                     section.odds?.find(odd => odd.otype === 'back')
      const layOdd = section.odds?.find(odd => odd.otype === 'lay' && odd.tno === 0) ||
                    section.odds?.find(odd => odd.otype === 'lay')

      // Use back odds for "Odd" and lay odds for "Even" (or vice versa based on your logic)
      const oddOdds = backOdd ? convertOdds(backOdd.odds) : 0
      const oddAmount = backOdd ? formatAmount(backOdd.size) : '0'
      const evenOdds = layOdd && layOdd.odds > 0 ? convertOdds(layOdd.odds) : 0
      const evenAmount = layOdd && layOdd.size > 0 ? formatAmount(layOdd.size) : '0'

      const sectionGstatus = section.gstatus || ''
      const isSuspended = sectionGstatus.toUpperCase() === 'SUSPENDED' || marketStatus.toUpperCase() === 'SUSPENDED'

      return {
        id: section.sid || index + 1,
        title: section.nat || section.name || '',
        oddOdds: oddOdds > 0 ? oddOdds.toFixed(2) : '0',
        oddAmount: oddAmount,
        evenOdds: evenOdds > 0 ? evenOdds.toFixed(2) : '0',
        evenAmount: evenAmount,
        min: section.min || 10,
        max: section.max ? formatAmount(section.max) : '50K',
        gstatus: sectionGstatus, // Use gstatus from API for suspended state
        isSuspended: isSuspended
      }
    })
  }

  // Get transformed odd/even markets from API or use empty array
  const oddEvenMarkets = marketsData.length > 0 ? transformOddEvenData() : []

  // Don't render component if no data available
  if (oddEvenMarkets.length === 0) {
    return null
  }

  // Sample data structure for run amounts
  const getRunAmountData = (title) => {
    return [
      { run: 10, amount: 100 },
      { run: 20, amount: 200 },
      { run: 30, amount: 300 },
      { run: 40, amount: 400 },
      { run: 50, amount: 500 }
    ]
  }

  const handleTitleClick = (title) => {
    setSelectedTitle(title)
    setRunAmountData(getRunAmountData(title))
    setShowRunAmountModal(true)
  }

  return (
    <div className="market-6">
      <div className="bet-table">
        <div className="bet-table-header">
          <div data-toggle="collapse" data-target="#market4" aria-expanded="true" className="nation-name">
            <span title="oddeven">oddeven</span>
          </div>
          <div className="float-right">
            <a 
              href="javascript:void(0)" 
              className="btn btn-back"
              onClick={(e) => {
                e.preventDefault()
                if (onBetLockClick) {
                  onBetLockClick('OddEven')
                }
              }}
            >
              Bet Lock
            </a>
          </div>
        </div>

        <div id="market4" data-title="OPEN" className="bet-table-body collapse show">
          {/* Header Row */}
          <div className="bet-table-row">
            <div className="text-right nation-name"></div>
            <div className="back bl-title d-none-mobile">Odd</div>
            <div className="back bl-title d-none-mobile">Even</div>
            <div className="bl-title-empty d-none-mobile"></div>
          </div>

          {/* Data Rows */}
          {oddEvenMarkets.map((market, index) => (
            <div 
              key={market.id} 
              data-title={market.isSuspended ? "SUSPENDED" : (market.gstatus || "")} 
              className={`fancy-tripple ${market.isSuspended ? 'suspendedtext' : ''}`}
            >
              <div data-title="" className="bet-table-row">
                <div className="nation-name d-none-mobile">
                  <p onClick={() => handleTitleClick(market.title)}>
                    <span>{market.title}</span>
                  </p>
                  <p className={`mb-0 ${exposureData[market.title] >= 0 ? 'text-green' : 'text-red'}`}>
                    {exposureData[market.title] || 0}
                  </p>
                </div>
                <div className="bl-box back">
                  <span className="d-block odds">{market.oddOdds}</span>
                  <span className="d-block">{market.oddAmount}</span>
                </div>
                <div className="bl-box back">
                  <span className="d-block odds">{market.evenOdds}</span>
                  <span className="d-block">{market.evenAmount}</span>
                </div>
                <div className="fancy-min-max">
                  Min:<span>{market.min}</span> Max:<span>{market.max}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Run Amount Modal */}
      <Modal 
        show={showRunAmountModal} 
        onHide={() => setShowRunAmountModal(false)} 
        dialogClassName="modal-md modal-dialog-scrollable"
      >
        <Modal.Header>
          <Modal.Title>Run Amount</Modal.Title>
          <button 
            type="button" 
            className="close text-white" 
            onClick={() => setShowRunAmountModal(false)}
            aria-label="Close"
          >
            ×
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive run-amount-container">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {runAmountData.length > 0 ? (
                  runAmountData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.run}</td>
                      <td>{item.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">No record found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default OddEven

