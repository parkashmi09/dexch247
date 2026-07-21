import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";


import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import styles from "./Poker20.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import { BetTablePoker20 } from "../../casinoComponents/betTablePoker20";
import VideoBox from "../../casinoComponents/videoBox";

import MyBet from "../../casinoComponents/myBet";
import ResultPoker20 from "../resultui/resultPoker20/ResultPoker20";


function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Poker20() {
  const [gameData, setGameData] = useState(null);
  const [activeTab, setActiveTab] = useState("game");
  const [subData, setSubData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedPlayerName, setSelectedPlayerName] = useState("Player");
  const [selectedPlayerNameForApi, setSelectedPlayerNameForApi] = useState("Player A");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [showPlaceBet, setShowPlaceBet] = useState(false);


  const { pathname } = useLocation();

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



  const handleBetClick = (value, selection, betData, tablePlayerName) => {
    setBetValue(value);
    setSelectedPlayerName(` ${selection}`);
    setSelectedSelection(selection);
    setSelectedBetData(betData);
    // Set player_name based on which table was clicked (A or B)
    setSelectedPlayerNameForApi(`Player ${tablePlayerName}`);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setBetValue("");
    setSelectedPlayerName("Player");
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



  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="20-20 POKER"
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
                gameType="poker20"
                resultData={gameData?.data?.data?.card}
              />

              <div className={styles.tableContainer}>
                <div className={styles.table}>
                  <BetTablePoker20
                    data={subData.slice(0, 9)}
                    onBetClick={(value, selection, betData) => handleBetClick(value, selection, betData, "A")}
                    exposures={exposures}
                  />
                </div>
                <div className={styles.table}>
                  <BetTablePoker20
                    data={subData.slice(0, 9)}
                    onBetClick={(value, selection, betData) => handleBetClick(value, selection, betData, "B")}
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

              <ResultPoker20 data={resultdata} gameData={gameData} />
            </>
          )}
          {activeTab === "placedBet" && (
            <div className={styles.mobileMyBetContainer}>
              <MyBet bets={myBets} />
            </div>
          )}
        </div>


        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ""}`}>
          {betValue && selectedBetData && (
            <PlaceBet
              betValue={betValue}
              playerName={selectedPlayerName}
              playerNameForApi={selectedPlayerNameForApi}
              setShowPlaceBet={setShowPlaceBet}
              gameId={gameData?.data?.data?.mid?.toString() || "98765"}
              gameName="poker20"
              roundId={gameData?.data?.data?.mid || 0}
              selection={selectedSelection}
              betData={selectedBetData}
              onBetPlaced={handleBetPlaced}
            />
          )}
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
            {/* <RulesCard subHeader="Pair Plus" rules={rules} /> */}
          </div>
        </div>

      </div>
    </>
  );
}
