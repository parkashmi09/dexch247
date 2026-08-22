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
  cashoutToastMessage,
} from "../utils/gameDetailsUtils.js";
import {
  TOASTS,
  BET_BUFFER_SECONDS,
  FANCY_BUFFER_SECONDS,
  getGameType,
  getBetCategory,
  isFancyCategory,
  isOddsLocked,
  getStakeLimits,
  getOddsBounds,
  isRateCapped,
} from "../utils/sportsBetRules.js";
import { manualBetGate, manualBetLiveCheck, autoBetCheck, autoCheckApplies, EPS } from "../utils/bookieFavour.js";
import {
  monitorOddsBuffer,
  getFinalSuspensionStatus,
  hasFancyDrift,
} from "../utils/placeBetLiveChecks.js";
import { registerBetAttempt } from "../utils/betAttemptTracker.js";
import { getPlatformBufferSeconds } from "../utils/bufferTime.js";
import MarketSection from "../components/sports/markets/MarketSection.jsx";
import RightSidebar from "../components/sports/RightSidebar.jsx";
import PlaceBetMobile from "../components/sports/PlaceBetMobile.jsx";
import HorseBanner from "../components/sports/markets/HorseBanner.jsx";
import RunAmountModal from "../components/sports/markets/RunAmountModal.jsx";

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

  // Run Amount ladder modal — the Normal-market runner whose book is shown.
  const [ladderRunner, setLadderRunner] = useState(null);

  const pollRef = useRef(null);
  const latestMarketsRef = useRef([]); // always-fresh markets for submit-time odds/suspended checks

  // --- Bet click handler (passed down to market components) ---
  // X (the clicked price) is frozen into `originalOdds` here and never touched
  // again — every bookie-favour comparison downstream is relative to it.
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
      isUserModifiedOdds: false,
      isCashout: false,
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
      toast.error(cashoutToastMessage(result.reason));
      return;
    }
    // Open the place-bet panel pre-filled with the computed hedge. The user
    // still confirms with Submit; the pipeline routes it through is_cashout,
    // which skips the min-stake and bookie-favour checks (spec §8.5) but keeps
    // the max, suspension, balance and buffer checks.
    setBetState({
      open: true,
      market,
      marketType,
      runner: result.runner,
      betType: result.betType,
      odds: String(result.odds),
      originalOdds: String(result.odds),
      stake: String(result.stake),
      isUserModifiedOdds: false,
      isCashout: true,
    });
    if (window.innerWidth < 1200) setActiveTab("bets");
  }, [user, exposures]);

  // --- Odds change (typed or stepped) — this is what makes a bet MANUAL ---
  const handleOddsChange = useCallback((val) => {
    setBetState((prev) => ({ ...prev, odds: val, isUserModifiedOdds: true }));
  }, []);

  // --- Stake change (A3: allow empty or a number with up to 2 decimals) ---
  const handleStakeChange = useCallback((val) => {
    if (val === "" || /^\d*(\.\d{0,2})?$/.test(val)) {
      setBetState((prev) => ({ ...prev, stake: val }));
    }
  }, []);

  // --- Quick stake: ADDS to current stake (capped at the market max) ---
  const handleQuickStake = useCallback((val) => {
    const { max } = getStakeLimits(betState.market, betState.runner, {
      isCashout: betState.isCashout,
    });
    const next = (Number(betState.stake) || 0) + val;
    if (max && next > max) {
      toast.error(TOASTS.MAX_BET_LIMIT);
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

  // --- Submit bet — pipeline order is spec §5.2 and must not be reordered ---
  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to place a bet.");
      return;
    }

    const { market, runner, betType, odds, stake, isCashout } = betState;
    if (!market) return;

    // The market list is read from the ref on EVERY access, never snapshotted:
    // the 2s poll mutates it while the buffer is running, and a snapshot would
    // make the buffer blind to the very move it exists to catch.
    const getMarkets = () => latestMarketsRef.current || [];

    const oddsNum = Number(odds);
    const stakeNum = Number(stake);
    const marketId = market?.mid;
    const selectionId = runner?.sid;
    const selectionName = runner?.nat || runner?.name || "";
    const oddsLocked = isOddsLocked(market);
    // Bookmaker (match1) odds are NOT user-editable — `oddsLocked` stays true so
    // the panel renders them read-only and the manual-edit gate never fires — but
    // they DO move live, so they need the SAME directional bookie-favour check as
    // Match Odds (auto path), NOT the fancy locked-odds drift check. This flag is
    // tied to autoCheckApplies (match_odds / bookmaker / bookmaker 2) so live
    // tracking fires exactly where the auto favour check will apply; Tied and the
    // fancy family aren't auto-check markets, so they stay locked (drift check).
    const oddsLiveTracked = !oddsLocked || autoCheckApplies(market);
    const eventName = matchInfo.name || "";

    // ── Step 0: anti-spam — 4 attempts per market per 60s ──
    if (!registerBetAttempt(marketId || `${market?.mname}:${selectionName}`)) {
      toast.error(TOASTS.MULTIPLE_BET_NOT_ALLOWED);
      return;
    }

    // ── Step 0b: MATCH_ODDS maxb:1 kill-switch ──
    // The feed marks MATCH_ODDS unbettable by quoting maxb:1 while the market
    // still renders OPEN. Reference: submit runs the loader ~5s, then rejects
    // with "Game Not Active2." — no validation, no buffer, no API call. Must
    // run BEFORE stake validation (maxb:1 makes maxStake 1, which would fire
    // the wrong "Check Maximum Bet Limit2." toast instantly). MATCH_ODDS only —
    // Bookmaker/Fancy/Tied are untouched. `market` is the CLICK-TIME snapshot.
    if (
      String(market.gtype || "").toLowerCase() === "match" &&
      String(market.mname || "").toUpperCase() === "MATCH_ODDS" &&
      Number(market.maxb) === 1
    ) {
      setPlacing(true);
      setTimeout(() => {
        setPlacing(false);
        // Panel closes first, then the toast (same order as the success flow)
        setBetState(INITIAL_BET_STATE);
        toast.error(TOASTS.GAME_NOT_ACTIVE_2);
      }, 5000);
      return;
    }

    // ── Step 0c: cashout Min/Max range check ──
    // The hedge stake is COMPUTED, not chosen — the panel still opens with an
    // out-of-range value, but the reference refuses to confirm a cashout whose
    // stake sits outside the market's Min/Max header range (Min: market.min,
    // Max: maxb > 0 ? maxb : max), with its own toast. Runs BEFORE Step 1:
    // minStake is 0 for cashout (so MIN_BET_LIMIT never fires) and the max
    // check would show the wrong "Check Maximum Bet Limit2." text.
    if (isCashout) {
      const coMin = Number(market?.min) || 0;
      const coMaxb = Number(market?.maxb) || 0;
      const coMax = coMaxb > 0 ? coMaxb : Number(market?.max) || 0;
      if ((coMin > 0 && stakeNum < coMin) || (coMax > 0 && stakeNum > coMax)) {
        toast.error(TOASTS.BET_NOT_CONFIRM_RANGE);
        return;
      }
    }

    // ── Step 1: stake + odds validation ──
    if (!stakeNum || stakeNum <= 0) {
      toast.error(TOASTS.ENTER_VALID_STAKE);
      return;
    }
    if (stakeNum >= 1e16) {
      setPlacing(true);
      setTimeout(() => {
        setPlacing(false);
        toast.error(TOASTS.SERVER_ERROR);
      }, 1500);
      return;
    }
    if (stakeNum >= 1e12) {
      toast.error(TOASTS.BET_NOT_VALID);
      return;
    }

    const bounds = getOddsBounds(market);
    if (!Number.isFinite(oddsNum) || oddsNum <= 0 || oddsNum < bounds.min || oddsNum > bounds.max) {
      toast.error(TOASTS.INVALID_BET);
      return;
    }

    const { min, max } = getStakeLimits(market, runner, { isCashout });
    if (min > 0 && stakeNum < min) {
      toast.error(TOASTS.MIN_BET_LIMIT);
      return;
    }
    if (max > 0 && stakeNum > max) {
      toast.error(TOASTS.MAX_BET_LIMIT);
      return;
    }

    // ── Step 1b: ODI/T20 MATCH_ODDS rate cap on the ENTERED odds ──
    if (isRateCapped({ sid, market, eventName, odds: oddsNum })) {
      toast.error(TOASTS.RATE_OVER_LIMIT);
      return;
    }

    // X = the clicked price, E = what the user asked for.
    const selOdds = Number(betState.originalOdds) || oddsNum;

    // ── Step 2: manual edit → Gate 1, decided instantly (no loader, no call) ──
    // Editing back to the same price is not an edit — that flows down the auto
    // path. Odds-locked markets and cashouts can never be manual.
    const isEdited =
      !isCashout && !oddsLocked && betState.isUserModifiedOdds &&
      Math.abs(oddsNum - selOdds) > EPS;

    if (isEdited) {
      const gate = manualBetGate({ betType, selectedOdds: selOdds, editedOdds: oddsNum });
      if (!gate.accept) {
        toast.error(gate.reason);
        return;
      }
    }

    setPlacing(true);
    // Everything past this point MUST clear `placing` before returning.
    try {
      // ── Step 3: buffer — watch the feed, then take the last live price Y ──
      // Live-tracked markets (Match Odds + Bookmaker) use the real platform
      // buffer to follow the live price; fancy/locked markets keep the shorter
      // env buffer and their clicked price.
      const platformBuffer = oddsLiveTracked ? await getPlatformBufferSeconds() : 0;
      const bufferSeconds = oddsLiveTracked
        ? platformBuffer > 0
          ? platformBuffer
          : BET_BUFFER_SECONDS
        : FANCY_BUFFER_SECONDS;

      const clickedSizes = deriveBetSizes(runner, betType, oddsNum);
      const buffer = await monitorOddsBuffer({
        getMarkets,
        market,
        marketId,
        selectionId,
        selectionName,
        betType,
        initialOdds: oddsNum,
        initialSize: clickedSizes.size,
        bufferSeconds,
        // Override the gtype-only lock: bookmaker must follow the live price so
        // the auto favour check below compares live vs clicked.
        liveTracked: oddsLiveTracked,
      });
      let finalOdds = Number(buffer.finalOdds);
      let finalSize = Number(buffer.finalSize) || 0;

      // ── Step 4: final suspension read ──
      const susp = getFinalSuspensionStatus({
        markets: getMarkets(),
        marketId,
        selectionId,
        selectionName,
      });
      if (susp.suspended) {
        setPlacing(false);
        toast.error(susp.reason === "ball_running" ? TOASTS.BALL_RUNNING : TOASTS.GAME_NOT_ACTIVE);
        return;
      }

      // ── Step 5: strict drift check on odds-locked (fancy) markets ──
      // Only markets whose odds don't move live. Bookmaker is oddsLocked (not
      // editable) but IS live-tracked, so it SKIPS this and uses the directional
      // auto bookie-favour check (Step 6) instead — the whole point of the fix.
      if (!oddsLiveTracked &&
          hasFancyDrift({ markets: getMarkets(), marketId, selectionName, betType, odds: oddsNum })) {
        setPlacing(false);
        toast.error(TOASTS.ODDS_CHANGED);
        return;
      }

      // ── Step 6: bookie favour ──
      if (buffer.blocked) {
        setPlacing(false);
        toast.error(TOASTS.GAME_NOT_ACTIVE);
        return;
      }

      if (isCashout) {
        // The hedge stake was solved at this exact price — one tick would break
        // the balance, so cashout skips the favour checks entirely.
        finalOdds = oddsNum;
      } else if (isEdited) {
        const manual = manualBetLiveCheck({ betType, editedOdds: oddsNum, liveOdds: finalOdds });
        if (!manual.accept) {
          setPlacing(false);
          toast.error(manual.reason);
          return;
        }
        finalOdds = manual.finalOdds; // Y, never E
      } else {
        const auto = autoBetCheck({ market, betType, selectedOdds: selOdds, currentOdds: finalOdds });
        if (!auto.accept) {
          setPlacing(false);
          toast.error(auto.reason);
          return;
        }
        finalOdds = auto.finalOdds; // Y, never X
      }

      // ── Step 7: rate cap again — an auto BACK can cross 4.00 in the buffer ──
      if (isRateCapped({ sid, market, eventName, odds: finalOdds })) {
        setPlacing(false);
        toast.error(TOASTS.RATE_OVER_LIMIT);
        return;
      }

      // Show the price the bet is actually going in at.
      setBetState((prev) => ({ ...prev, odds: String(Number(finalOdds.toFixed(2))) }));

      // ── Payload ──
      const sections = market.section || [];
      const teamNames = sections.filter((s) => s.nat).map((s) => s.nat);
      const placeDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      const fancyCat = isFancyCategory(market);

      // Price the payload off the LIVE runner where possible — same source the
      // buffer and drift check trust — falling back to the click-time snapshot.
      const liveMarket = getMarkets().find((m) => String(m?.mid ?? "") === String(marketId ?? ""));
      const liveRunner =
        liveMarket?.section?.find(
          (s) =>
            (selectionId && String(s?.sid ?? "") === String(selectionId)) ||
            String(s?.nat ?? "").trim().toLowerCase() === selectionName.trim().toLowerCase()
        ) || runner;
      const sizes = deriveBetSizes(liveRunner, betType, finalOdds);
      if (finalSize > 0) {
        sizes.size = finalSize;
        const laySide = betType === "lay" || betType === "no";
        if (laySide) sizes.lay_size = finalSize;
        else sizes.back_size = finalSize;
      }

      // Field-for-field mirror of the reference lords payload
      // (D:\Developer\lords-exch-new\exchange-payload\payloads\01_MATCH_ODDS.json).
      // Order, names and TYPES match it exactly — the only deviation is the
      // trailing `is_cashout`, which this server reads to skip the min-stake on a
      // computed hedge (sportbetscontroller.js:797); lords never sent it.
      const payload = {
        // ⚠ Known gap carried from the reference: football/tennis bets still save
        // as Cricket. Fixing it needs the server's sport mapping.
        sports: "Cricket",
        event_name: eventName,
        market_name: market.mname || "",
        // GOLDEN RULE (spec §3.3): market_type is the feed's mname VERBATIM —
        // never a UI label. Exposure + settlement key on it, and "Bookmaker" vs
        // "Bookmaker 2" are only distinguishable here.
        market_type: market.mname || "",
        category: getBetCategory(market),
        eventid: String(gmid),
        fancy_name: String(fancyCat ? selectionName : ""),
        fixed: 0,
        // match1 → BOOKMAKER (server maps to BM); Tied Match → FANCY so the
        // server accepts sub-1 percent odds and routes to its Tied branch.
        game_type: getGameType(market),
        match_id: String(market.mid),      // NB: MARKET id (string)
        match_start_time: String(matchInfo.time || ""),
        match_title: String(matchInfo.name || ""),
        odds: Number(finalOdds.toFixed(2)),
        original_amount: Number(stakeNum.toFixed(2)),
        original_currency: "INR",
        selection_name: String(selectionName),
        sid: String(sid || ""),             // SPORT id (route param), not runner id
        stake_amount: Number(stakeNum.toFixed(2)),
        team_one: String(teamNames[0] || ""),
        team_two: String(teamNames[1] || ""),
        usd_amount: Number((stakeNum * 0.0118).toFixed(2)),
        user_id: String(user.user_id || user.id || "0"),
        count: sections.length || 2,
        bet_type: betType,
        settlened: "pending",               // reference typo — preserved verbatim
        nation: String(selectionName),
        // = odds; for the fancy family this carries the LINE, not the rate
        // (reference behaviour preserved, lords report 03).
        user_rate: Number(finalOdds.toFixed(2)),
        amount: Number(stakeNum.toFixed(2)),
        place_date: placeDate,              // "YYYY-MM-DD HH:mm:ss" UTC
        event_id: Number(gmid),             // number (eventid is the string form)
        market_id: Number(market.mid),      // number (match_id is the string form)
        // size = CLICKED rung size; back_size/lay_size = each SIDE's best (tno0)
        // size independently (lords 01: back 2179.35 / lay 13981.64). deriveBetSizes.
        ...sizes,
        runners: teamNames,
        // runner_odds inside ...sizes carries the top back1/lay1 prices.
        mname: String(market.mname || ""),
        gtype: String(market.gtype || "match"),
        // Reference contract: section is a STRINGIFIED runners array — the server
        // JSON.parse()s it. Sending a raw array is the bug we were carrying.
        section: JSON.stringify(Array.isArray(sections) ? sections : []),
        nat: String(selectionName),
        // Frontend never places an unmatched bet — an accepted manual bet is a
        // matched bet at the live price.
        unmatched: false,
        // dexch247-only: skips the min-stake gate for a computed cashout hedge.
        is_cashout: !!isCashout,
      };

      const res = await sportsPlaceBet(payload);
      if (res?.success === false) {
        toast.error(res?.error || res?.message || TOASTS.GENERIC_ERROR);
      } else {
        // Order is fixed (spec §5.2 step 12): close the panel, toast, then
        // refresh balance/bets — exposure last so it reads post-commit.
        setBetState(INITIAL_BET_STATE);
        toast.success(TOASTS.BET_PLACED);
        dispatch(fetchBalanceThunk());
        if (user?.user_id) {
          dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId: user.user_id }));
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "";
      toast.error(/fetch|network/i.test(msg) ? TOASTS.NETWORK_ERROR : msg || TOASTS.GENERIC_ERROR);
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
                ? `${SCORECARD_URL}/?etid=${sid}&gmid=${gmid}&v=5`
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
                onRunnerClick={user ? setLadderRunner : null}
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

    {/* Run Amount ladder — opens on a Normal-market runner-name click */}
    <RunAmountModal
      show={!!ladderRunner}
      onClose={() => setLadderRunner(null)}
      runnerName={ladderRunner}
      eventId={gmid}
      userId={user?.user_id}
    />
    </>
  );
}
