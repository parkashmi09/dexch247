import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import { SPORTS_STREAM_URL, SCORECARD_URL } from "../config.js";
import { fetchBalanceThunk } from "../features/user/userSlice.js";
import { fetchMatchedBetsThunk } from "../features/matchedBets/matchedBetsSlice.js";
import {
  formatStime,
  detectMarketType,
  MARKET_TYPE,
  isFancyType,
  buildMarketCashout,
  INITIAL_BET_STATE,
  deriveBetSizes,
} from "../utils/gameDetailsUtils.js";
import MarketSection from "../components/sports/markets/MarketSection.jsx";
import RightSidebar from "../components/sports/RightSidebar.jsx";
import PlaceBetMobile from "../components/sports/PlaceBetMobile.jsx";
import HorseBanner from "../components/sports/markets/HorseBanner.jsx";

// ---------------------------------------------------------------------------
// Main GameDetails page
// ---------------------------------------------------------------------------

export default function GameDetails() {
  const { sid, gmid } = useParams();
  const location = useLocation();
  const isRacing = location.state?.racing === true || Number(sid) === 10 || Number(sid) === 65;
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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("odds");
  const [scoreUrl, setScoreUrl] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [showTv, setShowTv] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Bet placement state
  const [betState, setBetState] = useState(INITIAL_BET_STATE);
  const [placing, setPlacing] = useState(false);

  const pollRef = useRef(null);
  const latestMarketsRef = useRef([]); // always-fresh markets for submit-time odds/suspended checks

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
  }, []);

  // --- Cashout handler ---
  const handleCashout = useCallback((market, marketType) => {
    if (!user) {
      toast.error("Please log in to use cashout.");
      return;
    }
    const result = buildMarketCashout(market, marketType, exposures);
    if (!result.ok) {
      const msgs = {
        invalid_market: "Invalid market for cashout.",
        no_position: "No open position to cashout.",
        already_balanced: "Position is already balanced.",
        no_odds: "No odds available for cashout.",
        worsens: "Cashout would worsen your position.",
        below_min: `Cashout stake below minimum (${result.min}).`,
        above_max: `Cashout stake above maximum (${result.max}).`,
      };
      toast.error(msgs[result.reason] || "Cashout not available.");
      return;
    }
    // Open place bet panel pre-filled with cashout bet
    setBetState({
      open: true,
      market,
      marketType,
      runner: result.runner,
      betType: result.betType,
      odds: String(result.odds),
      originalOdds: String(result.odds),
      stake: String(result.stake),
    });
    if (window.innerWidth < 1200) setActiveTab("bets");
  }, [user, exposures]);

  // --- Odds change from spinner ---
  const handleOddsChange = useCallback((val) => {
    setBetState((prev) => ({ ...prev, odds: val }));
  }, []);

  // --- Stake change (A3: allow empty or a number with up to 2 decimals) ---
  const handleStakeChange = useCallback((val) => {
    if (val === "" || /^\d*(\.\d{0,2})?$/.test(val)) {
      setBetState((prev) => ({ ...prev, stake: val }));
    }
  }, []);

  // --- Quick stake: ADDS to current stake (A4: cap at market max) ---
  const handleQuickStake = useCallback((val) => {
    const max = betState.runner?.max ?? betState.market?.max ?? 0;
    const next = (Number(betState.stake) || 0) + val;
    if (max && next > max) {
      toast.error(`Maximum stake is ${max}.`);
      return;
    }
    setBetState((prev) => ({ ...prev, stake: String(next) }));
  }, [betState]);

  // --- Clear stake only ---
  const handleClear = useCallback(() => {
    setBetState((prev) => ({ ...prev, stake: "" }));
  }, []);

  // --- Reset: close panel, reset odds and stake ---
  const handleReset = useCallback(() => {
    setBetState(INITIAL_BET_STATE);
  }, []);

  // --- Submit bet ---
  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to place a bet.");
      return;
    }

    const { market, marketType, runner, betType, odds, stake } = betState;
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

    if (oddsNum > 1000) {
      toast.error("Odds must be ≤ 1000.");
      return;
    }

    // A7: don't let the user move the price in their own favour past the offered rate
    // (back/yes can't go above original, lay/no can't go below).
    const origOdds = Number(betState.originalOdds) || 0;
    if (origOdds > 0 && oddsNum !== origOdds) {
      const isBackSide = betType === "back" || betType === "yes";
      if ((isBackSide && oddsNum > origOdds) || (!isBackSide && oddsNum < origOdds)) {
        toast.error("Bet not allowed.");
        return;
      }
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

    // A8/A9: re-check against the freshest live market at submit time. Reject if the
    // runner is suspended now, or the slip odds no longer match a live price tier on
    // the user's side. Lenient when the live runner can't be resolved (backend still
    // does the authoritative check) — only block on a positive suspended/mismatch.
    let pricedRunner = runner;
    {
      const wantMid = String(market?.mid ?? "");
      const wantSid = String(runner?.sid ?? "");
      const wantNat = String(runner?.nat ?? runner?.name ?? "").trim().toLowerCase();
      const liveMarket = (latestMarketsRef.current || []).find((m) => String(m?.mid ?? "") === wantMid);
      const liveRunner = liveMarket?.section?.find(
        (s) => (wantSid && String(s?.sid ?? "") === wantSid) ||
               String(s?.nat ?? "").trim().toLowerCase() === wantNat
      );
      // Prefer the LIVE runner for size/bhav derivation (same source the drift
      // check below trusts); fall back to the click-time snapshot if the feed
      // can't be resolved.
      pricedRunner = liveRunner || runner;
      if (liveMarket && liveRunner) {
        const gs = String(liveRunner.gstatus || liveRunner.status || "").toUpperCase();
        if (gs === "SUSPENDED" || gs === "BALL RUNNING" || gs === "BALLRUNNING") {
          toast.error("Market is not available");
          return;
        }
        const isLaySide = betType === "lay" || betType === "no";
        const tiers = (liveRunner.odds || [])
          .filter((o) => (String(o?.otype || "").toUpperCase() === (isLaySide ? "LAY" : "BACK")))
          .map((o) => (o?.odds == null || o?.odds === "-" || o?.odds === "--" || o?.odds === "") ? NaN : Number(o.odds))
          .filter((n) => Number.isFinite(n) && n > 0);
        if (tiers.length > 0) {
          const closest = tiers.reduce((b, c) => (Math.abs(c - oddsNum) < Math.abs(b - oddsNum) ? c : b));
          if (Math.abs(closest - oddsNum) > 0.01) {
            toast.error("Odds changed");
            return;
          }
        }
      }
    }

    const selectionName = runner?.nat || runner?.name || "";
    const mnLower = (market.mname || "").toLowerCase();
    const gtLower = (market.gtype || "").toLowerCase();
    const isFancyCat = mnLower.includes("fancy") || gtLower === "fancy" || gtLower === "fancy1" || gtLower === "oddeven" || gtLower === "meter";
    const sections = market.section || [];
    const teamNames = sections.filter((s) => s.nat).map((s) => s.nat);
    const placeDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Determine game_type: Bookmaker/match1 = "MATCH", fancy = "FANCY", etc.
    let gameType = "MATCH";
    if (gtLower === "fancy" || gtLower === "fancy1" || gtLower === "oddeven" || gtLower === "meter") {
      gameType = "FANCY";
    } else if (gtLower === "cricketcasino") {
      gameType = "FANCY";
    }

    // For fancy-style, selection_name = runner name; for structured, = team name
    const selName = isFancyCat
      ? (selectionName || (betType === "yes" ? "YES" : "NO"))
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
      // sid must be the SPORT id (route param, e.g. 4=cricket) — NOT runner.sid,
      // which is the selection/runner id. Sending the runner id here was stored as
      // SportsBet.sport_id and made AVRKHUB reject the result fetch (400) so bets
      // never settled. Route `sid` is the authoritative sport id.
      sid: String(sid || ""),
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
      // Real feed sizes + top-tier prices. These are what let the server price a
      // fancy bet at all — hardcoding them to 0/[] made lay/no bets book zero
      // liability. See deriveBetSizes().
      ...deriveBetSizes(pricedRunner, betType, oddsNum),
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
        // Refresh balance and matched bets
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
  }, [betState, user, gmid, sid, dispatch, matchInfo]);

  // --- Fetch match info once on mount (for name / time / iplay) ---
  useEffect(() => {
    if (!gmid || !sid) return;

    getTopBarEvents(sid)
      .then((res) => {
        const inner = res?.data;
        const t1 = inner?.data?.t1 || [];
        const t2 = inner?.data?.t2 || [];
        const all = [...t1, ...t2];
        const match = all.find((m) => String(m.gmid) === String(gmid));
        if (match) {
          setMatchInfo({
            name: match.ename || gmid,
            time: match.stime || match.open_date || "",
          });
          const live = match.iplay === true || match.iplay === 1 || match.iplay === "true";
          setIsLive(live);
          if (live) {
            // Fetch scorecard URL from API for all sports
            getSportsScoreCard(gmid, sid).then((url) => {
              if (url) setScoreUrl(url);
            });
            // Only build stream URL — don't auto-show (showTv starts false)
            if (match.tv && SPORTS_STREAM_URL) {
              setStreamUrl(`${SPORTS_STREAM_URL}?id=${gmid}`);
            }
          }
        }
      })
      .catch(() => {
        // Match info is optional — markets will still render
      });
  }, [gmid, sid]);

  // --- Poll getMatchPrivateData every 2s for live market data ---
  useEffect(() => {
    if (!gmid || !sid) return;
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [marketRes, exposureRes] = await Promise.all([
          getMatchPrivateData(gmid, sid),
          user?.user_id
            ? getMatchExposures(gmid, user.user_id)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        let mData = marketRes?.data;
        if (mData && !Array.isArray(mData)) {
          mData = mData.data ?? mData;
        }
        if (mData && !Array.isArray(mData)) {
          mData = mData.data ?? [];
        }
        const marketArr = Array.isArray(mData) ? mData : [];
        setMarkets(marketArr);
        latestMarketsRef.current = marketArr;

        if (Array.isArray(mData) && mData.length > 0) {
          setMatchInfo((prev) => ({
            name: prev.name || mData[0].ename || gmid,
            time: prev.time || mData[0].stime || "",
          }));
        }

        if (exposureRes?.data) {
          setExposures(
            Array.isArray(exposureRes.data) ? exposureRes.data : []
          );
        }

        setError(null);
      } catch (err) {
        if (cancelled) return;
        // Failure is logged only — no blocking error UI (see commented alert below).
        console.warn("Failed to load match data. Please try again.", err);
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

  // --- Fetch matched bets on mount ---
  useEffect(() => {
    if (gmid && user?.user_id) {
      dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId: user.user_id }));
    }
  }, [gmid, user?.user_id, dispatch]);

  const matchedBetCount = matchedBets?.length ?? 0;

  return (
    <>
    <Layout
      variant="detail-page"
      rightSidebar={
        <RightSidebar
          matchedBets={matchedBets}
          exposures={exposures}
          betState={betState}
          onOddsChange={handleOddsChange}
          onStakeChange={handleStakeChange}
          onQuickStake={handleQuickStake}
          onClear={handleClear}
          onReset={handleReset}
          onSubmit={handleSubmit}
          placing={placing}
          streamUrl={streamUrl}
          isLive={isLive}
        />
      }
    >
      <div className="detail-page-container">
        {/* Game Header — replaced by HorseBanner for racing */}
        {isRacing ? (
          <HorseBanner
            matchInfo={matchInfo}
            sid={sid}
            markets={markets}
          />
        ) : (
          <div className="game-header">
            <span>{matchInfo.name || gmid}</span>
            {matchInfo.time && (
              <span className="float-end">
                {formatStime(matchInfo.time)}
              </span>
            )}
          </div>
        )}

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
          {isLive && (streamUrl || scoreUrl) && (
            <li className="nav-item">
              <a
                className={`nav-link${showTv ? " active" : ""}`}
                href="#tv"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTv(!showTv);
                  if (activeTab !== "odds") setActiveTab("odds");
                }}
              >
                <i className="fas fa-tv" />
              </a>
            </li>
          )}
        </ul>

        {/* Live Stream — mobile only, toggle via TV tab */}
        {activeTab === "odds" && isLive && streamUrl && showTv && (
          <div className="live-tv d-xl-none" style={{ width: "100%", marginBottom: "4px" }}>
            <iframe
              allow="autoplay; encrypted-media"
              allowFullScreen
              src={streamUrl}
              title="Live Cricket Stream"
              frameBorder="0"
              scrolling="no"
              style={{ width: "100%", height: "100%", overflow: "hidden", display: "block" }}
            />
          </div>
        )}

        {/* Scorecard iframe — not shown for racing. Cricket uses a shorter
            154px scoreboard; other sports keep the default 250px. */}
        {activeTab === "odds" && isLive && !isRacing && (Number(sid) === 4 || scoreUrl) && (
          <div className={`scorestats${Number(sid) === 4 ? " scorestats-cricket" : ""}`}>
            <iframe
              src={Number(sid) === 4
                ? `https://scorecard.avrkhub.in/?etid=${sid}&gmid=${gmid}&v=5`
                : scoreUrl}
              frameBorder="0"
            />
          </div>
        )}

        {/* Mobile Matched Bets table — shown when bets tab active on mobile */}
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
                      <td>{bet.nation || bet.nat || bet.selection || bet.teamName || bet.selection_name || "-"}</td>
                      <td className="text-end">{bet.odds ?? "-"}</td>
                      <td className="text-end">{bet.stake ?? bet.amount ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="text-center text-muted">No matched bets</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Markets section — hidden on mobile when bets/tv tab active */}
        {activeTab === "odds" && loading && (
          <div className="text-center py-4 w-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Disabled — load failures are logged via console.warn, not shown as an alert div.
        {activeTab === "odds" && error && !loading && (
          <div className="alert alert-danger m-3 w-100">{error}</div>
        )}
        */}

        {activeTab === "odds" && !loading && !error && markets.length === 0 && (
          <div className="text-center py-4 text-muted w-100">
            No markets available for this match.
          </div>
        )}

        {activeTab === "odds" && !loading &&
          (() => {
            const hasBookmaker2 = markets.some((m) => detectMarketType(m) === MARKET_TYPE.BOOKMAKER2);
            return markets.map((market) => {
              const mt = detectMarketType(market);
              let wc;
              if (hasBookmaker2 && mt === MARKET_TYPE.BOOKMAKER) wc = "width70";
              return (
              <MarketSection
                key={market.mid || market.mname}
                market={market}
                exposures={exposures}
                onBetClick={handleBetClick}
                onCashout={user ? handleCashout : null}
                widthClass={wc}
              />
            );
            });
          })()}
      </div>
    </Layout>

    {/* Mobile Place Bet Modal — only render on mobile (< 1200px) */}
    {isMobile && (
      <PlaceBetMobile
        betState={betState}
        exposures={exposures}
        onOddsChange={handleOddsChange}
        onStakeChange={handleStakeChange}
        onQuickStake={handleQuickStake}
        onClear={handleClear}
        onReset={handleReset}
        onClose={handleReset}
        onSubmit={handleSubmit}
        placing={placing}
      />
    )}
    </>
  );
}
