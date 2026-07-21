import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import './style.css'

/**
 * Meter Component
 *
 * Displays meter markets from API data.
 * Maps data from marketsData prop filtered by mname === "meter"
 */
function Meter({ onBetLockClick, marketsData = [], exposureData = {} }) {
  const [showRunAmountModal, setShowRunAmountModal] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState('')
  const [runAmountData, setRunAmountData] = useState([])

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
  const transformMeterData = () => {
    // Find meter market from API data
    const meterMarket = marketsData.find(market => {
      const mname = market.mname || market.marketName || market.name
      return mname === 'meter'
    })

    if (!meterMarket || !meterMarket.section || !Array.isArray(meterMarket.section)) {
      return []
    }

    const marketStatus = meterMarket.status || ''
    
    // Transform each section to component format
    return meterMarket.section.map((section, index) => {
      // Find back and lay odds (tno: 0 is the best price)
      const backOdd = section.odds?.find(odd => odd.otype === 'back' && odd.tno === 0) ||
                     section.odds?.find(odd => odd.otype === 'back')
      const layOdd = section.odds?.find(odd => odd.otype === 'lay' && odd.tno === 0) ||
                    section.odds?.find(odd => odd.otype === 'lay')

      const backOdds = backOdd ? convertOdds(backOdd.odds) : 0
      const backAmount = backOdd ? (backOdd.size || 0) : 0
      const layOdds = layOdd ? convertOdds(layOdd.odds) : 0
      const layAmount = layOdd ? (layOdd.size || 0) : 0

      const sectionGstatus = section.gstatus || ''
      const isSuspended = sectionGstatus.toUpperCase() === 'SUSPENDED' || marketStatus.toUpperCase() === 'SUSPENDED'

      return {
        id: section.sid || index + 1,
        title: section.nat || section.name || '',
        layOdds: layOdds > 0 ? layOdds.toFixed(2) : '0',
        layAmount: layAmount,
        backOdds: backOdds > 0 ? backOdds.toFixed(2) : '0',
        backAmount: backAmount,
        min: section.min || 10,
        max: section.max ? (section.max >= 1000 ? `${(section.max / 1000).toFixed(0)}K` : section.max.toString()) : '2K',
        gstatus: sectionGstatus, // Use gstatus from API for suspended state
        isSuspended: isSuspended
      }
    })
  }

  // Get transformed meter markets from API
  const bettingMarkets = marketsData.length > 0 ? transformMeterData() : []

  // Don't render component if no data available
  if (bettingMarkets.length === 0) {
    return null
  }

  // Sample data structure for run amounts
  const getRunAmountData = (title) => {
    // Return sample data based on title
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
          <div data-toggle="collapse" data-target="#market1" aria-expanded="true" className="nation-name">
            <span title="Meter">Meter</span>
          </div>
          <div className="float-right">
            <a 
              href="javascript:void(0)" 
              className="btn btn-back"
              onClick={(e) => {
                e.preventDefault()
                if (onBetLockClick) {
                  onBetLockClick('Meter')
                }
              }}
            >
              Bet Lock
            </a>
          </div>
        </div>

        <div id="market1" data-title="OPEN" className="bet-table-body collapse show">
          {/* Header Row */}
          <div className="bet-table-row">
            <div className="text-right nation-name"></div>
            <div className="lay bl-title d-none-mobile">No</div>
            <div className="back bl-title d-none-mobile">Yes</div>
            <div className="bl-title-empty"></div>
          </div>

          {/* Data Rows */}
          {bettingMarkets.map((market, index) => {
            return (
              <div key={market.id}>
                <div className="fancy-tripple">
                  <div 
                    data-title={market.isSuspended ? "SUSPENDED" : (market.gstatus || "")} 
                    className={`bet-table-row ${market.isSuspended ? 'suspendedtext' : ''}`}
                  >
                    <div className="nation-name d-none-mobile">
                      <p onClick={() => handleTitleClick(market.title)}>{market.title}</p>
                      <p className={`mb-0 ${exposureData[market.title] >= 0 ? 'text-green' : 'text-red'}`}>
                        {exposureData[market.title] || 0}
                      </p>
                    </div>
                    <div className="bl-box lay">
                      <span className="d-block odds">{market.layOdds}</span>
                      <span className="d-block">{market.layAmount}</span>
                    </div>
                    <div className="bl-box back">
                      <span className="d-block odds">{market.backOdds}</span>
                      <span className="d-block">{market.backAmount}</span>
                    </div>
                    <div className="fancy-min-max">
                      Min:<span>{market.min}</span> Max:<span>{market.max}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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

export default Meter
