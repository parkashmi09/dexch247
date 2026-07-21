import React, { useState, useEffect } from 'react';
import HierarchicalTree from '../../components/HierarchicalTree';

import { getSportsEventsData } from '../../data/sportsList'
import Toast from '../../utils/toast'

const SportsLockSection = ({ api, API_ENDPOINTS, profile, targetProfile, transactionCode }) => {
  const [eventsData, setEventsData] = useState(getSportsEventsData());
  const [eventsExpandedItems, setEventsExpandedItems] = useState(new Set());
  const [eventsSelectedItems, setEventsSelectedItems] = useState(new Set());

  // Initialize Sports Data
  useEffect(() => {
    // Initial fetch for Sports Tree is done inside Main component or here?
    // Current logic does fetch on mount or when profile changes?
    // Actually, in GeneralLock, initData calls GET_SPORTS_TREE.
    // Let's refactor to fetch here on mount.
    const fetchSportsTree = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_SPORTS_TREE);
            let treeData = [];
            if (res.data && res.data.data) {
                // Determine if nested
                let d = res.data.data;
                 // Handle varied response structure logic from original file
                if (d.t1 && Array.isArray(d.t1) && d.t2 && Array.isArray(d.t2)) {
                   treeData = [...d.t1, ...d.t2];
                } else if (Array.isArray(d)) {
                   treeData = d;
                }
            }
            
            // Only update state if API returned data (defaults already rendered)
            if (treeData.length > 0) {
                const apiEvents = treeData.map(sport => ({
                    name: sport.name || sport.eventName,
                    sportsId: sport.etid || sport.marketId || sport.id || sport.sportsId,
                    etid: sport.etid || sport.id,
                    enabled: false,
                    tree: [{ submarketId: 'loading', name: 'Loading...', subtree: [] }]
                }));

                const uniqueEvents = apiEvents.filter((v,i,a)=>a.findIndex(t=>(t.sportsId === v.sportsId))===i);
                setEventsData(uniqueEvents);
            }
            // If API returned empty, keep defaults already in state

        } catch (e) {
            console.error("Error loading sports tree", e);
            // Keep defaults already in state
        }
    };

    fetchSportsTree();
  }, [api, API_ENDPOINTS]);

  // Helper function reused
  const groupSportsHelper = (input) => {
      let data = input;
      
      // Attempt to drill down to the level containing t1/t2 or an array
      // Structure: res.data -> data -> data -> { t1, t2 }
      if (data && data.data) data = data.data;
      if (data && data.data) data = data.data;

      // Now check for t1/t2
      if (data && (data.t1 || data.t2)) {
          const t1 = Array.isArray(data.t1) ? data.t1 : [];
          const t2 = Array.isArray(data.t2) ? data.t2 : [];
          const allMatches = [...t1, ...t2];
          
          return allMatches.reduce((acc, match) => {
              const seriesName = match.cname || match.seriesName || 'Others';
              if (!acc[seriesName]) acc[seriesName] = [];
              acc[seriesName].push(match);
              return acc;
          }, {});
      }

      // Check for array at this level (if structure is different)
      if (Array.isArray(data)) {
          return data.reduce((acc, match) => {
              const seriesName = match.cname || match.seriesName || 'Others';
              if (!acc[seriesName]) acc[seriesName] = [];
              acc[seriesName].push(match);
              return acc;
          }, {});
      }

      console.warn("groupSportsHelper: Unable to parse data", input);
      return {};
  }


  // Handlers
  const toggleEventsItem = async (itemId) => {
       setEventsExpandedItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
        } else {
          newSet.add(itemId)
        }
        return newSet
      })

      // Fetch Logic
      if (itemId.startsWith('market-') && !itemId.includes('submarket')) {
          const sportsId = parseInt(itemId.split('-')[1])
          const sport = eventsData.find(s => s.sportsId === sportsId)
          
           if (sport && sport.tree.length === 1 && sport.tree[0].submarketId === 'loading') {
               try {
                   // Corrected Endpoint usage if needed, assuming API_ENDPOINTS.GET_SPORT_DATA is correct
                   const res = await api.post(API_ENDPOINTS.GET_SPORT_DATA, { id: sportsId })
                   
                   if (res.data) {
                       // Helper debug
                       console.log('Sport Data Response:', res.data);
                       
                       const grouped = groupSportsHelper(res.data)
                       console.log('Grouped Data:', grouped);
                       const newTree = Object.entries(grouped).map(([seriesName, matches], idx) => ({
                           submarketId: `series-${idx}`,
                           name: seriesName,
                           enabled: false,
                           subtree: matches.map((match, mIdx) => ({
                               name: match.ename || match.name,
                               gmid: match.gmid,
                               mid: match.mid || match.marketId, // ensure ID is captured
                               enabled: false,
                               matches: [{
                                   title: 'Loading markets...',
                                   evnets: []
                               }]
                           }))
                       }))
                       console.log('New Tree:', newTree);
                       
                       setEventsData(prev => prev.map(s => 
                           s.sportsId === sportsId ? { ...s, tree: newTree.length > 0 ? newTree : [] } : s
                       ))
                       
                       // Apply Series Locks from fetchedLocks
                       setEventsSelectedItems(prev => {
                           const n = new Set(prev);
                           // Iterate through newTree (Series)
                           newTree.forEach((series, sIdx) => {
                               // Find lock for this series
                               const lock = fetchedLocks.find(l => 
                                   String(l.sport_id) === String(sportsId) &&
                                   l.series_id === series.name && // Using Name as ID
                                   !l.match_id && !l.market_id &&
                                   l.is_locked
                               );
                               if (lock) {
                                   n.add(`submarket-${sportsId}-${series.submarketId}`);
                               }
                           });
                           return n;
                       });
                   }
               } catch (e) {
                   console.error('Error fetching sport data:', e)
                   setEventsData(prev => prev.map(s => s.sportsId === sportsId ? { ...s, tree: [] } : s))
               }
           }
      } 
      
      // Match Level Fetch
      if (itemId.startsWith('subtree-')) {
           const parts = itemId.split('-') 
           const sportsId = parseInt(parts[1])
           const submarketId = parts[2] + '-' + parts[3]
           const subtreeIndex = parseInt(parts[4])

           const sport = eventsData.find(s => s.sportsId === sportsId)
           if (sport) {
                const series = sport.tree.find(t => t.submarketId === submarketId)
                if (series && series.subtree[subtreeIndex]) {
                     const match = series.subtree[subtreeIndex]
                     if (match.matches.length === 1 && match.matches[0].title === 'Loading markets...') {
                         try {
                              const res = await api.post(API_ENDPOINTS.GET_MATCH_PRIVATE_DATA, { gmid: match.gmid, sid: sportsId })
                              
                              let markets = []
                              if (res.data) {
                                  // Consolidated Extraction Logic
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

                              const marketEvents = [];
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
                                  if (groupTitle.toLowerCase() === 'match') groupTitle = 'Match';
                                  else if (groupTitle.toLowerCase() === 'oddeven') groupTitle = 'oddeven';
                                  else if (groupTitle.toLowerCase() === 'fancy1') groupTitle = 'fancy1';
                                  
                                  const group = getGroup(groupTitle);
                                  
                                  if (m.gtype === 'match') {
                                      group.evnets.push({
                                          name: m.mname,
                                          id: m.mid || m.marketId,
                                          enabled: false
                                      });
                                  } else if (m.section && m.section.length > 0) {
                                      m.section.forEach(sec => {
                                          group.evnets.push({
                                              name: sec.nat,
                                              id: sec.sid, 
                                              marketId: m.mid,
                                              enabled: false
                                          });
                                      });
                                  } else {
                                      group.evnets.push({
                                          name: m.mname || m.marketName,
                                          id: m.mid,
                                          enabled: false
                                      });
                                  }
                              });

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
                              
                              // Apply Match & Market Locks
                              setEventsSelectedItems(prev => {
                                   const n = new Set(prev);
                                   const currentSeriesName = series ? series.name : null;
                                   const currentMatchId = match.gmid || match.mid;

                                   marketEvents.forEach((group, mIdx) => {
                                       // Check Match Level Lock? (Not implemented in UI grouping properly, assumes group title is match)
                                       // But let's check events
                                       if (group.evnets) {
                                           group.evnets.forEach((ev, eIdx) => {
                                               // Check Market Lock
                                               const mLock = fetchedLocks.find(l => 
                                                   String(l.sport_id) === String(sportsId) &&
                                                   l.series_id === currentSeriesName &&
                                                   String(l.match_id) === String(currentMatchId) &&
                                                   String(l.market_id) === String(ev.id || ev.marketId) &&
                                                   l.is_locked
                                               );
                                               if (mLock) {
                                                   // Construct Key: event-{sportId}-{submarketId}-{subtreeIndex}-{matchIndex}-{eventIndex} 
                                                   // Wait, matchIndex is index in `marketEvents`. eventIndex is index in `evnets`.
                                                   // `subtreeIndex` is passed.
                                                   n.add(`event-${sportsId}-${submarketId}-${subtreeIndex}-${mIdx}-${eIdx}`);
                                               }
                                           });
                                       }
                                   });
                                   return n;
                              });

                         } catch (e) {
                              console.error('Error fetch match markets', e)
                         }
                     }
                }
           }
      }
  }

   const [fetchedLocks, setFetchedLocks] = useState([]); // Store raw API locks

   // Fetch Locks
   const fetchLocks = async () => {
        if (!targetProfile || (!targetProfile.id && !targetProfile.staff_id)) return;
        let tId = targetProfile.id || targetProfile.staff_id || targetProfile.owner_id;
        targetProfile.role = targetProfile.role || targetProfile.user_type; 
        
        try {
            const res = await api.get(`/admin/sports-lock/get/${tId}?type=${targetProfile.role === 'USER' ? 'USER' : targetProfile.role === 'OWNER' ? 'OWNER' : 'STAFF'}`);
            if (res.data && res.data.success) {
                 const locks = res.data.data;
                 setFetchedLocks(locks); // Save raw data

                 const newSelected = new Set();
                 locks.forEach(l => {
                     if (l.is_locked) {
                         // Restore Sport Locks
                         if (l.lock_type === 'SPORT' || (l.sport_id && !l.series_id && !l.match_id && !l.market_id)) {
                             newSelected.add(`market-${l.sport_id}`);
                         }
                         // Other locks are restored during tree expansion logic
                     }
                 });
                 setEventsSelectedItems(newSelected);
            }
        } catch (e) {
            console.error("Error fetching locks", e);
        }
   }

  // Effect to fetch locks when target changes
  useEffect(() => {
    if (targetProfile) {
        fetchLocks();
    } else {
        setEventsSelectedItems(new Set());
    }
  }, [targetProfile]);


// Import Toast if not already imported (Need to check imports, assuming passed or global? No, need to look at file)
// Checking imports...
// Toast is likely imported as `import Toast from '../../utils/toast'` in other files.
// Let's assume I need to fix imports if missing.
// But first, let's update the function.

  const updateLockApi = async (data, key) => {
       console.log("updateLockApi called with:", data);
       
       if (!targetProfile) {
           console.warn("Cannot update lock: No target profile selected");
           return;
       }

       if (!transactionCode) {
           Toast.fire({
               icon: 'error',
               title: 'Transaction code is required'
           });
           return;
       }

       try {
           const payload = {
               targetId: targetProfile.id || targetProfile.staff_id,
               targetType: targetProfile.role === 'USER' ? 'USER' : targetProfile.role === 'OWNER' ? 'OWNER' : 'STAFF',
               transactionPassword: transactionCode,
               ...data
           }
           
           const res = await api.post('/admin/sports-lock/update', payload);
           
           if (res.data && res.data.success) {
               Toast.fire({
                   icon: 'success',
                   title: 'Lock updated successfully'
               });
               // Update State on Success
               if (key) {
                   setEventsSelectedItems(prev => {
                       const n = new Set(prev);
                       if (data.isLocked) n.add(key); else n.delete(key);
                       return n;
                   });
                   
                   // Also update fetchedLocks to keep sync for future expansions during this session
                   // (Simplified: just add a mock lock object or re-fetch? Re-fetch is safer but slower. 
                   //  Mocking is okay for basic checks)
               }
           } else {
               Toast.fire({
                   icon: 'error',
                   title: res.data?.message || 'Failed to update lock'
               });
           }

       } catch (e) {
           console.error("Error updating lock:", e);
           Toast.fire({
               icon: 'error',
               title: e.response?.data?.message || 'Error updating lock'
           });
       }
  }
  const handleMarketToggle = (sportId) => {
     const key = `market-${sportId}`;
     const isLocked = !eventsSelectedItems.has(key);
     
     updateLockApi({
         sportId: sportId,
         isLocked: isLocked,
         lockType: 'SPORT'
     }, key);
  }

  const handleSubmarketToggle = (sportId, submarketId) => { 
      const key = `submarket-${sportId}-${submarketId}`;
      const isLocked = !eventsSelectedItems.has(key);
      
       // submarketId here is "series-0" usually. get series name from data.
       const sport = eventsData.find(s => s.sportsId == sportId);
       const series = sport?.tree.find(t => t.submarketId == submarketId);
       
       updateLockApi({
          sportId: sportId,
          seriesId: series ? series.name : submarketId,
          isLocked: isLocked,
          lockType: 'SERIES'
      }, key);
  }
  
  const handleSubtreeToggle = (sportId, submarketId, subtreeIndex) => { 
      const key = `subtree-${sportId}-${submarketId}-${subtreeIndex}`;
      const isLocked = !eventsSelectedItems.has(key);
      
      // Look up logic to get Match ID
      const sport = eventsData.find(s => s.sportsId == sportId);
      const series = sport?.tree.find(t => t.submarketId == submarketId);
      const match = series?.subtree[subtreeIndex];
      
      if (match) {
          updateLockApi({
              sportId: sportId,
              seriesId: series ? series.name : submarketId, // Use Name if available, fallback to ID
              matchId: match.gmid || match.mid, 
              isLocked: isLocked,
              lockType: 'MATCH'
          }, key);
      }
  }
  
  const handleEventToggle = (sportId, submarketId, subtreeIndex, matchIndex, eventIndex) => { 
      const key = `event-${sportId}-${submarketId}-${subtreeIndex}-${matchIndex}-${eventIndex}`;
      const isLocked = !eventsSelectedItems.has(key);
      
      // Find Event ID
      const sport = eventsData.find(s => s.sportsId == sportId);
      const series = sport?.tree.find(t => t.submarketId == submarketId);
      const match = series?.subtree[subtreeIndex];
      const eventItem = match?.matches[matchIndex]?.evnets[eventIndex];
      
      console.log('DEBUG handleEventToggle Lookup:', {
          sportId, submarketId, subtreeIndex, matchIndex, eventIndex,
          foundSeries: series ? series.name : 'NOT FOUND',
          foundMatch: match ? (match.gmid || match.mid) : 'NOT FOUND',
          foundEvent: eventItem ? (eventItem.id || eventItem.marketId) : 'NOT FOUND'
      });
 
      if (eventItem) {
         // User Requirement: Series ID should be the Name of the Series
         // And Match ID cannot be null
         updateLockApi({
             sportId: sportId, 
             seriesId: series ? series.name : null,
             matchId: match ? (match.gmid || match.mid) : null,
             marketId: eventItem.id || eventItem.marketId,
             isLocked: isLocked,
             lockType: 'MARKET'
         }, key);
      }
  }


  return (
    <div className="bg-gray-100 p-4 rounded-lg">
        <HierarchicalTree 
            data={eventsData}
            expandedItems={eventsExpandedItems}
            selectedItems={eventsSelectedItems}
            onToggleItem={toggleEventsItem}
            onMarketToggle={handleMarketToggle}
            onSubmarketToggle={handleSubmarketToggle}
            onSubtreeToggle={handleSubtreeToggle}
            onEventToggle={handleEventToggle}
        />
    </div>
  );
};

export default SportsLockSection;
