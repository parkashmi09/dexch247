import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router';
import { Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import styles from "./Teen1.module.css";
import BetTableTeen1 from "../../casinoComponents/betTableTeen1";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import ResultTeen1 from "../resultui/resultTeen1/ResultTeen1";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

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

export default function Teen1() {
  const [gameData, setGameData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [betType, setBetType] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setiframesrc] = useState("");
  const [PlayerAscore, setPlayerAscore] = useState({});
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [selectedBetData, setSelectedBetData] = useState(null);

  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("teen1");
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
      const subData = gameData?.data?.data?.sub || [];

      if (subData.length >= 6) {
        const playerAScore = {
          pb: subData[0]?.b,
          pl: subData[0]?.l,
          db: subData[1]?.b,
          dl: subData[1]?.l,
          pu: subData[2]?.b,
          pd: subData[3]?.b,
          du: subData[4]?.b,
          dd: subData[5]?.b,
          // Pass full item objects for back/lay bets
          playerItem: subData[0] || {},
          dealerItem: subData[1] || {},
          // Pass full items for up/down bets
          playerUpItem: subData[2] || {},
          playerDownItem: subData[3] || {},
          dealerUpItem: subData[4] || {},
          dealerDownItem: subData[5] || {},
        };
        setPlayerAscore(playerAScore);
      }
    }
  }, [gameData]);

  const handleBetClick = (value, selection, item, type) => {
    if (!value) return;
    setBetValue(value);
    setPlayerName(selection);
    setBetType(type);
    setSelectedBetData(item || { value, selection, type });
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setShowPlaceBet(false);
    setBetValue("");
    setPlayerName("");
    setBetType("");
    setSelectedBetData(null);
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
            type: bet.type || null, // Include type field for background color
            selection: bet.selection || bet.player_name || "",
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
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
  }, [gameData?.data?.data?.mid, fetchExposure, fetchMyBetsData]);

  const gameName = "1 CARD ONE-DAY";

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading name={gameName.toUpperCase()} roundId="157250124095658" />
        <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />
        <div className={styles.tableContainer}>
          <div style={{ width: "100%" }}>
            <BetTableTeen1 
              data={PlayerAscore} 
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
        <ResultTeen1
          data={[]}
          gameData={gameData}
          playerA={playerA}
          playerB={playerB}
        />
      </div>
      <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
        {betValue && selectedBetData && (
          <PlaceBet
            betValue={betValue}
            playerName={playerName}
            playerNameForApi={selectedBetData?.nat || playerName}
            setShowPlaceBet={setShowPlaceBet}
            gameId={gameData?.data?.data?.mid?.toString() || "98765"}
            gameName="teen1"
            roundId={gameData?.data?.data?.mid || 0}
            selection={selectedBetData?.nat || playerName}
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
