import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client"

import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./Sicbo.module.css";
import BetTableSicbo from "../../casinoComponents/betTableSicbo";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import Result from "../Result/Result";
import MyBet from "../../casinoComponents/myBet";

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

export default function Sicbo() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [betType, setBetType] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  const { pathname } = useLocation();

  const gameName = "Sicbo";

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
        setSubData(response?.data?.data?.sub || []);
      } catch (err) {
        console.error("Error fetching game data: ", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (gameData) {
      const subData = gameData?.data?.data?.sub || [];
      setSubData(subData);
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
    if (!gameData) return;
    const matchId = gameData?.data?.data?.mid?.toString() ||
      gameData?.data?.mid?.toString() ||
      gameData?.mid?.toString();

    if (matchId) {
      fetchExposure();
      const interval = setInterval(fetchExposure, 2000);
      return () => clearInterval(interval);
    }
  }, [gameData, fetchExposure]);

  const fetchMyBetsData = useCallback(async () => {
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
    if (!gameData) return;
    const matchId = gameData?.data?.data?.mid?.toString() ||
      gameData?.data?.mid?.toString() ||
      gameData?.mid?.toString();

    if (matchId) {
      fetchMyBetsData();
      const interval = setInterval(fetchMyBetsData, 2000);
      return () => clearInterval(interval);
    }
  }, [gameData, fetchMyBetsData]);

  const handleBetClick = (betData) => {
    if (!betData || !betData.b) return;
    setBetValue(betData.b);
    setBetType("back"); // Default to back for sicbo
    setSelectedSelection(betData?.nat || "");
    setSelectedBetData(betData);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setBetType("");
    setSelectedSelection("");
    setSelectedBetData(null);
    // Fetch exposure and my bets after bet placement
    fetchExposure();
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Parse result data from API
  const parseResultData = () => {
    if (!gameData?.data?.data?.card) return [];
    const cardString = gameData.data.data.card;
    // For sicbo, card format is "1,1,1" (three dice values)
    // Convert to display format - could be simplified or formatted differently
    const diceValues = cardString.split(",").map(v => v.trim());
    // Return as array for Result component - you may need to adjust format
    return diceValues.length > 0 ? diceValues : [];
  };

  const resultdata = parseResultData();
  const placedBetCount = myBets.length;
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658";
  const gameId = roundId?.toString() || "157250124095658";
  const gameNameForApi = extractCasinoGame(pathname) || "sicbo";
  const playerNameForApi = selectedSelection;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name={gameName.toUpperCase()}
            roundId={roundId}
            placedBetCount={placedBetCount}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
                gameType="sicbo"
                resultData={gameData?.data?.data?.card}
              />

              <div className={styles.tableContainer}>
                <div style={{ width: "100%" }}>
                  <BetTableSicbo
                    data={subData}
                    onBetClick={handleBetClick}
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
              </div>

              <div className={styles.heading}>
                <div>Last Result</div>
                <Link to="/casino/results">
                  <div style={{ cursor: "pointer" }}>View All</div>
                </Link>
              </div>
              <Result data={resultdata} gameType="sicbo" />
            </>
          )}

          {activeTab === "placedBet" && (
            <div className={styles.myBetContainerMobie}>
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
              gameName={gameNameForApi}
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
  );
}
