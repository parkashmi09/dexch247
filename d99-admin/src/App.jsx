import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout } from './store/slices/authSlice'
import { authService } from './services/authService'
import Login from './pages/login/login'
import ResetPassword from './pages/reset-password/reset-password'
import PasswordSuccess from './pages/reset-password/password-success'
import Dashboard from './pages/dashboard/dashboard'
import MarketAnalysis from './pages/market-analysis/market-analysis'
import Users from './pages/users/users'
import AddAccount from './pages/users/add-account'
import AssignAgent from './pages/assign-agent/assign-agent'
import AccountStatement from './pages/accounts/account-statement'
import GeneralReport from './pages/reports/general-report'
import CasinoReport from './pages/reports/casino-report'
import ProfitLoss from './pages/reports/profit-loss'
import TotalProfitLoss from './pages/reports/total-profit-loss'
import UserWinLoss from './pages/reports/user-win-loss'
import CasinoResultReport from './pages/reports/casino-result-report'
import GameReport from './pages/reports/game-report'
import CurrentBets from './pages/reports/current-bets'
import UserBetHistory from './pages/reports/user-bet-history'
import GeneralLock from './pages/settings/general-lock'
import ChangePassword from './pages/settings/change-password'
import SecurityAuth from './pages/security-auth';
import MultiLogin from './pages/multi-login/multi-login'
import GameDetails from './pages/game-details/game-details'
import SystemTracker from './pages/system-tracker/SystemTracker'
import GlobalSettings from './pages/settings/global-settings'
import MatchSettlement from './pages/settlement/match-settlement'
import FancySettlement from './pages/settlement/fancy-settlement'
import SettledBets from './pages/settlement/settled-bets'
import ProtectedRoute from './components/ProtectedRoute'
import NoAccess from './pages/no-access'
import Loader from './components/Loader'
import './App.css'
import Users2 from './pages/users2/users2'
import TeenPatti from "./pages/diamondCasinoAllGames/teen";
import TeenPatti2 from "./pages/diamondCasinoAllGames/patti2";
import TeenPatti3 from "./pages/diamondCasinoAllGames/teen3";
import TeenPatti33 from "./pages/diamondCasinoAllGames/teen33";
import TeenPatti8 from "./pages/diamondCasinoAllGames/teen8";
import TeenPatti6 from "./pages/diamondCasinoAllGames/teen6";
import TeenPatti20c from "./pages/diamondCasinoAllGames/teen20c";
import {TeenPatti20List} from "./pages/diamondCasinoAllGames/teenPatti20";
import {PokerList} from "./pages/diamondCasinoAllGames/pokerlist"
// import CasinoResult from "./pages/diamondCasinoAllGames/casinoResult";
import OurRoullete from "./pages/diamondCasinoAllGames/ourRoullete";
import TeenPatti42 from "./pages/diamondCasinoAllGames/teen42";
import TeenPatti41 from "./pages/diamondCasinoAllGames/teen41";
import TeenPatti32 from "./pages/diamondCasinoAllGames/teen32";
import TeenPatti20b from "./pages/diamondCasinoAllGames/teen20b";
import TeenPatti20 from "./pages/diamondCasinoAllGames/teen20";
import TeenPattiMuf from "./pages/diamondCasinoAllGames/teenmuf";

import TeenPatti9 from "./pages/diamondCasinoAllGames/teen9";
import Mogambo from "./pages/diamondCasinoAllGames/mogambo";
import TeenUnique from "./pages/diamondCasinoAllGames/teenunique";
import TeenPatti62 from "./pages/diamondCasinoAllGames/teen62";
import DoliDana from "./pages/diamondCasinoAllGames/dolidana";

import Poker from "./pages/diamondCasinoAllGames/poker";
import Poker20 from "./pages/diamondCasinoAllGames/poker20";
import Poker6 from "./pages/diamondCasinoAllGames/poker6";
import Baccarat from "./pages/diamondCasinoAllGames/baccarat";
import Baccarat2 from "./pages/diamondCasinoAllGames/baccarat2";
import DragonTiger from "./pages/diamondCasinoAllGames/dragonTiger";
import DragonTiger202 from "./pages/diamondCasinoAllGames/dragonTiger202";
import DragonTiger6 from "./pages/diamondCasinoAllGames/dragonTiger6";
import DragonTigerLion from "./pages/diamondCasinoAllGames/dragonTigerLion";
import Card32 from "./pages/diamondCasinoAllGames/card32";
import Lucky7 from "./pages/diamondCasinoAllGames/lucky7";
import Card32B from "./pages/diamondCasinoAllGames/Card32B";
import Lucky15 from "./pages/diamondCasinoAllGames/lucky15";
import Lucky7B from "./pages/diamondCasinoAllGames/lucky7B";
import Lucky7C from "./pages/diamondCasinoAllGames/lucky7C";
import Goals from "./pages/diamondCasinoAllGames/goals";
import SuperOver3 from "./pages/diamondCasinoAllGames/superOver3";
import SuperOver from "./pages/diamondCasinoAllGames/superOver";
import SuperOver2 from "./pages/diamondCasinoAllGames/superOver2";
import Dum10 from "./pages/diamondCasinoAllGames/dum10";
import Race2 from "./pages/diamondCasinoAllGames/race2";
import AAA2 from "./pages/diamondCasinoAllGames/aaa2";
import Teen1 from "./pages/diamondCasinoAllGames/teen1";
import NotEnum from "./pages/diamondCasinoAllGames/notEnum";
import Trio from "./pages/diamondCasinoAllGames/trio";
import Race20 from "./pages/diamondCasinoAllGames/race20";
import Trap from "./pages/diamondCasinoAllGames/trap";
import Sicbo from "./pages/diamondCasinoAllGames/sicbo";
import Sicbo2 from "./pages/diamondCasinoAllGames/sicbo2";
import Kbc from "./pages/diamondCasinoAllGames/kbc";
import Queen from "./pages/diamondCasinoAllGames/queen";
import LottCard from "./pages/diamondCasinoAllGames/lottCard";
import Race17 from "./pages/diamondCasinoAllGames/race17";
import BallByBalll from "./pages/diamondCasinoAllGames/ballByBall";
// import ComingSoon from './pages/diamondCasinoAllGames/comingSoon'
// import PageNotFound from "./pages/pageNotFound";
// import ScrollToTop from "../components/ScrollToTop";

// import CurrentBet from "../components/currentBet";

import LaunchedLiveSection from "./pages/diamondCasinoAllGames/launchedLiveSection";
import FootballTabPage from "./pages/diamondCasinoAllGames/FootballTabPage";
import TableTennisTabPage from "./pages/diamondCasinoAllGames/TableTennisTabPage";
import CricketTabPage from "./pages/diamondCasinoAllGames/CricketTabPage";
import TennisTabPage from "./pages/diamondCasinoAllGames/TennisTabPage";

// import popupImg from "../assets/img/popup.png";
// import mobilePopup from "../assets/img/mobilePopup.png";
import Teensin from "./pages/diamondCasinoAllGames/teensin";
// import FirstLoginRules from "../components/firstLoginRules";
import Lucky5 from "./pages/diamondCasinoAllGames/lucky5";
import Poison from "./pages/diamondCasinoAllGames/poison";
import Poison20 from "./pages/diamondCasinoAllGames/poison20";
import Joker20 from "./pages/diamondCasinoAllGames/joker20";
import TwoFactorAuth from './pages/login/TwoFactorAuth';
import CasinoLayout from './components/CasinoLayout';
import { PremiumCasino } from './pages/diamondCasinoAllGames/premiumCasino'
import { TemboCasino } from './pages/diamondCasinoAllGames/temboCasino'
import { VipCasino } from './pages/diamondCasinoAllGames/vipCasino'
import { RouletteList } from './pages/diamondCasinoAllGames/rouletteList'
import { BaccaratList } from './pages/diamondCasinoAllGames/baccaratList'
import {WorliList} from './pages/diamondCasinoAllGames/worli'
import {Card32List} from './pages/diamondCasinoAllGames/card32list'
import { LiveTeenPatti } from './pages/diamondCasinoAllGames/liveTeenPattiList'
import { SportList } from './pages/diamondCasinoAllGames/sportList'
/**
 * App Component
 *
 * Main application component that sets up routing and layout.
 */
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

/**
 * AppContent Component
 *
 * Handles route-based body class management and routing logic.
 */
function AppContent() {
  const location = useLocation()
  const dispatch = useDispatch()
  const { isAuthenticated, token, user } = useSelector((state) => state.auth)
  const isLoginPage = location.pathname === '/' || location.pathname === '/login'
  const isResetPasswordPage = location.pathname === '/reset-password'
  const isPasswordSuccessPage = location.pathname === '/password-success'

  // Set sidebar hidden immediately for authenticated pages (before first render)
  if (typeof document !== 'undefined' && !isLoginPage && !isResetPasswordPage && !isPasswordSuccessPage) {
    document.body.classList.add('vertical-collpsed')
  }

  // Fetch profile on app initialization if token exists but user is not loaded
  useEffect(() => {
    const initializeAuth = async () => {
      const activeRole = localStorage.getItem('activeRole')
      const storedToken = activeRole === 'owner'
        ? localStorage.getItem('ownerToken')
        : activeRole === 'staff'
          ? localStorage.getItem('staffToken')
          : activeRole === 'executive'
            ? localStorage.getItem('executiveToken')
            : localStorage.getItem('token')

      // Executives have no profile endpoint — restore the session (incl. the
      // permission map) straight from localStorage; the backend re-validates
      // active + permissions on every request anyway.
      if (storedToken && activeRole === 'executive') {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
          dispatch(setCredentials({ token: storedToken, user: storedUser, role: 'executive' }))
        } catch {
          dispatch(logout())
        }
        return
      }

      // If we have a token but no user in Redux, fetch profile
      if (storedToken && !user) {
        try {
          console.log('Initializing auth: Fetching profile...', { role: activeRole })
          const profileResponse = activeRole === 'owner'
            ? await authService.getOwnerProfile()
            : await authService.getProfile()
          console.log('Profile response on init:', profileResponse)

          // Owner profile has data directly, staff profile has data.user
          const userData = activeRole === 'owner'
            ? profileResponse.data
            : profileResponse.data?.user

          if (profileResponse && profileResponse.success && userData) {
            dispatch(setCredentials({
              token: storedToken,
              user: userData,
              role: activeRole || 'staff'
            }))
            console.log('Profile loaded on app init:', userData)
          } else {
            console.warn('Invalid profile response, logging out')
            dispatch(logout())
          }
        } catch (error) {
          console.error('Failed to fetch profile on init:', error)
          // If 401, token is invalid, logout
          if (error.response?.status === 401) {
            dispatch(logout())
          }
        }
      } else if (storedToken && user) {
        // Token and user exist, ensure Redux is in sync
        dispatch(setCredentials({
          token: storedToken,
          user: user,
          role: activeRole || 'staff'
        }))
      }
    }

    if (!isLoginPage && !isResetPasswordPage && !isPasswordSuccessPage) {
      initializeAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  // Redirect /casino/results/:gameName to report so "View All" works
  function CasinoResultsRedirect() {
    const { gameName } = useParams();
    const to = `/admin/reports/casinoresult${gameName ? `/${gameName}` : ''}`;
    return <Navigate to={to} replace />;
  }

  // Manage body classes based on current route
  useEffect(() => {
    if (isLoginPage || isResetPasswordPage || isPasswordSuccessPage) {
      document.body.classList.add('login')
      document.body.classList.remove('vertical-collpsed')
      document.body.setAttribute('data-sidebar', 'dark')
    } else {
      document.body.classList.remove('login')
      // Ensure sidebar is hidden by default on authenticated pages
      document.body.classList.add('vertical-collpsed')
    }

    return () => {
      document.body.classList.remove('login')
    }
  }, [isLoginPage, isResetPasswordPage, isPasswordSuccessPage])

  return (
    <div className={`App ${isLoginPage || isResetPasswordPage || isPasswordSuccessPage ? 'login' : ''}`}>
      <Loader />
      <div className={isLoginPage || isResetPasswordPage || isPasswordSuccessPage ? 'wrapper' : ''}>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                user?.first_login === false ? (
                  <Navigate to="/reset-password" replace />
                ) : (
                  <Navigate to="/admin/market-analysis" replace />
                )
              ) : (
                <Login />
              )
            }
          />


          <Route
            path="/loginauth/2"
            element={<TwoFactorAuth />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                user?.first_login === false ? (
                  <Navigate to="/reset-password" replace />
                ) : (
                  <Navigate to="/admin/market-analysis" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          {/* Executive (multi-login) landing when granted nothing routable */}
          <Route
            path="/no-access"
            element={
              <ProtectedRoute>
                <NoAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/password-success"
            element={<PasswordSuccess />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/market-analysis"
            element={
              <ProtectedRoute>
                <MarketAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system-tracker"
            element={
              <ProtectedRoute>
                <SystemTracker />
              </ProtectedRoute>
            }
          />
          {/* New Account List page (Users2) - primary route */}
          <Route
            path="/admin/users2"
            element={
              <ProtectedRoute>
                <Users2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users2/child/:childUsername"
            element={
              <ProtectedRoute>
                <Users2 />
              </ProtectedRoute>
            }
          />
          {/* Backwards-compatible route so /admin/users also shows the new Account List */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/child/:childUsername"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/insertuser"
            element={
              <ProtectedRoute>
                <AddAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assign-agent"
            element={
              <ProtectedRoute>
                <AssignAgent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/accountstatement"
            element={
              <ProtectedRoute>
                <AccountStatement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/currentbets"
            element={
              <ProtectedRoute>
                <CurrentBets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/generalreport"
            element={
              <ProtectedRoute>
                <GeneralReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/livecasinoreport"
            element={
              <ProtectedRoute>
                <CasinoReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/profitloss"
            element={
              <ProtectedRoute>
                <ProfitLoss />
              </ProtectedRoute>
            }
          />
          {/* Casino Result Report: used by CasinoLastResult "View All" link (see .cursor/rules/cursor-rules.mdc) */}
          <Route
            path="/admin/reports/casinoresult/:gameName?"
            element={
              <ProtectedRoute>
                <CasinoResultReport />
              </ProtectedRoute>
            }
          />
          <Route path="/casino/results/:gameName?" element={<CasinoResultsRedirect />} />
          <Route
            path="/admin/reports/gamereport"
            element={
              <ProtectedRoute>
                <GameReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/totalprofitloss"
            element={
              <ProtectedRoute>
                <TotalProfitLoss />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/userwinloss"
            element={
              <ProtectedRoute>
                <UserWinLoss />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/userbethistory"
            element={
              <ProtectedRoute>
                <UserBetHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/userlock"
            element={
              <ProtectedRoute>
                <GeneralLock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/security-auth"
            element={
              <ProtectedRoute>
                 <SecurityAuth />
              </ProtectedRoute>
             }
          />
          <Route
            path="/admin/settings/global-settings"
            element={
              <ProtectedRoute>
                <GlobalSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/createaccount"
            element={
              <ProtectedRoute>
                <MultiLogin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settlement/match"
            element={
              <ProtectedRoute>
                <MatchSettlement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settlement/fancy"
            element={
              <ProtectedRoute>
                <FancySettlement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settlement/settled-bets"
            element={
              <ProtectedRoute>
                <SettledBets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-details/:sportId/:eventId/:marketId"
            element={
              <ProtectedRoute>
                <GameDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-details/:sportId/:eventId"
            element={
              <ProtectedRoute>
                <GameDetails />
              </ProtectedRoute>
            }
          />
          <Route element={<CasinoLayout />}>
            <Route path="/admin/casino/premium" element={<PremiumCasino />} />
            <Route path="/admin/casino/tembo" element={<TemboCasino />} />
            <Route path="/admin/casino/vip" element={<VipCasino />} />

            <Route path="/admin/casino/patti2" element={<TeenPatti2 />} />
            <Route path="/admin/casino/teen3" element={<TeenPatti3 />} />
            {/* admin/casino/pteen */}
            <Route path="/admin/casino/pteen" element={<TeenPatti />} />
            <Route path="/admin/casino/pteen20" element={<TeenPatti20 />} />
            {/* <Route path="/admin/vcasino/teen" element={<TeenPatti />} /> */}
            <Route path="/admin/casino/patti2" element={<TeenPatti2 />} />
             <Route path="/admin/casino/teen3" element={<TeenPatti3 />} />
            <Route path="/admin/casino/teen6" element={<TeenPatti6 />} />
            <Route path="/admin/casino/teen8" element={<TeenPatti8 />} />
            <Route path="/admin/casino/teen" element={<TeenPatti9 />} />
            <Route path="/admin/casino/teen9" element={<TeenPatti9 />} />
            <Route path="/admin/casino/teen20" element={<TeenPatti20 />} />
            <Route path="/admin/casino/teen20b" element={<TeenPatti20b />} />
            <Route path="/admin/casino/teenmuf" element={<TeenPattiMuf />} />
            <Route path="/admin/casino/teen20c" element={<TeenPatti20c />} />
            <Route path="/admin/casino/teen32" element={<TeenPatti32 />} />
            <Route path="/admin/casino/teen33" element={<TeenPatti33 />} />
            <Route path="/admin/casino/teen41" element={<TeenPatti41 />} />
            <Route path="/admin/casino/teen42" element={<TeenPatti42 />} />
            <Route path="/admin/casino/poker" element={<Poker />} />
            <Route path="/admin/casino/livepokerlist" element={<PokerList />} />
            <Route path="/admin/casino/poker6" element={<Poker6 />} />
            <Route path="/admin/casino/poker20" element={<Poker20 />} />
            <Route path="/admin/casino/baccarat" element={<Baccarat />} />
            <Route path="/admin/casino/baccarat2" element={<Baccarat2 />} />
            <Route path="/admin/casino/pbaccarat" element={<Baccarat />} />
            <Route path="/admin/casino/dt20" element={<DragonTiger />} />
            <Route path="/admin/casino/pdt20" element={<DragonTiger />} />
            <Route path="/admin/vcasino/dt6" element={<DragonTiger6 />} />
            <Route path="/admin/casino/dt202" element={<DragonTiger202 />} />
            <Route path="/admin/vcasino/dtl20" element={<DragonTigerLion />} />
            <Route path="/admin/casino/card32" element={<Card32 />} />
            <Route path="/admin/casino/pcard32" element={<Card32 />} />
            <Route path="/admin/casino/card32eu" element={<Card32B />} />
            <Route path="/admin/casino/card32list" element={<Card32List />} />
            <Route path="/admin/casino/liveteenpattilist" element={<LiveTeenPatti />} />
            <Route path="/admin/casino/lucky5" element={<Lucky5 />} />
            <Route path="/admin/vcasino/lucky7" element={<Lucky7 />} />
            <Route path="/admin/casino/plucky7" element={<Lucky7 />} />
            <Route path="/admin/casino/lucky15" element={<Lucky15 />} />
            <Route path="/admin/casino/lucky7eu" element={<Lucky7B />} />
            <Route path="/admin/casino/lucky7eu2" element={<Lucky7C />} />
            <Route path="/admin/casino/roulettelist" element={<RouletteList />} />
            <Route path="/admin/casino/baccaratlist" element={<BaccaratList/>} />
            <Route path="/admin/casino/sportscasinolist" element={<SportList/>} />
            <Route path="/admin/casino/ourroullete" element={<OurRoullete />} />
            <Route path="/admin/casino/roulette11" element={<OurRoullete />} />
            <Route path="/admin/casino/roulette12" element={<OurRoullete />} />
            <Route path="/admin/casino/roulette13" element={<OurRoullete />} />
            <Route path="/admin/casino/goal" element={<Goals />} />
            <Route path="/admin/casino/superOver3" element={<SuperOver3 />} />
            <Route path="/admin/casino/superOver2" element={<SuperOver2 />} />
            <Route path="/admin/casino/superOver" element={<SuperOver />} />
            <Route path="/admin/casino/dum10" element={<Dum10 />} />
            <Route path="/admin/casino/race2" element={<Race2 />} />
            <Route path="/admin/vcasino/aaa2" element={<AAA2 />} />
            <Route path="/admin/casino/teen1" element={<Teen1 />} />
            <Route path="/admin/casino/notenum" element={<NotEnum />} />
            <Route path="/admin/vcasino/trio" element={<Trio />} />
            <Route path="/admin/casino/race20" element={<Race20 />} />
            <Route path="/admin/casino/trap" element={<Trap />} />
            <Route path="/admin/casino/sicbo" element={<Sicbo />} />
            <Route path="/admin/casino/sicbo2" element={<Sicbo2 />} />
            <Route path="/admin/casino/kbc" element={<Kbc />} />
            <Route path="/admin/casino/queen" element={<Queen />} />
            <Route path="/admin/casino/lottcard" element={<LottCard />} />
            <Route path="/admin/casino/race17" element={<Race17 />} />
            <Route path="/admin/casino/superover2" element={<SuperOver2 />} />
        <Route path="/admin/casino/worlilist" element={<WorliList />} />



            <Route path="/admin/casino/mogambo" element={<Mogambo />} />
            <Route path="/admin/casino/teenunique" element={<TeenUnique />} />
            <Route path="/admin/casino/teen62" element={<TeenPatti62 />} />
            <Route path="/admin/casino/teenpatti2list" element={<TeenPatti20List />} />
            <Route path="/admin/casino/dolidana" element={<DoliDana />} />
            <Route path="/admin/casino/poison" element={<Poison />} />
            <Route path="/admin/casino/poison20" element={<Poison20 />} />
            <Route path="/admin/casino/joker20" element={<Joker20 />} />
            <Route path="/admin/vcasino/joker20" element={<Joker20 />} />
            <Route path="/admin/casino/football" element={<FootballTabPage />} />
            <Route path="/admin/casino/tabletennis" element={<TableTennisTabPage />} />
            <Route path="/admin/casino/cricket" element={<CricketTabPage />} />
            <Route path="/admin/casino/tennis" element={<TennisTabPage />} />
            <Route path="/admin/casino/teensin" element={<Teensin />} />
          </Route>
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/admin/*" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
