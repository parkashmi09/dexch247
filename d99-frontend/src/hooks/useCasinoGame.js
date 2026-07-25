import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCasinoGameDetails, getMatchExposure, getMyBets, getLastResults, placeCasinoBet } from "../apiservices/CasionApi.js";
import { CASINO_STREAM_URL } from "../config.js";
import { fetchBalanceThunk } from "../features/user/userSlice.js";
import toast from "react-hot-toast";

const BUFFER_MS = 2000;
const CHECK_INTERVAL_MS = 500;

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Helper to normalize string for exposure key matching
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

// Create all exposure key variations for a selection
const createExposureKeys = (selection) => {
  if (!selection) return [];
  const keys = [
    selection,
    selection.toLowerCase(),
    selection.toLowerCase().trim(),
    selection.trim(),
    normalizeString(selection),
  ];
  return [...new Set(keys.filter((k) => k))];
};

/**
 * Hook that manages all casino game API logic:
 * - Game data polling (1.5s)
 * - Video stream URL
 * - Exposure polling (2s)
 * - My bets polling (2s)
 * - Last results (once)
 * - Bet placement state
 *
 * @param {string} gameId - e.g. "worli3", "teen62"
 * @param {object} options
 * @param {Array} options.defaultResults - placeholder last results
 */
export default function useCasinoGame(gameId, options = {}) {
  const { defaultResults = [], formatResult, matchId: matchIdOverride } = options;
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  // ─── Core state ───
  const [gameData, setGameData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [tableData, setTableData] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [lastResults, setLastResults] = useState(defaultResults);

  // ─── Bet placement state ───
  const [betValue, setBetValue] = useState("");
  // Odds shown in the bet slip. Usually === betValue, but Trio's Session shows
  // the line (b/l, e.g. 21) while betting/settling at the bhav-derived decimal.
  const [betDisplayOdds, setBetDisplayOdds] = useState("");
  const [betType, setBetType] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [placing, setPlacing] = useState(false);

  // Keep fresh refs for buffer checks
  const gameDataRef = useRef(null);
  const betTypeRef = useRef("");
  // Last non-zero Trio Session line (b/l). Between rounds the feed drops the row
  // to 0/suspended; without this cache the My Bet odds column would blank to "-".
  const trioSessionLineRef = useRef({ b: null, l: null });
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);
  useEffect(() => { betTypeRef.current = betType; }, [betType]);

  // ─── Derived values ───
  // Allow the page to supply the round/market id explicitly (e.g. worli3, whose
  // gameData is an array of markets, so the derived mid below is empty).
  const matchId =
    (matchIdOverride != null && matchIdOverride !== "" ? String(matchIdOverride) : "") ||
    gameData?.data?.data?.mid?.toString() ||
    gameData?.data?.mid?.toString() ||
    gameData?.mid?.toString() ||
    "";

  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "";
  const gameName = extractCasinoGame(pathname) || gameId;

  // ─── Smooth timer: local countdown between API polls ───
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(0);
  const lastApiLt = gameData?.data?.data?.lt ?? gameData?.data?.lt ?? 0;

  // Sync timer from API
  useEffect(() => {
    timerRef.current = Number(lastApiLt) || 0;
    setTimer(timerRef.current);
  }, [lastApiLt]);

  // Decrement every second locally
  useEffect(() => {
    const tick = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // ─── Smooth card string: only update on actual change ───
  const [cardString, setCardString] = useState("");
  const rawCardString = gameData?.data?.data?.card || gameData?.data?.card || "";

  useEffect(() => {
    if (rawCardString && rawCardString !== cardString) {
      setCardString(rawCardString);
    }
  }, [rawCardString]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Video stream URL ───
  useEffect(() => {
    const name = extractCasinoGame(pathname) || gameId;
    setIframeSrc(`${CASINO_STREAM_URL}?id=${name}`);
  }, [pathname, gameId]);

  // ─── Poll game data every 1.5s ───
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(gameId);
        if (response) setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };
    fetchGameData();
    const interval = setInterval(fetchGameData, 500);
    return () => clearInterval(interval);
  }, [gameId]);

  // ─── Parse table data from gameData ───
  useEffect(() => {
    if (!gameData) return;
    const subData = gameData?.data?.data?.sub || gameData?.data?.sub || [];
    const mappedData = subData.map((item) => ({
      ...item,
      nat: item.nat,
      gstatus: item.gstatus || "OPEN",
      mid: item.mid,
      sr: item.sr,
    }));
    const sortedData = mappedData.sort((a, b) => (a.sr || 0) - (b.sr || 0));
    setTableData(sortedData);

    // Cache the live Trio Session line so My Bet can keep showing it during the
    // between-rounds suspension when the feed reports it as 0.
    if (gameId === "trio") {
      const session = subData.find((s) => Number(s.sid) === 1);
      if (session) {
        if (Number(session.b) > 0) trioSessionLineRef.current.b = session.b;
        if (Number(session.l) > 0) trioSessionLineRef.current.l = session.l;
      }
    }
  }, [gameData, gameId]);

  // ─── Fetch exposure every 2s ───
  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.id;
      if (!userId || !matchId) return;

      const response = await getMatchExposure(userId, matchId);
      if (response?.success && response?.data) {
        const exposureMap = {};
        response.data.forEach((item) => {
          const name = item.team_name || "";
          const exp = parseFloat(item.exposure_amount) || 0;
          if (name && exp !== 0) {
            exposureMap[name] = exp;
            exposureMap[name.toLowerCase()] = exp;
            // "3 Card Total 19" → also map as "3 Card Total"
            const baseMatch = name.match(/^(.+?)\s+\d+$/);
            if (baseMatch) {
              exposureMap[baseMatch[1]] = (exposureMap[baseMatch[1]] || 0) + exp;
            }
          }
        });
        setExposures(exposureMap);
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    fetchExposure();
    const interval = setInterval(fetchExposure, 2000);
    return () => clearInterval(interval);
  }, [fetchExposure, matchId]);

  // ─── Fetch my bets every 2s ───
  const fetchMyBets = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.id;
      if (!userId || !matchId) return;

      // Trio: drop the My Bet card once the round is closing (countdown hit 0),
      // so it clears before the next round begins — matching the original site,
      // rather than carrying the current round's bets into the transition.
      if (gameId === "trio") {
        const gd = gameDataRef.current;
        const lt = Number(gd?.data?.data?.lt ?? gd?.data?.lt ?? 0);
        if (lt <= 0) { setMyBets([]); return; }
      }

      const response = await getMyBets(userId, matchId);
      if (response?.success && response?.bets) {
        // Trio Session stores the bhav-derived decimal (1.8/2.0) as its odds, but
        // the slip and table show the line (b/l). Mirror that in My Bet using the
        // live session line for this round (My Bet is scoped to the current mid).
        const isTrio = gameId === "trio";
        const cachedLine = trioSessionLineRef.current;

        const formattedBets = response.bets.map((bet) => {
          const type = (bet.type || bet.btype || "").toLowerCase() || null;
          let odds = bet.odds || bet.urate || "0";
          if (isTrio && String(bet.selection || bet.player_name || "").trim().toLowerCase() === "session") {
            // Prefer the last known-good line (kept alive across the between-rounds
            // suspension); only show the stored decimal if a line was never seen.
            const line = type === "lay" ? cachedLine.l : cachedLine.b;
            if (Number(line) > 0) odds = line;
          }
          return {
            matchedBet: bet.player_name || bet.selection || bet.nat || "",
            nat: bet.nat || bet.player_name || bet.selection || "",
            odds,
            stake: bet.stake || bet.amt || "0",
            type,
            selection: bet.selection || bet.player_name || "",
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0,
          };
        });
        setMyBets(formattedBets);
      }
    } catch (error) {
      console.error("Error fetching my bets:", error);
    }
  }, [matchId, gameId]);

  useEffect(() => {
    if (!matchId) return;
    fetchMyBets();
    const interval = setInterval(fetchMyBets, 2000);
    return () => clearInterval(interval);
  }, [fetchMyBets, matchId]);

  // ─── Fetch last results, repeat every 4s ───
  useEffect(() => {
    let cancelled = false;

    const fetchResults = async () => {
      try {
        const data = await getLastResults(gameId);
        if (cancelled) return;

        const resArray = data?.data?.data?.res || data?.data?.res || data?.data || [];
        if (!resArray?.length) return;

        const results = resArray.slice(0, 20).map((r) => {
          if (formatResult) return formatResult(r);
          return {
            label: r.win || r.result || r.mid || "-",
            mid: r.mid != null ? String(r.mid) : "",
            win: r.win || "",
            type: "result-b",
          };
        });
        setLastResults(results);
      } catch {
        // ignore
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [gameId]);

  // ─── Bet click handler ───
  const handleBetClick = useCallback((value, selection, item, type) => {
    if (!value) return;
    setBetValue(value);
    // Trio Session shows the line (b/l) in the slip, but bets/settles at the
    // bhav-derived decimal (`value`). Every other market displays the same odds
    // it bets at.
    const display = (gameId === "trio" && Number(item?.sid) === 1)
      ? (parseFloat(type === "lay" ? item?.l : item?.b) || value)
      : value;
    setBetDisplayOdds(display);
    setBetType(type);
    setSelectedSelection(item?.nat || selection);
    setSelectedBetData(item);
    setShowPlaceBet(true);
    setStakeAmount("");
  }, [gameId]);

  const closeBetPanel = useCallback(() => setShowPlaceBet(false), []);

  // ─── Place bet with buffer + odds monitoring (matching tenexch) ───
  const handlePlaceBet = useCallback(async () => {
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) { toast.error("Enter a valid stake"); return; }
    if (!selectedBetData) return;

    const currentGstatus = (selectedBetData.gstatus || "").toUpperCase();
    if (currentGstatus === "SUSPENDED" || selectedBetData.gstatus === "0") {
      toast.error("Bet Not Confirm Reason Game Suspended.");
      return;
    }

    setPlacing(true);
    try {
      const selSid = selectedBetData._parentSid || selectedBetData.sid;
      const selName = selectedBetData.nat || "";
      const originalOdds = parseFloat(betValue) || 0;
      let latestOdds = originalOdds;
      let suspended = false;
      let suspendReason = "";

      // Buffer period: monitor odds & suspension
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          const gd = gameDataRef.current;
          if (!gd) return;
          const sub = gd?.data?.data?.sub || gd?.data?.sub || [];
          const lt = gd?.data?.data?.lt ?? gd?.data?.lt ?? 0;

          const currentItem = sub.find((s) => s.sid === selSid) || sub.find((s) => s.nat === selName);
          if (!currentItem) return;

          const gs = (currentItem.gstatus || "").toUpperCase();
          if (gs === "SUSPENDED" || currentItem.gstatus === "0") {
            suspended = true;
            suspendReason = "Bet Not Confirm Reason Game Suspended.";
            clearInterval(interval);
            resolve();
            return;
          }

          if (gs !== "OPEN" && lt <= 1) {
            suspended = true;
            suspendReason = "Bet Not Confirm Reason Game Suspended.";
            clearInterval(interval);
            resolve();
            return;
          }

          // For nested odds items (suit/oddeven/cards), look inside odds array
          let currentOdds;
          const nestedSid = selectedBetData._parentSid ? selectedBetData.sid : null;
          if (nestedSid && Array.isArray(currentItem.odds)) {
            const nestedOdd = currentItem.odds.find((o) => o.sno === nestedSid || o.sid === nestedSid);
            currentOdds = betTypeRef.current === "lay"
              ? (parseFloat(nestedOdd?.l) || 0)
              : (parseFloat(nestedOdd?.b) || 0);
          } else if (gameId === "trio" && Number(currentItem.sid) === 1) {
            // Trio Session (Fancy2): the real rate is bbhav/lbhav as profit-per-100
            // (decimal = bhav/100 + 1), NOT the b/l line. Must match how
            // BetTableTrio.handleBet priced the bet, or the monitor would overwrite
            // the stored odds with the raw b/l line (~21) and overpay settlement.
            const bhav = betTypeRef.current === "lay"
              ? parseFloat(currentItem.lbhav)
              : parseFloat(currentItem.bbhav);
            currentOdds = bhav > 0 ? bhav / 100 + 1 : 0;
          } else if (gameId === "patti2" && currentItem.subtype === "total") {
            // Total A/B (Fancy2): rate is in bbhav/lbhav as profit-per-100 →
            // decimal = bhav/100 + 1. Must match BetTablePatti2.TotalRow, else the
            // monitor would overwrite the stored odds with the raw b/l line (~15)
            // and overpay settlement.
            const bhav = betTypeRef.current === "lay"
              ? parseFloat(currentItem.lbhav)
              : parseFloat(currentItem.bbhav);
            currentOdds = bhav > 0 ? bhav / 100 + 1 : 0;
          } else {
            currentOdds = betTypeRef.current === "lay"
              ? (parseFloat(currentItem.l) || 0)
              : (parseFloat(currentItem.b) || 0);
          }

          if (currentOdds > 0 && Math.abs(currentOdds - originalOdds) > 0.001) {
            const isFavorable = betTypeRef.current === "back"
              ? currentOdds >= originalOdds
              : currentOdds <= originalOdds;
            if (isFavorable) {
              latestOdds = currentOdds;
              setBetValue(currentOdds);
            } else {
              suspended = true;
              suspendReason = "Odds changed. Please try again.";
              clearInterval(interval);
              resolve();
              return;
            }
          }
        }, CHECK_INTERVAL_MS);

        setTimeout(() => { clearInterval(interval); resolve(); }, BUFFER_MS);
      });

      if (suspended) { toast.error(suspendReason); setPlacing(false); return; }

      // Build payload
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.id || "";
      const etype = (selectedBetData.etype || "match").toLowerCase();

      // Mogambo "3 Card Total" (Fancy2 line market): settle on — and book exposure
      // for — the specific size/line the user backed/laid, so tag the selection with
      // it ("3 Card Total 110"). back uses bbhav, lay uses lbhav. Scoped to mogambo
      // so other games' selection formats are untouched.
      let selectionName = selectedBetData.nat || "";
      if (gameId === "mogambo" && selectedBetData.subtype === "total") {
        const lineSize = betType === "lay" ? selectedBetData.lbhav : selectedBetData.bbhav;
        if (lineSize != null && lineSize !== "") {
          selectionName = `${selectionName} ${lineSize}`.trim();
        }
      }
      // Lottery (lottcard): the player picks a number under Single/Double/Triple.
      // Send it space-separated ("Single 2", "Double 2 5", "Tripple 1 0 5") so the
      // server settles it positionally against the drawn cards. Scoped to lottcard.
      if (gameId === "lottcard" && Array.isArray(selectedBetData.lotteryDigits) && selectedBetData.lotteryDigits.length) {
        selectionName = `${selectionName} ${selectedBetData.lotteryDigits.join(" ")}`.trim();
      }

      const payload = {
        userId: userId.toString(),
        player_name: selectedBetData.nat || "",
        gameId: matchId?.toString() || "",
        gameName: gameId || "",
        gtype: gameId || "",
        amount: amount,
        odds: latestOdds,
        selection: selectionName,
        roundId: matchId || 0,
        mtype: (etype === "fancy1" || etype === "fancy") ? "fancy" : etype,
        type: betType,
      };

      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        toast.success("Bet successfully placed");
        setShowPlaceBet(false);
        setSelectedBetData(null);
        setStakeAmount("");
        fetchExposure();
        fetchMyBets();
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
  }, [stakeAmount, selectedBetData, betValue, betType, matchId, gameId, fetchExposure, fetchMyBets, dispatch]);

  return {
    // Data
    gameData,
    tableData,
    iframeSrc,
    exposures,
    myBets,
    lastResults,
    matchId,
    roundId,
    gameName,
    timer,
    cardString,

    // Bet placement
    betValue,
    betDisplayOdds,
    betType,
    selectedSelection,
    selectedBetData,
    showPlaceBet,
    setShowPlaceBet,
    stakeAmount,
    setStakeAmount,
    placing,
    handleBetClick,
    handlePlaceBet,
    closeBetPanel,

    // Refetch helpers
    fetchExposure,
    fetchMyBets,
  };
}
