import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout/Layout.jsx";
import { CasinoMobileTabs, CasinoHiddenBetTable, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import BetTable from "../../../components/casino/common/BetTable.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableOurRoulette from "../../../components/casino/tables/ourroullete/BetTableOurRoulette.jsx";
import RatesTable from "../../../components/casino/tables/ourroullete/RatesTable.jsx";
import { getCasinoGameDetails, getLastResults, placeCasinoBet, getMyBets, undoCasinoBet } from "../../../apiservices/CasionApi.js";
import { CASINO_STREAM_URL } from "../../../config.js";
import { fetchBalanceThunk } from "../../../features/user/userSlice.js";
import toast from "react-hot-toast";

const GAME_TYPE = "ourroullete";
const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

const CHIPS = [
  { amount: 25, color: "#00ddff" },
  { amount: 50, color: "#00ddff" },
  { amount: 100, color: "#00ddff" },
  { amount: 200, color: "#99cc00" },
  { amount: 500, color: "#99cc00" },
  { amount: 1000, label: "1K", color: "#aa66cc" },
];

function formatRange(val) {
  const num = parseFloat(val) || 0;
  if (num >= 100000) return (num / 100000).toFixed(0) + "L";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toFixed(0);
}

function resultColor(num) {
  if (num === 0) return "green";
  return RED.has(num) ? "red" : "black";
}

export default function OurRoulettePage() {
  const dispatch = useDispatch();

  const [gameData, setGameData] = useState(null);
  const [sub2, setSub2] = useState({});
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCasinoGameDetails(GAME_TYPE);
        const d = res?.data?.data || res?.data || {};
        setGameData(d);
        if (d.sub2) setSub2(d.sub2);
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
        setLastResults(d.res || []);
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 1000);
    return () => clearInterval(iv);
  }, []);

  const mid = gameData?.mid ?? "";
  const lt = gameData?.lt ?? 0;
  const minBet = gameData?.min ?? "25";
  const maxBet = gameData?.max ?? "100000";

  const [timer, setTimer] = useState(0);
  useEffect(() => { setTimer(Number(lt) || 0); }, [lt]);
  useEffect(() => {
    const tick = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(tick);
  }, []);

  const prevLatestMidRef = useRef(null);
  const [latestWinNumber, setLatestWinNumber] = useState(-1);
  useEffect(() => {
    if (!lastResults.length) return;
    const newest = lastResults[0];
    if (newest?.mid && newest.mid !== prevLatestMidRef.current) {
      prevLatestMidRef.current = newest.mid;
      const num = parseInt(newest.win || "0", 10);
      if (num >= 0 && num <= 36) setLatestWinNumber(num);
    }
  }, [lastResults]);

  const prevLtRef = useRef(0);
  useEffect(() => {
    if (lt > 0 && prevLtRef.current <= 0) setLatestWinNumber(-1);
    prevLtRef.current = lt;
  }, [lt]);

  const subMap = useMemo(() => {
    const map = {};
    (gameData?.sub || []).forEach((item) => { map[item.i] = item; });
    return map;
  }, [gameData?.sub]);

  // No chip is selected on load, and the board will not take a bet until the
  // player picks one. This used to default to 25 — the table minimum — which
  // meant the very first click on the board placed a real 25 bet at a stake the
  // player had never chosen, with no confirmation step and an "Undo Bet" button
  // that cannot actually undo it. The chip IS the stake on this game (there is no
  // stake box, unlike the card tables), so it has to be an explicit choice.
  // Persists across rounds once picked — only the initial choice is required.
  const [selectedChip, setSelectedChip] = useState(null);
  const [placedBets, setPlacedBets] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [myBets, setMyBets] = useState([]);
  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { if (mid) setPlacedBets([]); }, [mid]);

  // Poll the user's bets for the current round so the "My Bet" panel renders,
  // mirroring what useCasinoGame does for the standard casino pages.
  const fetchMyBets = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.id;
      if (!userId || !mid) return;
      const res = await getMyBets(userId, mid);
      if (res?.success && res?.bets) {
        setMyBets(res.bets
          // An undone bet stays in the table as result_status 'void' for the
          // audit trail, but it must not linger in the player's My Bet list —
          // "undo" that leaves the bet on screen reads as though it failed.
          .filter((bet) => String(bet.result_status || "").toLowerCase() !== "void")
          .map((bet) => ({
            matchedBet: bet.player_name || bet.selection || bet.nat || "",
            odds: bet.odds || bet.urate || "0",
            stake: bet.stake || bet.amt || "0",
            type: (bet.type || bet.btype || "back").toLowerCase(),
            status: String(bet.status || "").toLowerCase(),
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

  const handleBoardClick = useCallback(async (id) => {
    if (lt <= 0 || placing) return;
    // Tell the player why nothing happened — a silent no-op reads as a broken board.
    if (!selectedChip) { toast.error("Select a chip to set your stake"); return; }
    const item = subMap[id];
    if (!item) return;
    // Spot out of play (its numbers are already drawn): `s` is 0 and `b` is 0.
    // The board no longer offers these, but the feed polls every 500ms so a spot
    // can close between render and click — without this the request goes out with
    // odds 0 and the server 400s, surfacing as "Error placing bet".
    if (Number(item.s) !== 1 || !(Number(item.b) > 0)) {
      toast.error("This bet is no longer available");
      return;
    }

    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = (user?.user_id || user?.id || "").toString();
      if (!userId) { toast.error("Please login"); return; }
      const payload = {
        userId, player_name: item.n || String(id), gameId: mid?.toString() || "",
        gameName: GAME_TYPE, gtype: GAME_TYPE, mtype: "match",
        amount: selectedChip, odds: parseFloat(item.b) || 0,
        selection: item.n || String(id), roundId: mid || 0, type: "back",
      };
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        setPlacedBets((prev) => [...prev, { id, amount: selectedChip }]);
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
      } else {
        toast.error(res?.error || res?.msg || "Failed");
      }
    } catch { toast.error("Error placing bet"); }
    finally { setPlacing(false); }
  }, [selectedChip, lt, placing, subMap, mid, dispatch]);

  // Real undo: reverse the LAST open bet on this round server-side (refund the
  // stake, back out its exposure, close it as void). This used to only pop a
  // local array, which did nothing at all — the bet was already placed and the
  // money already locked, so the button silently lied.
  //
  // The server refuses once betting closes for the round, which is what keeps
  // this from being an exploit — see CasinoService.undoLastBet.
  const [undoing, setUndoing] = useState(false);
  const handleUndo = useCallback(async () => {
    if (undoing || !mid) return;
    setUndoing(true);
    try {
      const res = await undoCasinoBet(GAME_TYPE, mid);
      if (res?.success) {
        toast.success("Bet undone");
        setPlacedBets((prev) => prev.slice(0, -1));
        await fetchMyBets();
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
      } else {
        toast.error(res?.error || "Could not undo the bet");
      }
    } finally {
      setUndoing(false);
    }
  }, [undoing, mid, fetchMyBets, dispatch]);

  // Server truth, not the local array — so Undo still works after a refresh and
  // greys out once there is genuinely nothing left to take back.
  const hasBets = myBets.some((b) => b.status === "open");
  const loading = !gameData;

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <div className="sidebar right-sidebar casino-right-sidebar">
          <BetTable bets={myBets} />
          <RatesTable sub2={sub2} />
        </div>
      }
    >
      <div className="casino-page-container roulette">
        {loading && <CasinoLoader />}

        <div className="casino-header">
          <span className="casino-name">
            Unique Roulette
            <a className="ms-1" style={{ cursor: "pointer" }} onClick={() => setShowRules(true)}><small>Rules</small></a>
          </span>
          <span className="casino-rid d-none d-xl-inline-block">
            <small>Round ID: <span>{mid}</span></small>
            <small className="ms-2"><span>Range: {formatRange(minBet)} to {formatRange(maxBet)}</span></small>
          </span>
          <span className="casino-rid d-xl-none">
            <small className="ms-2"><span>Range: {formatRange(minBet)} to {formatRange(maxBet)}</span></small>
          </span>
        </div>

        <CasinoMobileTabs activeTab={mobilePanelTab} onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length} roundId={mid} />

        <div className={`position-relative${mobilePanelTab === "bets" ? " d-none d-xl-block" : ""}`}>
          <div className={`casino-video${lt <= 0 ? " full" : ""}`}>
            <div className="video-box-container">
              <div className="casino-video-box">
                <iframe src={`${CASINO_STREAM_URL}?id=${GAME_TYPE}`} title="Unique Roulette" allowFullScreen allow="autoplay" />
              </div>
            </div>
            {lt <= 0 && latestWinNumber >= 0 && (
              <div className="casino-video-cards">
                <div>
                  <div className="flip-card-container">
                    <div className="flip-card">
                      <div className="flip-card-inner">
                        <div className="flip-card-front">
                          <img src={`/assets/casino/roulette-cards/${String(latestWinNumber).padStart(2, "0")}.png`} alt={latestWinNumber} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <FlipClock value={timer} />

            {/* Coins - only Undo button, hidden when lt<=0 */}
            {lt > 0 && <div className="casino-coins-container">
              <div className="casino-coin-box">
                {CHIPS.map((chip) => (
                  <div key={chip.amount} className={`casino-coin${selectedChip === chip.amount ? " active" : ""}`}
                    onClick={() => setSelectedChip(chip.amount)}>
                    <div className="bet-chip-holder" style={{ "--g-chip-inner-color": chip.color }}>
                      <div className="bet-chip">
                        <div className="bet-chip-front" />
                        <div className="bet-chip-top" />
                        <div className="bet-chip-amount">
                          <svg className="bet-chip-amount-in" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 108 108">
                            <text className="bet-chip-amount-label" x="50%" y="53.5%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="700">
                              {chip.label || chip.amount}
                            </text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="coin-btns">
                <div>
                  <button className="btn btn-danger" disabled={!hasBets || undoing} onClick={handleUndo}>
                    <i className="fas fa-undo" /><span className="d-none d-md-flex">{undoing ? "Undoing…" : "Undo Bet"}</span>
                  </button>
                  <span className="d-md-none">Undo Bet</span>
                </div>
              </div>
            </div>}
          </div>

          <div className="casino-detail">
            <div className="casino-table">
              {/* myBets drives the chips shown on the board — server truth, so
                  they survive a refresh and clear themselves after an undo. */}
              <BetTableOurRoulette gameData={gameData} onBet={handleBoardClick} latestWinNumber={latestWinNumber} myBets={myBets} />
            </div>

            <div className="casino-last-result-title">
              <span>Last Result</span><span><a href={`/casino-results/${GAME_TYPE}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.slice(0, 9).map((r, i) => {
                const num = parseInt(r.win || "0", 10);
                const padded = String(r.win || "0").padStart(2, "0");
                return (
                  <span key={i} className={`result ${resultColor(num)}`} style={{ cursor: "pointer" }}
                    onClick={() => setResultModal({ show: true, mid: r.mid || "" })}>{padded}</span>
                );
              })}
              <a href={`/casino-results/${GAME_TYPE}`}><span className="result">...</span></a>
            </div>

            {/* Mobile rates table */}
            <RatesTable sub2={sub2} className="mt-2 d-xl-none" />
          </div>
        </div>

        {mobilePanelTab === "bets" && <CasinoMobileBetTable bets={myBets} />}
        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal show={resultModal.show} onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_TYPE} gameType="roulette12" mid={resultModal.mid} title="Unique Roulette Result" />
    </Layout>
  );
}
