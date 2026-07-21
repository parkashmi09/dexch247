import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import './style.css'
import MatchOdds from '../../components/match-details/match-odds'
import Normal from '../../components/match-details/normal'
import Fancy from '../../components/match-details/fancy'
import Khado from '@/components/match-details/khado'
import OddEven from '../../components/match-details/oddeven'
import Meter from '@/components/match-details/meter'
import TiedMatch from '@/components/match-details/tied-match'
import SportsViewMoreBetsModal from '../../components/SportsViewMoreBetsModal'
import BetLockModal from '../../components/BetLockModal'
import MarketList from '../../components/MarketList/MarketList'
import GroupedBetsTable from './GroupedBetsTable'
import { getMatchPrivateData, getSportsData, getSportsScoreCard, getMatchExposureSummary, getMatchDownlineBets } from '../../services/api'


// Sport ID constants (matching database sport_id values)
const SPORT_IDS = {
  SOCCER: '1',
  TENNIS: '2',
  CRICKET: '4'
}

/**
 * GameDetails Page Component
 * 
 * Displays game details and betting markets based on sport type.
 * Conditionally renders betting components based on sportId:
 * - Cricket (sportId: 4): Shows all betting markets (MatchOdds, Normal, Fancy, Khado, OddEven, Meter, TiedMatch)
 * - Soccer (sportId: 1): Shows only MatchOdds
 * 
 * Route: /game-details/:sportId/:eventId/:marketId
 * 
 * @example
 * /game-details/4/481589204/5746424906884 (Cricket - all markets)
 * /game-details/1/481589204/5746424906884 (Soccer - MatchOdds only)
 */
function GameDetails() {
  // Extract route parameters
  const { sportId, eventId, marketId } = useParams()

  // Parse and store active IDs
  const activeSportId = sportId ? String(sportId) : null
  const activeEventId = eventId ? String(eventId) : null
  const activeMarketId = marketId ? String(marketId) : null

  // Determine if current sport is Cricket (shows all markets)
  const isCricket = useMemo(() => activeSportId === SPORT_IDS.CRICKET, [activeSportId])

  // Determine if current sport is Soccer (shows only MatchOdds)
  const isSoccer = useMemo(() => activeSportId === SPORT_IDS.SOCCER, [activeSportId])

  // State management
  const [activeTab, setActiveTab] = useState('matched')
  const [showBetLockModal, setShowBetLockModal] = useState(false)
  const [betLockMarketName, setBetLockMarketName] = useState(null)
  // Initialize selectedMarket based on route - will be updated when markets are loaded
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [markets, setMarkets] = useState([]) // Market names for MarketList (Soccer only)
  const [marketsData, setMarketsData] = useState([]) // Store full market objects (for both Soccer and Cricket)
  const lastRouteMarketIdRef = useRef(null) // Track last route marketId to detect actual route changes
  const isManualSelectionRef = useRef(false) // Track if selection was manual
  const [matchInfo, setMatchInfo] = useState({ name: '', series: '', time: '' }) // Match details for header
  const [scoreCardUrl, setScoreCardUrl] = useState(null)

  // Streaming State (mirrors FallbackStreamIframe logic from frontend)
  const [useFallbackStream, setUseFallbackStream] = useState(false)
  const streamLoadedRef = useRef(false)

  // Store exposure data scoped per market so two markets that share runner names
  // (e.g. MATCH_ODDS vs Bookmaker) don't bleed into each other.
  // byMarketId: { [marketId]: { [selectionName]: amount } }
  // byGameType: { [gameTypeLower]: { [selectionName]: amount } } (fallback match)
  // list: [{ marketId, gameType, marketName, name, exposure }] (for Book Summary)
  const [matchExposure, setMatchExposure] = useState({ byMarketId: {}, byGameType: {}, list: [] })
  const [matchedBets, setMatchedBets] = useState([])
  const [unmatchedBets, setUnmatchedBets] = useState([])
  const [betsLoading, setBetsLoading] = useState(false)
  const [showViewMoreModal, setShowViewMoreModal] = useState(false)
  const [isTvExpanded, setIsTvExpanded] = useState(false)
  const [isBookSummaryOpen, setIsBookSummaryOpen] = useState(true)

  // Markets that have data - these will update MatchOdds component


  // Helper function to check if a market exists in marketsData
  // Supports case-insensitive matching for better compatibility
  const hasMarket = (marketName) => {
    if (!marketName) return false
    const lowerMarketName = marketName.toLowerCase()
    return marketsData.some(market => {
      const mname = market.mname || market.marketName || market.name
      if (!mname) return false
      // Case-insensitive comparison
      return mname.toLowerCase() === lowerMarketName
    })
  }

  /**
   * Fetch match markets from API for both Soccer and Cricket
   * Market names are extracted from the 'mname' field in the API response
   * @param {boolean} shouldSetMarket - Whether to set the selected market based on route
   */
  const fetchMatchMarkets = useCallback(async (shouldSetMarket = false) => {
    if (!activeEventId || !activeSportId) {
      return
    }

    try {
      const response = await getMatchPrivateData(activeEventId, activeSportId)
      console.log('Match private data response:', response)

      let marketArray = []

      // Handle different response structures - array, single object, or nested
      if (response && response.success) {
        // Case 1: data is an array (most common)
        if (Array.isArray(response.data)) {
          marketArray = response.data
        }
        // Case 2: nested data structure (response.data.data)
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          marketArray = response.data.data
        }
        // Case 3: data is a single object (convert to array) - check for mid, id, or mname
        else if (response.data && typeof response.data === 'object' && (response.data.mid || response.data.id || response.data.mname)) {
          marketArray = [response.data]
        }
        // Case 4: data is an object with array-like structure
        else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Try to extract array from object values
          const values = Object.values(response.data)
          if (values.length > 0) {
            // Check if first value looks like a market object
            if (values[0] && (values[0].mid || values[0].id || values[0].mname)) {
              marketArray = values
            }
            // Check if values contain arrays of markets
            else if (Array.isArray(values[0])) {
              marketArray = values[0]
            }
          }
        }
      }

      console.log('Extracted marketArray:', marketArray)
      console.log('Market names found:', marketArray.map(m => m?.mname || m?.marketName || m?.name || 'unknown'))

      // Store full market objects for matching by ID (for both Soccer and Cricket)
      setMarketsData(marketArray)

      // Extract market names from the markets array (for MarketList - Soccer only)
      // Always use 'mname' field as primary source for market name
      if (isSoccer) {
        const marketNames = marketArray
          .map(market => {
            // Primary source: mname field from API response
            const marketName = market.mname || market.marketName || market.name
            return marketName
          })
          .filter(name => name) // Remove any null/undefined values

        setMarkets(marketNames)

        // Only set market on initial load or when explicitly requested (Soccer)
        if (shouldSetMarket) {
          if (activeMarketId) {
            const activeMarket = marketArray.find(market => {
              const marketId = market.mid || market.marketId || market.id
              return String(marketId) === String(activeMarketId)
            })

            if (activeMarket) {
              // Use mname field from API response as market name
              const marketName = activeMarket.mname || activeMarket.marketName || activeMarket.name
              if (marketName) {
                setSelectedMarket(marketName)
                lastRouteMarketIdRef.current = activeMarketId
                isManualSelectionRef.current = false
                return
              }
            }
          }

          // Set default market if no market is selected and no marketId in route
          if (marketNames.length > 0) {
            const defaultMarket = marketNames.find(name => name === 'MATCH_ODDS') || marketNames[0] || 'MATCH_ODDS'
            setSelectedMarket(defaultMarket)
            isManualSelectionRef.current = false
          }
        }
      } else if (isCricket && shouldSetMarket) {
        // For Cricket, set market based on route marketId
        // Market name is extracted from mname field in API response
        if (activeMarketId) {
          const activeMarket = marketArray.find(market => {
            const marketId = market.mid || market.marketId || market.id
            return String(marketId) === String(activeMarketId)
          })

          if (activeMarket) {
            // Use mname field from API response as market name (e.g., "MATCH_ODDS", "fancy1", "oddeven", "TIED_MATCH")
            const marketName = activeMarket.mname || activeMarket.marketName || activeMarket.name
            if (marketName) {
              setSelectedMarket(marketName)
              lastRouteMarketIdRef.current = activeMarketId
              isManualSelectionRef.current = false
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching match markets:', error)
      // Don't clear markets on error, keep previous data
    }
  }, [activeEventId, activeSportId, activeMarketId, isSoccer, isCricket])

  /**
   * Fetch matched and unmatched bets for downline users only.
   * Uses the dedicated /admin/reports/match-downline-bets endpoint which
   * enforces hierarchy filtering (owner → full tree, staff → descendants).
   */
  const fetchBets = useCallback(async () => {
    if (!activeEventId) return

    setBetsLoading(true)
    try {
      const params = {
        eventId: activeEventId,
        limit: 100
      }

      const response = await getMatchDownlineBets(params)
      if (response && response.success) {
        const allBets = response.data || []

        // Filter matched and unmatched bets based on the 'unmatched' flag
        // and fall back to status strings if flag is not present.
        const mBets = allBets.filter(bet => {
          if (bet.unmatched === true) return false;
          if (bet.unmatched === false) return true;
          // Fallback to status if unmatched flag is missing
          return ['matched', 'Match', 'MATCHED'].includes(bet.status);
        });

        const uBets = allBets.filter(bet => {
          if (bet.unmatched === true) return true;
          if (bet.unmatched === false) return false;
          // Fallback to status if unmatched flag is missing
          return ['OPEN', 'PENDING', 'open', 'pending'].includes(bet.status);
        });

        setMatchedBets(mBets)
        setUnmatchedBets(uBets)
      }
    } catch (error) {
      console.error('Error fetching downline bets:', error)
    } finally {
      setBetsLoading(false)
    }
  }, [activeEventId])

  // Fetch match details for header (works for both Soccer and Cricket)
  const fetchMatchDetails = useCallback(async () => {
    if (!activeEventId || !activeSportId) {
      return
    }

    try {
      const response = await getSportsData(activeSportId)
      const actualData = response.data?.data || response.data || response
      const allEvents = [...(actualData.t1 || []), ...(actualData.t2 || [])]

      // Find the match by gmid (eventId)
      const match = allEvents.find(event => String(event.gmid) === String(activeEventId))

      if (match) {
        const seriesName = match.cname || ''
        const matchName = match.ename || match.name || ''
        const startTime = match.stime || ''

        setMatchInfo({
          name: matchName,
          series: seriesName,
          time: startTime
        })
      } else {
        // If match not found, set default/fallback
        setMatchInfo({
          name: 'Match Details',
          series: '',
          time: ''
        })
      }
    } catch (error) {
      console.error('Error fetching match details:', error)
      // Set fallback on error
      setMatchInfo({
        name: 'Match Details',
        series: '',
        time: ''
      })
    }
  }, [activeEventId, activeSportId])

  // Fetch match details when eventId or sportId changes
  useEffect(() => {
    if (activeEventId && activeSportId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMatchDetails()

      const fetchScoreCard = async () => {
        try {
          const url = await getSportsScoreCard(activeEventId, activeSportId)
          setScoreCardUrl(url)
        } catch (error) {
          console.error("Error fetching scorecard:", error)
        }
      }
      fetchScoreCard()
    }
  }, [activeEventId, activeSportId, fetchMatchDetails])

  // Initial fetch and debounced updates (every 2 seconds) - For both Soccer and Cricket
  useEffect(() => {
    if (!activeEventId || !activeSportId) {
      return
    }

    const fetchExposure = async () => {
      const token = localStorage.getItem('ownerToken') || localStorage.getItem('staffToken') || localStorage.getItem('token')
      if (activeEventId) {
        try {
          const res = await getMatchExposureSummary(token, activeEventId);
          console.log('Match exposure initial response:', res)
          if (res && res.success && res.data) {
            // Keep exposure scoped per market. The backend already returns
            // markets[] each with its own matchId (the market ID / mid the bet
            // was placed on) + gameType + selections{}. We must NOT flatten by
            // selection name only, otherwise markets that share runner names
            // (MATCH_ODDS vs Bookmaker -> England/New Zealand/The Draw) collide
            // and the exposure renders against the wrong market.
            const byMarketId = {}
            const byGameType = {}
            const list = []
            const rawData = res.data

            const extractFromMarket = (market) => {
              if (!market || !market.selections || typeof market.selections !== 'object') return
              const midKey = String(market.matchId ?? market.id ?? '')
              const typeKey = String(market.gameType ?? '').trim().toLowerCase()
              if (midKey && !byMarketId[midKey]) byMarketId[midKey] = {}
              if (typeKey && !byGameType[typeKey]) byGameType[typeKey] = {}
              Object.entries(market.selections).forEach(([name, val]) => {
                const amt = Number(val) || 0
                if (midKey) byMarketId[midKey][name] = amt
                if (typeKey) byGameType[typeKey][name] = amt
                list.push({ marketId: midKey, gameType: market.gameType, marketName: market.marketName, name, exposure: amt })
              })
            }

            const extractFromMarkets = (markets) => {
              if (Array.isArray(markets)) {
                markets.forEach(extractFromMarket)
              } else if (markets && typeof markets === 'object') {
                Object.values(markets).forEach(extractFromMarket)
              }
            }

            if (Array.isArray(rawData)) {
              rawData.forEach(event => { if (event.markets) extractFromMarkets(event.markets) })
            } else if (rawData && typeof rawData === 'object') {
              if (rawData.markets) extractFromMarkets(rawData.markets)
              else if (rawData.selections) extractFromMarket(rawData)
            }
            setMatchExposure({ byMarketId, byGameType, list })
          }
        } catch (err) {
          console.error('Error fetching match exposure:', err)
        }
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatchMarkets(true)
    fetchBets()
    fetchExposure()

    // Set up interval to fetch data every 2 seconds (only update data, don't change selection)
    const intervalId = setInterval(() => {
      fetchMatchMarkets(false) // Don't set market during periodic updates
    }, 2000) // 2 seconds

    // Interval for exposure and bets (5 seconds is enough)
    const slowIntervalId = setInterval(() => {
      fetchExposure()
      fetchBets()
    }, 5000)

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(intervalId)
      clearInterval(slowIntervalId)
    }
  }, [activeEventId, activeSportId, fetchMatchMarkets, fetchBets, isTvExpanded])

  // Reset + arm fallback timer whenever the match (eventId) changes or TV is opened
  useEffect(() => {
    setUseFallbackStream(false)
    streamLoadedRef.current = false
    if (activeEventId && isTvExpanded) {
      const t = setTimeout(() => {
        if (!streamLoadedRef.current) setUseFallbackStream(true)
      }, 6000) // 6 second timeout for primary stream
      return () => clearTimeout(t)
    }
  }, [activeEventId, isTvExpanded])

  // Bets and exposure are handled in the main polling loop above

  // Update selected market only when route marketId actually changes (not on data updates)
  // Works for both Soccer and Cricket - uses mname field from API response
  useEffect(() => {
    // Only update if route marketId actually changed (different from last one we processed)
    if (activeMarketId && activeMarketId !== lastRouteMarketIdRef.current) {
      // Don't override if it's a manual selection (unless route actually changed to a different marketId)
      // Since activeMarketId !== lastRouteMarketIdRef.current, route did change, so we should update

      if (marketsData.length > 0) {
        const activeMarket = marketsData.find(market => {
          const marketId = market.mid || market.marketId || market.id
          return String(marketId) === String(activeMarketId)
        })

        if (activeMarket) {
          // Use mname field from API response as market name
          const marketName = activeMarket.mname || activeMarket.marketName || activeMarket.name
          if (marketName) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedMarket(marketName) // Update when route marketId changes
            lastRouteMarketIdRef.current = activeMarketId
            isManualSelectionRef.current = false // Mark as route-based selection
          }
        }
      }
      // Update the ref to track this route marketId (even if data not loaded yet)
      lastRouteMarketIdRef.current = activeMarketId
    }
  }, [activeMarketId, marketsData]) // Include marketsData to update when data loads

  /**
   * Transform API market data to component format
   * Works for both Soccer and Cricket markets
   * @param {Object} apiMarket - Market data from API
   * @returns {Object} Transformed market data
   */
  const transformMarketData = (apiMarket) => {
    if (!apiMarket || !apiMarket.section || !Array.isArray(apiMarket.section)) {
      return null
    }

    // Always use mname from API response (primary source for market name)
    const marketName = apiMarket.mname || apiMarket.marketName || apiMarket.name

    // Helper function to convert odds - handles both formats (decimal or multiplied by 100)
    const convertOdds = (oddsValue) => {
      if (!oddsValue || oddsValue <= 0) return 0
      // If odds are > 100, they're likely multiplied by 100, so divide
      // Otherwise, they're already in decimal format
      if (oddsValue > 100) {
        return parseFloat((oddsValue / 100).toFixed(2))
      }
      return parseFloat(oddsValue.toFixed(2))
    }

    // Handle HT/FT market (Soccer - has 9 sections)
    if (marketName === 'HT/FT' || marketName === 'HT-FT') {
      const items = apiMarket.section.map(section => {
        // Find back odds (usually tno: 0, but check all tiers)
        const backOdd = section.odds?.find(odd => odd.otype === 'back' && odd.tno === 0) ||
          section.odds?.find(odd => odd.otype === 'back' && odd.tno === 1) ||
          section.odds?.find(odd => odd.otype === 'back')

        const oddsValue = backOdd ? convertOdds(backOdd.odds) : 0

        return {
          label: (section.nat || section.name || '').trim(),
          odds: oddsValue
        }
      })
      return {
        type: 'htft',
        items: items
      }
    }

    // Helper function to transform a single section
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

      return {
        name: section.nat || section.name || '',
        odds: [
          { back: backOdds[0] || 0, lay: layOdds[0] || 0 },
          { back: backOdds[1] || 0, lay: layOdds[1] || 0 },
          { back: backOdds[2] || 0, lay: layOdds[2] || 0 }
        ],
        amounts: [
          { back: backAmounts[0] || 0, lay: layAmounts[0] || 0 },
          { back: backAmounts[1] || 0, lay: layAmounts[1] || 0 },
          { back: backAmounts[2] || 0, lay: layAmounts[2] || 0 }
        ]
      }
    }

    // Handle markets with 2 sections (OVER_UNDER, fancy1, TIED_MATCH for Cricket, etc.)
    // Works for both Soccer and Cricket
    if (apiMarket.section.length === 2) {
      return {
        team1: transformSection(apiMarket.section[0]),
        team2: transformSection(apiMarket.section[1])
      }
    }

    // Handle markets with more than 3 sections (multi-column layout like HT/FT)
    // For markets like "Match Result/Both Teams to score" with 6+ sections
    if (apiMarket.section.length > 3) {
      const marketStatus = apiMarket.status || ''
      const items = apiMarket.section.map(section => {
        // Find back odds (usually tno: 0)
        const backOdd = section.odds?.find(odd => odd.otype === 'back' && odd.tno === 0) ||
          section.odds?.find(odd => odd.otype === 'back')

        const sectionGstatus = section.gstatus || ''
        const isSuspended = sectionGstatus.toUpperCase() === 'SUSPENDED' || marketStatus.toUpperCase() === 'SUSPENDED'

        const oddsValue = (backOdd && !isSuspended && backOdd.odds > 0) ? convertOdds(backOdd.odds) : 0

        return {
          label: (section.nat || section.name || '').trim(),
          odds: isSuspended ? null : oddsValue, // null means show "—" for suspended
          isSuspended: isSuspended,
          gstatus: sectionGstatus
        }
      })
      return {
        type: 'multi-column',
        items: items
      }
    }

    // Handle markets with exactly 3 sections (MATCH_ODDS for Cricket with 3 teams, HALF_TIME, etc.)
    // Works for both Soccer and Cricket
    if (apiMarket.section.length === 3) {
      return {
        team1: transformSection(apiMarket.section[0]),
        team2: transformSection(apiMarket.section[1]),
        team3: apiMarket.section[2] ? transformSection(apiMarket.section[2]) : null
      }
    }

    return null
  }

  /**
   * Get market data based on selected market
   * Uses API data for both Soccer and Cricket (market name from mname field)
   * Falls back to static data only if API data is not available
   * @param {string} marketName - Market name (from mname field in API response)
   * @returns {Object} Market data with team1 and team2
   */
  const getMarketData = (marketName) => {
    // Use API data for both Soccer and Cricket
    // Market name is always extracted from mname field in API response
    if (marketsData.length > 0) {
      const wantedName = String(marketName || '').toLowerCase()
      const apiMarket = marketsData.find(market => {
        // Always use mname as primary source for market name matching.
        // Case-insensitive to stay consistent with hasMarket() — the feed uses
        // 'Bookmaker' (capital B) while the render passes lowercase 'bookmaker',
        // which otherwise fell through to the Victoria/Western Australia default.
        const name = market.mname || market.marketName || market.name
        return String(name || '').toLowerCase() === wantedName
      })

      if (apiMarket) {
        const transformed = transformMarketData(apiMarket)
        if (transformed) {
          return transformed
        }
      }
    }

    // Fallback to static data for cricket or if API data not available
    const defaultData = {
      team1: { name: 'Victoria', odds: [{ back: 1.74, lay: 2.06 }, { back: 1.9, lay: 2.12 }, { back: 1.94, lay: 2.34 }], amounts: [{ back: 1, lay: 2 }, { back: 83.02, lay: 11.31 }, { back: 2.07, lay: 185.45 }] },
      team2: { name: 'Western Australia', odds: [{ back: 1.74, lay: 2.06 }, { back: 1.9, lay: 2.12 }, { back: 1.94, lay: 2.86 }], amounts: [{ back: 250.46, lay: 1.95 }, { back: 12.62, lay: 74.4 }, { back: 2.12, lay: 152.03 }] }
    }

    const marketData = {
      'MATCH_ODDS': defaultData,
      'OVER_UNDER_25': {
        team1: { name: 'Over 2.5', odds: [{ back: 1.85, lay: 2.10 }, { back: 1.95, lay: 2.20 }, { back: 2.05, lay: 2.30 }], amounts: [{ back: 150, lay: 200 }, { back: 95.5, lay: 125.8 }, { back: 45.2, lay: 78.9 }] },
        team2: { name: 'Under 2.5', odds: [{ back: 1.75, lay: 2.00 }, { back: 1.88, lay: 2.15 }, { back: 1.98, lay: 2.25 }], amounts: [{ back: 180.3, lay: 175.5 }, { back: 110.2, lay: 95.8 }, { back: 52.1, lay: 88.4 }] }
      },
      'OVER_UNDER_05': {
        team1: { name: 'Over 0.5', odds: [{ back: 1.20, lay: 1.35 }, { back: 1.25, lay: 1.40 }, { back: 1.30, lay: 1.45 }], amounts: [{ back: 500, lay: 450 }, { back: 320.5, lay: 280.8 }, { back: 180.2, lay: 195.9 }] },
        team2: { name: 'Under 0.5', odds: [{ back: 3.50, lay: 4.20 }, { back: 3.75, lay: 4.50 }, { back: 4.00, lay: 4.80 }], amounts: [{ back: 85.3, lay: 75.5 }, { back: 45.2, lay: 38.8 }, { back: 25.1, lay: 28.4 }] }
      },
      'OVER_UNDER_15': {
        team1: { name: 'Over 1.5', odds: [{ back: 1.45, lay: 1.65 }, { back: 1.55, lay: 1.75 }, { back: 1.65, lay: 1.85 }], amounts: [{ back: 280, lay: 320 }, { back: 195.5, lay: 225.8 }, { back: 95.2, lay: 128.9 }] },
        team2: { name: 'Under 1.5', odds: [{ back: 2.40, lay: 2.80 }, { back: 2.60, lay: 3.00 }, { back: 2.80, lay: 3.20 }], amounts: [{ back: 120.3, lay: 105.5 }, { back: 75.2, lay: 65.8 }, { back: 42.1, lay: 48.4 }] }
      },
      // HT/FT removed - will use API data only
    }

    return marketData[marketName] || defaultData
  }

  /**
   * Get the exposure slice for a single market, scoped by the market's own ID.
   * This mirrors the user panel logic (match exposure by market mid, not by
   * selection name) so that markets sharing runner names don't show each
   * other's exposure. Falls back to gameType when the market ID isn't matched.
   * @param {string} marketName - mname of the market (e.g. "MATCH_ODDS", "Bookmaker", "Normal")
   * @returns {Object} { [selectionName]: amount }
   */
  const getMarketExposure = (marketName) => {
    const byMarketId = matchExposure?.byMarketId || {}
    const byGameType = matchExposure?.byGameType || {}
    const wanted = String(marketName || '').trim().toLowerCase()

    // Resolve this market's ID (mid) from the live markets feed
    const apiMarket = marketsData.find(market => {
      const name = market.mname || market.marketName || market.name
      return String(name || '').trim().toLowerCase() === wanted
    })
    const mid = apiMarket && (apiMarket.mid || apiMarket.marketId || apiMarket.id)

    if (mid != null && byMarketId[String(mid)]) return byMarketId[String(mid)]
    if (byGameType[wanted]) return byGameType[wanted]
    return {}
  }

  /**
   * Handles market selection from MarketList component
   * @param {string} marketName - Name of the selected market
   */
  const handleMarketSelect = (marketName) => {
    // Set the selected market and mark it as manual selection
    setSelectedMarket(marketName)
    isManualSelectionRef.current = true // Mark as manual selection so it persists
  }

  /**
   * Format API created_at to display date (DD/MM/YYYY HH:mm:ss)
   */
  const formatBetDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      return `${day}/${month}/${year} ${h}:${m}:${s}`
    } catch {
      return dateStr
    }
  }

  /**
   * Group bets by market_type and bet_type for table display (header + rows with back-border/lay-border)
   * Returns array of { marketType, betType, borderClass, date, bets } sorted by newest first
   */
  const groupBetsForTable = (bets) => {
    if (!bets || !bets.length) return []
    const map = new Map()
    bets.forEach((bet) => {
      const marketType = bet.market_type || bet.marketType || 'Market'
      const betType = (bet.bet_type || bet.betType || 'back').toLowerCase()

      // Determine if it's a lay-style bet (Lay or No)
      const selection = (bet.selection || bet.selection_name || '').toLowerCase()
      const isLay = betType === 'lay' || betType === 'no' || selection === 'no'

      const key = `${marketType}|${betType}`
      if (!map.has(key)) {
        map.set(key, {
          marketType,
          betType,
          borderClass: isLay ? 'lay-border' : 'back-border',
          bets: []
        })
      }
      map.get(key).bets.push(bet)
    })
    const groups = Array.from(map.values())
    groups.forEach((g) => {
      g.bets.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      g.date = g.bets[0]?.created_at
    })
    groups.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    return groups
  }

  /**
   * Handles Bet Lock button click
   * Opens the Bet Lock modal for account selection
   */
  const [betLockMarketId, setBetLockMarketId] = useState(null)

  const handleBetLockClick = (marketName) => {
    // Find the mid for this market from marketsData
    const market = marketsData.find(m => {
      const mname = m.mname || m.marketName || m.name
      return mname && mname.toLowerCase() === (marketName || '').toLowerCase()
    })
    const mid = market?.mid || activeMarketId
    setBetLockMarketId(mid ? String(mid) : null)
    setBetLockMarketName(marketName || 'MATCH_ODDS')
    setShowBetLockModal(true)
  }

  // Debug logging (remove in production)
  console.log('GameDetails Params:', {
    sportId: activeSportId,
    eventId: activeEventId,
    marketId: activeMarketId,
    isCricket,
    isSoccer
  })
  return (
    <Layout title="Game Details - Diamond Admin">
      <div className="detail-page-container">

        {/* Market Name List - Soccer Leagues Markets (Only shown for Soccer) */}
        {isSoccer && markets.length > 0 && (
          <MarketList
            markets={markets}
            defaultActive={selectedMarket || markets.find(name => name === 'MATCH_ODDS') || markets[0] || "MATCH_ODDS"}
            onMarketSelect={handleMarketSelect}
          />
        )}
        <div className="center-main-container">
          <div className="center-content">
            {/* Header section - displays match information */}
            <div className="game-header">
              <span className="game-header-name">
                {matchInfo.series && matchInfo.name
                  ? `${matchInfo.series} > ${matchInfo.name}`
                  : matchInfo.name || 'Loading match details...'}
              </span>
              <span className="game-header-time">
                <span>{matchInfo.time || 'Loading...'}</span>
              </span>
            </div>


            {/* Scorecard Section - uses API-resolved URL (works for all sports incl. football) */}
            {activeEventId && (
              <div className={`scorecard-frame${isCricket ? " scorecard-frame-cricket" : ""}`}>
                <iframe
                  src={isCricket
                    ? `https://scorecard.avrkhub.in/?etid=${activeSportId}&gmid=${activeEventId}&v=5`
                    : (scoreCardUrl || `https://scorecard.avrkhub.in/?etid=${activeSportId}&gmid=${activeEventId}`)}
                  title="Live Score Card"
                  frameBorder="0"
                  scrolling="no"
                  style={{ width: "100%", height: "100%", overflow: "hidden" }}
                />
              </div>
            )}



            {/* Match Odds - Always visible for all sports */}
            {/* For Soccer: updates based on selected market from MarketList (MATCH_ODDS, HALF_TIME, etc.) */}
            {/* For Cricket: always shows MATCH_ODDS from API data */}
            {/* For Soccer: Show MatchOdds component if selected market exists in API data */}
            {/* For Cricket: Show MatchOdds component only if MATCH_ODDS market exists */}
            {((isSoccer && selectedMarket && hasMarket(selectedMarket)) || (isCricket && hasMarket('MATCH_ODDS'))) && (
              <MatchOdds
                marketName={isCricket ? 'MATCH_ODDS' : (selectedMarket || 'MATCH_ODDS')}
                marketData={getMarketData(isCricket ? 'MATCH_ODDS' : (selectedMarket || 'MATCH_ODDS'))}
                onBetLockClick={handleBetLockClick}
                sportId={activeSportId}
                eventId={activeEventId}
                marketId={activeMarketId}
                exposureData={getMarketExposure(isCricket ? 'MATCH_ODDS' : (selectedMarket || 'MATCH_ODDS'))}
              />
            )}

            {/* Render Bookmaker market for Cricket if it exists */}
            {isCricket && (hasMarket('bookmaker') || hasMarket('Bookmaker')) && (
              <div className="my-3">
                <MatchOdds
                  marketName={hasMarket('bookmaker') ? 'bookmaker' : 'Bookmaker'}
                  marketData={getMarketData(hasMarket('bookmaker') ? 'bookmaker' : 'Bookmaker')}
                  onBetLockClick={handleBetLockClick}
                  sportId={activeSportId}
                  eventId={activeEventId}
                  marketId={activeMarketId}
                  exposureData={getMarketExposure(hasMarket('bookmaker') ? 'bookmaker' : 'Bookmaker')}
                />
              </div>
            )}

            {/* Cricket-specific betting markets - Only show for Cricket (sportId: 4) */}
            {/* For Cricket, data is mapped directly from API (marketsData) to components */}
            {/* Only render components for markets that exist in the API response based on mname */}
            {isCricket && (
              <>
                {/* Normal & Fancy markets - Render only if they exist */}
                {hasMarket('Normal') && hasMarket('fancy1') && (
                  <div className="d-flex gap-3 my-3">
                    <Normal
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('Normal')}
                    />
                    <Fancy
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('fancy1')}
                    />
                  </div>
                )}
                {hasMarket('Normal') && !hasMarket('fancy1') && (
                  <div className="my-3">
                    <Normal
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('Normal')}
                    />
                  </div>
                )}
                {!hasMarket('Normal') && hasMarket('fancy1') && (
                  <div className="my-3">
                    <Fancy
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('fancy1')}
                    />
                  </div>
                )}

                {/* Khado & OddEven markets - Render only if they exist */}
                {hasMarket('khado') && hasMarket('oddeven') && (
                  <div className="d-flex gap-3 my-3">
                    <Khado
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('khado')}
                    />
                    <OddEven
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('oddeven')}
                    />
                  </div>
                )}
                {hasMarket('khado') && !hasMarket('oddeven') && (
                  <div className="my-3">
                    <Khado
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('khado')}
                    />
                  </div>
                )}
                {!hasMarket('khado') && hasMarket('oddeven') && (
                  <div className="my-3">
                    <OddEven
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('oddeven')}
                    />
                  </div>
                )}

                {/* Meter market - Render only if it exists */}
                {hasMarket('meter') && (
                  <div className='my-3'>
                    <Meter
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('meter')}
                    />
                  </div>
                )}

                {/* Tied Match market - Render only if it exists */}
                {hasMarket('TIED_MATCH') && (
                  <div className='my-3'>
                    <TiedMatch
                      onBetLockClick={handleBetLockClick}
                      sportId={activeSportId}
                      eventId={activeEventId}
                      marketId={activeMarketId}
                      marketsData={marketsData}
                      exposureData={getMarketExposure('TIED_MATCH')}
                    />
                  </div>
                )}
              </>
            )}
            {/* OddEven market - Show for any sport if market exists (not just cricket) */}
            {hasMarket('oddeven') && (
              <div className='my-3'>
                <OddEven
                  onBetLockClick={handleBetLockClick}
                  sportId={activeSportId}
                  eventId={activeEventId}
                  marketId={activeMarketId}
                  marketsData={marketsData}
                  exposureData={getMarketExposure('oddeven')}
                />
              </div>
            )}

            {/* Soccer (sportId: 1) - Only MatchOdds is shown above, no additional markets */}
          </div>

          {/* Right Sidebar - Contains Book Summary, Score Card, and My Bets */}
          <div className="right-sidebar">
            {/* Book Summary Section - Collapsible summary of betting book */}
            <div className="booksum-box-container mb-2">
              {
                isCricket && (
                  <div
                    className="booksum-title"
                    onClick={() => setIsBookSummaryOpen(prev => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    Book Summary
                    <i
                      className={`fa fa-chevron-${isBookSummaryOpen ? 'up' : 'down'} float-right`}
                      style={{ fontSize: '12px', marginTop: '2px' }}
                    />
                  </div>
                )
              }
              {isBookSummaryOpen && (
                <div className="booksum-desc">
                  <div className="booksum-box">
                    {(matchExposure?.list?.length > 0) ? (
                      matchExposure.list.map((row, idx) => (
                        <div key={`${row.marketId}-${row.name}-${idx}`} className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
                          <span style={{ textAlign: 'left', flex: 1 }}>{row.name}</span>
                          <span style={{
                            textAlign: 'right',
                            color: row.exposure < 0 ? '#ff4d4f' : '#28c76f',
                            fontWeight: '600'
                          }}>
                            {row.exposure < 0 ? `(${Math.abs(row.exposure).toFixed(2)})` : row.exposure.toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span>No Data Found</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live TV Bar - Same style as My Bets */}
            <div className="mb-2 mt-2">
              <div
                className="card-header cursor-pointer"
                onClick={() => setIsTvExpanded(!isTvExpanded)}
                style={{ cursor: 'pointer' }}
              >
                <h6 className="card-title float-left">
                  <i className={`fa fa-tv mr-2 ${isTvExpanded ? 'text-danger' : ''}`}></i> Live TV
                </h6>
                <span className="float-right">
                  <i className={`fa fa-chevron-${isTvExpanded ? 'up' : 'down'}`}></i>
                </span>
              </div>

              {isTvExpanded && (
                <div className="streaming-container" style={{ width: '100%', height: '250px', backgroundColor: '#000' }}>
                  <iframe
                    key={useFallbackStream ? 'fallback' : 'primary'}
                    src={useFallbackStream
                      ? `https://live-stream.softgamingapi.com/directStream?gmid=${activeEventId}`
                      : `https://stream-s-43.uhdmovies.online/sports-stream?id=${activeEventId}`}
                    title="Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    scrolling="no"
                    onLoad={() => { streamLoadedRef.current = true }}
                    onError={() => setUseFallbackStream(true)}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              )}
            </div>
            {/* My Bets Section - Tabbed interface for matched/unmatched bets */}
            <div className="mb-2 my-bet">
              <div className="card-header">
                <h6 className="card-title float-left">My Bets</h6>
                <a
                  href="javascript:void(0)"
                  className="btn btn-back float-right"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowViewMoreModal(true)
                  }}
                >
                  View More
                </a>
              </div>
              <div>
                {/* Tab Navigation */}
                <div className="tabs mt-4">
                  <ul role="tablist" className="nav nav-tabs small">
                    <li role="presentation" className="nav-item">
                      <a
                        role="tab"
                        aria-selected={activeTab === 'matched'}
                        href="#"
                        className={`nav-link ${activeTab === 'matched' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveTab('matched')
                        }}
                      >
                        Matched Bets
                      </a>
                    </li>
                    <li role="presentation" className="nav-item">
                      <a
                        role="tab"
                        aria-selected={activeTab === 'unmatched'}
                        href="#"
                        className={`nav-link ${activeTab === 'unmatched' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveTab('unmatched')
                        }}
                      >
                        Unmatched Bets
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Tab Content - Betting table */}
                <div className="tab-content">
                  <GroupedBetsTable
                    columns={[
                      { key: 'username', label: 'UserName', getValue: (bet) => bet.username || bet.user?.username || '-' },
                      { key: 'selection', label: 'Nation', getValue: (bet) => bet.selection || bet.selection_name || '-' },
                      { key: 'odds', label: 'Rate', getValue: (bet) => bet.odds ?? '-', className: 'text-right' },
                      { key: 'amount', label: 'Amount', getValue: (bet) => bet.amount ?? bet.stake_amount ?? '-', className: 'text-right' }
                    ]}
                    groups={groupBetsForTable(activeTab === 'matched' ? matchedBets : unmatchedBets)}
                    emptyMessage={activeTab === 'matched' ? 'No matched bets found' : 'No unmatched bets found'}
                    formatDate={formatBetDate}
                  />
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Bet Lock Modal - Account selection and transaction code input */}
      <BetLockModal
        show={showBetLockModal}
        onHide={() => setShowBetLockModal(false)}
        sportId={activeSportId}
        eventId={activeEventId}
        marketId={betLockMarketId || activeMarketId}
        marketName={betLockMarketName}
      />
      <SportsViewMoreBetsModal
        show={showViewMoreModal}
        onHide={() => setShowViewMoreModal(false)}
        matchId={activeEventId}
      />
    </Layout>
  )
}

export default GameDetails


