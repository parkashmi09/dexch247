import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client"

import { Link } from "react-router"
import { useState, useEffect, useCallback } from "react"
import { useLocation } from 'react-router';
import styles from "./Poison.module.css"
import CasinoHeading from "../../casinoComponents/casinoHeading"
import BetTablePoison from "../../casinoComponents/betTablePoison"
import VideoBox from "../../casinoComponents/videoBox"
import cardPattiBack from '../../../assets/img/card/patti_back.jpg'
import MyBet from "../../casinoComponents/myBet";
import ResultPoison from "../resultui/resultPoison/ResultPoison";

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

// Helper function to parse card string for Poison game
// Format: "7SS,7HH,1,1,1,1,1" where first is Poison, then Player A (3), then Player B (3)
const parsePoisonCards = (cardString) => {
  if (!cardString) return { poison: null, playerA: [], playerB: [] };

  const cards = cardString.split(",").map(t => t.trim());

  // First card is Poison
  const poisonCard = cards[0] && cards[0] !== "1" && cards[0] !== "0"
    ? `/assets/img/tablecard/${cards[0]}.jpg`
    : null;

  // Player A: indices 1, 2, 3
  const playerACards = [1, 2, 3].map(i => {
    const card = cards[i];
    if (!card || card === "1" || card === "0") return cardPattiBack;
    return `/assets/img/tablecard/${card}.jpg`;
  });

  // Player B: indices 4, 5, 6
  const playerBCards = [4, 5, 6].map(i => {
    const card = cards[i];
    if (!card || card === "1" || card === "0") return cardPattiBack;
    return `/assets/img/tablecard/${card}.jpg`;
  });

  return {
    poison: poisonCard,
    playerA: playerACards,
    playerB: playerBCards
  };
};

export default function Poison() {
  const [gameData, setGameData] = useState([])

  console.log("gameData", gameData)
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

  let { pathname } = useLocation();

  useEffect(() => {
    let name = extractCasinoGame(pathname)
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`)
    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("poison");
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
              const keys = createExposureKeys(teamName);
              keys.forEach(key => {
                if (key) exposureMap[key] = exposureAmount;
              });
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
              const keys = createExposureKeys(selection);
              keys.forEach(key => {
                if (key) exposureMap[key] = exposureAmount;
              });

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

  // Parse cards from gameData
  const cardString = gameData?.data?.data?.card || "";
  const parsedCards = parsePoisonCards(cardString);

  const playerA = {
    cards: parsedCards.playerA,
  }

  const playerB = {
    cards: parsedCards.playerB,
  }

  const placedBetCount = myBets.length;
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "174251219183834";
  const gameId = roundId?.toString() || "174251219183834";
  const gameName = extractCasinoGame(pathname) || "poison";
  const playerNameForApi = selectedSelection;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="POISON"
            roundId={roundId}
            placedBetCount={placedBetCount}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                gameType="poison"
                resultData={cardString}
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
                poisonCard={parsedCards.poison}
                playerA={playerA}
                playerB={playerB}
              />

              <div className={styles.tableContainer}>
                <BetTablePoison
                  data={tableData}
                  onBetClick={handleBetClick}
                  exposures={exposures}
                  myBets={myBets}
                />
              </div>

              <div className={styles.heading}>
                <div>Last Result</div>
                <Link to="/casino/results">
                  <div className={styles.viewAll}>View All</div>
                </Link>
              </div>

              <ResultPoison
                data={[]}
                gameData={gameData}
                playerA={playerA}
                playerB={playerB}
                poisonCard={parsedCards.poison}
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
    </>
  )
}
