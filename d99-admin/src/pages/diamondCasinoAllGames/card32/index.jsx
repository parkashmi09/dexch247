import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";
"use client";

import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./Card32.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableCard32 from "../../casinoComponents/BetTableCard32";
import VideoBox from "../../casinoComponents/videoBox";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import MyBet from "../../casinoComponents/myBet";
import ResultCard32 from "../resultui/resultCard32/ResultCard32";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Card32() {
  const [gameData, setGameData] = useState(null);

  const [betValue, setBetValue] = useState("");
  const [betType, setBetType] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [iframeSrc, setiframesrc] = useState("");
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  let { pathname } = useLocation();

  useEffect(() => {
    let name = extractCasinoGame(pathname);
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("card32");
        setGameData(response);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchGameData();
    const gameDataInterval = setInterval(fetchGameData, 1500);
    return () => clearInterval(gameDataInterval);
  }, [pathname]);

  useEffect(() => {
    if (gameData) {
      // Handle both response formats: direct sub array or nested in data.data.data
      const subData = gameData?.sub || gameData?.data?.data?.sub || gameData?.data?.sub || [];
      setData1(subData[0] ? [subData[0]] : []);
      setData2(subData[1] ? [subData[1]] : []);
      setData3(subData[2] ? [subData[2]] : []);
      setData4(subData[3] ? [subData[3]] : []);
    }
  }, [gameData]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const placedBetCount = myBets.length;
  const roundId = gameData?.mid || gameData?.data?.data?.mid || gameData?.data?.mid || "157250124095658";

  const playerA = { cards: [card1, card2, card3] };
  const playerB = { cards: [cardPattiBack, cardPattiBack, cardPattiBack] };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="32 CARDS A"
            roundId={roundId}
            placedBetCount={placedBetCount}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          {activeTab === "game" && (
            <>
              <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />
              <div className={styles.tableContainer}>
                <div className={styles.table}>
                  <BetTableCard32
                    data={[data1, data2]}
                    onBetClick={handleBetClick}
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
                <div className={styles.table}>
                  <BetTableCard32
                    data={[data3, data4]}
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
              <ResultCard32 
                data={gameData?.lrs || []}
                gameData={gameData}
              />
            </>
          )}
          {activeTab === "placedBet" && (
            <div className={styles.myBetContainer}>
              <MyBet bets={myBets} />
            </div>
          )}
        </div>
        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ""}`}>
          {
            betValue && selectedBetData && (
              <PlaceBet
                betValue={betValue}
                setShowPlaceBet={setShowPlaceBet}
                playerName={playerName}
                playerNameForApi={selectedBetData?.nat || playerName}
                gameId={roundId?.toString() || "98765"}
                gameName="card32"
                roundId={roundId || 0}
                selection={selectedSelection}
                betData={selectedBetData}
                betType={betType}
                onBetPlaced={handleBetPlaced}
              />
            )
          }
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
          </div>
        </div>
      </div>
    </>
  );
}
