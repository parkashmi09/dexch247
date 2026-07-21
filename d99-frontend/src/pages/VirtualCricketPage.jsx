import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import {
  getTopBarEvents,
  getMatchPrivateData,
  getMatchExposures,
  sportsPlaceBet,
  getSportsScoreCard,
} from "../apiservices/SportsApi.js";
import { SPORTS_STREAM_URL } from "../config.js";
import { fetchBalanceThunk } from "../features/user/userSlice.js";
import { fetchMatchedBetsThunk } from "../features/matchedBets/matchedBetsSlice.js";
import {
  formatStime,
  detectMarketType,
  MARKET_TYPE,
  INITIAL_BET_STATE,
  deriveBetSizes,
} from "../utils/gameDetailsUtils.js";
import MarketSection from "../components/sports/markets/MarketSection.jsx";
import RightSidebar from "../components/sports/RightSidebar.jsx";
import PlaceBetMobile from "../components/sports/PlaceBetMobile.jsx";

// ---------------------------------------------------------------------------
// Virtual Cricket page (cricketv3 layout)
//
// Serves "(e)" / T10 virtual cricket events linked from the home board via
// BetTable's `matchHref` (type "virtual" → /virtual-cricket/:etid/:gmid).
//
// Reuses GameDetails' proven sports data + bet flow (poll getMatchPrivateData,
// RightSidebar "My Bet" + PlaceBetPanel, PlaceBetMobile, MarketSection) but
// renders the casino-style `cricketv3` shell from the reference UI:
//   casino-header → scorecard (iframe) → casino-video → fancy markets.
// etid here doubles as the backend sid (cricket = 4).
// ---------------------------------------------------------------------------

export default function VirtualCricketPage() {
  const { etid, gmid } = useParams();
  const sid = etid; // virtual cricket events live under cricket (sid 4)
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user.user);
  const matchedBets = useSelector((s) => s.matchedBets?.matchedBets ?? []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1200);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const [markets, setMarkets] = useState([]);
  const [matchInfo, setMatchInfo] = useState({ name: "", time: "" });
  const [exposures, setExposures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("odds");
  const [scoreUrl, setScoreUrl] = useState(null);

  // Bet placement state
  const [betState, setBetState] = useState(INITIAL_BET_STATE);
  const [placing, setPlacing] = useState(false);

  const pollRef = useRef(null);

  // Virtual events are always running — stream URL is always available.
  const streamUrl = gmid && SPORTS_STREAM_URL ? `${SPORTS_STREAM_URL}?id=${gmid}` : null;

  // --- Bet click handler (passed down to market components) ---
  const handleBetClick = useCallback(({ market, marketType, runner, betType, odds }) => {
    setBetState({
      open: true,
      market,
      marketType,
      runner,
      betType,
      odds: String(odds),
      originalOdds: String(odds),
      stake: "",
    });
    if (window.innerWidth < 1200) setActiveTab("odds");
  }, []);

  const handleOddsChange = useCallback((val) => {
    setBetState((prev) => ({ ...prev, odds: val }));
  }, []);
  const handleStakeChange = useCallback((val) => {
    setBetState((prev) => ({ ...prev, stake: val }));
  }, []);
  const handleQuickStake = useCallback((val) => {
    setBetState((prev) => ({ ...prev, stake: String((Number(prev.stake) || 0) + val) }));
  }, []);
  const handleClear = useCallback(() => {
    setBetState((prev) => ({ ...prev, stake: "" }));
  }, []);
  const handleReset = useCallback(() => {
    setBetState(INITIAL_BET_STATE);
  }, []);

  // --- Submit bet (mirrors GameDetails' sports bet payload) ---
  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to place a bet.");
      return;
    }

    const { market, runner, betType, odds, stake } = betState;
    const oddsNum = Number(odds);
    const stakeNum = Number(stake);

    if (!stakeNum || stakeNum <= 0) {
      toast.error("Please enter a valid stake amount.");
      return;
    }
    if (oddsNum < 1.01) {
      toast.error("Odds must be at least 1.01.");
      return;
    }

    const min = runner?.min ?? market?.min ?? 0;
    const max = runner?.max ?? market?.max ?? 0;
    if (min && stakeNum < min) {
      toast.error(`Minimum stake is ${min}.`);
      return;
    }
    if (max && stakeNum > max) {
      toast.error(`Maximum stake is ${max}.`);
      return;
    }

    const selectionName = runner?.nat || runner?.name || "";
    const mnLower = (market.mname || "").toLowerCase();
    const gtLower = (market.gtype || "").toLowerCase();
    const isFancyCat =
      mnLower.includes("fancy") ||
      gtLower === "fancy" ||
      gtLower === "fancy1" ||
      gtLower === "oddeven" ||
      gtLower === "meter";
    const sections = market.section || [];
    const teamNames = sections.filter((s) => s.nat).map((s) => s.nat);
    const placeDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    let gameType = "MATCH";
    if (
      gtLower === "fancy" ||
      gtLower === "fancy1" ||
      gtLower === "oddeven" ||
      gtLower === "meter" ||
      gtLower === "cricketcasino"
    ) {
      gameType = "FANCY";
    }

    const selName = isFancyCat
      ? selectionName || (betType === "yes" ? "YES" : "NO")
      : selectionName;

    const payload = {
      sports: "Cricket",
      event_name: matchInfo.name || "",
      market_name: market.mname || "",
      market_type: market.mname || "",
      category: String(isFancyCat ? "1" : "0"),
      eventid: String(gmid),
      event_id: String(gmid),
      fancy_name: String(isFancyCat ? selectionName : ""),
      fixed: 0,
      game_type: String(gameType),
      match_id: String(market.mid),
      market_id: String(market.mid),
      match_start_time: String(matchInfo.time || ""),
      match_title: String(matchInfo.name || ""),
      odds: Number(oddsNum.toFixed(2)),
      original_amount: Number(stakeNum.toFixed(2)),
      original_currency: "INR",
      selection_name: String(selName),
      // sid must be the sport/event-type id (route `etid`), NOT runner.sid — see GameDetails.jsx
      sid: String(etid || ""),
      stake_amount: Number(stakeNum.toFixed(2)),
      team_one: String(teamNames[0] || ""),
      team_two: String(teamNames[1] || ""),
      usd_amount: Number((stakeNum * 0.0118).toFixed(2)),
      user_id: String(user.user_id || user.id || "0"),
      count: sections.length || 2,
      bet_type: betType,
      settlened: "pending",
      nation: String(selectionName),
      nat: String(selectionName),
      user_rate: Number(oddsNum.toFixed(2)),
      amount: Number(stakeNum.toFixed(2)),
      place_date: placeDate,
      runners: teamNames,
      // Real feed sizes + top-tier prices — see deriveBetSizes(). Hardcoded
      // zeros here made the server unable to price fancy liability.
      ...deriveBetSizes(runner, betType, oddsNum),
      unmatched: false,
      mname: String(market.mname || ""),
      gtype: String(market.gtype || "match"),
      section: Array.isArray(sections) ? sections : [],
    };

    setPlacing(true);
    try {
      const res = await sportsPlaceBet(payload);
      if (res?.success === false) {
        toast.error(res?.error || res?.message || "Bet failed.");
      } else {
        toast.success("Bet placed successfully!");
        setBetState(INITIAL_BET_STATE);
        dispatch(fetchBalanceThunk());
        if (user?.user_id) {
          dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId: user.user_id }));
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Bet placement failed.");
    } finally {
      setPlacing(false);
    }
  }, [betState, user, gmid, etid, dispatch, matchInfo]);

  // --- Fetch match info once (name / time / scorecard url) ---
  useEffect(() => {
    if (!gmid || !sid) return;
    getTopBarEvents(sid)
      .then((res) => {
        const inner = res?.data;
        const t1 = inner?.data?.t1 || [];
        const t2 = inner?.data?.t2 || [];
        const match = [...t1, ...t2].find((m) => String(m.gmid) === String(gmid));
        if (match) {
          setMatchInfo({
            name: match.ename || gmid,
            time: match.stime || match.open_date || "",
          });
        }
      })
      .catch(() => {});

    // Scorecard iframe url (structured score data isn't exposed elsewhere).
    getSportsScoreCard(gmid, sid)
      .then((url) => {
        setScoreUrl(url || `https://scorecard.avrkhub.in/?etid=${sid}&gmid=${gmid}`);
      })
      .catch(() => {
        setScoreUrl(`https://scorecard.avrkhub.in/?etid=${sid}&gmid=${gmid}`);
      });
  }, [gmid, sid]);

  // --- Poll private market data + exposures every 2s ---
  useEffect(() => {
    if (!gmid || !sid) return;
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [marketRes, exposureRes] = await Promise.all([
          getMatchPrivateData(gmid, sid),
          user?.user_id ? getMatchExposures(gmid, user.user_id) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        let mData = marketRes?.data;
        if (mData && !Array.isArray(mData)) mData = mData.data ?? mData;
        if (mData && !Array.isArray(mData)) mData = mData.data ?? [];
        setMarkets(Array.isArray(mData) ? mData : []);

        if (Array.isArray(mData) && mData.length > 0) {
          setMatchInfo((prev) => ({
            name: prev.name || mData[0].ename || gmid,
            time: prev.time || mData[0].stime || "",
          }));
        }
        if (exposureRes?.data) {
          setExposures(Array.isArray(exposureRes.data) ? exposureRes.data : []);
        }
      } catch (err) {
        if (!cancelled) console.warn("Failed to load virtual cricket data.", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    fetchAll();
    pollRef.current = setInterval(fetchAll, 2000);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [gmid, sid, user?.user_id]);

  // --- Matched bets ---
  useEffect(() => {
    if (gmid && user?.user_id) {
      dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId: user.user_id }));
    }
  }, [gmid, user?.user_id, dispatch]);

  const matchedBetCount = matchedBets?.length ?? 0;

  return (
    <>
      <Layout
        variant="casino-page"
        rightSidebar={
          <RightSidebar
            matchedBets={matchedBets}
            betState={betState}
            onOddsChange={handleOddsChange}
            onStakeChange={handleStakeChange}
            onQuickStake={handleQuickStake}
            onClear={handleClear}
            onReset={handleReset}
            onSubmit={handleSubmit}
            placing={placing}
            streamUrl={null}
            isLive={false}
          />
        }
      >
        <div className="casino-page-container cricketv3">
          {/* Header */}
          <div className="casino-header">
            <span>{matchInfo.name || gmid}</span>
            {matchInfo.time && (
              <span className="float-right">{formatStime(matchInfo.time)}</span>
            )}
          </div>

          {/* Mobile tabs */}
          <ul className="nav nav-tabs d-xl-none menu-tabs">
            <li className="nav-item">
              <a
                className={`nav-link${activeTab === "odds" ? " active" : ""}`}
                href="#odds"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("odds");
                }}
              >
                Odds
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link${activeTab === "bets" ? " active" : ""}`}
                href="#bets"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("bets");
                }}
              >
                Matched Bet ({matchedBetCount})
              </a>
            </li>
          </ul>

          {/* Scorecard */}
          {activeTab === "odds" && scoreUrl && (
            <div className="scorecard mb-1">
              <iframe
                src={scoreUrl}
                title="Scorecard"
                frameBorder="0"
                scrolling="no"
                style={{ width: "100%", border: 0, display: "block" }}
              />
            </div>
          )}

          {/* Video */}
          {activeTab === "odds" && streamUrl && (
            <div className="casino-video">
              <div className="video-box-container">
                <div className="casino-video-box">
                  <iframe
                    src={streamUrl}
                    title="Virtual Cricket"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    frameBorder="0"
                    scrolling="no"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile matched bets table */}
          {activeTab === "bets" && (
            <div className="table-responsive w-100 d-xl-none">
              <table className="table">
                <thead>
                  <tr>
                    <th>Matched Bet</th>
                    <th className="text-end">Odds</th>
                    <th className="text-end">Stake</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedBets && matchedBets.length > 0 ? (
                    matchedBets.map((bet, i) => (
                      <tr key={bet.id || i} className={bet.bet_type || bet.betType || ""}>
                        <td>
                          {bet.nation ||
                            bet.nat ||
                            bet.selection ||
                            bet.teamName ||
                            bet.selection_name ||
                            "-"}
                        </td>
                        <td className="text-end">{bet.odds ?? "-"}</td>
                        <td className="text-end">{bet.stake ?? bet.amount ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        No matched bets
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Markets */}
          {activeTab === "odds" && loading && (
            <div className="text-center py-4 w-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {activeTab === "odds" && !loading && markets.length === 0 && (
            <div className="text-center py-4 text-muted w-100">
              No markets available for this match.
            </div>
          )}

          {activeTab === "odds" &&
            !loading &&
            markets
              .filter((m) => detectMarketType(m) !== MARKET_TYPE.MATCH_ODDS)
              .map((market) => (
                <MarketSection
                  key={market.mid || market.mname}
                  market={market}
                  exposures={exposures}
                  onBetClick={handleBetClick}
                  onCashout={null}
                />
              ))}
        </div>
      </Layout>

      {/* Mobile Place Bet Modal */}
      {isMobile && (
        <PlaceBetMobile
          betState={betState}
          onOddsChange={(v) => setBetState((s) => ({ ...s, odds: v }))}
          onStakeChange={(v) => setBetState((s) => ({ ...s, stake: v }))}
          onQuickStake={(v) =>
            setBetState((s) => ({ ...s, stake: String((Number(s.stake) || 0) + v) }))
          }
          onClear={() => setBetState((s) => ({ ...s, stake: "" }))}
          onReset={() => setBetState(INITIAL_BET_STATE)}
          onClose={() => setBetState(INITIAL_BET_STATE)}
          onSubmit={handleSubmit}
          placing={placing}
        />
      )}
    </>
  );
}
