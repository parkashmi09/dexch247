
"use client";

import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./Lucky7C.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableLucky7 from "../../casinoComponents/betTableLucky7";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import ResultLucky7 from "../resultui/resultLucky7/ResultLucky7";
import { getCasinoGameDetails, getMyBets } from '../../../apiservices/CasionApi';

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

function transformLucky7CData(sub) {
  const find = (name) => sub.find((item) => item.nat?.toLowerCase() === name.toLowerCase());

  return {
    b: sub.every((item) => item.b === 0) ? 0 : 1,
    lowCardData: find("Low Card") || {},
    highCardData: find("High Card") || {},
    evenData: find("Even") || {},
    oddData: find("Odd") || {},
    redData: find("Red") || {},
    blackData: find("Black") || {},
    cardGroupsData: [
      { odds: find("Line 1")?.b || "-", cards: ["A", "2", "3"] },
      { odds: find("Line 2")?.b || "-", cards: ["4", "5", "6"] },
      { odds: find("Line 3")?.b || "-", cards: ["8", "9", "10"] },
      { odds: find("Line 4")?.b || "-", cards: ["J", "Q", "K"] },
    ],
    bottomCards: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  };
}

export default function Lucky7() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState({});
  const [activeTab, setActiveTab] = useState("game");
  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [myBets, setMyBets] = useState([]);
  const [exposures, setExposures] = useState({});
  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);

        const sub = response?.data?.data?.sub || [];
        const transformed = transformLucky7CData(sub);
        setSubData(transformed);
      } catch (err) {
        console.error("Error fetching Lucky 7 game data: ", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  // When a bet button clicked in BetTableLucky7
  const handleBetClick = (value, playerName, betType, betData) => {
    setBetValue(value);
    setSelectedPlayer(playerName);
    setSelectedSelection(betData?.nat || playerName);
    setSelectedBetData(betData);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setBetValue("");
    setSelectedPlayer("");
    setSelectedSelection("");
    setSelectedBetData(null);
    fetchMyBetsData();
  };

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
            type: bet.type || null,
            selection: bet.selection || bet.player_name || "",
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
          }));
          setMyBets(formattedBets);

          // Map exposure from myBets to exposures object
          const exposureMap = {};
          response.bets.forEach((bet) => {
            const selection = bet.selection || bet.player_name || "";
            const exposureAmount = parseFloat(bet.exposer || bet.exposure_amount || "0") || 0;
            if (selection && exposureAmount !== 0) {
              // Add the selection as-is
              exposureMap[selection] = exposureAmount;
              // Also add normalized versions for matching
              exposureMap[selection.trim()] = exposureAmount;
              exposureMap[selection.toLowerCase().trim()] = exposureAmount;
              exposureMap[selection.toLowerCase()] = exposureAmount;
            }
          });
          setExposures(exposureMap);
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
      fetchMyBetsData();
    }, 2000);

    const intervalId = setInterval(() => {
      fetchMyBetsData();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchMyBetsData, gameData?.mid, gameData?.data?.data?.mid, gameData?.data?.mid]);

  const playerA = {
    cards: [card1, card2, card3],
  };

  const playerB = {
    cards: [cardPattiBack, cardPattiBack, cardPattiBack],
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name="LUCKY 7"
          roundId={gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658"}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {activeTab === "game" && (
          <>
            <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />

            <div className={styles.tableContainer}>
              <BetTableLucky7
                data={subData}
                sub={gameData?.data?.data?.sub || []}
                onBetClick={handleBetClick}
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

            <ResultLucky7
              data={gameData?.lrs || []}
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

      <div className={`${styles.placeBet} ${betValue ? styles.visible : ''}`}>
        {betValue && (
          <PlaceBet
            betValue={betValue}
            playerName={selectedPlayer}
            playerNameForApi={selectedBetData?.nat || selectedPlayer}
            gameId={gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || gameData?.mid?.toString() || "98765"}
            gameName="lucky7c"
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
