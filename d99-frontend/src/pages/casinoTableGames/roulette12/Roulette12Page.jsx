import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout/Layout.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoLoader, CasinoMobileBetTable, CasinoResultModal, CasinoRulesModal } from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableRoulette12 from "../../../components/casino/tables/roulette12/BetTableRoulette12.jsx";
import BetTable from "../../../components/casino/common/BetTable.jsx";
import { getCasinoGameDetails, getLastResults, placeCasinoBet, getMyBets, undoCasinoBet } from "../../../apiservices/CasionApi.js";
import { CASINO_STREAM_URL } from "../../../config.js";
import { fetchBalanceThunk } from "../../../features/user/userSlice.js";
import toast from "react-hot-toast";

const GAME_TYPE = "roulette12";

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const CHIPS = [
  { amount: 25, color: "#138cf5" },
  { amount: 50, color: "#138cf5" },
  { amount: 100, color: "#138cf5" },
  { amount: 200, color: "#00d700" },
  { amount: 500, color: "#00d700" },
  { amount: 1000, label: "1K", color: "#9541f9" },
];

function formatRange(val) {
  const num = parseFloat(val) || 0;
  if (num >= 10000000) return (num / 10000000).toFixed(0) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(0) + "L";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toFixed(0);
}

function resultColor(num) {
  if (num === 0) return "green";
  return RED.has(num) ? "red" : "black";
}

export default function Roulette12Page() {
  const dispatch = useDispatch();

  // ── Game data polling ──
  const [gameData, setGameData] = useState(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCasinoGameDetails(GAME_TYPE);
        const d = res?.data?.data || res?.data || {};
        setGameData(d);
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 500);
    return () => clearInterval(iv);
  }, []);

  // ── Last results + stats polling ──
  const [lastResults, setLastResults] = useState([]);
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLastResults(GAME_TYPE);
        const d = res?.data?.data || res?.data || {};
        setLastResults(d.res || []);
        if (d.g) setStats(d.g);
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

  // ── Timer ──
  const [timer, setTimer] = useState(0);
  useEffect(() => { setTimer(Number(lt) || 0); }, [lt]);
  useEffect(() => {
    const tick = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Win number animation ──
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

  // ── Sub items map ──
  const subMap = useMemo(() => {
    const map = {};
    (gameData?.sub || []).forEach((item) => { map[item.i] = item; });
    return map;
  }, [gameData?.sub]);

  // ── Roulette betting state ──
  const [selectedChip, setSelectedChip] = useState(25);
  const [betMode, setBetMode] = useState("back");
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
          // audit trail, but must not linger in the player's My Bet list.
          .filter((bet) => String(bet.result_status || "").toLowerCase() !== "void")
          .map((bet) => ({
            matchedBet: bet.player_name || bet.selection || bet.nat || "",
            selection: bet.selection || bet.player_name || "",
            odds: bet.odds || bet.urate || "0",
            stake: parseFloat(bet.stake || bet.amt || "0") || 0,
            type: (bet.type || bet.btype || "back").toLowerCase(),
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

  // Snapshot the outgoing round's bets so Repeat has something to replay — the
  // server's My Bet list is scoped to the live mid and is empty once it rolls.
  const lastRoundBetsRef = useRef([]);
  const myBetsRef = useRef([]);
  myBetsRef.current = myBets;
  const prevMidRef = useRef(mid);
  useEffect(() => {
    if (prevMidRef.current && prevMidRef.current !== mid && myBetsRef.current.length) {
      lastRoundBetsRef.current = myBetsRef.current.map((b) => ({
        selection: b.selection || b.matchedBet, stake: b.stake, type: b.type,
      }));
    }
    prevMidRef.current = mid;
  }, [mid]);

  const [repeating, setRepeating] = useState(false);

  const iframeSrc = `${CASINO_STREAM_URL}?id=${GAME_TYPE}`;

  // ── Board click → place bet ──
  const handleBoardClick = useCallback(async (id) => {
    if (!selectedChip || lt <= 0 || placing) return;
    const item = subMap[id];
    if (!item) return;

    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = (user?.user_id || user?.id || "").toString();
      if (!userId) { toast.error("Please login to place bets"); return; }
      const odds = betMode === "lay" ? item.l : item.b;
      const payload = {
        userId,
        player_name: item.n || String(id),
        gameId: mid?.toString() || "",
        gameName: GAME_TYPE,
        gtype: GAME_TYPE,
        mtype: "match",
        amount: selectedChip,
        odds: parseFloat(odds) || 0,
        selection: item.n || String(id),
        roundId: mid || 0,
        type: betMode,
      };
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        setPlacedBets((prev) => [...prev, { id, amount: selectedChip, mode: betMode }]);
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
      } else {
        toast.error(res?.error || res?.msg || "Failed to place bet");
      }
    } catch {
      toast.error("Error placing bet");
    } finally {
      setPlacing(false);
    }
  }, [selectedChip, betMode, lt, placing, subMap, mid, dispatch]);

  // Undo / Clear / Repeat.
  //
  // Bets post to the server the instant a spot is clicked (the chip IS the stake
  // — there is no confirm step), so these three buttons cannot work by touching
  // local state. They used to: Undo/Clear only spliced a `placedBets` array that
  // is not even rendered on this page, and Repeat had no onClick at all. The
  // money was already locked, so all three did nothing.
  //
  // Undo  → reverse the LAST open bet on this round, server-side.
  // Clear → reverse ALL of them, in one transaction.
  // Repeat→ re-place the previous round's bets at the CURRENT prices.
  //
  // The server refuses an undo once betting closes for the round, which is what
  // keeps it from being an exploit — see CasinoService.undoLastBet.
  const [undoing, setUndoing] = useState(false);
  const runUndo = useCallback(async (all) => {
    if (undoing || !mid) return;
    setUndoing(true);
    try {
      const res = await undoCasinoBet(GAME_TYPE, mid, { all });
      if (res?.success) {
        toast.success(all ? "Bets cleared" : "Bet undone");
        setPlacedBets((prev) => (all ? [] : prev.slice(0, -1)));
        await fetchMyBets();
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
      } else {
        toast.error(res?.error || "Could not undo");
      }
    } finally {
      setUndoing(false);
    }
  }, [undoing, mid, fetchMyBets, dispatch]);

  const handleUndo = useCallback(() => runUndo(false), [runUndo]);
  const handleClear = useCallback(() => runUndo(true), [runUndo]);

  // Re-place last round's bets. `lastRoundBets` is snapshotted when the round
  // rolls (below), because the server's My Bet list is scoped to the current mid
  // and the previous round's is gone by then. Prices are taken live, so a repeat
  // books at today's odds, not the ones that expired.
  const handleRepeat = useCallback(async () => {
    if (repeating || !mid || lt <= 0) return;
    const prior = lastRoundBetsRef.current;
    if (!prior.length) { toast.error("No previous bets to repeat"); return; }
    setRepeating(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = (user?.user_id || user?.id || "").toString();
      if (!userId) { toast.error("Please login to place bets"); return; }
      let placed = 0;
      for (const b of prior) {
        const item = Object.values(subMap).find((s) => String(s.n) === String(b.selection));
        const odds = item ? (b.type === "lay" ? item.l : item.b) : 0;
        if (!item || !(parseFloat(odds) > 0)) continue;
        const res = await placeCasinoBet({
          userId, player_name: item.n, gameId: mid?.toString() || "",
          gameName: GAME_TYPE, gtype: GAME_TYPE, mtype: "match",
          amount: b.stake, odds: parseFloat(odds), selection: item.n,
          roundId: mid || 0, type: b.type || "back",
        }).catch(() => null);
        if (res?.success || res?.status === 200) placed++;
      }
      if (placed) {
        toast.success(`Repeated ${placed} bet${placed > 1 ? "s" : ""}`);
        await fetchMyBets();
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchBalanceThunk());
      } else {
        toast.error("Those bets are not available this round");
      }
    } finally {
      setRepeating(false);
    }
  }, [repeating, mid, lt, subMap, fetchMyBets, dispatch]);

  // Server truth, not the local array — so the buttons stay usable after a page
  // refresh and grey out once there is genuinely nothing left to undo.
  const hasBets = myBets.length > 0;

  const loading = !gameData;

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <div className="sidebar right-sidebar casino-right-sidebar">
          <div className="sidebar-box my-bet-container roulette-rules">
            <div className="sidebar-title"><h4>Statistics</h4></div>
            <div>
              {stats && (
                <div className="roulette11-table">
                  <div className="roulette11-table-row">
                    <div className="roulette11-table-cell"><span>1st12:</span><b>{stats.C1st12}%</b></div>
                    <div className="roulette11-table-cell"><span>2nd12:</span><b>{stats.C2nd12}%</b></div>
                    <div className="roulette11-table-cell"><span>3rd12:</span><b>{stats.C3rd12}%</b></div>
                  </div>
                  <div className="roulette11-table-row">
                    <div className="roulette11-table-cell"><span>1-34:</span><b>{stats.R1st}%</b></div>
                    <div className="roulette11-table-cell"><span>2-35</span><b>{stats.R2nd}%</b></div>
                    <div className="roulette11-table-cell"><span>3-36</span><b>{stats.R3rd}%</b></div>
                  </div>
                  <div className="roulette11-table-row">
                    <div className="roulette11-table-cell"><span>Red:</span><b>{stats.Red}%</b></div>
                    <div className="roulette11-table-cell"><span>Black:</span><b>{stats.Blk}%</b></div>
                  </div>
                  <div className="roulette11-table-row">
                    <div className="roulette11-table-cell"><span>Odd:</span><b>{stats.Odd}%</b></div>
                    <div className="roulette11-table-cell"><span>Even:</span><b>{stats.Evn}%</b></div>
                  </div>
                  <div className="roulette11-table-row">
                    <div className="roulette11-table-cell"><span>1to18:</span><b>{stats.T01to18}%</b></div>
                    <div className="roulette11-table-cell"><span>19to36:</span><b>{stats.T19to36}%</b></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <BetTable bets={myBets} />
        </div>
      }
    >
      <div className="casino-page-container roulette roulette11">
        {loading && <CasinoLoader />}

        {/* Custom header with Range */}
        <div className="casino-header">
          <span className="casino-name">
            Beach Roulette
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

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={mid}
        />

        <div className={`position-relative${mobilePanelTab === "bets" ? " d-none d-xl-block" : ""}`}>
          <div className={`casino-video${lt <= 0 ? " full" : ""}`}>
            <div className="video-box-container">
              <div className="casino-video-box">
                {/* Video placeholder - iframe disabled for now */}
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

            {/* Coins container - INSIDE casino-video */}
            <div className="casino-coins-container">
              <div className="casino-coin-box">
                {CHIPS.map((chip) => (
                  <div
                    key={chip.amount}
                    className={`casino-coin${selectedChip === chip.amount ? " active" : ""}`}
                    onClick={() => setSelectedChip(chip.amount)}
                  >
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
                    <i className="fas fa-undo" /><span className="d-none d-md-flex">Undo Bet</span>
                  </button>
                  <span className="d-md-none">Undo Bet</span>
                </div>
                <div>
                  <button className="btn btn-info" disabled={repeating || lt <= 0} onClick={handleRepeat}>
                    <i className="fas fa-redo" /><span className="d-none d-md-flex">Repeat</span>
                  </button>
                  <span className="d-md-none">Repeat</span>
                </div>
                <div>
                  <button className="btn btn-warning" disabled={!hasBets || undoing} onClick={handleClear}>
                    <i className="fas fa-trash" /><span className="d-none d-md-flex">Clear</span>
                  </button>
                  <span className="d-md-none">Clear</span>
                </div>
              </div>
            </div>
          </div>

          <div className="casino-detail">
            <div className="casino-table">
              <div className="transfer-board">
                <div className="switch-board-icon">
                  <div className={`back${betMode === "back" ? " active" : ""}`} onClick={() => setBetMode("back")}>Back</div>
                  <div className={`lay${betMode === "lay" ? " active" : ""}`} onClick={() => setBetMode("lay")}>Lay</div>
                </div>
                <h5 className="d-block d-lg-none"><a href={`/casino-results/${GAME_TYPE}`}>Statistics</a></h5>
              </div>

              <div className="casino-table-box">
                <BetTableRoulette12
                  gameData={gameData}
                  onBet={handleBoardClick}
                  latestWinNumber={latestWinNumber}
                />
              </div>
            </div>

            <div className="casino-last-result-title">
              <span>Last Result</span>
              <span><a href={`/casino-results/${GAME_TYPE}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.slice(0, 10).map((r, i) => {
                const num = parseInt(r.win || "0", 10);
                const padded = String(r.win || "0").padStart(2, "0");
                return (
                  <span key={i} className={`result ${resultColor(num)}`} style={{ cursor: "pointer" }} onClick={() => setResultModal({ show: true, mid: r.mid || "" })}>
                    {padded}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {mobilePanelTab === "bets" && (
          <CasinoMobileBetTable bets={myBets} />
        )}

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_TYPE}
        gameType="roulette12"
        mid={resultModal.mid}
        title="Beach Roulette Result"
      />

      <CasinoRulesModal
        show={showRules}
        onHide={() => setShowRules(false)}
        title="Beach Roulette"
        gameType="roulette12"
      />
    </Layout>
  );
}
