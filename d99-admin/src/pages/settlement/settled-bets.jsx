import { useState } from 'react'
import Layout from '../../components/Layout'

/**
 * Settled Bets – List/view settled bets (placeholder; wire to API when endpoint is available).
 */
export default function SettledBets() {
  const [loading] = useState(false)

  return (
    <Layout title="Settled Bets - Diamond Admin">
      <div className="listing-grid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0 font-size-18">Settled Bets</h4>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th>Event</th>
                        <th>Market</th>
                        <th>Selection</th>
                        <th>Result</th>
                        <th>Settled At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            Loading...
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No settled bets found. Wire this page to your settled-bets API when ready.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
