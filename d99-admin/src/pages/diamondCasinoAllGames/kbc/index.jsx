import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import BetTableKBC from "../../casinoComponents/betTableKBC";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import Result from "../Result/Result";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import styles from "./Kbc.module.css";
import MyBet from "../../casinoComponents/myBet";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Kbc() {
  const [gameData, setGameData] = useState(null);
  const [betValue, setBetValue] = useState("");
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    const fetchGameData = async () => {
      try {
        const resp = await getCasinoGameDetails(name);
        setGameData(resp);
      } catch (err) {
        console.error("Error fetching KBC game data:", err);
      }
    };
    fetchGameData();
    const timer = setInterval(fetchGameData, 1500);
    return () => clearInterval(timer);
  }, [pathname]);

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
            type: bet.type || null,
            selection: bet.selection || bet.player_name || "",
            teamName: bet.player_name || bet.selection || ""
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

  const handleBetClick = (value, label, type, betData) => {
    setBetValue(value);
    setSelectedPlayerName(label);
    setSelectedSelection(betData?.nat || label);
    setSelectedBetData(betData);
    setBetType(type);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setSelectedPlayerName("");
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
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "0";
  const gameId = roundId?.toString() || "98765";
  const gameNameForApi = extractCasinoGame(pathname) || "kbc";
  const playerNameForApi = selectedPlayerName;

  const playerA = { cards: [card1, card2, card3] };
  const playerB = { cards: [cardPattiBack, cardPattiBack, cardPattiBack] };
  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];
  const betTableData = gameData?.data?.data?.sub || [];

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name="KBC"
          roundId={roundId}
          placedBetCount={placedBetCount}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeTab === "game" && (
          <>
            <VideoBox
              playerA={playerA}
              playerB={playerB}
              iframeSrc="https://livestream-v3-iframe.akamaized.uk/casinoStream?id=teen41&key=scoreswift.in"
              timerValue={gameData?.data?.data?.lt}
            />
            <div className={styles.tableContainer}>
              <BetTableKBC 
                data={betTableData} 
                onBetClick={handleBetClick}
                exposures={exposures}
                myBets={myBets}
              />
            </div>
            <div className={styles.heading}>
              <div>Last Result</div>
              <Link to="/casino/results">
                <div style={{ cursor: "pointer" }}>View All</div>
              </Link>
            </div>
            <Result data={resultdata} />
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
            playerName={selectedPlayerName}
            playerNameForApi={playerNameForApi}
            betType={betType && betType.trim() !== "" ? betType : undefined}
            setShowPlaceBet={setShowPlaceBet}
            gameId={gameId}
            gameName={gameNameForApi}
            roundId={roundId}
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
