
"use client";

import { NavLink } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";

import styles from "./DragonTiger6.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableDragon6 from "../../casinoComponents/betTableDragon6";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";

import { getCasinoGameDetails, getMyBets } from "../../../apiservices/CasionApi";
import ResultDragonTiger6 from "../resultui/resultDragonTiger6/ResultDragonTiger6";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function DragonTiger6() {
  const [gameData, setGameData] = useState(null);
  console.log(gameData,"gameData");
  const [betValue, setBetValue] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [selectedSelection, setSelectedSelection] = useState("");
  const [myBets, setMyBets] = useState([]);
  const [iframeSrc, setIframeSrc] = useState("");
  const [activeTab, setActiveTab] = useState("game");
  const [showPlaceBet, setShowPlaceBet] = useState(false);

  const [data1, setData1] = useState([]);
  let { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("dt6");
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

  // Callback function to handle click on betting options
  const handleBetClick = (label, value, type, betData) => {
    if (!value) return;
    setBetValue(value);
    setSelectedBetData(betData);
    setSelectedSelection(betData?.nat || label);
    setShowPlaceBet(true);
  };

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
      fetchMyBetsData();
    }, 2000);

    const intervalId = setInterval(() => {
      fetchMyBetsData();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid, fetchMyBetsData]);

  const handleBetPlaced = () => {
    setBetValue("");
    setSelectedBetData(null);
    setSelectedSelection("");
    setShowPlaceBet(false);
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading 
          name="DRAGON TIGER 6" 
          roundId={gameData?.mid || "157250124095658"}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeTab === "game" && (
          <>
            <VideoBox
              iframeSrc={iframeSrc}
              timerValue={gameData?.data?.data?.lt}
              gameType="dt6"
              resultData={gameData?.data?.data?.card}
            />

            <div className={styles.tableContainer}>
              <BetTableDragon6 data={data1} onBetClick={handleBetClick} />
            </div>

            <div className={styles.heading}>
              <div>Last Result</div>
              <NavLink to="/casino/results">
                <div className={styles.viewAll}>View All</div>
              </NavLink>
            </div>

            <ResultDragonTiger6 
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
            gameName="dt6"
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
  );
}
