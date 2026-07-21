import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client";

import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./Poker.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import VideoBox from "../../casinoComponents/videoBox";

import MyBet from "../../casinoComponents/myBet";
import PokerRulesCard from "../../casinoComponents/pokerRulesCard";
import BetTablePoker from "../../casinoComponents/betTablePoker";
import ResultPoker from "../resultui/resultPoker/ResultPoker";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Poker() {
  const [gameData, setGameData] = useState(null);
  const [activeTab, setActiveTab] = useState("game");
  const [subData, setSubData] = useState([]);
  const [playerAData, setPlayerAData] = useState({});
  const [playerBData, setPlayerBData] = useState({});
  const [betValue, setBetValue] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);

  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedPlayerNameForApi, setSelectedPlayerNameForApi] = useState("Player A");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState("back");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [rules, setRules] = useState([]);

  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);


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
    if (subData.length >= 6) {
      // Extract Player A match data (sub[0])
      const playerAMatch = subData[0] || {};
      // Extract Player B match data (sub[1])
      const playerBMatch = subData[1] || {};
      // Extract Player A bonus data (sub[2] and sub[3])
      const playerA2Card = subData[2] || {};
      const playerA7Card = subData[3] || {};
      // Extract Player B bonus data (sub[4] and sub[5])
      const playerB2Card = subData[4] || {};
      const playerB7Card = subData[5] || {};

      setPlayerAData({
        b: playerAMatch.b ?? 0,
        l: playerAMatch.l ?? 0,
        nat: playerAMatch.nat ?? "Player A",
        gstatus: playerAMatch.gstatus,
        bonus2Card: playerA2Card.b ?? 0,
        bonus2CardStatus: playerA2Card.gstatus,
        bonus2CardNat: playerA2Card.nat ?? "Player A 2 card Bonus",
        bonus7Card: playerA7Card.b ?? 0,
        bonus7CardStatus: playerA7Card.gstatus,
        bonus7CardNat: playerA7Card.nat ?? "Player A 7 card bonus",
        // Store full API data objects for betData
        matchData: playerAMatch,
        bonus2CardData: playerA2Card,
        bonus7CardData: playerA7Card,
      });

      setPlayerBData({
        b: playerBMatch.b ?? 0,
        l: playerBMatch.l ?? 0,
        nat: playerBMatch.nat ?? "Player B",
        gstatus: playerBMatch.gstatus,
        bonus2Card: playerB2Card.b ?? 0,
        bonus2CardStatus: playerB2Card.gstatus,
        bonus2CardNat: playerB2Card.nat ?? "Player B 2 card Bonus",
        bonus7Card: playerB7Card.b ?? 0,
        bonus7CardStatus: playerB7Card.gstatus,
        bonus7CardNat: playerB7Card.nat ?? "Player B 7 card bonus",
        // Store full API data objects for betData
        matchData: playerBMatch,
        bonus2CardData: playerB2Card,
        bonus7CardData: playerB7Card,
      });
    }
  }, [subData]);

  // Extract rules from gameData if available
  useEffect(() => {
    const extractAndSetRules = () => {
      let extractedRules = [];
      if (gameData?.data?.data?.rules && Array.isArray(gameData.data.data.rules)) {
        extractedRules = gameData.data.data.rules;
      } else if (gameData?.data?.rules && Array.isArray(gameData.data.rules)) {
        extractedRules = gameData.data.rules;
      } else if (gameData?.rules && Array.isArray(gameData.rules)) {
        extractedRules = gameData.rules;
      }
      setRules(extractedRules);
    };
    extractAndSetRules();
  }, [gameData]);

  const handleBetClick = (value, selection, type = "back", betData = null) => {
    if (!value) return;
    setBetValue(value);
    // CRITICAL: Always use nat value from betData as selection - this must come from API
    // betData should always contain the full API object with nat field
    const selectionValue = betData?.nat || betData?.selection || selection;
    setSelectedSelection(selectionValue);
    setSelectedPlayerName(` ${selectionValue}`);
    setBetType(type);
    // Store the full betData object to ensure all API fields are available
    setSelectedBetData(betData || { nat: selectionValue });
    // Extract player name for API (Player A or Player B)
    const playerNameForApi = betData?.nat?.includes("Player A") ? "Player A" :
      betData?.nat?.includes("Player B") ? "Player B" :
        selectionValue?.includes("Player A") ? "Player A" : "Player B";
    setSelectedPlayerNameForApi(playerNameForApi);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setBetValue("");
    setSelectedPlayerName("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setSelectedPlayerNameForApi("Player A");
    setBetType("back");
    setShowPlaceBet(false);
    // Fetch exposure and my bets after bet placement
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response.success && response.data) {
          // Convert array to object keyed by team_name
          const exposureMap = {};
          response.data.forEach((item) => {
            exposureMap[item.team_name] = parseFloat(item.exposure_amount) || 0;
          });
          setExposures(exposureMap);
        }
      }
    } catch (error) {
      console.error('Error fetching exposure:', error);
    }
  }, [gameData?.data?.data?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMyBets(userId, matchId);
        if (response.success && response.bets) {
          // Map bets data to format needed for MyBet component
          const formattedBets = response.bets.map((bet) => ({
            matchedBet: bet.player_name || bet.selection || "",
            odds: bet.odds || "0",
            stake: bet.stake || "0",
            type: bet.type || null // Include type field for background color
          }));
          setMyBets(formattedBets);
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData?.data?.data?.mid]);

  // Fetch exposure and my bets on mount and periodically with debounce
  useEffect(() => {
    const matchId = gameData?.data?.data?.mid?.toString();
    if (!matchId) return;

    // Initial fetch after 2 seconds
    const timeoutId = setTimeout(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    // Periodic fetch every 2 seconds
    const intervalId = setInterval(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchExposure, fetchMyBetsData, gameData?.data?.data?.mid]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };



  const iframeStreamSrc =
    "https://livestream-v3-iframe.akamaized.uk/casinoStream?id=poker&key=scoreswift.in";

  const resultdata = ["A", "A", "B", "A", "A", "A", "B", "B"];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="POKER"
            roundId={gameData?.data?.data?.mid || "157250124095658"}
            placedBetCount={myBets.length}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                iframeSrc={iframeStreamSrc}
                timerValue={gameData?.data?.data?.lt}
                gameType="poker"
                resultData={gameData?.data?.data?.card}
              />
              <div className={styles.tableContainer}>
                <div className={styles.table}>
                  <BetTablePoker
                    data={playerAData}
                    playerLabel={playerAData.nat}
                    onBetClick={handleBetClick}
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
                <div className={styles.table}>
                  <BetTablePoker
                    data={playerBData}
                    playerLabel={playerBData.nat}
                    onBetClick={handleBetClick}
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
              </div>
              <div className={styles.playAndWin}>
                <div>Play & Win</div>
              </div>
              <div className={styles.heading}>
                <div>Last result</div>
                <Link to="/casino/results">
                  <div className={styles.viewAll}>View All</div>
                </Link>
              </div>
              <ResultPoker data={resultdata} gameData={gameData} />
            </>
          )}
          {activeTab === "placedBet" && (
            <div className={styles.mobileMyBetContainer}>
              <MyBet bets={myBets} />
            </div>
          )}
        </div>
        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ""}`}>
          {betValue && (
            <PlaceBet
              betValue={betValue}
              setShowPlaceBet={setShowPlaceBet}
              playerName={selectedPlayerName}
              playerNameForApi={selectedPlayerNameForApi}
              gameId={gameData?.data?.data?.mid?.toString() || "98765"}
              gameName="poker"
              roundId={gameData?.data?.data?.mid || 0}
              selection={selectedSelection}
              betData={selectedBetData}
              betType={betType}
              onBetPlaced={handleBetPlaced}
            />
          )}
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
            <PokerRulesCard subHeader="Bonus 1 (2 Cards Bonus)" rules={rules} />
          </div>
        </div>
      </div>
    </>
  );
}
