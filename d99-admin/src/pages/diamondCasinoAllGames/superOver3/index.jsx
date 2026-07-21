import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./SuperOver3.module.css";
import BetTableSuper3 from "../../casinoComponents/betTableSuper3";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import ResultSuperOver3 from "../resultui/resultSuperOver3/ResultSuperOver3";
import MyBet from "../../casinoComponents/myBet";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function SuperOver3() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [betType, setBetType] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  const { pathname } = useLocation();
  const gameName = "Goals Betting";

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.t1?.gmid?.toString() ||
        gameData?.data?.data?.mid?.toString() ||
        gameData?.data?.mid?.toString() ||
        gameData?.mid?.toString();

      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response.success && response.data) {
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
  }, [gameData]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.t1?.gmid?.toString() ||
        gameData?.data?.data?.mid?.toString() ||
        gameData?.data?.mid?.toString() ||
        gameData?.mid?.toString();

      if (userId && matchId) {
        const response = await getMyBets(userId, matchId);
        if (response.success && response.bets) {
          const formattedBets = response.bets.map((bet) => ({
            matchedBet: bet.player_name || bet.selection || "",
            odds: bet.odds || "0",
            stake: bet.stake || "0",
            type: bet.type || null
          }));
          setMyBets(formattedBets);
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData]);

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
        setSubData(response?.data?.data?.t2 || []);
      } catch (err) {
        console.error("Error fetching game data: ", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (!gameData) return;
    
    const matchId = gameData?.data?.data?.t1?.gmid?.toString() ||
      gameData?.data?.data?.mid?.toString() ||
      gameData?.data?.mid?.toString() ||
      gameData?.mid?.toString();
    
    if (matchId) {
      // Initial fetch
      fetchExposure();
      fetchMyBetsData();
      
      // Set up interval for periodic updates
      const exposureInterval = setInterval(() => {
        fetchExposure();
        fetchMyBetsData();
      }, 2000);
      
      return () => clearInterval(exposureInterval);
    }
  }, [gameData, fetchExposure, fetchMyBetsData]);

  const handleBetClick = (value, label, type, betData) => {
    setBetValue(value);
    setSelectedPlayer(label);
    setSelectedSelection(betData?.nat || label);
    setSelectedBetData(betData);
    // Type is now directly "back" or "lay" from BetTableSuper3
    setBetType(type || "back");
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setSelectedPlayer("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setBetType("");
    // Fetch exposure and my bets after bet placement
    fetchExposure();
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];
  const roundId = gameData?.data?.data?.t1?.gmid || gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658";
  const gameId = roundId?.toString() || "98765";
  const playerNameForApi = selectedPlayer;

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name={gameName.toUpperCase()}
          roundId={roundId}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeTab === "game" && (
          <>
            <VideoBox 
              iframeSrc={iframeSrc} 
              timerValue={gameData?.data?.data?.lt} 
              gameType="superover3"
              resultData={gameData?.data?.data?.t1?.card || gameData?.data?.data?.card}
            />

            <div className={styles.tableContainer}>
              <BetTableSuper3 
                onBetClick={handleBetClick} 
                data={subData}
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

            <ResultSuperOver3 
              data={resultdata}
              gameData={gameData}
            />
          </>
        )}
        {activeTab === "placedBet" && (
          <div className={styles.myBetMobileContainer}>
            <MyBet bets={myBets} />
          </div>
        )}
      </div>

      <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ""}`}>
        {betValue && selectedBetData && (
          <PlaceBet
            betValue={betValue}
            playerName={selectedPlayer}
            playerNameForApi={playerNameForApi}
            setShowPlaceBet={setShowPlaceBet}
            gameId={gameId}
            gameName="superover3"
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
  );
}
