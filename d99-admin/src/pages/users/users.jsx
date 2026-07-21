import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Layout from '../../components/Layout'
import TransactionModal from '../../components/TransactionModal'
import ExposureLimitModal from '../../components/ExposureLimitModal'
import CreditModal from '../../components/CreditModal'
import PasswordModal from '../../components/PasswordModal'
import ChangeStatusModal from '../../components/ChangeStatusModal'
import userService from '../../services/userService'
import walletService from '../../services/walletService'
import { searchByUsername } from '../../services/api'
import Toast from '../../utils/toast'
import { showTransactionPassword } from '../settings/change-password'
import loaderGif from '../../assets/loader.gif'
import './style.css'

/**
 * Users Component
 * 
 * Displays list of clients/users (Account List).
 */
function Users() {
  const { user } = useSelector((state) => state.auth)
  const { childUsername } = useParams()
  const isChildView = !!childUsername
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [searchValue, setSearchValue] = useState('')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showExposureLimitModal, setShowExposureLimitModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)

  // Data state
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalWallets, setTotalWallets] = useState(0)

  // Search suggestions
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimerRef = useRef(null)
  const searchBoxRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchInput = useCallback((e) => {
    const val = e.target.value
    setSearchValue(val)
    if (!val.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchByUsername(val.trim(), 1, 10)
        const results = res?.data?.results || []
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }, [])

  const handleSuggestionClick = useCallback((username) => {
    setSearchValue(username)
    setShowSuggestions(false)
    setSuggestions([])
  }, [])

  /* eslint-disable react-hooks/exhaustive-deps */
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const opts = (isChildView || searchValue) ? { exact: isChildView ? childUsername : searchValue } : {}
      const data = await userService.getAllDetails(currentPage, entriesPerPage, '', opts)
      if (data.success && data.data && data.data.wallets) {
        setAccounts(data.data.wallets)
        const p = data.data.pagination || {}
        setTotalPages(Number(p.total_pages) || 1)
        setTotalWallets(Number(p.total_wallets) || data.data.wallets.length)
      } else {
        setAccounts([])
        setTotalPages(1)
        setTotalWallets(0)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, entriesPerPage])

  const getExportRows = () =>
    accounts.map((a) => [
      a.username || '',
      parseFloat(a.cash_received || 0).toFixed(2),
      a.status || '',
      a.bet_locked ? 'Locked' : 'Active',
      a.exposureLimit ?? '',
      a.percentage ?? '',
      a.user_type || '',
    ])

  const exportColumns = ['User Name', 'Credit Reference', 'User Status', 'Bet Status', 'Exposure Limit', 'Default (%)', 'Account Type']

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Users List', 14, 15)
    autoTable(doc, {
      head: [exportColumns],
      body: getExportRows(),
      startY: 20,
    })
    doc.save('users.pdf')
  }

  const handleExportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([exportColumns, ...getExportRows()])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')
    XLSX.writeFile(wb, 'users.xlsx')
  }

  const handleLoad = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const handleReset = () => {
    setSearchValue('')
    setCurrentPage(1)
    // fetchUsers will be triggered by useEffect when searchValue changes if we add it to dependency, 
    // but here we want explicit load. 
    // Let's just reset search and call fetch
    setTimeout(() => fetchUsers(), 0)
  }

  const handleDepositClick = (account) => {
    setSelectedAccount(account)
    setShowDepositModal(true)
  }

  const handleWithdrawClick = (account) => {
    setSelectedAccount(account)
    setShowWithdrawModal(true)
  }

  const handleExposureLimitClick = (account) => {
    setSelectedAccount(account)
    setShowExposureLimitModal(true)
  }

  const handleCreditClick = (account) => {
    setSelectedAccount(account)
    setShowCreditModal(true)
  }

  const handlePasswordClick = (account) => {
    setSelectedAccount(account)
    setShowPasswordModal(true)
  }

  const handleChangeStatusClick = (account) => {
    setSelectedAccount(account)
    setShowChangeStatusModal(true)
  }



  const handleDepositSubmit = async (formData) => {
    console.log('Deposit submitted:', formData, 'for account:', selectedAccount)
    try {
      const payload = {
        userId: selectedAccount.user_id || selectedAccount.staff_id,
        amount: formData.amount,
        userType: selectedAccount.user_type,
        transactionPassword: formData.transactionPassword
      }

      const response = await walletService.addCash(payload)
      if (response.success) {
        Toast.fire({
          icon: 'success',
          title: 'Deposit successful!'
        });
        setShowDepositModal(false)
        fetchUsers() // Refresh list
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Deposit failed: ' + (response.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Deposit error:', error)
      Toast.fire({
        icon: 'error',
        title: 'Deposit failed: ' + (error.response?.data?.message || error.message)
      });
    }
  }

  const handleWithdrawSubmit = async (formData) => {
    console.log('Withdraw submitted:', formData, 'for account:', selectedAccount)
    try {
      const payload = {
        userId: selectedAccount.user_id || selectedAccount.staff_id,
        amount: formData.amount,
        userType: selectedAccount.user_type,
        transactionPassword: formData.transactionPassword
      }

      const response = await walletService.subtractCash(payload)
      if (response.success) {
        Toast.fire({
          icon: 'success',
          title: 'Withdraw successful!'
        });
        setShowWithdrawModal(false)
        fetchUsers() // Refresh list
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Withdraw failed: ' + (response.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Withdraw error:', error)
      Toast.fire({
        icon: 'error',
        title: 'Withdraw failed: ' + (error.response?.data?.message || error.message)
      });
    }
  }

  const handleExposureLimitSubmit = (formData) => {
    console.log('Exposure Limit submitted:', formData, 'for account:', selectedAccount)
    // TODO: Implement exposure limit API call
  }

  const handleCreditSubmit = async (formData) => {
    console.log('Credit submitted:', formData, 'for account:', selectedAccount)
    try {
      const payload = {
        userId: selectedAccount.user_id || selectedAccount.staff_id,
        amount: formData.amount, // Changed from newCredit to amount to match API
        userType: selectedAccount.user_type,
        transactionPassword: formData.transactionPassword
      }

      const response = await walletService.addCredit(payload)
      if (response.success) {
        Toast.fire({
          icon: 'success',
          title: 'Credit added successful!'
        });
        setShowCreditModal(false)
        fetchUsers() // Refresh list
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Credit add failed: ' + (response.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Credit add error:', error)
      Toast.fire({
        icon: 'error',
        title: 'Credit add failed: ' + (error.response?.data?.message || error.message)
      });
    }
  }

  const handlePasswordSubmit = async (formData) => {
    try {
      const isUser = selectedAccount.user_type === 'USER'
      const payload = {
        user_type: isUser ? 'USER' : 'STAFF',
        [isUser ? 'user_id' : 'staff_id']: selectedAccount.user_id || selectedAccount.staff_id,
        newPassword: formData.newPassword,
        transactionPassword: formData.transactionPassword
      }

      const response = await userService.updateStatusAndPassword(payload)

      if (response.success) {
        setShowPasswordModal(false)
        if (response.transactionPassword) {
          showTransactionPassword(response.transactionPassword, selectedAccount.username)
        } else {
          Toast.fire({ icon: 'success', title: 'Password updated successfully' });
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Failed to update password: ' + (response.message || response.error || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Error updating password:', error)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update password: ' + (error.response?.data?.message || error.response?.data?.error || error.message)
      });
    }
  }

  const handleChangeStatusSubmit = async (formData) => {
    console.log('Change Status submitted:', formData, 'for account:', selectedAccount)
    try {
      const isUser = selectedAccount.user_type === 'USER'
      const payload = {
        user_type: isUser ? 'USER' : 'STAFF',
        [isUser ? 'user_id' : 'staff_id']: selectedAccount.user_id || selectedAccount.staff_id,
        // Map userActive to status/active
        ...(isUser
          ? { status: formData.userActive ? 'Active' : 'InActive' }
          : { active: formData.userActive }
        ),
        transactionPassword: formData.transactionPassword,
        betlock: !formData.betActive
      }

      const response = await userService.updateStatusAndPassword(payload)

      if (response.success) {
        Toast.fire({
          icon: 'success',
          title: 'Status updated successfully'
        });
        setShowChangeStatusModal(false)
        fetchUsers() // Refresh list
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Failed to update status: ' + (response.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Error updating status:', error)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update status: ' + (error.response?.data?.message || error.message)
      });
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Calculate totals for the current page
  const totals = accounts.reduce((acc, curr) => ({
    credit_ref: acc.credit_ref + (parseFloat(curr.cash_received) || 0),
    cash_received: acc.cash_received + (parseFloat(curr.cash_received) || 0),
    exposure: acc.exposure + (parseFloat(curr.exposure) || 0),
  }), { credit_ref: 0, cash_received: 0, exposure: 0 });

  return (
    <Layout title="List of Clients - Diamond Admin">
      {/* Full Page Diamond Loader */}
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
        <div className="account-list">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Account List
                </h4>
                <div className="page-title-right">
                  {!isChildView && (
                    <div className="d-inline-block">
                      <Link to="/admin/users/insertuser" className="btn btn-primary">
                        Add Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="account-list">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {/* PDF/Excel Export Buttons */}
                  <div className="row row5">
                    <div className="col-md-6 mb-2 search-form">
                      <div className="d-inline-block mr-2">
                        <button
                          type="button"
                          className="btn buttons-pdf btn-danger"
                          onClick={handleExportPDF}
                        >
                          <i className="far fa-file-pdf mr-1"></i>
                          PDF
                        </button>
                      </div>
                      <div className="d-inline-block">
                        <button
                          type="button"
                          className="btn buttons-excel btn-success"
                          onClick={handleExportExcel}
                        >
                          <i className="far fa-file-excel mr-1"></i>
                          Excel
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6 text-right mb-2"></div>
                  </div>

                  {/* Show Entries and Search */}
                  <div className="row">
                    <div className="col-sm-12 col-md-6">
                      <div id="tickets-table_length" className="dataTables_length">
                        <label className="d-inline-flex align-items-center">
                          Show&nbsp;
                          <select
                            className="custom-select custom-select-sm"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                          >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                            <option value="500">500</option>
                            <option value="750">750</option>
                            <option value="1000">1000</option>
                          </select>
                          &nbsp;entries
                        </label>
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-6">
                      <div id="tickets-table_filter" className="dataTables_filter text-md-right">
                        <label className="d-inline-flex align-items-center">
                          Search:
                          <div ref={searchBoxRef} style={{ position: 'relative', display: 'inline-block' }}>
                            <input
                              name="searchuser"
                              type="search"
                              placeholder="Search..."
                              className="form-control form-control-sm ml-2 form-control py-1"
                              value={searchValue}
                              onChange={handleSearchInput}
                              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                              autoComplete="off"
                            />
                            {showSuggestions && (
                              <ul className="list-group" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '200px', overflowY: 'auto', marginLeft: '0.5rem' }}>
                                {suggestions.map((item) => (
                                  <li
                                    key={item.user_id || item.wallet_id || item.username}
                                    className="list-group-item list-group-item-action py-1 px-2"
                                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                                    onClick={() => handleSuggestionClick(item.username)}
                                  >
                                    {item.username}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <button
                            type="button"
                            id="loaddata"
                            className="btn btn-primary ml-2"
                            onClick={handleLoad}
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary ml-2"
                            onClick={handleReset}
                          >
                            Reset
                          </button>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-responsive mb-0">
                    <div className="table no-footer list-clients table-responsive-sm">
                      <table
                        id="eventsListTbl"
                        role="table"
                        className="table b-table table-striped table-bordered"
                      >
                        <thead role="rowgroup" className="">
                          <tr role="row" className="">
                            <th role="columnheader" scope="col" className="position-relative">
                              <div>User Name</div>
                            </th>
                            <th role="columnheader" scope="col" className="position-relative text-right">
                              <div>Credit Reference</div>
                            </th>
                            <th role="columnheader" scope="col" className="">
                              <div>U st</div>
                            </th>
                            <th role="columnheader" scope="col" className="">
                              <div>B st</div>
                            </th>
                            {/* <th role="columnheader" scope="col" className="">
                              <div>Balance</div>
                            </th>
                            <th role="columnheader" scope="col" className="">
                              <div>Exposure</div>
                            </th> */}
                            <th role="columnheader" scope="col" className="">
                              <div>Exposure Limit</div>
                            </th>
                            <th role="columnheader" scope="col" className="">
                              <div>Deafult (%)</div>
                            </th>
                            <th role="columnheader" scope="col" className="">
                              <div>Account Type</div>
                            </th>

                            <th role="columnheader" scope="col" className="">
                              <div>Action</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody role="rowgroup">
                          {loading ? (
                            <tr role="row" className="">
                              <td colSpan="10" style={{ height: '150px' }}></td>
                            </tr>
                          ) : accounts.length === 0 ? (
                            <tr role="row" className="">
                              <td colSpan="10" className="text-center">
                                No accounts found
                              </td>
                            </tr>
                          ) : (
                            <>
                              {/* Total Row */}
                              <tr role="row" className="total-row font-weight-bold">
                                <td aria-colindex="1" role="cell"></td>
                                <td aria-colindex="2" role="cell" className="text-right">{totals.credit_ref.toLocaleString()}</td>
                                <td aria-colindex="3" role="cell"></td>
                                <td aria-colindex="4" role="cell"></td>
                                {/* <td aria-colindex="5" role="cell" className="text-right">{totals.cash_received.toLocaleString()}</td>
                                <td aria-colindex="6" role="cell" className="text-right">{totals.exposure.toLocaleString()}</td> */}
                                <td aria-colindex="7" role="cell"></td>
                                <td aria-colindex="8" role="cell"></td>
                                <td aria-colindex="9" role="cell"></td>
                                <td aria-colindex="10" role="cell"></td>
                              </tr>
                              {accounts.map((account) => (
                                <tr key={account.wallet_id} role="row" className="">
                                  <td aria-colindex="1" role="cell" className="">
                                    <Link
                                      to={`/admin/users/child/${encodeURIComponent(account.username)}`}
                                      className="wrape-text"
                                      title={account.username}
                                      target="_blank"
                                    >
                                      <span>{account.username}</span>
                                    </Link>
                                  </td>
                                  <td aria-colindex="2" role="cell" className="">
                                    <p className="text-right mb-0 cp">{account.cash_received}</p>
                                  </td>
                                  <td aria-colindex="3" role="cell" className="">
                                    <div className="custom-control custom-checkbox">
                                      <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id={`ust-${account.wallet_id}`}
                                        checked={account.status === 'Active'}
                                        disabled
                                      />
                                      <label className="custom-control-label" htmlFor={`ust-${account.wallet_id}`}></label>
                                    </div>
                                  </td>
                                  <td aria-colindex="4" role="cell" className="">
                                    <div className="custom-control custom-checkbox">
                                      <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id={`bst-${account.wallet_id}`}
                                        checked={!account.bet_locked}
                                        disabled
                                      />
                                      <label className="custom-control-label" htmlFor={`bst-${account.wallet_id}`}></label>
                                    </div>
                                  </td>
                                  {/* <td aria-colindex="5" role="cell" className="">
                                    <p className="text-right mb-0 cp">{account.cash_received}</p>
                                  </td>
                                  <td aria-colindex="6" role="cell" className="">
                                    <p className="text-right mb-0 cp">{account.exposure}</p>
                                  </td> */}
                                  <td aria-colindex="7" role="cell" className="">{account.exposureLimit || 0}</td>
                                  <td aria-colindex="8" role="cell" className="">
                                    <p className="text-left mb-0">{account.percentage || 0}</p>
                                  </td>
                                  <td aria-colindex="9" role="cell" className="">{account.user_type}</td>
                                  <td aria-colindex="10" role="cell" className="">
                                    <div role="group" className="btn-group">
                                      <button
                                        type="button"
                                        className="btn action-button btn-secondary-action"
                                        onClick={() => handleDepositClick(account)}
                                        title="Deposit"
                                      >
                                        D
                                      </button>
                                      <button
                                        type="button"
                                        className="btn action-button btn-secondary-action"
                                        onClick={() => handleWithdrawClick(account)}
                                        title="Withdraw"
                                      >
                                        W
                                      </button>
                                      <button
                                        type="button"
                                        className="btn action-button btn-secondary-action"
                                        onClick={() => handleExposureLimitClick(account)}
                                        title="Exposure Limit"
                                      >
                                        L
                                      </button>
                                      <button
                                        type="button"
                                        className="btn action-button btn-secondary-action"
                                        onClick={() => handleCreditClick(account)}
                                        title="Credit"
                                      >
                                        C
                                      </button>
                                      <button
                                        type="button"
                                        className="btn action-button btn-secondary-action"
                                        onClick={() => handlePasswordClick(account)}
                                        title="Password"
                                      >
                                        P
                                      </button>
                                      <button
                                        type="button"
                                        className="btn action-button btn-secondary-action"
                                        onClick={() => handleChangeStatusClick(account)}
                                        title="Status"
                                      >
                                        S
                                      </button>
                                      <button type="button" className="btn action-button btn-secondary-action">More</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="row pt-3 align-items-center">
                    <div className="col-sm-12 col-md-6">
                      <div className="dataTables_info">
                        {totalWallets > 0 ? (
                          <>Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalWallets)} of {totalWallets} entries</>
                        ) : 'No entries'}
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-6">
                      <div className="dataTables_paginate paging_simple_numbers float-right">
                        <ul className="pagination pagination-rounded mb-0">
                          <ul
                            role="menubar"
                            aria-label="Pagination"
                            className="pagination dataTables_paginate paging_simple_numbers my-0 b-pagination justify-content-end"
                          >
                            <li role="presentation" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                              >
                                «
                              </button>
                            </li>
                            <li role="presentation" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                ‹
                              </button>
                            </li>
                            {(() => {
                              const pages = [];
                              const start = Math.max(1, currentPage - 2);
                              const end = Math.min(totalPages, start + 4);
                              for (let p = start; p <= end; p++) {
                                pages.push(
                                  <li key={p} role="presentation" className={`page-item ${p === currentPage ? 'active' : ''}`}>
                                    <button
                                      type="button"
                                      aria-label={`Go to page ${p}`}
                                      className="page-link"
                                      onClick={() => handlePageChange(p)}
                                    >
                                      {p}
                                    </button>
                                  </li>
                                );
                              }
                              return pages;
                            })()}
                            <li role="presentation" className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                              >
                                ›
                              </button>
                            </li>
                            <li role="presentation" className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage >= totalPages}
                              >
                                »
                              </button>
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

      {/* Deposit Modal */}
      <TransactionModal
        show={showDepositModal}
        onHide={() => setShowDepositModal(false)}
        userData={selectedAccount}
        currentUser={user}
        mode="deposit"
        onSubmit={handleDepositSubmit}
        title="Deposit"
      />

      {/* Withdraw Modal */}
      <TransactionModal
        show={showWithdrawModal}
        onHide={() => setShowWithdrawModal(false)}
        userData={selectedAccount}
        currentUser={user}
        mode="withdraw"
        onSubmit={handleWithdrawSubmit}
        title="Withdraw"
      />

      {/* Exposure Limit Modal */}
      <ExposureLimitModal
        show={showExposureLimitModal}
        onHide={() => setShowExposureLimitModal(false)}
        userData={selectedAccount}
        onSubmit={handleExposureLimitSubmit}
      />

      {/* Credit Modal */}
      <CreditModal
        show={showCreditModal}
        onHide={() => setShowCreditModal(false)}
        userData={selectedAccount}
        onSubmit={handleCreditSubmit}
      />

      {/* Password Modal */}
      <PasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        userData={selectedAccount}
        onSubmit={handlePasswordSubmit}
      />

      {/* Change Status Modal */}
      <ChangeStatusModal
        show={showChangeStatusModal}
        onHide={() => setShowChangeStatusModal(false)}
        userData={selectedAccount}
        onSubmit={handleChangeStatusSubmit}
      />
    </Layout>
  )
}

export default Users

