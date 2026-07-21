import { useState, useEffect, useRef } from 'react'
import { searchByUsername } from '../services/api'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { setCredentials } from '../store/slices/authSlice'
import { authService } from '../services/authService'
import { can } from '../utils/permissions'
import UserDetailModal from './UserDetailModal'
import IntegrityAlertsBell from './IntegrityAlertsBell'

import logo from '../assets/main/logo.png'
import searchIcon from '../assets/images/search.svg'

const useViewport = import.meta.env.VITE_USE_VIEWPORT !== 'false'

function Header() {
  const { user, token, role, isAuthenticated } = useSelector((state) => state.auth)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [liveMarketOpen, setLiveMarketOpen] = useState(false)
  const [liveVirtualMarketOpen, setLiveVirtualMarketOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [settlementOpen, setSettlementOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userModalOpen, setUserModalOpen] = useState(false)

  const userMenuRef = useRef(null)
  const searchRef = useRef(null)
  const searchTimerRef = useRef(null)
  const settlementRef = useRef(null)

  // Fetch user profile if authenticated but user data is missing
  useEffect(() => {

    const fetchUserProfile = async () => {
      // Executives have no profile endpoint — their user (with permissions) is
      // restored from localStorage by the auth slice. Skip the fetch.
      if (role === 'executive') return
      // Only fetch if we have a token but no user data
      if (isAuthenticated && token && !user) {
        try {
          console.log('Header: Fetching user profile...')
          const profileResponse = role === 'owner'
            ? await authService.getOwnerProfile()
            : await authService.getProfile()

          console.log('Header: Profile response:', profileResponse)

          // Owner profile has data directly, staff profile has data.user
          const userData = role === 'owner'
            ? profileResponse.data
            : profileResponse.data?.user

          if (profileResponse && profileResponse.success && userData) {
            dispatch(setCredentials({
              token: token,
              user: userData,
              role: role
            }))
            console.log('Header: Profile loaded successfully')
          } else {
            console.warn('Header: Profile response missing user data:', profileResponse)
          }
        } catch (error) {
          console.error('Header: Failed to fetch profile:', error)
          // Don't logout on error, just log it
        }
      }
    }


 fetchUserProfile();

  // 🧹 Cleanup on unmount / dependency change

  }, [isAuthenticated, token, user, role, dispatch])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
        setSearchValue('')
      }
      if (settlementRef.current && !settlementRef.current.contains(event.target)) {
        setSettlementOpen(false)
      }
    }

    if (userMenuOpen || searchOpen || settlementOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen, searchOpen, settlementOpen])

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    // Show dropdown when user types
    if (value.trim()) {
      setSearchOpen(true)
      // Debounce network calls and use shared service
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(async () => {
        try {
          const query = value.trim()
          const res = await searchByUsername(query, 1, 10)
          // service returns { success: true, data: { results: [...] } }
          const results = res?.data?.results || []
          setSearchResults(results)
        } catch (err) {
          console.error('Header: search API failed', err)
          setSearchResults([])
        }
      }, 300)
    } else {
      // clear debounce and results
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }
      setSearchResults([])
    }
  }
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }
    }
  }, [])

  const handleSearchClick = () => {
    setSearchOpen(true)
  }

  // Toggle sidebar - when vertical-collpsed class is present, sidebar is hidden
  const handleSidebarToggle = () => {
    const body = document.body
    body.classList.toggle('vertical-collpsed')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header id="page-topbar" className={!useViewport ? 'header-desktop-on-mobile' : ''}>
      <div className="navbar-header">
        <div className="d-flex">
          {/* Logo */}
          <div className="navbar-brand-box">
            <Link to="/admin/users2" className="logo logo-light">
              <span className="logo-lg">
                <img src={logo} alt="" className="site-logo" />
              </span>
            </Link>
          </div>

          {/* Hamburger Menu Button */}
          <button
            id="vertical-menu-btn"
            type="button"
            className="btn btn-sm px-3 font-size-16 header-item"
            onClick={handleSidebarToggle}
          >
            <i className="fa fa-fw fa-bars"></i>
          </button>

          {/* Main Navigation Menu */}
          <ul className="nav align-items-center main-menu">
            {can('userList') && (
            <li className="nav-item">
              <Link to="/admin/users" className="nav-link">
                List of Clients
              </Link>
            </li>
            )}

            {can('agentAssign') && (
            <li className="nav-item">
              <Link to="/admin/assign-agent" className="nav-link">
                Assign Agent
              </Link>
            </li>
            )}

            {can('marketAnalysis') && (
            <li className="nav-item">
              <Link to="/admin/market-analysis" className="nav-link">
                Market Analysis
              </Link>
            </li>
            )}

            {role === 'owner' && (
            <li className="nav-item">
              <Link to="/admin/system-tracker" className="nav-link">
                System Tracker
              </Link>
            </li>
            )}

            {/* Live Market Dropdown */}
            {can('ourCasino') && (
            <li className={`nav-item dropdown ${liveMarketOpen ? 'show' : ''}`}>
              <a
                href="#"
                className="nav-link dropdown-toggle"
                onClick={(e) => {
                  e.preventDefault()
                  setLiveMarketOpen(!liveMarketOpen)
                }}
                role="button"
                aria-expanded={liveMarketOpen}
              >
                Live Market

              </a>
              <div className={`dropdown-menu ${liveMarketOpen ? 'show' : ''}`}>
                <Link to="/admin/casino/premium" className="dropdown-item">
                  <span>Premium Casino</span>
                </Link>
                {/* <Link to="/admin/casino/tembo" className="dropdown-item">
                  <span>Tembo Casino</span>
                </Link> */}
                {/* <Link to="/admin/casino/vip" className="dropdown-item">
                  <span>Vip Casino</span>
                </Link>
                <Link to="/admin/casino/lucky5" className="dropdown-item">
                  <span>Lucky 6</span>
                </Link> */}
                <Link to="/admin/casino/mogambo" className="dropdown-item">
                  <span>Mogambo</span>
                </Link>
                <Link to="/admin/casino/teenunique" className="dropdown-item">
                  <span>Unique Teenpatti</span>
                </Link>
                {/* <Link to="/admin/casino/roulettelist" className="dropdown-item">
                  <span>Roulette</span>
                </Link> */}

                <Link to="/admin/casino/superover2" className="dropdown-item">
                  <span>Super Over2</span>
                </Link>
                <Link to="/admin/casino/lucky15" className="dropdown-item">
                  <span>Lucky15</span>
                </Link>
                <Link to="/admin/casino/goal" className="dropdown-item">
                  <span>Goal</span>
                </Link>
               
                <Link to="/admin/casino/race20" className="dropdown-item">
                  <span>Race 20-20</span>
                </Link>
                <Link to="/admin/casino/queen" className="dropdown-item">
                  <span>Queen</span>
                </Link>
                <Link to="/admin/casino/baccaratlist" className="dropdown-item">
                  <span>Baccarat</span  >
                </Link>
                <Link to="/admin/casino/sportscasinolist" className="dropdown-item">
                  <span>Sport Casino</span>
                </Link>
             
                <Link to="/admin/casino/liveteenpattilist" className="dropdown-item">
                  <span>Live Teenpatti</span>
                </Link>
                <Link to="/admin/casino/teenpatti2list" className="dropdown-item">
                  <span>Teenpatti 2.0</span>
                </Link>
                <Link to="/admin/casino/livepokerlist" className="dropdown-item">
                  <span>Live Poker</span>
                </Link>
                {/* <Link to="/admin/casino/andarbaharlist" className="dropdown-item">
                  <span>Andar Bahar</span>
                </Link> */}
                <Link to="/admin/casino/lucky7list" className="dropdown-item">
                  <span>Lucky 7</span>
                </Link>
                <Link to="/admin/casino/dragontigerlist" className="dropdown-item">
                  <span>Dragon Tiger</span>
                </Link>
                <Link to="/admin/casino/bollywood-casino" className="dropdown-item">
                  <span>Bollywood Casino</span>
                </Link>
                <Link to="/market-analysis" className="dropdown-item">
                  <span>Cricket Casino</span>
                </Link>
                <Link to="/casino/other-casino" className="dropdown-item">
                  <span>Others</span>
                </Link>
              </div>
            </li>
            )}

            {/* Live Virtual Market Dropdown */}
            {can('ourCasino') && (
            <li className={`nav-item dropdown ${liveVirtualMarketOpen ? 'show' : ''}`}>
              <a
                href="#"
                className="nav-link dropdown-toggle"
                onClick={(e) => {
                  e.preventDefault()
                  setLiveVirtualMarketOpen(!liveVirtualMarketOpen)
                }}
                role="button"
                aria-expanded={liveVirtualMarketOpen}
              >
                Live Virtual Market

              </a>
              <div className={`dropdown-menu ${liveVirtualMarketOpen ? 'show' : ''}`}>
                <Link to="/admin/vcasino/dtl20" className="dropdown-item">
                  <span>20-20 DTL</span>
                </Link>
                <Link to="/admin/vcasino/aaa2" className="dropdown-item">
                  <span>Amar Akbar Anthony</span>
                </Link>
                <Link to="/admin/vcasino/teenmuf" className="dropdown-item">
                  <span>Muflis Teenpatti</span>
                </Link>
                <Link to="/admin/vcasino/teen" className="dropdown-item">
                  <span>1 Day Teenpatti</span>
                </Link>
                <Link to="/admin/vcasino/dt6" className="dropdown-item">
                  <span>1 Day Dragon Tiger</span>
                </Link>
                <Link to="/admin/vcasino/lucky7" className="dropdown-item">
                  <span>Lucky 7</span>
                </Link>
                <Link to="/admin/vcasino/btable" className="dropdown-item">
                  <span>Bollywood Casino</span>
                </Link>
                <Link to="/admin/vcasino/teen20" className="dropdown-item">
                  <span>20-20 Teenpatti</span>
                </Link>
                <Link to="/admin/vcasino/trio" className="dropdown-item">
                  <span>Trio</span>
                </Link>
              </div>
            </li>
            )}

            {/* Reports Dropdown — shown if the executive holds any report perm */}
            {can(['accountStatement','currentBets','partyWinLoss','events','liveCasinoResult','casinoResult','generalLock','userLock']) && (
            <li className={`nav-item dropdown ${reportsOpen ? 'show' : ''}`}>
              <a
                href="#"
                className="nav-link dropdown-toggle"
                onClick={(e) => {
                  e.preventDefault()
                  setReportsOpen(!reportsOpen)
                }}
                role="button"
                aria-expanded={reportsOpen}
              >
                Reports

              </a>
              <div className={`dropdown-menu ${reportsOpen ? 'show' : ''}`}>
                {can('accountStatement') && (
                <Link to="/admin/reports/accountstatement" className="side-nav-link-ref dropdown-item">
                  Account Statement
                </Link>
                )}
                {can('currentBets') && (
                <Link to="/admin/reports/currentbets" className="side-nav-link-ref dropdown-item">
                  Current Bets
                </Link>
                )}
                {can('partyWinLoss') && (
                <Link to="/admin/reports/generalreport" className="side-nav-link-ref dropdown-item">
                  General Report
                </Link>
                )}
                {can('events') && (
                <Link to="/admin/reports/gamereport" className="side-nav-link-ref dropdown-item">
                  Game Report
                </Link>
                )}
                {can('liveCasinoResult') && (
                <Link to="/admin/reports/livecasinoreport" className="side-nav-link-ref dropdown-item">
                  Casino Report
                </Link>
                )}
                {can('partyWinLoss') && (
                <Link to="/admin/reports/profitloss" className="side-nav-link-ref dropdown-item">
                  Profit And Loss
                </Link>
                )}
                {can('casinoResult') && (
                <Link to="/admin/reports/casinoresult" className="side-nav-link-ref dropdown-item">
                  Casino Result Report
                </Link>
                )}
                {can('userLock') && (
                <Link to="/admin/settings/userlock" className="side-nav-link-ref dropdown-item">
                  General Lock
                </Link>
                )}
                {can('generalLock') && (
                <Link to="/admin/settings/global-settings" className="side-nav-link-ref dropdown-item">
                  Global Settings
                </Link>
                )}
                {can('partyWinLoss') && (
                <Link to="/admin/reports/totalprofitloss" className="side-nav-link-ref dropdown-item">
                  Total Profit Loss
                </Link>
                )}
                {can('partyWinLoss') && (
                <Link to="/admin/reports/userwinloss" className="side-nav-link-ref dropdown-item">
                  User Win Loss
                </Link>
                )}
                {can('currentBets') && (
                <Link to="/admin/reports/userbethistory" className="side-nav-link-ref dropdown-item">
                  User Bet History
                </Link>
                )}

              </div>
            </li>
            )}

            {/* Settlement Dropdown - Owner only */}
            {role === 'owner' && (
              <li className={`nav-item dropdown ${settlementOpen ? 'show' : ''}`} ref={settlementRef}>
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  onClick={(e) => {
                    e.preventDefault()
                    setSettlementOpen(!settlementOpen)
                  }}
                  role="button"
                  aria-expanded={settlementOpen}
                >
                  Settlement
                </a>
                <div className={`dropdown-menu ${settlementOpen ? 'show' : ''}`}>
                  <Link to="/admin/settlement/match" className="dropdown-item">
                    <span>Match Settlement</span>
                  </Link>
                  <Link to="/admin/settlement/fancy" className="dropdown-item">
                    <span>Fancy Settlement</span>
                  </Link>
                  <Link to="/admin/settlement/settled-bets" className="dropdown-item">
                    <span>Settled Bets</span>
                  </Link>
                </div>
              </li>
            )}

            {can('loginUserCreation') && (
            <li className="nav-item">
              <Link to="/admin/createaccount" className="nav-link">
                Multi Login
              </Link>
            </li>
            )}
          </ul>
        </div>

        {/* User Menu Section */}
        <div className="d-flex user-menu align-items-center">
          {/* System Tracker integrity bell — mother-admin (owner) only */}
          {role === 'owner' && <IntegrityAlertsBell />}
          {/* Desktop Balance */}
          {/* <div className="d-none d-sm-flex align-items-center mr-3">
             <span className="text-white font-weight-bold" style={{ fontSize: '14px' }}>
                Pts: {user?.wallet?.inr_balance || 0}
             </span>
          </div> */}

          {/* User Dropdown */}
          <div className="dropdown b-dropdown btn-group" ref={userMenuRef}>
            <button
              type="button"
              className="btn dropdown-toggle btn-black header-item"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <span className="ml-1 font-[500]">{user?.username || 'User'}</span>

            </button>
            <ul
              className={`dropdown-menu ${userMenuOpen ? 'show' : ''}`}
              role="menu"
            >
              <div className="dropdown d-sm-none ml-1 mr-1">
                <div className="bal-box">
                  {/* <span className="balance nowrap">
                    Pts: <span className="balance-value"><b>{user?.wallet?.inr_balance || 0}</b></span>
                  </span> */}
                </div>
              </div>
              <a href="javascript: void(0);" className="dropdown-item d-sm-none">
                <i className="fas fa-info-circle mr-1"></i> Rules
              </a>
              <Link to="/admin/security-auth" className="dropdown-item">
                Secure Auth Verification
              </Link>
              <Link to="/admin/change-password" className="dropdown-item">
                Change Password
              </Link>
              <a
                href="javascript:void(0)"
                className="dropdown-item"
                onClick={handleLogout}
              >
                Logout
              </a>
            </ul>
          </div>

          {/* Search Box */}
          <div className="site-searchbox " ref={searchRef}>
            <div className={`multiselect ${searchOpen ? 'multiselect--active' : ''}`} tabIndex="-1" role="combobox">
              <div className="multiselect__select"></div>
              <div className="multiselect__tags" onClick={handleSearchClick}>
                <div className="multiselect__tags-wrap" style={{ display: 'none' }}></div>
                <div className="multiselect__spinner" style={{ display: 'none' }}></div>
                <input
                  name=""
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="All Client"
                  tabIndex="0"
                  className="multiselect__input"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onClick={handleSearchClick}
                  style={{
                    width: searchOpen ? '' : '0px',
                    position: searchOpen ? 'relative' : 'absolute',
                    padding: searchOpen ? '0.47rem 0.75rem' : '0px',
                    color: searchOpen ? '#000' : 'transparent'
                  }}
                />
                {!searchOpen && <span className="multiselect__placeholder">All Client</span>}
                {!searchValue && (
                  <div className="search-icon" onClick={handleSearchClick}>
                    <img src={searchIcon} alt="Search" style={{ width: '22px', height: '22px' }} />
                  </div>
                )}
              </div>
              <div
                className="multiselect__content-wrapper"
                style={{
                  maxHeight: '300px',
                  display: searchOpen && searchValue ? 'block' : 'none'
                }}
              >
                <ul role="listbox" className="multiselect__content">
                  {searchResults && searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <li key={item.user_id || item.wallet_id || item.username}>
                          <button
                            type="button"
                            className="multiselect__option"
                            onClick={() => {
                              // Open user modal with full data
                              setSelectedUser(item)
                              setUserModalOpen(true)
                              setSearchValue(item.username || '')
                              setSearchOpen(false)
                              setSearchResults([])
                            }}
                            style={{ color: '#000', background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
                          >
                            <span>{item.username}</span>
                          </button>
                        </li>
                    ))
                  ) : (
                    <li>
                      <span style={{ color: '#000' }} className="multiselect__option">
                        <span>No elements found</span>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      {/* User Detail Modal */}
      {userModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setUserModalOpen(false)}
        />
      )}



      </div>
    </header>
  )
}

export default Header