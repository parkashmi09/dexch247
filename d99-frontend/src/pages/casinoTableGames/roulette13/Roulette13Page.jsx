import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../components/layout/Layout.jsx";
import { CasinoMobileTabs, CasinoHiddenBetTable, CasinoLoader, CasinoMobileBetTable, CasinoResultModal, CasinoRulesModal } from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableRoulette12 from "../../../components/casino/tables/roulette12/BetTableRoulette12.jsx";
import { getCasinoGameDetails, getLastResults, placeCasinoBet } from "../../../apiservices/CasionApi.js";
import { CASINO_STREAM_URL } from "../../../config.js";
import { fetchBalanceThunk } from "../../../features/user/userSlice.js";
import toast from "react-hot-toast";

const GAME_TYPE = "roulette13";

const CHIPS = [
  { amount: 25, color: "#00ddff" },
  { amount: 50, color: "#00ddff" },
  { amount: 100, color: "#00ddff" },
  { amount: 200, color: "#99cc00" },
  { amount: 500, color: "#99cc00" },
  { amount: 1000, label: "1K", color: "#aa66cc" },
];

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

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

export default function Roulette13Page() {
  const dispatch = useDispatch();

  const [gameData, setGameData] = useState(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCasinoGameDetails(GAME_TYPE);
        setGameData(res?.data?.data || res?.data || {});
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 500);
    return () => clearInterval(iv);
  }, []);

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

  const [selectedChip, setSelectedChip] = useState(25);
  const [placedBets, setPlacedBets] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [myBets, setMyBets] = useState([]);
  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { if (mid) setPlacedBets([]); }, [mid]);

  const handleBoardClick = useCallback(async (id) => {
    if (!selectedChip || lt <= 0 || placing) return;
    const item = subMap[id];
    if (!item) return;

    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = (user?.user_id || user?.id || "").toString();
      if (!userId) { toast.error("Please login to place bets"); return; }
      const payload = {
        userId,
        player_name: item.n || String(id),
        gameId: mid?.toString() || "",
        gameName: GAME_TYPE,
        gtype: GAME_TYPE,
        mtype: "match",
        amount: selectedChip,
        odds: parseFloat(item.b) || 0,
        selection: item.n || String(id),
        roundId: mid || 0,
        type: "back",
      };
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        setPlacedBets((prev) => [...prev, { id, amount: selectedChip }]);
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
  }, [selectedChip, lt, placing, subMap, mid, dispatch]);

  const handleUndo = useCallback(() => setPlacedBets((prev) => prev.slice(0, -1)), []);
  const handleClear = useCallback(() => setPlacedBets([]), []);
  const hasBets = placedBets.length > 0;

  const loading = !gameData;
  const iframeSrc = `${CASINO_STREAM_URL}?id=${GAME_TYPE}`;

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
          <div className="sidebar-box my-bet-container">
            <div className="sidebar-title"><h4>My Bet</h4></div>
            <div className="my-bets">
              <div className="table-responsive">
                <table className="table">
                  <thead><tr><th>Matched Bet</th><th className="text-end">Odds</th><th className="text-end">Stake</th></tr></thead>
                  <tbody>
                    {myBets.map((bet, i) => (
                      <tr key={i}>
                        <td>{bet.matchedBet}</td>
                        <td className="text-end">{bet.odds}</td>
                        <td className="text-end">{bet.stake}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="casino-page-container roulette roulette11 roulette13">
        {loading && <CasinoLoader />}

        <div className="casino-header">
          <span className="casino-name">
            Roulette
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
                {iframeSrc && <iframe src={iframeSrc} title="Roulette" allowFullScreen allow="autoplay" />}
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

            {/* Coins container inside casino-video - only when round open */}
            {lt > 0 && <div className="casino-coins-container">
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
                  <button className="btn btn-danger" disabled={!hasBets} onClick={handleUndo}>
                    <i className="fas fa-undo" /><span className="d-none d-md-flex">Undo Bet</span>
                  </button>
                  <span className="d-md-none">Undo Bet</span>
                </div>
                <div>
                  <button className="btn btn-info">
                    <i className="fas fa-redo" /><span className="d-none d-md-flex">Repeat</span>
                  </button>
                  <span className="d-md-none">Repeat</span>
                </div>
                <div>
                  <button className="btn btn-warning" disabled={!hasBets} onClick={handleClear}>
                    <i className="fas fa-trash" /><span className="d-none d-md-flex">Clear</span>
                  </button>
                  <span className="d-md-none">Clear</span>
                </div>
              </div>
            </div>}
          </div>

          <div className="casino-detail">
            <div className="casino-table">
              {/* No Back/Lay toggle for roulette13 - only Statistics link */}
              <div className="transfer-board">
                <h5 className="d-block d-lg-none"><a href={`/casino/${GAME_TYPE}`}>Statistics</a></h5>
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
        title="Roulette Result"
      />

      <CasinoRulesModal
        show={showRules}
        onHide={() => setShowRules(false)}
        title="Roulette"
        gameType="roulette12"
      />
    </Layout>
  );
}
