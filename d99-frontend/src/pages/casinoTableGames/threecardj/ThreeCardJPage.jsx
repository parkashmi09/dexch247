import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import {
  CasinoHeader,
  CasinoMobileTabs,
  CasinoHiddenBetTable,
  CasinoRightSidebar,
  CasinoLoader,
  CasinoResultModal,
  CasinoMobileBetTable,
} from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableThreeCardJ from "../../../components/casino/tables/threecardj/BetTableThreeCardJ.jsx";
import ThreeCardJVideoCards from "../../../components/casino/tables/threecardj/ThreeCardJVideoCards.jsx";
import {
  getCasinoGameDetails,
  getLastResults,
  placeCasinoBet,
  getMatchExposure,
  getMyBets,
} from "../../../apiservices/CasionApi.js";
import { CASINO_STREAM_URL } from "../../../config.js";
import { fetchBalanceThunk } from "../../../features/user/userSlice.js";
import toast from "react-hot-toast";

const GAME_ID = "3cardj";
const GAME_NAME = "3 Cards Judgement";

// Display helper: turn a numeric pick ("Yes 1,11,12,13") into card faces
// ("Yes AJQK") — 1→A, 11→J, 12→Q, 13→K, 2–10 stay as-is. Used only for display;
// the payload's `selection` keeps the numeric/comma form the server settles on.
function toFaceLabel(sel) {
  const m = String(sel || "").match(/^(\S+)\s*(.*)$/);
  if (!m) return sel;
  const nums = (m[2].match(/\d+/g) || []).map((n) => {
    const x = parseInt(n, 10);
    return x === 1 ? "A" : x === 11 ? "J" : x === 12 ? "Q" : x === 13 ? "K" : String(x);
  });
  return nums.length ? `${m[1]} ${nums.join("")}` : String(sel || "");
}

function formatResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

export default function ThreeCardJPage() {
  const dispatch = useDispatch();

  const [gameData, setGameData] = useState(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCasinoGameDetails(GAME_ID);
        setGameData(res);
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
        const res = await getLastResults(GAME_ID);
        const d = res?.data?.data || res?.data || {};
        setLastResults((d.res || []).slice(0, 10).map(formatResult));
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 4000);
    return () => clearInterval(iv);
  }, []);

  const raw = useMemo(() => gameData?.data?.data || gameData?.data || {}, [gameData]);
  const mid = raw?.mid ?? "";
  const lt = raw?.lt ?? 0;
  const card = raw?.card ?? "";
  const sub = raw?.sub || [];

  const [timer, setTimer] = useState(0);
  useEffect(() => { setTimer(Number(lt) || 0); }, [lt]);
  useEffect(() => {
    const tick = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(tick);
  }, []);

  // Exposure
  const [exposures, setExposures] = useState({});
  useEffect(() => {
    if (!mid) return;
    const fetchExp = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user?.user_id || user?.id;
        if (!userId) return;
        const res = await getMatchExposure(userId, mid);
        if (res?.success && res?.data) {
          const map = {};
          res.data.forEach((e) => {
            const n = e.team_name || "";
            const exp = parseFloat(e.exposure_amount) || 0;
            if (n && exp !== 0) { map[n] = exp; }
          });
          setExposures(map);
        }
      } catch { /* ignore */ }
    };
    fetchExp();
    const iv = setInterval(fetchExp, 2000);
    return () => clearInterval(iv);
  }, [mid]);

  // Bet state
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [betValue, setBetValue] = useState("");
  const [betType, setBetType] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [myBets, setMyBets] = useState([]);
  const fetchMyBets = useCallback(async () => {
    if (!mid) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.id;
      if (!userId) return;
      const response = await getMyBets(userId, mid);
      if (response?.success && response?.bets) {
        setMyBets(response.bets.map((bet) => ({
          matchedBet: bet.player_name || bet.selection || bet.nat || "",
          nat: bet.nat || bet.player_name || bet.selection || "",
          odds: bet.odds || bet.urate || "0",
          stake: bet.stake || bet.amt || "0",
          type: (bet.type || bet.btype || "").toLowerCase() || null,
          selection: bet.selection || bet.player_name || "",
          exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0,
        })));
      }
    } catch { /* ignore */ }
  }, [mid]);
  useEffect(() => {
    if (!mid) return;
    fetchMyBets();
    const iv = setInterval(fetchMyBets, 2000);
    return () => clearInterval(iv);
  }, [mid, fetchMyBets]);
  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });

  const handleBetClick = useCallback((value, selection, item, type) => {
    if (!value) return;
    setBetValue(value);
    setBetType(type);
    // `selection` carries the composed pick with the chosen cards (e.g. "Yes 347");
    // prefer it over the plain "Yes"/"No" feed nat so the cards show in the slip + My Bets.
    setSelectedSelection(selection || item?.nat);
    setSelectedBetData(item);
    setShowPlaceBet(true);
    setStakeAmount("");
  }, []);

  const closeBetPanel = useCallback(() => setShowPlaceBet(false), []);

  const handlePlaceBet = useCallback(async () => {
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) { toast.error("Enter a valid stake"); return; }
    if (!selectedBetData) return;
    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = (user?.user_id || user?.id || "").toString();
      const payload = {
        userId,
        // selection keeps the comma-separated card numbers ("Yes 4,5,8") so the
        // server can parse them unambiguously (incl. 10–13); player_name shows the
        // card faces for a compact My Bets display ("Yes 458", "Yes JQK").
        player_name: toFaceLabel(selectedSelection || selectedBetData.nat),
        gameId: mid?.toString() || "",
        gameName: GAME_ID,
        gtype: GAME_ID,
        amount,
        odds: parseFloat(betValue) || 0,
        selection: selectedSelection || selectedBetData.nat,
        roundId: mid || 0,
        mtype: "fancy",
        type: betType,
      };
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        setShowPlaceBet(false);
        setStakeAmount("");
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
        fetchMyBets();
      } else {
        toast.error(res?.error || res?.msg || "Failed");
      }
    } catch {
      toast.error("Error placing bet");
    } finally {
      setPlacing(false);
    }
  }, [stakeAmount, selectedBetData, betValue, betType, mid, selectedSelection, dispatch, fetchMyBets]);

  const loading = !gameData;
  const iframeSrc = `${CASINO_STREAM_URL}?id=${GAME_ID}`;

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar
          bets={myBets}
          showPlaceBet={showPlaceBet}
          betValue={betValue}
          betType={betType}
          selection={toFaceLabel(selectedSelection)}
          min={selectedBetData?.min}
          max={selectedBetData?.max}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          placing={placing}
          onClosePlaceBet={closeBetPanel}
          onSubmitBet={handlePlaceBet}
          gameType={GAME_ID}
        />
      }
    >
      <div className="casino-page-container threecardj">
        {loading && <CasinoLoader />}

        <CasinoHeader name={GAME_NAME} gameId={GAME_ID} roundId={mid} hideRules />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={mid}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <div className="casino-video">
            <div className="video-box-container">
              <div className="casino-video-box">
                {iframeSrc && (
                  <iframe src={iframeSrc} title={GAME_NAME} allowFullScreen allow="autoplay" />
                )}
              </div>
            </div>
            <ThreeCardJVideoCards cardString={card} />
            <FlipClock value={timer} />
          </div>

          {sub.length > 0 && (
            <div className="casino-detail">
              <BetTableThreeCardJ
                gameData={gameData}
                onBetClick={handleBetClick}
                exposures={exposures}
                showPlaceBet={showPlaceBet}
              />

              <div className="casino-last-result-title">
                <span>Last Result</span>
                <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
              </div>
              <div className="casino-last-results">
                {lastResults.map((r, i) => (
                  <span
                    key={i}
                    className={`result ${r.type || ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setResultModal({ show: true, mid: r.mid || "" })}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {mobilePanelTab === "bets" && <CasinoMobileBetTable bets={myBets} />}

        <PlaceBetMobile
          show={showPlaceBet}
          betValue={betValue}
          betType={betType}
          selection={toFaceLabel(selectedSelection)}
          min={selectedBetData?.min}
          max={selectedBetData?.max}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          placing={placing}
          onClose={closeBetPanel}
          onSubmit={handlePlaceBet}
          gameType={GAME_ID}
        />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType={GAME_ID}
        mid={resultModal.mid}
        title={`${GAME_NAME} Result`}
      />
    </Layout>
  );
}
