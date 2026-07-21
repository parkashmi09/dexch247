import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import SuperOverBalls from "../../../components/casino/tables/superover3/SuperOverBalls.jsx";
import SuperOverScorecard from "../../../components/casino/tables/superover3/SuperOverScorecard.jsx";
import SuperOverMarkets from "../../../components/casino/tables/superover3/SuperOverMarkets.jsx";
import { getCasinoGameDetails, getLastResults, placeCasinoBet, getMatchExposure } from "../../../apiservices/CasionApi.js";
import { CASINO_STREAM_URL } from "../../../config.js";
import { fetchBalanceThunk } from "../../../features/user/userSlice.js";
import toast from "react-hot-toast";
import { runBetBuffer } from "../../../hooks/useCasinoBetBuffer.js";

const GAME_TYPE = "superover3";

function formatSuperOverResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "I" : win === "2" ? "A" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

export default function SuperOver3Page() {
  const dispatch = useDispatch();

  // SuperOver API returns t1/t2 structure
  const [t1, setT1] = useState({});
  const [t2, setT2] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCasinoGameDetails(GAME_TYPE);
        const raw = res?.data?.data || res?.data || {};
        const newT1 = raw?.t1?.[0] || raw?.t1 || {};
        const newT2 = Array.isArray(raw?.t2) ? raw.t2 : [];
        setT1(newT1);
        setT2(newT2);
        setLoading(false);
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 500);
    return () => clearInterval(iv);
  }, []);

  const [lastResults, setLastResults] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLastResults(GAME_TYPE);
        const d = res?.data?.data || res?.data || {};
        const results = (d.res || []).slice(0, 10).map(formatSuperOverResult);
        setLastResults(results);
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 4000);
    return () => clearInterval(iv);
  }, []);

  const gmid = t1?.gmid ?? t1?.mid ?? "";
  const lt = t1?.lt ?? 0;
  const card = t1?.card ?? "";
  const scard = t1?.scard ?? "";

  const [timer, setTimer] = useState(0);
  useEffect(() => { setTimer(Number(lt) || 0); }, [lt]);
  useEffect(() => {
    const tick = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(tick);
  }, []);

  // Exposure polling
  const [exposures, setExposures] = useState({});
  useEffect(() => {
    if (!gmid) return;
    const fetchExp = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user?.user_id || user?.id;
        if (!userId) return;
        const res = await getMatchExposure(userId, gmid);
        if (res?.success && res?.data) {
          const map = {};
          res.data.forEach((e) => {
            const name = e.team_name || "";
            const exp = parseFloat(e.exposure_amount) || 0;
            if (name && exp !== 0) { map[name] = exp; map[name.toLowerCase()] = exp; }
          });
          setExposures(map);
        }
      } catch { /* ignore */ }
    };
    fetchExp();
    const iv = setInterval(fetchExp, 2000);
    return () => clearInterval(iv);
  }, [gmid]);

  // Extract team names
  const bookmakerMarket = t2.find((m) => m.dtype === 2 || m.gtype === "match1");
  const sections = bookmakerMarket?.section || [];
  const team1 = sections[0]?.nat || "IND";
  const team2 = sections[1]?.nat || "AUS";

  // Bet state
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [betValue, setBetValue] = useState("");
  const [betType, setBetType] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [myBets, setMyBets] = useState([]);
  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });

  const handleBetClick = useCallback((value, selection, item, type) => {
    if (!value) return;
    setBetValue(value);
    setBetType(type);
    setSelectedSelection(item?.nat || selection);
    setSelectedBetData(item);
    setShowPlaceBet(true);
    setStakeAmount("");
  }, []);

  const closeBetPanel = useCallback(() => setShowPlaceBet(false), []);

  const handlePlaceBet = useCallback(async () => {
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) { toast.error("Enter a valid stake"); return; }
    if (!selectedBetData) return;

    const gs = (selectedBetData.gstatus || "").toUpperCase();
    if (gs === "SUSPENDED" || gs === "BALL RUNNING" || selectedBetData.gstatus === "0") {
      toast.error("Bet Not Confirm Reason Game Suspended.");
      return;
    }

    setPlacing(true);
    try {
      const { ok, latestOdds, reason } = await runBetBuffer(GAME_TYPE, selectedBetData, parseFloat(betValue) || 0, betType);
      if (!ok) { toast.error(reason); setPlacing(false); return; }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = (user?.user_id || user?.id || "").toString();
      const payload = {
        userId,
        player_name: selectedBetData.nat || selectedSelection,
        gameId: gmid?.toString() || "",
        gameName: GAME_TYPE,
        gtype: GAME_TYPE,
        amount,
        odds: latestOdds,
        selection: selectedBetData.nat || selectedSelection,
        roundId: gmid || 0,
        mtype: selectedBetData._marketName === "Bookmaker" ? "match" : "fancy",
        type: betType,
      };
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        setShowPlaceBet(false);
        setStakeAmount("");
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
      } else {
        toast.error(res?.error || res?.msg || "Failed");
      }
    } catch { toast.error("Error placing bet"); }
    finally { setPlacing(false); }
  }, [stakeAmount, selectedBetData, betValue, betType, gmid, selectedSelection, dispatch]);

  const iframeSrc = `${CASINO_STREAM_URL}?id=${GAME_TYPE}`;

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar
          bets={myBets}
          showPlaceBet={showPlaceBet}
          betValue={betValue}
          betType={betType}
          selection={selectedSelection}
          min={selectedBetData?.min}
          max={selectedBetData?.max}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          placing={placing}
          onClosePlaceBet={closeBetPanel}
          onSubmitBet={handlePlaceBet}
        />
      }
    >
      <div className="casino-page-container super-over">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Mini SuperOver" gameId={GAME_TYPE} roundId={gmid} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={gmid}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          {/* Scorecard */}
          <SuperOverScorecard team1={team1} team2={team2} cardString={card} scard={scard} />

          {/* Video + Balls */}
          <div className="casino-video">
            <div className="video-box-container">
              <div className="casino-video-box">
                {iframeSrc && <iframe src={iframeSrc} title="Mini SuperOver" allowFullScreen allow="autoplay" />}
              </div>
            </div>
            <div className="casino-video-cards">
              <SuperOverBalls cardString={card} />
            </div>
            <FlipClock value={timer} />
          </div>

          {/* Markets */}
          <div className="casino-detail detail-page-container position-relative">
            <SuperOverMarkets
              markets={t2}
              onBet={handleBetClick}
              exposures={exposures}
            />

            <div className="casino-last-result-title">
              <span>Last Result</span>
              <span><a href={`/casino-results/${GAME_TYPE}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.map((r, i) => (
                <span key={i} className={`result ${r.type || ""}`} style={{ cursor: "pointer" }}
                  onClick={() => setResultModal({ show: true, mid: r.mid || "" })}>{r.label}</span>
              ))}
            </div>
          </div>
        </div>

        {mobilePanelTab === "bets" && <CasinoMobileBetTable bets={myBets} />}

        <PlaceBetMobile
          show={showPlaceBet}
          betValue={betValue}
          betType={betType}
          selection={selectedSelection}
          min={selectedBetData?.min}
          max={selectedBetData?.max}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          placing={placing}
          onClose={closeBetPanel}
          onSubmit={handlePlaceBet}
        />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_TYPE}
        gameType="superover3"
        mid={resultModal.mid}
        title="Mini SuperOver Result"
      />
    </Layout>
  );
}
