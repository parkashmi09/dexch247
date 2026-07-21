import { useState } from 'react'
import Layout from '../../components/Layout'
import './style.css'

/**
 * GeneralReport Component
 * 
 * Page for viewing general reports with filters and export options.
 */
function GeneralReport() {

  const [reportType, setReportType] = useState('General Report')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)

  // Handle Load button click
  const handleLoad = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Sample data - replace with actual API response
      const sampleData = [
        {
          id: 1,
          srNo: 1,
          name: 'Sample Name 1',
          amount: '1000.00'
        },
        {
          id: 2,
          srNo: 2,
          name: 'Sample Name 2',
          amount: '2000.00'
        }
      ]
      
      setTableData(sampleData)
    } catch (error) {
      console.error('Error loading data:', error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }



  return (
    <Layout title="General Report - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  General Report
                </h4>
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  <form method="post" className="ajaxFormSubmit" onSubmit={(e) => { e.preventDefault(); handleLoad(); }}>
                    <div className="row row5">
                      <div className="col-md-2">
                        <label>Select Type:</label>
                        <select 
                          className="form-control"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          <option value="General Report">General Report</option>
                          <option value="Daily Report">Daily Report</option>
                          <option value="Weekly Report">Weekly Report</option>
                          <option value="Monthly Report">Monthly Report</option>
                        </select>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary">
                          Load
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                 

                  {/* Table */}
                  <div className="table-responsive mb-0 mt-4">
                    <div className="table no-footer table-responsive-sm">
                      <table 
                        id="generalReportTbl" 
                        role="table" 
                        aria-busy={loading}
                        aria-colcount="3"
                        className="table b-table table-striped table-bordered"
                      >
                        <thead role="rowgroup" className="">
                          <tr role="row" className="">
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="1"
                              className="position-relative"
                            >
                              <div>Sr.No</div>
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="2"
                              className="position-relative"
                            >
                              <div>Name</div>
                            </th>
                            <th 
                              role="columnheader" 
                              scope="col" 
                              tabIndex="0"
                              aria-colindex="3"
                              className="position-relative text-right"
                            >
                              <div>Amount</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="3" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">Loading...</div>
                                </div>
                              </td>
                            </tr>
                          ) : tableData.length === 0 ? (
                            <tr role="row" className="b-table-empty-row">
                              <td colSpan="3" role="cell" className="">
                                <div role="alert" aria-live="polite">
                                  <div className="text-center my-2">No data available in table</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            tableData.map((row, index) => (
                              <tr key={row.id || index} role="row" className="">
                                <td aria-colindex="1" role="cell" className="">
                                  {row.srNo || index + 1}
                                </td>
                                <td aria-colindex="2" role="cell" className="">
                                  {row.name || '-'}
                                </td>
                                <td aria-colindex="3" role="cell" className="text-right">
                                  {row.amount || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="row pt-3">
                    <div className="col">
                      <div className="dataTables_paginate paging_simple_numbers float-right">
                        <ul className="pagination pagination-rounded mb-0">
                          <ul 
                            role="menubar" 
                            aria-label="Pagination" 
                            className="pagination dataTables_paginate paging_simple_numbers my-0 b-pagination justify-content-end"
                          >
                            <li role="presentation" className="page-item disabled">
                              <span role="menuitem" aria-label="Go to first page" className="page-link">«</span>
                            </li>
                            <li role="presentation" className="page-item disabled">
                              <span role="menuitem" aria-label="Go to previous page" className="page-link">‹</span>
                            </li>
                            <li role="presentation" className="page-item active">
                              <button 
                                role="menuitemradio" 
                                type="button" 
                                aria-label="Go to page 1" 
                                className="page-link"
                              >
                                1
                              </button>
                            </li>
                            <li role="presentation" className="page-item disabled">
                              <span role="menuitem" aria-label="Go to next page" className="page-link">›</span>
                            </li>
                            <li role="presentation" className="page-item disabled">
                              <span role="menuitem" aria-label="Go to last page" className="page-link">»</span>
                            </li>
                          </ul>
                        </ul>
                      </div>
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

export default GeneralReport

