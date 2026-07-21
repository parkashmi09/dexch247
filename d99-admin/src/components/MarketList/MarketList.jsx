import { useState, useEffect } from 'react'
import './MarketList.css'

/**
 * MarketList Component
 * 
 * Displays a list of betting markets as clickable buttons.
 * Used for Soccer (sportId: 1) to show available betting markets.
 * 
 * @param {Object} props - Component props
 * @param {Array<string>} props.markets - Array of market names to display
 * @param {string} props.defaultActive - Default active market name
 * @param {Function} props.onMarketSelect - Callback when a market is selected
 */
function MarketList({ markets = [], defaultActive = '', onMarketSelect }) {
  const [activeMarket, setActiveMarket] = useState(defaultActive || (markets.length > 0 ? markets[0] : ''))
  
  // Sync with defaultActive prop when it changes (e.g., from route)
  useEffect(() => {
    if (defaultActive && defaultActive !== activeMarket) {
      setActiveMarket(defaultActive)
    }
  }, [defaultActive])

  /**
   * Handles market selection
   * @param {string} marketName - Name of the selected market
   */
  const handleMarketClick = (marketName) => {
    setActiveMarket(marketName)
    if (onMarketSelect) {
      onMarketSelect(marketName)
    }
    console.log('Market selected:', marketName)
  }

  if (!markets || markets.length === 0) {
    return null
  }

  return (
    <div className="market-name-list">
      {markets.map((market, index) => (
        <a
          key={index}
          href="javascript:void(0)"
          className={`btn btn-primary ${activeMarket === market ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            handleMarketClick(market)
          }}
        >
          {market}
        </a>
      ))}
    </div>
  )
}

export default MarketList

