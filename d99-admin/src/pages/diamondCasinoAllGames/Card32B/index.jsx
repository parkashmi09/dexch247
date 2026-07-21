import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client";

import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import styles from "./Card32B.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableCard32B from "../../casinoComponents/BetTableCard32B";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import ResultCard32B from "../resultui/resultCard32B/ResultCard32B";

export default function Card32B() {
  const [gameData, setGameData] = useState(null);
  console.log(gameData,"gameData");
  const [betValue, setBetValue] = useState("");
  const [betType, setBetType] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await getCasinoGameDetails("card32eu");
        setGameData(data);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();
    const gameDataInterval = setInterval(fetchGameData, 1500);
    return () => clearInterval(gameDataInterval);
  }, []);

  const subData = gameData?.data?.data?.sub || gameData?.data?.sub || gameData?.sub || [];
  // Pass the entire sub array so BetTableCard32B can find data by nat name
  const bettingData = subData.length > 0 ? [subData] : [];

  const handleBetClick = (value, name, type, betData) => {
    setBetValue(value);
    setPlayerName(name);
    setBetType(type.toLowerCase().includes("back") ? "back" : "lay");
    setSelectedSelection(betData?.nat || name);
    setSelectedBetData(betData);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setPlayerName("");
    setBetType("");
    setSelectedSelection("");
    setSelectedBetData(null);
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.mid?.toString() || gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString();

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
  }, [gameData?.mid, gameData?.data?.data?.mid, gameData?.data?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.mid?.toString() || gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString();

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
  }, [gameData?.mid, gameData?.data?.data?.mid, gameData?.data?.mid]);

  useEffect(() => {
    const matchId = gameData?.mid?.toString() || gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString();
    if (!matchId) return;

    const timeoutId = setTimeout(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    const intervalId = setInterval(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchExposure, fetchMyBetsData, gameData?.mid, gameData?.data?.data?.mid, gameData?.data?.mid]);

  const playerA = {
    cards: [card1, card2, card3],
  };

  const playerB = {
    cards: [cardPattiBack, cardPattiBack, cardPattiBack],
  };

  const iframeSrc = "https://livestream-v3-iframe.akamaized.uk/casinoStream?id=card32eu&key=scoreswift.in";

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading name="32 CARDS B" roundId={gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658"} />
          <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />
          <div className={styles.tableContainer}>
            <div className={styles.table}>
              <BetTableCard32B 
                data={bettingData} 
                onBetClick={handleBetClick}
                exposures={exposures}
                myBets={myBets}
              />
            </div>
          </div>
          <div className={styles.heading}>
            <div>Last Result</div>
            <Link to="/casino/results">
              <div className={styles.viewAll}>View All</div>
            </Link>
          </div>
          <ResultCard32B 
            data={gameData?.lrs || []}
            gameData={gameData}
          />
        </div>
        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ""}`}>
          {betValue && selectedBetData && (
            <PlaceBet
              betValue={betValue}
              setShowPlaceBet={setShowPlaceBet}
              playerName={playerName}
              playerNameForApi={selectedBetData?.nat || playerName}
              gameId={gameData?.mid?.toString() || gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || "98765"}
              gameName="card32eu"
              roundId={gameData?.mid || gameData?.data?.data?.mid || gameData?.data?.mid || 0}
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
