
import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import HierarchicalTree from '../../components/HierarchicalTree'
import SportsLockSection from './SportsLockSection'
import api, { searchByUsername } from '../../services/api'
import { getSportsEventsData } from '../../data/sportsList'
import { API_ENDPOINTS } from '../../config/api'
import Toast from '../../utils/toast'
import '../reports/style.css'
import './general-lock.css'


/**
 * GeneralLock Component
 * 
 * Page for general lock settings with search and filter options.
 */
function GeneralLock() {
  const [clientName, setClientName] = useState('')
  const [transactionCode, setTransactionCode] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Search & Dropdown State
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeoutRef = useRef(null)

  // User State
  const [selfProfile, setSelfProfile] = useState(null)
  const [targetProfile, setTargetProfile] = useState(null) // The user we are currently editing

  const [eventsExpandedItems, setEventsExpandedItems] = useState(new Set())

  // Events data structure - initialize with default sports list for instant render
  const [eventsData, setEventsData] = useState(getSportsEventsData())
  const [loadingStates, setLoadingStates] = useState({}) // Track loading per item key

  // Casino data structure
  const [casinoData, setCasinoData] = useState([])

  // Helper to fetch locks for a specific ID
  const fetchLocks = async (staffId, type = 'OTHER') => {
    try {
      const locksResponse = await api.get(`${API_ENDPOINTS.TABLE_CASINO.LOCKS}/${staffId}`, {
        params: { type }
      })
      if (locksResponse.data && locksResponse.data.success) {
        const locks = locksResponse.data.data
        const lockMap = new Map(locks.map(l => [l.table_casino_id, l.is_locked]))

        setCasinoData(prev => prev.map(item => ({
          ...item,
          isLocked: lockMap.get(item.id) || false
        })))
      }
    } catch (error) {
      console.error('Error fetching locks:', error)
    }
  }

  // Fetch Sports Tree on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch Casino List
        const listRes = await api.get(API_ENDPOINTS.TABLE_CASINO.LIST)
        if (listRes.data && listRes.data.success) {
          setCasinoData(listRes.data.data.map(item => ({
            ...item,
            isLocked: false
          })))
        }

        // Fetch Sports Tree
        const treeRes = await api.get(API_ENDPOINTS.GET_SPORTS_TREE)
        
        let sportsData = treeRes.data;
        // Drill down to find t1/t2
        if (sportsData?.data?.t1) sportsData = sportsData.data;
        else if (sportsData?.data?.data?.t1) sportsData = sportsData.data.data;
        
        const t1 = sportsData?.t1 || [];
        const t2 = sportsData?.t2 || [];
        let sportsTree = [...t1, ...t2];

        // Fallback if no data from API
        if (sportsTree.length === 0) {
            console.warn('Using static fallback data for sports tree');
            // Transform fallback data to match API structure expectation if needed
            // But fallbackEventsData is already in the final format we use for state.
            // So we can set it directly? 
            // The logic below maps "sportsTree" (API format) to "initialEvents" (State format).
            // fallbackEventsData is ALREADY in State format.
        }
        
        // Update with API data if available (defaults already rendered)
        if (sportsTree.length > 0) {
            const apiEvents = sportsTree.map(sport => ({
                sportsId: sport.etid,
                name: sport.name,
                enabled: false,
                tree: [{
                    submarketId: 'loading',
                    name: 'Loading...',
                    enabled: false,
                    subtree: []
                }]
            }))
            setEventsData(apiEvents)
        }


        // Fetch Self Profile based on active role
        const activeRole = localStorage.getItem('activeRole');
        let profileRes;
        let profile;

        if (activeRole && activeRole.toLowerCase() === 'owner') {
          profileRes = await api.get(API_ENDPOINTS.USER.OWNER_PROFILE);
          if (profileRes.data && profileRes.data.success) {
            profile = profileRes.data.data;
          }
        } else {
          profileRes = await api.get(API_ENDPOINTS.USER.PROFILE);
          if (profileRes.data && profileRes.data.success) {
            profile = profileRes.data.data.staff || profileRes.data.data.user;
          }
        }

        if (profile) {
          // Normalize profile object
          const normalizedProfile = {
            id: profile.owner_id || profile.staff_id || profile.id,
            username: profile.username,
            role: profile.role
          }
          setSelfProfile(normalizedProfile)
          
          // Only set targetProfile to self if owner
          if (activeRole && activeRole.toLowerCase() === 'owner') {
             setTargetProfile(normalizedProfile) 
             // Load locks for self immediately
             console.log('Self Profile Loaded:', normalizedProfile)
             await fetchLocks(normalizedProfile.id, 'SELF')
          } else {
             setTargetProfile(null)
          }

        }

      } catch (error) {
        console.error('Error initializing data:', error)
      }
    }

    initData()
  }, [])
  
  // Helper to Group Sports Data by Series
  const groupSportsData = (data) => {
    let actualData = data;
    // Drill down to find t1/t2 - API response is deeply nested
    // Structure: { data: { data: { t1: [] } } }
    if (actualData.data) actualData = actualData.data;
    if (actualData.data) actualData = actualData.data;

    const allEvents = [...(actualData.t1 || []), ...(actualData.t2 || [])]
    
    // Group by Series (cname)
    const grouped = {}
    allEvents.forEach(event => {
      const seriesName = event.cname || 'Other'
      if (!grouped[seriesName]) {
        grouped[seriesName] = []
      }
      grouped[seriesName].push(event)
    })
    
    return grouped
  }

  // Handle Search Input Change (Debounced)
  const handleSearchChange = (e) => {
    const value = e.target.value
    setClientName(value)

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchByUsername(value)
        if (res.success && res.data && res.data.results) {
          setSearchResults(res.data.results)
          setShowDropdown(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      }
    }, 300)
  }

  // Handle Select User from Dropdown
  const handleSelectUser = async (user) => {
    setClientName(user.username)
    setShowDropdown(false)

    // Normalize selected user
    const selected = {
      id: user.staff_id || user.user_id,
      username: user.username,
      role: user.role || user.user_type
    }

    console.log('DEBUG handleSelectUser:', { user, selected });

    setTargetProfile(selected)
    // Clear locks viz until loaded
    setCasinoData(prev => prev.map(item => ({ ...item, isLocked: false })))
  }

  // Handle Load Button Click
  const handleLoad = async () => {
    if (!targetProfile) {
      Toast.fire({ icon: 'error', title: 'Please select a user first' })
      return
    }

    if (!transactionCode) {
      setPasswordError('Transaction code is required')
      return
    }

    try {
      // Verify Transaction Password
      // Fixed: Removed leading /api since it's likely part of the base URL config of the api instance
      const verifyRes = await api.post('/admin/transaction-password/verify', {
        transactionPassword: transactionCode
      })

      if (verifyRes.data && verifyRes.data.success) {
        // Password correct, fetch locks
        
        // Fix: Determine type correctly, checking for SELF (Owner)
        const isSelf = selfProfile && targetProfile.id === selfProfile.id && targetProfile.role === selfProfile.role;
        let type = isSelf ? 'SELF' : 'OTHER';
        if (targetProfile.role === 'USER') type = 'USER';
        
        console.log('DEBUG handleLoad:', { targetProfile, isSelf, type });
        
        await fetchLocks(targetProfile.id, type)
        setPasswordError('') // Clear error
        Toast.fire({ icon: 'success', title: 'Data loaded successfully' })
      } else {
        setPasswordError('Invalid transaction password')
        Toast.fire({ icon: 'error', title: 'Invalid transaction password' })
      }
    } catch (error) {
      console.error('Password verification error:', error)
      setPasswordError('Invalid transaction password')
      Toast.fire({ icon: 'error', title: 'Invalid transaction password' })
    }
  }

  // Handle Reset
  const handleReset = async () => {
    setClientName('')
    setTransactionCode('')
    setSearchResults([])
    setShowDropdown(false)
    setPasswordError('')

    const activeRole = localStorage.getItem('activeRole');
    if (selfProfile && activeRole && activeRole.toLowerCase() === 'owner') {
      setTargetProfile(selfProfile)
      await fetchLocks(selfProfile.id, 'SELF')
    } else {
      setTargetProfile(null)
      // Clear locks viz
      setCasinoData(prev => prev.map(item => ({ ...item, isLocked: false })))
    }
  }
// ... (rest of initial data fetching)

// ...

  // Fetch Logic Handlers
  const toggleEventsItem = async (itemId) => {
      // Toggle expansion state first
      setEventsExpandedItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
        } else {
          newSet.add(itemId)
        }
        return newSet
      })

      // Logic to fetch data if needed
      // Check if it's a Sport (L1) -> itemId = "market-{etid}"
      // Logic: The item ID for the sports level is generated by HierarchicalTree.
      // Assuming HierarchicalTree uses the ID property we give it? 
      // Actually HierarchicalTree likely uses the loop index or a property if specified.
      // Wait, HierarchicalTree.jsx implementation details matter here.
      // Let's assume the itemId passed here is the one we construct or the ID from data.
      
      // Based on previous logs and standard behavior, if we pass `marketId` as key, it uses that?
      // I need to check `HierarchicalTree.jsx` to be sure how it generates keys.
      // But based on `toggleItem(sport.etid.toString(), e)` in Sidebar, it uses ID.
      
      // Using `sportsId` now.
      
      if (itemId.startsWith('market-') && !itemId.includes('submarket')) {
          const sportsId = parseInt(itemId.split('-')[1])
          const sport = eventsData.find(s => s.sportsId === sportsId)
          
          // If tree has placeholder, fetch data
          if (sport && sport.tree.length === 1 && sport.tree[0].submarketId === 'loading') {
              try {
                  const res = await api.post(API_ENDPOINTS.GET_SPORT_DATA, { id: sportsId })
                  if (res.data) {
                      const grouped = groupSportsData(res.data)
                      
                      const newTree = Object.entries(grouped).map(([seriesName, matches], idx) => ({
                          submarketId: `series-${idx}`, // Generate simple relative ID
                          name: seriesName,
                          enabled: false,
                          subtree: matches.map(match => {
                              const matchObj = {
                                  name: match.ename || match.name,
                                  gmid: match.gmid,
                                  enabled: false,
                                  // Placeholder for markets
                                  matches: [{
                                      title: 'Loading markets...',
                                      evnets: []
                                  }]    
                              };
                              console.log('DEBUG Generated Match:', matchObj);
                              return matchObj;
                          })
                      }))

                      setEventsData(prev => prev.map(s => 
                          s.sportsId === sportsId ? { ...s, tree: newTree.length > 0 ? newTree : [] } : s
                      ))
                  }
              } catch (e) {
                  console.error('Error fetching sport data:', e)
                  // Remove placeholder
                   setEventsData(prev => prev.map(s => 
                          s.sportsId === sportsId ? { ...s, tree: [] } : s
                   ))
              }
          }
      }
      
      // Check if it's a Match (L3) -> itemId = "subtree-{sportsId}-{submarketId}-{subtreeIndex}"
      if (itemId.startsWith('subtree-')) {
          const parts = itemId.split('-') // ['subtree', sportsId, submarketId, subtreeIndex]
          const sportsId = parseInt(parts[1])
          const submarketId = parts[2] + '-' + parts[3] // 'series-0'
          const subtreeIndex = parseInt(parts[4])

          // Locate the match object
          const sport = eventsData.find(s => s.sportsId === sportsId)
          if (sport) {
              const series = sport.tree.find(t => t.submarketId === submarketId)
              if (series && series.subtree[subtreeIndex]) {
                  const match = series.subtree[subtreeIndex]
                  
                  // Check if needs fetch (placeholder present)
                  if (match.matches.length === 1 && match.matches[0].title === 'Loading markets...') {
                      try {
                          const res = await api.post(API_ENDPOINTS.GET_MATCH_PRIVATE_DATA, { gmid: match.gmid, sid: sportsId })
                          
                          let markets = []
                          if (res.data) {
                              const d = res.data;
                              if (d && d.data && d.data.data && Array.isArray(d.data.data)) {
                                  markets = d.data.data;
                              } else if (d && d.data && Array.isArray(d.data)) {
                                  markets = d.data;
                              } else if (Array.isArray(d)) {
                                  markets = d;
                              } else if (d && d.data && d.data.mid) {
                                  markets = [d.data];
                              } else if (d && d.mid) {
                                  markets = [d];
                              }
                          }
                          
                          // Format markets into groups (L4)
                          const marketEvents = [];
                          
                          // Helper to find or create group
                          const getGroup = (title) => {
                              let group = marketEvents.find(g => g.title === title);
                              if (!group) {
                                  group = { title, evnets: [] };
                                  marketEvents.push(group);
                              }
                              return group;
                          };

                          markets.forEach(m => {
                              if (!m) return;
                              
                              let groupTitle = m.gtype || 'Other';
                              // Normalize title
                              if (groupTitle.toLowerCase() === 'match') groupTitle = 'Match';
                              else if (groupTitle.toLowerCase() === 'oddeven') groupTitle = 'oddeven';
                              else if (groupTitle.toLowerCase() === 'fancy1') groupTitle = 'fancy1';
                              
                              const group = getGroup(groupTitle);
                              
                              // Logic to determine what to show (User: "render mname under event name")
                              // For Match Odds, mname is "MATCH_ODDS".
                              if (m.gtype === 'match') {
                                  group.evnets.push({
                                      name: m.mname,
                                      id: m.mid || m.marketId,
                                      enabled: false
                                  });
                              } else if (m.section && m.section.length > 0) {
                                  // For Fancy, list the runners
                                  m.section.forEach(sec => {
                                      group.evnets.push({
                                          name: sec.nat,
                                          id: sec.sid, 
                                          marketId: m.mid,
                                          enabled: false
                                      });
                                  });
                              } else {
                                  // Fallback
                                  group.evnets.push({
                                      name: m.mname || m.marketName,
                                      id: m.mid,
                                      enabled: false
                                  });
                              }
                          });

                          // Update State
                          setEventsData(prev => prev.map(s => {
                              if (s.sportsId !== sportsId) return s;
                              return {
                                  ...s,
                                  tree: s.tree.map(t => {
                                      if (t.submarketId !== submarketId) return t;
                                      return {
                                          ...t,
                                          subtree: t.subtree.map((st, idx) => {
                                              if (idx !== subtreeIndex) return st;
                                              return { ...st, matches: marketEvents.length > 0 ? marketEvents : [] };
                                          })
                                      }
                                  })
                              }
                          }))

                      } catch (e) {
                          console.error('Error fetching match markets:', e)
                          // Clear placeholder
                           setEventsData(prev => prev.map(s => {
                              if (s.sportsId !== sportsId) return s;
                              return {
                                  ...s,
                                  tree: s.tree.map(t => {
                                      if (t.submarketId !== submarketId) return t;
                                      return {
                                          ...t,
                                          subtree: t.subtree.map((st, idx) => {
                                              if (idx !== subtreeIndex) return st;
                                              return { ...st, matches: [] };
                                          })
                                      }
                                  })
                              }
                          }))
                      }
                  }
              }
          }
      }
  }

  const handleMarketToggle = (sportsId) => {
    setEventsData(prev => prev.map(item =>
      item.sportsId === sportsId
        ? { ...item, enabled: !item.enabled }
        : item
    ))
  }

  const handleSubmarketToggle = (sportsId, submarketId) => {
    setEventsData(prev => prev.map(market =>
      market.sportsId === sportsId
        ? {
          ...market,
          tree: market.tree.map(submarket =>
            submarket.submarketId === submarketId
              ? { ...submarket, enabled: !submarket.enabled }
              : submarket
          )
        }
        : market
    ))
  }

  const handleSubtreeToggle = (sportsId, submarketId, subtreeIndex) => {
    setEventsData(prev => prev.map(market =>
      market.sportsId === sportsId
        ? {
          ...market,
          tree: market.tree.map(submarket =>
            submarket.submarketId === submarketId
              ? {
                ...submarket,
                subtree: submarket.subtree.map((subtreeItem, stIdx) =>
                  stIdx === subtreeIndex
                    ? { ...subtreeItem, enabled: !(subtreeItem.enabled || false) }
                    : subtreeItem
                )
              }
              : submarket
          )
        }
        : market
    ))
  }

  // Toggle events under a match (e.g., Over / Under) – Match row itself has no checkbox
  const handleEventToggle = (sportsId, submarketId, subtreeIndex, matchIndex, eventIndex) => {
    setEventsData(prev => prev.map(market =>
      market.sportsId === sportsId
        ? {
          ...market,
          tree: market.tree.map(submarket =>
            submarket.submarketId === submarketId
              ? {
                ...submarket,
                subtree: submarket.subtree.map((subtreeItem, stIdx) =>
                  stIdx === subtreeIndex && subtreeItem.matches
                    ? {
                      ...subtreeItem,
                      matches: subtreeItem.matches.map((match, mIdx) =>
                        mIdx === matchIndex && match.evnets
                          ? {
                            ...match,
                            evnets: match.evnets.map((eventItem, eIdx) =>
                              eIdx === eventIndex
                                ? { ...eventItem, enabled: !(eventItem.enabled || false) }
                                : eventItem
                            )
                          }
                          : match
                      )
                    }
                    : subtreeItem
                )
              }
              : submarket
          )
        }
        : market
    ))
  }

  // Casino handlers
  const handleCasinoToggle = async (tableId, currentStatus) => {
    if (!targetProfile) {
      Toast.fire({
        icon: 'error',
        title: 'No user selected'
      });
      return
    }

    // Validate transaction password - must be provided
    if (!transactionCode) {
       setPasswordError('Transaction code is required to make changes')
       Toast.fire({ icon: 'error', title: 'Transaction code is required' })
       return
    }

    // Clear any previous errors
    setPasswordError('')

    const newStatus = !currentStatus

    // Optimistic update
    setCasinoData(prev => prev.map(item =>
      item.id === tableId ? { ...item, isLocked: newStatus } : item
    ))

    try {
      // Determine type: SELF if target is same as self, else OTHER
      // Fix: Check role equality to prevent ID collision between Owner/Staff and User
      const isSelf = selfProfile && targetProfile.id === selfProfile.id && targetProfile.role === selfProfile.role;
      let type = isSelf ? 'SELF' : 'OTHER';

      console.log('DEBUG handleCasinoToggle:', { targetProfile, isSelf });

      if (targetProfile.role === 'USER') type = 'USER';

      const payload = {
        tableCasinoId: tableId,
        isLocked: newStatus,
        type,
        transactionPassword: transactionCode
      };

      // Only send staffId if it's NOT self (for self, backend uses token)
      if (!isSelf) {
        if (type === 'USER') {
          payload.userId = targetProfile.id;
        } else {
          payload.staffId = targetProfile.id;
        }
      }

      await api.post(API_ENDPOINTS.TABLE_CASINO.LOCK, payload)
      Toast.fire({
        icon: 'success',
        title: 'Lock updated successfully'
      });
    } catch (error) {
      console.error('Error updating lock:', error)
      // Revert on error
      setCasinoData(prev => prev.map(item =>
        item.id === tableId ? { ...item, isLocked: currentStatus } : item
      ))
      
      const msg = error.response?.data?.message || 'Failed to update lock';
      Toast.fire({
        icon: 'error',
        title: msg
      });
      
      if (msg.toLowerCase().includes('password')) {
          setPasswordError(msg);
      }
    }
  }



  return (
    <Layout title="General Lock - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  General Lock
                </h4>
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  <form method="post" className="ajaxFormSubmit" onSubmit={(e) => e.preventDefault()}>
                    <div className="row row5">
                      <div className="col-md-3 position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search By Client Name"
                          value={clientName}
                          onChange={handleSearchChange}
                          onFocus={() => clientName && setShowDropdown(true)}
                        />
                        {/* Search Dropdown */}
                        {showDropdown && searchResults.length > 0 && (
                          <div className="search-dropdown">
                            {searchResults.map(user => (
                              <div
                                key={user.wallet_id || user.user_id}
                                className="search-dropdown-item"
                                onClick={() => handleSelectUser(user)}
                              >
                                {user.username} ({user.user_type || user.role})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                          placeholder="Transaction Code"
                          value={transactionCode}
                          onChange={(e) => {
                            setTransactionCode(e.target.value)
                            // Clear password error when user types
                            if (passwordError) {
                              setPasswordError('')
                            }
                          }}
                        />
                        {passwordError && (
                          <div className="invalid-feedback d-block">
                            {passwordError}
                          </div>
                        )}
                      </div>
                      <div className="col-md-3 d-flex align-items-end gap-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleLoad}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleReset}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="user-lock-container">
            <div className="row mt-4">

              <div className='col-lg-6 col-12'>
                <h4 className="ptitle">Events</h4>
                <SportsLockSection 
                    api={api} 
                    API_ENDPOINTS={API_ENDPOINTS}
                    profile={selfProfile}
                    targetProfile={targetProfile}
                    transactionCode={transactionCode}
                />
              </div>

              <div className='col-lg-6 col-12'>
                <h4 className="ptitle">Casino List</h4>
                <div className="casino-list-container" style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #eee', padding: '15px' }}>
                  <ul className="list-unstyled">
                    {casinoData.map((game) => (
                      <li key={game.id} className="mb-2">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`casino-check-${game.id}`}
                            checked={game.isLocked || false}
                            onChange={() => handleCasinoToggle(game.id, game.isLocked)}
                          />
                          <label className="custom-control-label" htmlFor={`casino-check-${game.id}`}>
                            {game.tablename}
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default GeneralLock

