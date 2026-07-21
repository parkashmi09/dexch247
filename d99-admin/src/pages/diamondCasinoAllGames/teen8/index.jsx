import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router';
import { Link } from "react-router";
import styles from "./TeenPatti8.module.css";
import BetTableTeenPatti8 from "../../casinoComponents/betTableTeenPatti8";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import VideoBox from "../../casinoComponents/videoBox";
import RulesCard from "../../casinoComponents/rulesCard";
import MyBet from "../../casinoComponents/myBet";
import ResultTeen8 from "../resultui/resultTeen8/ResultTeen8";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function TeenPatti8() {
  const [gameData, setGameData] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  console.log("gameData", gameData);

  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedPlayerNameForApi, setSelectedPlayerNameForApi] = useState("Player A");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [rules, setRules] = useState([]);

  const [filteredData, setFilteredData] = useState([]);

  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);

    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (gameData) {
      const subData = gameData?.data?.data?.sub || [];

      // Map the data correctly:
      // sub[0-7]: Player 1-8 (Odds column)
      // sub[8-15]: Pair Plus 1-8 (Pair Plus column)
      // sub[16-23]: Total 1-8 (Total column)
      const mappedData = [];
      for (let i = 0; i < 8; i++) {
        const playerData = subData[i] || {}; // Player data (Odds)
        const pairPlusData = subData[i + 8] || {}; // Pair Plus data
        const totalData = subData[i + 16] || {}; // Total data

        mappedData.push({
          nat: playerData.nat || `Player ${i + 1}`,
          odds: playerData.b || 0,
          pairPlus: pairPlusData.b || 0,
          total: totalData.b || 0,
          gstatus: playerData.gstatus || "SUSPENDED",
          // Store full data for each column
          oddsData: playerData,
          pairPlusData: pairPlusData,
          totalData: totalData,
        });
      }
      setFilteredData(mappedData);
    }
  }, [gameData]);

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

  const handleBetClick = (value, playerName, betData = null) => {
    setBetValue(value);
    setSelectedPlayer(playerName);
    setSelectedSelection(playerName);
    setSelectedBetData(betData || { b: value, nat: playerName });
    setSelectedPlayerNameForApi("Player A");
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setBetValue("");
    setSelectedPlayer("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setSelectedPlayerNameForApi("Player A");
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

  // Fetch exposure on mount and periodically with debounce
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

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="TEENPATTI OPEN"
            roundId={gameData?.data?.data?.mid || "157250124095658"}
            placedBetCount={myBets.length}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
                gameType={extractCasinoGame(pathname)}
                resultData={gameData?.data?.data?.card}
              />

              <div className={styles.tableContainer}>
                <div className={styles.table}>
                  <BetTableTeenPatti8
                    data={filteredData}
                    onBetClick={handleBetClick}
                    exposures={exposures}
                  />
                </div>
              </div>

              <div className={styles.heading}>
                <div>Last Result</div>
                <Link to="/casino/results">
                  <div className={styles.viewAll}>View All</div>
                </Link>
              </div>

              <ResultTeen8 data={gameData?.data?.lrs || []} gameData={gameData} />
            </>
          )}
          {activeTab === "placedBet" && (
            <div className={styles.mobileMyBetContainer}>
              <MyBet bets={myBets} />
            </div>
          )}
        </div>


        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
          <>
            {betValue && (
              <PlaceBet
                betValue={betValue}
                playerName={selectedPlayer}
                playerNameForApi={selectedPlayerNameForApi}
                gameId={gameData?.data?.data?.mid?.toString() || "98765"}
                gameName="teen8"
                roundId={gameData?.data?.data?.mid || 0}
                selection={selectedSelection}
                betData={selectedBetData}
                setShowPlaceBet={setShowPlaceBet}
                onBetPlaced={handleBetPlaced}
              />
            )}
          </>
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
            <RulesCard subHeader="Pair Plus" rules={rules} />
          </div>
        </div>

      </div>
    </>
  );
}
