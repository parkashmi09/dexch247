import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "react-router"
import styles from "./CasinoResult.module.css"
import { gamesConfig } from "../index"
import { getLastResults } from "../../../apiservices/CasionApi"
import { mapLastResults } from "../../../utils/casinoResultUtils"

// Extract game route name from path
const getGameRouteName = (path) => {
  // Extract name from path like "/casino/teen62" -> "teen62" (trim any spaces)
  const match = path.match(/\/casino\/([^/\s]+)/)
  return match ? match[1].trim() : null
}

const CasinoResult = () => {
  const { gameName } = useParams()
  const [entries, setEntries] = useState(10)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState("07/03/2025")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Find the default game based on gameName param - memoized
  const findDefaultGame = useCallback(() => {
    if (gameName) {
      // Find game by matching route name
      const foundGame = gamesConfig.find(game => {
        const routeName = getGameRouteName(game.path)
        return routeName === gameName
      })
      if (foundGame) {
        return foundGame.path.trim() // Use path as the value, trim spaces
      }
    }
    // Default to first game if no match
    return gamesConfig[0]?.path?.trim() || ""
  }, [gameName])

  // Initialize game state only once
  const initialGame = useMemo(() => findDefaultGame(), [findDefaultGame])
  const [game, setGame] = useState(initialGame)

  // Get game type from selected game path - memoized
  const gameType = useMemo(() => {
    if (!game) return null
    const routeName = getGameRouteName(game)
    return routeName || null
  }, [game])

  // Fetch last results - memoized callback
  const fetchResults = useCallback(async () => {
    if (!gameType) return

    setLoading(true)
    try {
      const response = await getLastResults(gameType)
      const mappedResults = mapLastResults(response, gameType)
      setResults(mappedResults)
      setPage(1) // Reset to first page when results change
    } catch (error) {
      console.error('Error fetching last results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [gameType])

  // Fetch last results when game type changes (only on selection change, no interval)
  useEffect(() => {
    if (!gameType) return
    fetchResults()
  }, [gameType, fetchResults])

  // Update game when gameName param changes
  useEffect(() => {
    const defaultGame = findDefaultGame()
    if (defaultGame && defaultGame !== game) {
      setGame(defaultGame)
    }
  }, [gameName, findDefaultGame, game])

  // Filter and paginate results
  const filteredResults = results.filter(result => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      result.mid?.toString().toLowerCase().includes(searchLower) ||
      result.win?.toLowerCase().includes(searchLower)
    )
  })

  const startIndex = (page - 1) * entries
  const endIndex = startIndex + entries
  const paginatedResults = filteredResults.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredResults.length / entries)

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1)
  }

  const handleFirst = () => {
    setPage(1)
  }

  const handleLast = () => {
    setPage(totalPages)
  }

  const handlePageChange = (e) => {
    const value = Number.parseInt(e.target.value, 10)
    if (value > 0 && value <= totalPages) {
      setPage(value)
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>Casino Results</div>

      <div className={styles.filters}>
        <input type="date" className={styles.dateInput} value={date} onChange={(e) => setDate(e.target.value)} />

        <select className={styles.gameSelect} value={game} onChange={(e) => setGame(e.target.value)}>
          {gamesConfig.map((gameItem, index) => {
            return (
              <option key={index} value={gameItem.path.trim()}>
                {gameItem.title}
              </option>
            )
          })}
        </select>

        <button className={styles.submitBtn}>Submit</button>
      </div>

      <div className={styles.tableControls}>
        <div className={styles.entriesControl}>
          Show
          <select
            className={styles.entriesSelect}
            value={entries}
            onChange={(e) => setEntries(Number.parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          Entries
        </div>

        <div className={styles.searchControl}>
          Search:
          <input
            type="text"
            className={styles.searchInput}
            placeholder={`${filteredResults.length} records...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1) // Reset to first page when searching
            }}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{width:'9%'}}>Round ID</th>
              <th style={{width:'91%'}}>Winner</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                  Loading...
                </td>
              </tr>
            ) : paginatedResults.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                  No results found
                </td>
              </tr>
            ) : (
              paginatedResults.map((result, index) => (
                <tr key={result.mid || index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                  <td>{result.mid || 'N/A'}</td>
                  <td>{result.win || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button className={styles.paginationBtn} onClick={handleFirst}>
          First
        </button>
        <button className={styles.paginationBtn} onClick={handlePrevious} disabled={page === 1}>
          Previous
        </button>
        <button className={styles.paginationBtn} onClick={handleNext} disabled={page === totalPages}>
          Next
        </button>
        <button className={styles.paginationBtn} onClick={handleLast}>
          Last
        </button>

        <div className={styles.pageInfo}>
          Page {page} of {totalPages} | Go to Page
          <input type="text" className={styles.pageInput} value={page} onChange={handlePageChange} />
        </div>
      </div>
    </div>
  )
}

export default CasinoResult

