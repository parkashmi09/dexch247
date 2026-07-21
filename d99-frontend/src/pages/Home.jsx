import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import LatestEvents from "../components/home/LatestEvents.jsx";
import MobileMenuTabs from "../components/home/MobileMenuTabs.jsx";
import SportsTabs from "../components/home/SportsTabs.jsx";
import BetTable from "../components/home/BetTable.jsx";
import CasinoList from "../components/home/CasinoList.jsx";
import WelcomeModal from "../components/home/WelcomeModal.jsx";
import FirstLoginRulesModal from "../components/common/FirstLoginRulesModal.jsx";
import { prefetchHomeSports } from "../hooks/useSportsData.js";

// Cricket = sid 4. The sports-tab iconIds double as backend sport ids so
// we can drive the live board straight from the active tab.
const DEFAULT_SID = 4;

export default function Home() {
  const [activeSid, setActiveSid] = useState(DEFAULT_SID);
  const [showRules, setShowRules] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Prefetch all home-board sports (cricket, football, tennis, table
  // tennis) on first load so tab switches render instantly from cache.
  useEffect(() => {
    prefetchHomeSports();
  }, []);

  useEffect(() => {
    const fromSession = sessionStorage.getItem("showLoginPopup") === "true";
    const fromState = location.state?.showFirstLoginRules === true;

    if (fromSession || fromState) {
      setShowRules(true);
      sessionStorage.removeItem("showLoginPopup");
      if (fromState) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout variant="home-page">
      <WelcomeModal />
      <FirstLoginRulesModal
        show={showRules}
        onHide={() => setShowRules(false)}
        onAccept={() => setShowRules(false)}
      />
      <LatestEvents variant="mobile" />
      <MobileMenuTabs />
      <LatestEvents />
      <SportsTabs activeSid={activeSid} onChange={setActiveSid} />
      <BetTable sid={activeSid} />
      <CasinoList />
    </Layout>
  );
}
