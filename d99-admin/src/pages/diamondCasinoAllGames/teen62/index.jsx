import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

import { Link } from "react-router"
import { useState, useEffect, useCallback } from "react"
import { useLocation } from 'react-router';
import styles from "./TeenPatti62.module.css"
import CasinoHeading from "../../casinoComponents/casinoHeading"
import BetTableTeenPatti62 from "../../casinoComponents/betTableTeenPatti62"
import VideoBox from "../../casinoComponents/videoBox"
import cardPattiBack from '../../../assets/img/card/patti_back.jpg'
import MyBet from "../../casinoComponents/myBet";
import ResultTeen62 from "../resultui/resultTeen62/ResultTeen62";
import RulesLayout from "../../../components/rulesLayout";
import Teen62Rules from "./Teen62Rules";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Helper function to normalize string for matching
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// Helper function to create all exposure key variations
const createExposureKeys = (selection) => {
  if (!selection) return [];
  const keys = [
    selection,
    selection.toLowerCase(),
    selection.toLowerCase().trim(),
    selection.trim(),
    normalizeString(selection),
  ];
  // Remove duplicates
  return [...new Set(keys.filter(k => k))];
};

export default function TeenPatti62() {
  const [gameData, setGameData] = useState([])
  const [betValue, setBetValue] = useState("")
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setiframesrc] = useState("")
  const [tableData, setTableData] = useState([]);
  const [betType, setBetType] = useState(""); // back or lay
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [showRulesModal, setShowRulesModal] = useState(false);

  let { pathname } = useLocation();

  useEffect(() => {
    let name = extractCasinoGame(pathname)
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`)
    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("teen62");
        setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };
    fetchGameData();
    const gameDataInterval = setInterval(fetchGameData, 1500);
    return () => clearInterval(gameDataInterval);
  }, [pathname]);

  useEffect(() => {
    if (gameData) {
      const subData = gameData?.data?.data?.sub || gameData?.data?.sub || [];
      const mappedData = subData.map((item) => ({
        ...item,
        nat: item.nat,
        gstatus: item.gstatus || "OPEN",
        mid: item.mid,
        sr: item.sr,
      }));
      // Sort by sr if available
      const sortedData = mappedData.sort((a, b) => (a.sr || 0) - (b.sr || 0));
      setTableData(sortedData);
    }
  }, [gameData]);

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString() ||
        gameData?.data?.mid?.toString() ||
        gameData?.mid?.toString();

      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response.success && response.data) {
          const exposureMap = {};
          response.data.forEach((item) => {
            const teamName = item.team_name || item.selection || item.player_name || "";
            const exposureAmount = parseFloat(item.exposure_amount) || 0;
            if (teamName && exposureAmount !== 0) {
              // Create keys for the team name as-is
              const keys = createExposureKeys(teamName);
              keys.forEach(key => {
                if (key) exposureMap[key] = exposureAmount;
              });

              // Note: We don't create keys for all card variations here because
              // that would show the same exposure on all cards. Instead, the bet table
              // will match "Odd"/"Even" exposure to the specific card that has a bet.
            }
          });
          setExposures(prev => ({ ...prev, ...exposureMap }));
        }
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid]);

  useEffect(() => {
    fetchExposure();
    const interval = setInterval(fetchExposure, 2000);
    return () => clearInterval(interval);
  }, [fetchExposure]);

  const fetchMyBets = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString() ||
        gameData?.data?.mid?.toString() ||
        gameData?.mid?.toString();

      if (userId && matchId) {
        const response = await getMyBets(userId, matchId);
        if (response.success && response.bets) {
          const formattedBets = response.bets.map((bet) => ({
            matchedBet: bet.player_name || bet.selection || "",
            odds: bet.odds || "0",
            stake: bet.stake || "0",
            type: bet.type || null,
            selection: bet.selection || bet.player_name || "",
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
          }));
          setMyBets(formattedBets);

          // Map exposure from myBets to exposures object with all key variations
          const exposureMap = {};
          response.bets.forEach((bet) => {
            const selection = bet.selection || bet.player_name || "";
            const exposureAmount = parseFloat(bet.exposer || bet.exposure_amount || "0") || 0;
            if (selection) {
              // Create keys for the base selection
              const keys = createExposureKeys(selection);
              keys.forEach(key => {
                if (key) exposureMap[key] = exposureAmount;
              });

              // Also create keys with bet type if selection doesn't already include it
              const betType = bet.type || "";
              if (betType && !selection.toLowerCase().includes(betType.toLowerCase())) {
                const selectionWithType = `${selection} ${betType}`;
                const typeKeys = createExposureKeys(selectionWithType);
                typeKeys.forEach(key => {
                  if (key) exposureMap[key] = exposureAmount;
                });
              }
            }
          });
          setExposures(prev => ({ ...prev, ...exposureMap }));
        }
      }
    } catch (error) {
      console.error("Error fetching my bets:", error);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid]);

  useEffect(() => {
    if (gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid) {
      fetchMyBets();
      const exposureInterval = setInterval(() => {
        fetchMyBets();
      }, 2000);
      return () => clearInterval(exposureInterval);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid, fetchMyBets]);

  const handleBetClick = (value, selection, item, type) => {
    if (!value) return;
    setBetValue(value)
    setBetType(type)
    setSelectedSelection(item?.nat || selection);
    setSelectedBetData(item);
    setShowPlaceBet(true)
  }

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setBetType("");
    setSelectedSelection("");
    setSelectedBetData(null);
    fetchExposure();
    fetchMyBets();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRulesClick = () => {
    setShowRulesModal(true);
  };

  const handleCloseRulesModal = () => {
    setShowRulesModal(false);
  };

  // Card Parsing Logic
  const cardString = gameData?.data?.data?.card || "";
  const cardTokens = cardString.split(",").map(t => t.trim());

  // Helper to map token to image
  const getCardImage = (token) => {
    if (!token || token === "1") return cardPattiBack;
    return `/assets/img/tablecard/${token}.jpg`;
  };

  // Player A: Indices 0, 2, 4
  const playerACards = [0, 2, 4].map(i => {
    const token = cardTokens[i];
    if (!token || token === "1" || token === "0") return cardPattiBack;
    return getCardImage(token);
  });

  // Player B: Indices 1, 3, 5
  const playerBCards = [1, 3, 5].map(i => {
    const token = cardTokens[i];
    if (!token || token === "1" || token === "0") return cardPattiBack;
    return getCardImage(token);
  });

  // Ensure always 3 cards and formatted for VideoBox
  const playerA = {
    cards: [...playerACards, cardPattiBack, cardPattiBack, cardPattiBack].slice(0, 3),
  }

  const playerB = {
    cards: [...playerBCards, cardPattiBack, cardPattiBack, cardPattiBack].slice(0, 3),
  }

  const placedBetCount = myBets.length;
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "1925251206";
  const gameId = roundId?.toString() || "1925251206";
  const gameName = extractCasinoGame(pathname) || "teen62";
  const playerNameForApi = selectedSelection;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="V VIP Teenpatti 1-day"
            roundId={roundId}
            placedBetCount={placedBetCount}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onRulesClick={handleRulesClick}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                gameType="teen62"
                resultData={cardString}
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
              />

              <div className={styles.tableContainer}>
                <BetTableTeenPatti62
                  data={tableData}
                  onBetClick={handleBetClick}
                  exposures={exposures}
                  myBets={myBets}
                />
              </div>

              <div className={styles.heading}>
                <div>Last Result</div>
                <Link to="/casino/results/teen62">
                  <div className={styles.viewAll}>View All</div>
                </Link>
              </div>

              <ResultTeen62
                data={[]}
                gameData={gameData}
                playerA={playerA}
                playerB={playerB}
              />
            </>
          )}
          {activeTab === "placedBet" && (
            <div className={styles.mobileMyBetContainer}>
              <MyBet bets={myBets} />
            </div>
          )}
        </div>
        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
          {betValue && selectedBetData && (
            <PlaceBet
              betValue={betValue}
              playerName={selectedSelection}
              playerNameForApi={playerNameForApi}
              setShowPlaceBet={setShowPlaceBet}
              gameId={gameId}
              gameName={gameName}
              roundId={roundId}
              selection={selectedSelection}
              betData={selectedBetData}
              betType={betType}
              onBetPlaced={handleBetPlaced}
            />
          )}
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <RulesLayout
        show={showRulesModal}
        onHide={handleCloseRulesModal}
        title="V VIP Teenpatti 1-day"
      >
        <Teen62Rules />
      </RulesLayout>
    </>
  )
}
