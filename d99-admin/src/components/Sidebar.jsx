import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSportsTree, getSportsData, getMatchPrivateData } from '../services/api'
import DEFAULT_SPORTS from '../data/sportsList'

function Sidebar() {
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [sportsTree, setSportsTree] = useState(DEFAULT_SPORTS)
  const [sportsData, setSportsData] = useState({})
  const [loadingSports, setLoadingSports] = useState({}) // Track loading state for each sport
  const [matchMarkets, setMatchMarkets] = useState({}) // Store markets for each match
  const [loadingMarkets, setLoadingMarkets] = useState({}) // Track loading state for each match
  const navigate = useNavigate()

  const handleCloseSidebar = () => {
    document.body.classList.add('vertical-collpsed')
  }

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await getSportsTree()

        // The API returns { success: true, data: { success: true, data: { t1: [...] } } }
        // So we need to access response.data.data.t1
        const treeData = response.data?.data?.t1 || response.data?.t1 || []
        if (treeData.length > 0) {
          setSportsTree(treeData)
        }
      } catch (error) {
        console.error('Failed to fetch sports tree:', error)
      }
    }
    fetchTree()
  }, [])

  const fetchSportData = async (sportId) => {
    if (sportsData[sportId] || loadingSports[sportId]) return // Already loaded or loading

    setLoadingSports(prev => ({ ...prev, [sportId]: true }))
    try {
      const response = await getSportsData(sportId)
      if (response.success && response.data) {
        const grouped = groupSportsData(response.data)
        setSportsData(prev => ({ ...prev, [sportId]: grouped }))
      }
    } catch (error) {
      console.error(`Failed to fetch data for sport ${sportId}:`, error)
    } finally {
      setLoadingSports(prev => ({ ...prev, [sportId]: false }))
    }
  }

  const groupSportsData = (data) => {
    // Check if data is nested in data.data
    const actualData = data.data || data
    // Combine t1 and t2 arrays if they exist
    const allEvents = [...(actualData.t1 || []), ...(actualData.t2 || [])]
    
    // Group by Series (cname) -> Date (stime) -> Match
    const grouped = {}
    
    allEvents.forEach(event => {
      const seriesName = event.cname || 'Other' // Use cname for series name
      if (!grouped[seriesName]) {
        grouped[seriesName] = {}
      }
      
      // Extract date from stime (e.g., "2025-11-29 14:30:00" -> "2025-11-29")
      const date = event.stime ? event.stime.split(' ')[0] : 'Unknown Date'
      
      if (!grouped[seriesName][date]) {
        grouped[seriesName][date] = []
      }
      
      grouped[seriesName][date].push(event)
    })
    
    return grouped
  }

  const toggleItem = (itemKey, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        // When collapsing, also collapse all children
        newSet.delete(itemKey)
        // Remove all child keys that start with this itemKey
        const keysToRemove = Array.from(newSet).filter(key => key.startsWith(itemKey + '-'))
        keysToRemove.forEach(key => newSet.delete(key))
      } else {
        // When expanding, only add this item (don't auto-expand children)
        newSet.add(itemKey)
        
        // If it's a sport ID (numeric), fetch data
        // We can check if the key corresponds to a sport ID from our tree
        const sport = sportsTree.find(s => s.etid.toString() === itemKey)
        if (sport) {
          fetchSportData(sport.etid)
        }
      }
      return newSet
    })
  }

  // Generate a simple match id for routing, with numeric sport id at the end
  const getMatchId = (league, date, match, sportId) => {
    // Example id format: AFRICA-CAF-Confederation-Cup_2025-11-29_Olympic-Safi-v-USM-Alger_1
    const slug = (str) =>
      String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    return `${slug(league)}_${date}_${slug(match)}_${sportId}`
  }

  const fetchMatchMarkets = async (gmid, sid) => {
    if (matchMarkets[gmid] || loadingMarkets[gmid]) return

    setLoadingMarkets(prev => ({ ...prev, [gmid]: true }))
    try {
      const response = await getMatchPrivateData(gmid, sid)
      console.log('Match private data:', response)
      
      let markets = []
      
      // Check for nested data structure (response.data.data)
      if (response.success && response.data && response.data.data && Array.isArray(response.data.data)) {
        markets = response.data.data
      }
      // Check for direct array (response.data)
      else if (response.success && Array.isArray(response.data)) {
        markets = response.data
      }
      // Check for single object
      else if (response.success && response.data && (response.data.mid || response.data.id)) {
        markets = [response.data]
      }
      // Fallback: try to make an array from values if it's an object
      else if (response.success && response.data && typeof response.data === 'object') {
         // Be careful not to include non-market objects
         const values = Object.values(response.data)
         if (values.length > 0 && (values[0]?.mid || values[0]?.id)) {
             markets = values
         }
      }

      setMatchMarkets(prev => ({ ...prev, [gmid]: markets }))
    } catch (error) {
      console.error(`Failed to fetch markets for match ${gmid}:`, error)
    } finally {
      setLoadingMarkets(prev => ({ ...prev, [gmid]: false }))
    }
  }

  const handleMatchClick = (match, sportId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const matchKey = `match-${match.gmid}`
    
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(matchKey)) {
        newSet.delete(matchKey)
      } else {
        newSet.add(matchKey)
        fetchMatchMarkets(match.gmid, sportId)
      }
      return newSet
    })
  }

  const handleMarketClick = (market, match, sportId) => {
    const marketId = market.mid || market.marketId || market.id
    // console.log('Navigating to market:', { sportId, matchId: match.gmid, marketId, market })
    
    if (!marketId) {
      console.error('Market ID is missing:', market)
      return
    }
    
    if (!sportId) {
       console.error('Sport ID is missing')
       return
    }

    // Navigate to /game-details/sportid/eventid/marketid
    const url = `/game-details/${sportId}/${match.gmid}/${marketId}`
    navigate(url)
    handleCloseSidebar()
  }

  return (
    <div className="vertical-menu">
      <div className="h-100" data-simplebar="init">
        <div className="simplebar-wrapper" style={{ margin: '0px' }}>
          <div className="simplebar-height-auto-observer-wrapper">
            <div className="simplebar-height-auto-observer"></div>
          </div>
          <div className="simplebar-mask">
            <div className="simplebar-offset" style={{ right: '0px', bottom: '0px' }}>
              <div 
                className="simplebar-content-wrapper" 
                tabIndex="0" 
                role="region" 
                aria-label="scrollable content" 
                style={{ height: '100%', overflow: 'hidden scroll' }}
              >
                <div className="simplebar-content" style={{ padding: '0px' }}>
                  <div id="sidebar-menu">
                    <ul id="side-menu" className="metismenu list-unstyled">
                      <li id="event-tree" className="menu-box">
                        <a href="javascript: void(0);" onClick={(e) => { e.preventDefault(); handleCloseSidebar(); }}>
                          <span>Sports</span>
                          <i className="fa fa-times float-right"></i>
                        </a>
                        <ul className="sub-menu mm-collapse mm-show">
                          {/* Dynamic Sports List */}
                          {sportsTree.map(sport => (
                            <li key={sport.etid}>
                              <span
                                onClick={(e) => toggleItem(sport.etid.toString(), e)}
                                style={{ cursor: 'pointer', padding: '0px 3px' }}
                              >
                                {sport.name} 
                                <b className="ml-1" style={{ float: 'right' }}>
                                  {expandedItems.has(sport.etid.toString()) ? '-' : '+'}
                                </b>
                              </span>

                              {expandedItems.has(sport.etid.toString()) && (
                                <ul className="sub-menu mm-show" style={{}}>
                                  {loadingSports[sport.etid] ? (
                                    <li><div className="loading-item">Loading...</div></li>
                                  ) : sportsData[sport.etid] ? (
                                    Object.entries(sportsData[sport.etid]).map(([seriesName, dates]) => (
                                      <li key={seriesName}>
                                        <span
                                          onClick={(e) => toggleItem(`${sport.etid}-${seriesName}`, e)}
                                          style={{ cursor: 'pointer', padding: '0px 20px 0px 0px' }}
                                        >
                                          {seriesName}
                                          <b className="ml-1" style={{ float: 'right' }}>
                                            {expandedItems.has(`${sport.etid}-${seriesName}`) ? '-' : '+'}
                                          </b>
                                        </span>

                                        {expandedItems.has(`${sport.etid}-${seriesName}`) && (
                                          <ul className="sub-menu mm-show" style={{ display: 'block' }}>
                                            {Object.entries(dates).map(([date, matches]) => (
                                              <li key={date}>
                                                <span
                                                  onClick={(e) => toggleItem(`${sport.etid}-${seriesName}-${date}`, e)}
                                                  style={{ cursor: 'pointer', padding: '0px 20px 0px 0px' }}
                                                >
                                                  {date}
                                                  <b className="ml-1" style={{ float: 'right' }}>
                                                    {expandedItems.has(`${sport.etid}-${seriesName}-${date}`) ? '-' : '+'}
                                                  </b>
                                                </span>

                                                {expandedItems.has(`${sport.etid}-${seriesName}-${date}`) && (
                                                  <ul className="sub-menu mm-show" style={{ display: 'block' }}>
                                                    {matches.map(match => (
                                                      <li
                                                        key={match.gmid}
                                                      >
                                                        <span
                                                          onClick={(e) => handleMatchClick(match, sport.etid, e)}
                                                          style={{ cursor: 'pointer', padding: '0px 20px 0px 0px' }}
                                                        >
                                                          {match.ename || match.name}
                                                          <b className="ml-1" style={{ float: 'right' }}>
                                                            {expandedItems.has(`match-${match.gmid}`) ? '-' : '+'}
                                                          </b>
                                                        </span>

                                                        {expandedItems.has(`match-${match.gmid}`) && (
                                                          <ul className="sub-menu mm-show" style={{}}>
                                                            {loadingMarkets[match.gmid] ? (
                                                              <li><div className="loading-item" style={{ paddingLeft: '60px' }}>Loading markets...</div></li>
                                                            ) : (matchMarkets[match.gmid] && Array.isArray(matchMarkets[match.gmid])) ? (
                                                              matchMarkets[match.gmid].map((market, index) => {
                                                                const marketId = market.mid || market.marketId || market.id
                                                                const marketName = market.mname || market.marketName || market.name
                                                                
                                                                if (!marketId || !marketName) return null // Skip invalid items

                                                                return (
                                                                  <li key={marketId || index}>
                                                                    <span
                                                                      onClick={() => handleMarketClick(market, match, sport.etid)}
                                                                      style={{ cursor: 'pointer', padding: '0px 20px 0px 0px', fontSize: '0.9em' }}
                                                                    >
                                                                      {marketName}
                                                                    </span>
                                                                  </li>
                                                                )
                                                              })
                                                            ) : (
                                                              <li><div className="no-data-item" style={{ paddingLeft: '60px' }}>No markets found</div></li>
                                                            )}
                                                          </ul>
                                                        )}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </li>
                                    ))
                                  ) : (
                                    <li><div className="no-data-item">No events found</div></li>
                                  )}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="simplebar-placeholder" style={{ width: 'auto', height: '2549px' }}></div>
        </div>
        <div className="simplebar-track simplebar-horizontal" style={{ visibility: 'hidden' }}>
          <div className="simplebar-scrollbar" style={{ width: '0px', display: 'none' }}></div>
        </div>
        <div className="simplebar-track simplebar-vertical" style={{ visibility: 'visible' }}>
          <div className="simplebar-scrollbar" style={{ height: '226px', display: 'block', transform: 'translate3d(0px, 0px, 0px)' }}></div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar