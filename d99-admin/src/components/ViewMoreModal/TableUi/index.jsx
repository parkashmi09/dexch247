import './style.css'

const COLUMNS = [
  { key: 'no', label: 'No' },
  { key: 'username', label: 'UserName' },
  { key: 'nation', label: 'Nation' },
  { key: 'betType', label: 'Bet Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'userRate', label: 'User Rate' },
  { key: 'placeDate', label: 'Place Date' },
  { key: 'ip', label: 'IP' },
  { key: 'browserDetails', label: 'Browser Details' },
]

function getRowBorderClass(row) {
  const betType = (row.bet_type ?? row.betType ?? row.game_type ?? 'back').toString().toLowerCase()
  const selection = (row.selection_name ?? (row.matchedBet || row.nation || row.selection || '')).toString().toLowerCase()

  // Selection 'no' or bet type 'lay'/'no' indicates a pink row
  const isLay = betType === 'lay' || betType === 'no' || selection === 'no'
  return isLay ? 'lay-border' : 'back-border'
}

function getCellValue(bet, columnKey, index) {
  switch (columnKey) {
    case 'no':
      return index + 1
    case 'username':
      return bet.username || bet.user?.username || '-'
    case 'nation':
      return bet.selection_name || bet.matchedBet || bet.nation || bet.selection || '-'
    case 'betType': {
      const type = (bet.bet_type ?? bet.betType ?? bet.game_type ?? 'back').toString().toLowerCase()
      const selection = (bet.selection_name ?? (bet.matchedBet || bet.nation || bet.selection || '')).toString().toLowerCase()
      const isLay = type === 'lay' || type === 'no' || selection === 'no'
      return (
        <span className={isLay ? 'text-danger' : 'text-primary'} style={{ fontWeight: 'bold' }}>
          {isLay ? 'LAY' : 'BACK'}
        </span>
      )
    }
    case 'amount':
      return bet.stake_amount ?? bet.stake ?? bet.amount ?? '-'
    case 'userRate':
      return bet.odds ?? bet.userrate ?? '-'
    case 'placeDate':
      return bet.placeDate ?? bet.created_at ?? '-'
    case 'ip':
      return bet.ip_address ?? bet.ip ?? '-'
    case 'browserDetails':
      return bet.browserDetails ?? bet.browser ?? '-'
    default:
      return bet[columnKey] ?? '-'
  }
}

/**
 * View More modal table – same design as assign-agent table.
 * Receives data (array of bets) and maps rows. Headers: No, UserName, Nation, Amount, User Rate, Place Date, IP, Browser Details.
 */
function BetViewMoreTable({ data = [] }) {
  const list = Array.isArray(data) ? data : []


  return (
    <div className="">
      <div className="account-list-new">
        <div className="account-list-new">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive mb-0">
                  <div className="table no-footer table-responsive-sm">
                    <table
                      id="viewMoreModalTbl"
                      role="table"
                      aria-busy="false"
                      aria-colcount={COLUMNS.length}
                      className="table b-table table-bordered"
                    >
                      <thead role="rowgroup" className="">
                        <tr role="row" className="">
                          {COLUMNS.map((col, i) => (
                            <th
                              key={col.key}
                              role="columnheader"
                              scope="col"
                              tabIndex={0}
                              aria-colindex={i + 1}
                              aria-sort="none"
                              className="position-relative"
                            >
                              <div>{col.label}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody role="rowgroup">
                        {list.length === 0 ? (
                          <tr role="row" className="b-table-empty-row">
                            <td colSpan={COLUMNS.length} role="cell" className="">
                              <div role="alert" aria-live="polite">
                                <div className="text-center my-2">There are no records to show</div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          list.map((row, idx) => (
                            <tr key={idx} role="row" className={getRowBorderClass(row)}>
                              {COLUMNS.map((col, cidx) => (
                                <td key={col.key} aria-colindex={cidx + 1} role="cell" className="">
                                  {getCellValue(row, col.key, idx)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BetViewMoreTable
