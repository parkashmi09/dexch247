import { useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import loaderGif from '../../assets/loader.gif'
import './style.css'

function ProfitLoss() {
  const [searchValue, setSearchValue] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)

  const handleLoad = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/pl/all', {
        params: { search: searchValue }
      })

      if (response.data.success) {
        setTableData(response.data.data)
      } else {
        setTableData([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  // Client-side filter by table search
  const filteredData = searchValue
    ? tableData.filter(row => (row.username || '').toLowerCase().includes(searchValue.toLowerCase()))
    : tableData

  const formatNum = (val) => parseFloat(val || 0).toFixed(2)

  return (
    <Layout title="Profit Loss - Diamond Admin">
      {loading && (
        <div style={{
          display: 'block',
          position: 'fixed',
          zIndex: 9999,
          backgroundImage: `url(${loaderGif})`,
          backgroundColor: '#666',
          opacity: 0.4,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          left: 0,
          bottom: 0,
          right: 0,
          top: 0,
          backgroundSize: '100px 100px'
        }} />
      )}
      <div className="listing-grid">
        <div className="account-list-statement">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">Profit Loss</h4>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body-casino">
              <div className="row">
                <div className="col-12">
                  <form method="post" className="ajaxFormSubmit" onSubmit={(e) => { e.preventDefault(); handleLoad(); }}>
                    <div className="row row5">
                      <div className="col-md-2">
                        <select
                          className="form-control"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="User">User</option>
                        </select>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary">Load</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="row">
                <div className="d-flex align-items-end justify-content-end">
                  <div id="tickets-table_filter" className="dataTables_filter">
                    <label className="d-inline-flex align-items-center">
                      Search:
                      <input
                        name="search"
                        type="search"
                        placeholder="Search..."
                        className="form-control form-control-sm ml-2 form-control py-1"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="table-responsive mb-0 mt-2">
                    <div className="table no-footer table-responsive-sm">
                      <table
                        id="profitLossTbl"
                        role="table"
                        aria-busy={loading}
                        aria-colcount="6"
                        className="table b-table table-striped table-bordered"
                      >
                        <thead role="rowgroup">
                          <tr role="row">
                            <th role="columnheader" scope="col" className="position-relative"><div>No</div></th>
                            <th role="columnheader" scope="col" className="position-relative"><div>User Name</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Casino Pts</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Sport Pts</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Third Party Pts</div></th>
                            <th role="columnheader" scope="col" className="position-relative text-right"><div>Profit/Loss</div></th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="6" role="cell" style={{ height: '150px' }} />
                            </tr>
                          ) : filteredData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="6" role="cell">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">No data available in table</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredData.map((row, index) => (
                              <tr style={{ padding: '10px' }} key={row.user_id || index} role="row">
                                <td role="cell">{index + 1}</td>
                                <td role="cell">{row.username || '-'}</td>
                                <td role="cell" className={`text-right ${parseFloat(row.casino_pts) < 0 ? 'text-danger' : parseFloat(row.casino_pts) > 0 ? 'text-success' : ''}`}>
                                  {formatNum(row.casino_pts)}
                                </td>
                                <td role="cell" className={`text-right ${parseFloat(row.sport_pts) < 0 ? 'text-danger' : parseFloat(row.sport_pts) > 0 ? 'text-success' : ''}`}>
                                  {formatNum(row.sport_pts)}
                                </td>
                                <td role="cell" className={`text-right ${parseFloat(row.third_party_pts) < 0 ? 'text-danger' : parseFloat(row.third_party_pts) > 0 ? 'text-success' : ''}`}>
                                  {formatNum(row.third_party_pts)}
                                </td>
                                <td role="cell" className={`text-right ${parseFloat(row.profit_loss) < 0 ? 'text-danger' : parseFloat(row.profit_loss) > 0 ? 'text-success' : ''}`}>
                                  {formatNum(row.profit_loss)}
                                </td>
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
    </Layout>
  )
}

export default ProfitLoss
