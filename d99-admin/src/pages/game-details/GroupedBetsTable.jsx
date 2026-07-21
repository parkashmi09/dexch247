import React from 'react'
import './GroupedBetsTable.css'

/**
 * Reusable grouped bets table. Renders configurable headers and rows,
 * with group header rows (marketType + date) and data rows styled by group.borderClass.
 *
 * @param {Object} props
 * @param {Array<{ key: string, label: string, getValue: (bet: object) => any, className?: string, headerClassName?: string, headerStyle?: object }>} props.columns - Column config (header label + how to get cell value from bet; optional headerClassName/headerStyle for <th>)
 * @param {Array<{ marketType: string, betType: string, borderClass: string, date?: string, bets: Array<object> }>} props.groups - Groups from groupBetsForTable (borderClass is built-in per group)
 * @param {string} props.emptyMessage - Message when there are no groups/bets
 * @param {(dateStr: string) => string} props.formatDate - Formats date for the group header row
 * @param {string} [props.tableClassName] - Optional extra table class (default: 'table my-bets-table')
 * @param {boolean} [props.showGroupHeader=true] - When true, render the group header row (marketType + date); when false, omit it
 */
function GroupedBetsTable({ columns, groups, emptyMessage, formatDate, tableClassName = 'table my-bets-table', showGroupHeader = true }) {
  const colCount = columns.length

  if (!groups || !groups.length) {
    return (
      <div className="table-responsive">
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headerClassName} style={col.headerStyle}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={colCount} className="text-center">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className={tableClassName}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.headerClassName} style={col.headerStyle}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gIdx) => (
            <React.Fragment key={`${group.marketType}-${group.betType}-${gIdx}`}>
              {group.bets.map((bet, bIdx) => (
                <React.Fragment key={bet.id || `${gIdx}-${bIdx}`}>
                  {showGroupHeader && (
                    <tr className={group.borderClass}>
                      <td colSpan={colCount}>
                        <div style={{ fontSize: '14px' }}>{group.marketType}</div>
                        <span className="float-right">
                          {formatDate(bet.created_at || group.date)}
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className={group.borderClass}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.className || ''} bt0`.trim()}
                      >
                        {col.getValue ? col.getValue(bet) : (bet[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                  <tr className="my-bets-gap">
                    <td colSpan={colCount} style={{ height: '3px', padding: 0 }} />
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GroupedBetsTable
