import angleDownIcon from '../assets/images/angle-down-solid-full.svg'

/**
 * HierarchicalTree Component
 * 
 * Reusable component for rendering hierarchical tree structures with checkboxes and expandable items
 */
function HierarchicalTree({
  data,
  expandedItems,
  selectedItems = new Set(),
  onToggleItem,
  onMarketToggle,
  onSubmarketToggle,
  onSubtreeToggle,
  onEventToggle,
  prefix = ''
}) {
  return (
    <ul className="navbar-nav user-lock-nav">
      {data.map((market) => {
        const marketKey = `${prefix}market-${market.sportsId}`
        const isExpanded = expandedItems.has(marketKey)
        const hasChildren = market.tree && market.tree.length > 0

        return (
          <li key={market.sportsId}>
            <div
              className="d-flex align-items-center"
              style={{ cursor: hasChildren ? 'pointer' : 'default' , marginLeft:hasChildren ? '0px' : '25px' }}
              onClick={() => hasChildren && onToggleItem(marketKey)}
            >
              {hasChildren && (
                <span className="arrow-icon">
                  <img
                    src={angleDownIcon}
                    alt="toggle"
                    style={{
                      width: '16px',
                      height: '16px',
                      // transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      display: 'inline-block'
                    }}
                  />
                </span>
              )}
              <div className="custom-control custom-checkbox" style={{ marginLeft: hasChildren ? '25px' : '0' }}>
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`${prefix}market-checkbox-${market.sportsId}`}
                  checked={selectedItems.has(`${prefix}market-${market.sportsId}`) || market.enabled || false}
                  onChange={(e) => {
                    e.stopPropagation()
                    onMarketToggle(market.sportsId)
                  }}
                />
                <label className="custom-control-label" htmlFor={`${prefix}market-checkbox-${market.sportsId}`}>
                  {market.name}
                </label>
              </div>
            </div>
            {isExpanded && hasChildren && (
              <ul className="user-lock-nav" style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {market.tree.map((submarket) => {
                  const submarketKey = `${prefix}submarket-${market.sportsId}-${submarket.submarketId}`
                  const isSubExpanded = expandedItems.has(submarketKey)
                  const hasSubtree = submarket.subtree && submarket.subtree.length > 0

                  return (
                    <li
                      key={submarket.submarketId}
                      className={selectedItems.has(submarketKey) ? 'active-item' : ''}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ cursor: hasSubtree ? 'pointer' : 'default' }}
                        onClick={() => hasSubtree && onToggleItem(submarketKey)}
                      >
                        {hasSubtree && (
                          <span className="arrow-icon">
                            <img
                              src={angleDownIcon}
                              alt="toggle"
                              style={{
                                width: '16px',
                                height: '16px',
                                // transform: isSubExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                display: 'inline-block'
                              }}
                            />
                          </span>
                        )}
                        <div className="custom-control custom-checkbox" style={{ marginLeft: hasSubtree ? '25px' : '25px' }}>
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`${prefix}submarket-checkbox-${market.sportsId}-${submarket.submarketId}`}
                            checked={selectedItems.has(`${prefix}submarket-${market.sportsId}-${submarket.submarketId}`) || submarket.enabled || false}
                            onChange={(e) => {
                              e.stopPropagation()
                              onSubmarketToggle(market.sportsId, submarket.submarketId)
                            }}
                          />
                          <label className="custom-control-label" htmlFor={`${prefix}submarket-checkbox-${market.sportsId}-${submarket.submarketId}`}>
                            {submarket.name}
                          </label>
                        </div>
                      </div>
                      {isSubExpanded && hasSubtree && (
                        <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                          {submarket.subtree.map((subtreeItem, subtreeIndex) => {
                            const subtreeKey = `${prefix}subtree-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}`
                            const isSubtreeExpanded = expandedItems.has(subtreeKey)
                            const hasMatches = subtreeItem.matches && subtreeItem.matches.length > 0
                            
                            // DEBUG
                            if (market.name === 'Cricket' && subtreeIndex === 0) {
                                console.log('DEBUG Tree Item:', { name: subtreeItem.name, hasMatches, matches: subtreeItem.matches })
                            }

                            return (
                              <li key={subtreeIndex} style={{ listStyle: 'none', marginBottom: '3px' }}>
                                <div
                                  className="d-flex align-items-center"
                                  style={{ cursor: hasMatches ? 'pointer' : 'default' }}
                                  onClick={() => hasMatches && onToggleItem(subtreeKey)}
                                >
                                  {hasMatches && (
                                    <span className="arrow-icon">
                                      <img
                                        src={angleDownIcon}
                                        alt="toggle"
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          // transform: isSubtreeExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                          display: 'inline-block'
                                        }}
                                      />
                                    </span>
                                  )}
                                  <div className="custom-control custom-checkbox" style={{ marginLeft: hasMatches ? '25px' : '25px' }}>
                                    <input
                                      type="checkbox"
                                      className="custom-control-input"
                                      id={`${prefix}subtree-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}`}
                                      checked={selectedItems.has(`${prefix}subtree-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}`) || subtreeItem.enabled || false}
                                      onChange={(e) => {
                                        e.stopPropagation()
                                        onSubtreeToggle(market.sportsId, submarket.submarketId, subtreeIndex)
                                      }}
                                    />
                                    <label className="custom-control-label" htmlFor={`${prefix}subtree-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}`}>
                                      {subtreeItem.name}
                                    </label>
                                  </div>
                                </div>
                                {isSubtreeExpanded && hasMatches && (
                                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                    {subtreeItem.matches.map((match, matchIndex) => (
                                      <li key={matchIndex} style={{ listStyle: 'none', marginBottom: '3px' }}>
                                        {/* Match row - label only, no checkbox */}
                                        <div className="d-flex align-items-center">
                                          <span style={{ marginLeft: '25px', fontWeight: 500 }}>
                                            {match.title}
                                          </span>
                                        </div>
                                        {/* Events under the match (e.g., Over / Under) with checkboxes */}
                                        {match.evnets && match.evnets.length > 0 && (
                                          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                            {match.evnets.map((eventItem, eventIndex) => (
                                              <li key={eventIndex} style={{ listStyle: 'none', marginBottom: '3px' }}>
                                                <div className="d-flex align-items-center">
                                                  <div className="custom-control custom-checkbox" style={{ marginLeft: '25px' }}>
                                                    <input
                                                      type="checkbox"
                                                      className="custom-control-input"
                                                      id={`${prefix}event-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}-${matchIndex}-${eventIndex}`}
                                                      checked={selectedItems.has(`${prefix}event-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}-${matchIndex}-${eventIndex}`) || eventItem.enabled || false}
                                                      onChange={(e) => {
                                                        e.stopPropagation()
                                                        onEventToggle(
                                                          market.sportsId,
                                                          submarket.submarketId,
                                                          subtreeIndex,
                                                          matchIndex,
                                                          eventIndex
                                                        )
                                                      }}
                                                    />
                                                    <label className="custom-control-label" htmlFor={`${prefix}event-${market.sportsId}-${submarket.submarketId}-${subtreeIndex}-${matchIndex}-${eventIndex}`}>
                                                      {eventItem.name}
                                                    </label>
                                                  </div>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default HierarchicalTree

