import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router';
import { Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./Trio.module.css";
import BetTableTrio from "../../casinoComponents/betTableTrio";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import MyBet from "../../casinoComponents/myBet";
import ResultTrio from "../resultui/resultTrio/ResultTrio";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

const playerA = {
  cards: [card1, card2, card3],
};

const playerB = {
  cards: [cardPattiBack, cardPattiBack, cardPattiBack],
};

export default function Trio() {
  const [gameData, setGameData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [data1, setData1] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  const { pathname } = useLocation();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("trio");
        setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (gameData) {
      const subData = gameData?.data?.data?.sub || gameData?.data?.sub || [];
      setData1(subData);
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
            if (teamName) {
              // Store with original case
              exposureMap[teamName] = exposureAmount;
              // Store with lowercase
              exposureMap[teamName.toLowerCase().trim()] = exposureAmount;
              // Store with trimmed version
              exposureMap[teamName.trim()] = exposureAmount;
              // Store with lowercase trimmed
              exposureMap[teamName.toLowerCase()] = exposureAmount;
            }
          });
          setExposures(exposureMap);
        }
      }
    } catch (error) {
      console.error('Error fetching exposure:', error);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid]);

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
            type: bet.type || null
          }));
          setMyBets(formattedBets);
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid]);

  useEffect(() => {
    if (gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid) {
      fetchExposure();
      fetchMyBetsData();
      const exposureInterval = setInterval(() => {
        fetchExposure();
        fetchMyBetsData();
      }, 2000);
      return () => clearInterval(exposureInterval);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid, fetchExposure, fetchMyBetsData]);

  const handleBetClick = (value, betName, type, betData) => {
    if (!value) return;
    setBetValue(value);
    setSelectedPlayer(betName);
    setSelectedSelection(betData?.nat || betName);
    setSelectedBetData(betData);
    setBetType(type);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setSelectedPlayer("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setBetType("");
    fetchExposure();
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const placedBetCount = myBets.length;
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658";
  const gameId = roundId?.toString() || "157250124095658";
  const gameName = extractCasinoGame(pathname) || "trio";
  const playerNameForApi = selectedPlayer;

  return (
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
            <VideoBox playerA={playerA} playerB={playerB} iframeSrc={`https://casino-stream.softgamingapi.com/casino-tv?id=${gameName}`} timerValue={gameData?.data?.data?.lt} />

            <div className={styles.tableContainer}>
              <div style={{ width: "100%" }}>
                <BetTableTrio 
                  data={data1} 
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

            <ResultTrio
              data={[]}
              gameData={gameData}
              playerA={playerA}
              playerB={playerB}
            />
          </>
        )}
        {activeTab === "placedBet" && (
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
          </div>
        )}
      </div>

      <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
        {betValue && selectedBetData && (
          <PlaceBet
            betValue={betValue}
            playerName={selectedPlayer}
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
  );
}
