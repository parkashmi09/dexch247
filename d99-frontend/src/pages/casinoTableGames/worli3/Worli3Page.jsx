import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Layout from "../../../components/layout/Layout.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { Worli3LastResults } from "../../../components/casino/tables/worli3/result/index.jsx";
import BetTable from "../../../components/casino/common/BetTable.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar } from "../../../components/casino/common/tableLayout/index.jsx";
import MatkaTabsList from "../../../components/casino/tables/worli3/betTableWorli3/MatkaTabsList.jsx";
import MatkaCoins from "../../../components/casino/tables/worli3/betTableWorli3/MatkaCoins.jsx";
import WorliTabs from "../../../components/casino/tables/worli3/betTableWorli3/WorliTabs.jsx";
import { CASINO_GAME_IDS } from "../../../components/casino/tables/tableCasinoUtils.js";
import { placeCasinoBet } from "../../../apiservices/CasionApi.js";
import { fetchBalanceThunk } from "../../../features/user/userSlice.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";
import { useExposure } from "../../../hooks/useExposure.jsx";

const GAME_ID = CASINO_GAME_IDS.WORLI3;

// Standard Matka payout multipliers (operator-adjustable). Used as the back odds
// at placement. Settlement uses the same `odds` the bet was placed at.
const WORLI3_ODDS = {
  single: 9.5, jodi: 95, pana: 140, sp: 140, dp: 280, trio: 600,
  cycle: 95, motorsp: 9.5, chart56: 140, chart64: 140,
  abr: 1.9, commonsp: 9.5, commondp: 28, colordp: 28,
};

// Map an FE tab + clicked label → the selection string resolveWorli3 understands.
function composeSelection(tab, label) {
  const l = String(label);
  switch (tab) {
    case "jodi":     return `Jodi ${l}`;          // "4-7"
    case "single":   return `Single ${l}`;        // "5" | "Line 1" | "ODD" | "EVEN"
    case "pana":     return `Pana ${l}`;
    case "sp":       return `SP ${l}`;
    case "dp":       return `DP ${l}`;
    case "trio":     return "ALL TRIO";
    case "cycle":    return `Cycle ${l}`;
    case "motorsp":  return `Motor ${l}`;
    case "chart56":  return `56 ${l}`;
    case "chart64":  return `64 ${l}`;
    case "abr":      return l;                     // A | B | R | AB ...
    case "commonsp": return `Common SP ${l}`;
    case "commondp": return `Common DP ${l}`;
    case "colordp":  return `Color DP ${l}`;
    default:         return `${tab} ${l}`;
  }
}

export default function Worli3Page() {
  const dispatch = useDispatch();
  const { refreshAll } = useExposure();
  const [activeMarketId, setActiveMarketId] = useState("");
  const {
    gameData,
    iframeSrc,
    myBets,
    lastResults,
    fetchExposure,
    fetchMyBets,
  } = useCasinoGame(GAME_ID, { defaultResults: [], matchId: activeMarketId });

  // Real markets (with provider round mids) from the all-data feed.
  const markets = Array.isArray(gameData?.data?.data) ? gameData.data.data : [];
  const [activeGameTab, setActiveGameTab] = useState("jodi");
  const [selectedCoin, setSelectedCoin] = useState(0);
  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [placing, setPlacing] = useState(false);

  // Default the active market to the first live one once the feed loads.
  useEffect(() => {
    if (markets.length && !markets.some((m) => String(m.mid) === String(activeMarketId))) {
      setActiveMarketId(String(markets[0].mid));
    }
  }, [markets, activeMarketId]);

  // Tabs list (real markets → countdown UI shape MatkaTabsList expects).
  const marketTabs = markets.map((m) => ({
    id: String(m.mid),
    name: m.mname,
    remaining: m.ptime,
    time: m.mtime,
  }));

  const activeMarket = markets.find((m) => String(m.mid) === String(activeMarketId));

  // 1-click bet: coin selected + option click → place immediately.
  async function handleBetSelect({ label, tab }) {
    if (placing) return;
    if (!selectedCoin) { toast.error("Please select a coin amount first"); return; }
    if (!activeMarket) { toast.error("No live market available"); return; }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = (user?.user_id || user?.id || "").toString();
    if (!userId) { toast.error("Login required"); return; }

    const selection = composeSelection(tab, label);
    const odds = WORLI3_ODDS[tab] || 9.5;
    const payload = {
      userId,
      player_name: selection,
      gameId: String(activeMarket.mid),
      gameName: "worli3",
      gtype: "worli3",
      amount: selectedCoin,
      odds,
      selection,
      roundId: activeMarket.mid,
      mtype: "fancy",
      type: "back",
    };

    setPlacing(true);
    try {
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        // reset the selected coin/stake after a successful bet
        setSelectedCoin(0);
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
        // refresh My Bets + per-market exposure immediately
        fetchMyBets?.();
        fetchExposure?.();
        // refresh header net-exposure/balance (now + after the 1s net-exposure
        // worker sync, so the header total reflects ALL placed bets)
        refreshAll?.(userId);
        setTimeout(() => refreshAll?.(userId), 1500);
      } else {
        toast.error(res?.error || res?.msg || "Bet could not be placed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || "Bet placing error");
    } finally {
      setPlacing(false);
    }
  }

  function handleCoinSelect(val) { setSelectedCoin(val); }
  function handleReset() { setSelectedCoin(0); }

  // Board is suspended only when the selected market's betting window has
  // expired (ptime hits 0 at draw time). NOTE: mtype OPEN/CLOSED identifies the
  // matka draw (e.g. "Diamond Open" vs "Diamond Close") — a "CLOSED" market is a
  // normal bettable Close draw, NOT a suspended one — so it must NOT gate betting;
  // both legs stay bettable until their own ptime expires.
  const selectedMarket =
    markets.find((m) => String(m.mid) === String(activeMarketId)) || markets[0];
  const ptimeExpired = (() => {
    const p = selectedMarket?.ptime;
    if (!p) return false;
    const [h = 0, m = 0, s = 0] = String(p).split(":").map(Number);
    return h * 3600 + m * 60 + s <= 0;
  })();
  const suspended =
    markets.length > 0
      ? !selectedMarket || ptimeExpired
      : false;

  return (
    <Layout variant="casino-page" rightSidebar={<CasinoRightSidebar bets={myBets} />}>
      <div className="casino-page-container worli matka">
        <CasinoHeader name="Matka Market" gameId={GAME_ID} />

        <MatkaTabsList
          activeTab={activeMarketId}
          onTabChange={setActiveMarketId}
          markets={marketTabs}
        />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox src={iframeSrc} gameName="Matka Market" />

          {markets.length > 0 ? (
            <div className="casino-detail">
              <div className="casino-table">
                <MatkaCoins
                  selectedCoin={selectedCoin}
                  onCoinSelect={handleCoinSelect}
                  onReset={handleReset}
                />

                <WorliTabs
                  activeTab={activeGameTab}
                  onTabChange={setActiveGameTab}
                  onBetSelect={handleBetSelect}
                  selectedBets={[]}
                  suspended={suspended}
                  gameData={gameData}
                />
              </div>

              <Worli3LastResults results={lastResults} gameId={GAME_ID} />
            </div>
          ) : (
            <div className="casino-detail">
              <div className="text-center p-4">No live Matka market right now.</div>
            </div>
          )}
        </div>

        {mobilePanelTab === "bets" && (
          <div className="d-xl-none">
            <BetTable title="My Bet" bets={myBets} />
          </div>
        )}

        <CasinoHiddenBetTable />
      </div>
    </Layout>
  );
}
