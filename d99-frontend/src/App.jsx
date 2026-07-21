import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import TwoFactorAuth from "./pages/TwoFactorAuth.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import GameDetails from "./pages/GameDetails.jsx";
import AllSports from "./pages/AllSports.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SpinLoader from "./components/common/SpinLoader.jsx";
import casinoRoutes from "./routes/casinoRoutes.js";

const CurrentBet = lazy(() => import("./pages/CurrentBet.jsx"));
const CrashPage = lazy(() => import("./pages/CrashPage.jsx"));
const AccountStatement = lazy(() => import("./pages/AccountStatement.jsx"));
const ActivityLog = lazy(() => import("./pages/ActivityLog.jsx"));
const LiveCasinoBets = lazy(() => import("./pages/LiveCasinoBets.jsx"));
const SecureAuth = lazy(() => import("./pages/SecureAuth.jsx"));
const CasinoResultsPage = lazy(() => import("./pages/casinoResults/CasinoResultsPage.jsx"));
const CasinoListPage = lazy(() => import("./pages/CasinoListPage.jsx"));
const LiveCasinoListPage = lazy(() => import("./pages/LiveCasinoListPage.jsx"));
const SlotListPage = lazy(() => import("./pages/SlotListPage.jsx"));
const FantasyListPage = lazy(() => import("./pages/FantasyListPage.jsx"));
const SportsBookPage = lazy(() => import("./pages/SportsBookPage.jsx"));
const ECricketRaw = lazy(() => import("./pages/ECricketRaw.jsx"));
const VirtualCricketPage = lazy(() => import("./pages/VirtualCricketPage.jsx"));
const TpVirtualCricketPage = lazy(() => import("./pages/TpVirtualCricketPage.jsx"));
const CricketVPage = lazy(() => import("./pages/CricketVPage.jsx"));

function P({ children }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<SpinLoader />}>{children}</Suspense>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/casino/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/game-details/:sid/:gmid" element={<ProtectedRoute><GameDetails /></ProtectedRoute>} />
      <Route path="/all-sports/:sid" element={<ProtectedRoute><AllSports /></ProtectedRoute>} />
      <Route path="/sports-book/:id" element={<P><SportsBookPage /></P>} />
      <Route path="/e-cricket" element={<P><ECricketRaw /></P>} />
      <Route path="/virtual-cricket/:etid/:gmid" element={<P><VirtualCricketPage /></P>} />
      <Route path="/tp-virtual-cricket/:etid/:gmid" element={<P><TpVirtualCricketPage /></P>} />
      <Route path="/cricketv/:etid/:gmid" element={<P><CricketVPage /></P>} />

      {/* Casino table game routes */}
      {casinoRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={<P><Component /></P>}
        />
      ))}

      <Route path="/current-bet" element={<P><CurrentBet /></P>} />
      <Route path="/account-statement" element={<P><AccountStatement /></P>} />
      <Route path="/activity-log" element={<P><ActivityLog /></P>} />
      <Route path="/live-casino-bets" element={<P><LiveCasinoBets /></P>} />
      <Route path="/secure-auth" element={<P><SecureAuth /></P>} />
      <Route path="/casino-results" element={<P><CasinoResultsPage /></P>} />
      <Route path="/casino-results/:type" element={<P><CasinoResultsPage /></P>} />

      {/* List pages — single route each with optional params */}
      <Route path="/casino-list" element={<P><CasinoListPage /></P>} />
      <Route path="/casino-list/:provider" element={<P><CasinoListPage /></P>} />
      <Route path="/casino-list/:provider/:providerId" element={<P><CasinoListPage /></P>} />
      <Route path="/casino-list/:provider/:providerId/:categoryId" element={<P><CasinoListPage /></P>} />

      <Route path="/live-casino-list" element={<P><LiveCasinoListPage /></P>} />
      <Route path="/live-casino-list/:provider" element={<P><LiveCasinoListPage /></P>} />
      <Route path="/live-casino-list/:provider/:categoryId" element={<P><LiveCasinoListPage /></P>} />

      <Route path="/slot-list" element={<P><SlotListPage /></P>} />
      <Route path="/slot-list/:providerId" element={<P><SlotListPage /></P>} />
      <Route path="/slot-list/:providerId/:categoryId" element={<P><SlotListPage /></P>} />

      <Route path="/aviator-list" element={<P><CrashPage /></P>} />

      <Route path="/fantasy-list" element={<P><FantasyListPage /></P>} />
      <Route path="/fantasy-list/:provider" element={<P><FantasyListPage /></P>} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/authentication/2" element={<TwoFactorAuth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
