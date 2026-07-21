import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client";

import { NavLink } from "react-router";
import { useState, useEffect, useCallback } from "react";
import styles from "./DragonTiger202.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableDragon from "../../casinoComponents/betTableDragon";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import ResultDragonTiger202 from "../resultui/resultDragonTiger202/ResultDragonTiger202";

export default function DragonTiger202() {
  const [gameData, setGameData] = useState(null);
  const [betValue, setBetValue] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [selectedSelection, setSelectedSelection] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [showPlaceBet, setShowPlaceBet] = useState(false);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await getCasinoGameDetails("dt202");
        setGameData(data);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, []);

  const subData = gameData?.data?.data?.sub || gameData?.data?.sub || [];

  // Callback function to handle click on betting options
  const handleBetClick = (label, value, betData) => {
    setBetValue(value);
    setSelectedBetData(betData);
    setSelectedSelection(betData?.nat || label);
    setShowPlaceBet(true);
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || gameData?.mid?.toString();

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
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || gameData?.mid?.toString();

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
    const matchId = gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || gameData?.mid?.toString();
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
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid, fetchExposure, fetchMyBetsData]);

  const handleBetPlaced = () => {
    setBetValue("");
    setSelectedBetData(null);
    setSelectedSelection("");
    setShowPlaceBet(false);
    fetchExposure();
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Player data for VideoBox
  const playerA = {
    cards: [card1, card2, card3],
  };

  const playerB = {
    cards: [cardPattiBack, cardPattiBack, cardPattiBack],
  };

  const iframeSrc = "https://livestream-v3-iframe.akamaized.uk/casinoStream?id=dt202&key=scoreswift.in";

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading 
            name="DRAGON TIGER 202" 
            roundId={gameData?.mid || "157250124095658"}
            placedBetCount={myBets.length}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <div><VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} /></div>

              <div className={styles.tableContainer}>
                <BetTableDragon data={subData} onBetClick={handleBetClick} exposures={exposures} myBets={myBets} />
              </div>

              <div className={styles.heading}>
                <div>Last Result</div>
                <NavLink to="/casino/results">
                  <div className={styles.viewAll}>View All</div>
                </NavLink>
              </div>

              <ResultDragonTiger202 
                data={gameData?.lrs || []}
                gameData={gameData}
              />
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
              playerName={selectedSelection}
              playerNameForApi={selectedBetData?.nat || selectedSelection}
              setShowPlaceBet={setShowPlaceBet}
              gameId={gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || gameData?.mid?.toString() || "98765"}
              gameName="dt202"
              roundId={gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || 0}
              selection={selectedSelection}
              betData={selectedBetData}
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
