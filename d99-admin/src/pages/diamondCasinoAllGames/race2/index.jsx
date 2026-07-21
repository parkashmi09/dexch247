import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./Race2.module.css";
import BetTableRace2 from "../../casinoComponents/betTableRace2";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import MyBet from "../../casinoComponents/myBet";
import ResultRace2 from "../resultui/resultRace2/ResultRace2";
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

export default function Race2() {
  const [gameData, setGameData] = useState(null);

  const [betValue, setBetValue] = useState("");
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState(""); 
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");

  const [Playerscore, setPlayerscore] = useState({});
  const [playersData, setPlayersData] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  const gameName = "Queen Top Open Teenpatti";

  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("race2");
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
      // Handle different API response structures
      const subData = gameData?.data?.data?.sub || gameData?.data?.sub || gameData?.sub || [];
      const firstFour = subData.slice(0, 4);
      setPlayersData(firstFour);
      if (Array.isArray(firstFour) && firstFour.length >= 4) {
        const playerScores = {
          ab: firstFour[0]?.b ?? "",
          al: firstFour[0]?.l ?? "",
          bb: firstFour[1]?.b ?? "",
          bl: firstFour[1]?.l ?? "",
          cb: firstFour[2]?.b ?? "",
          cl: firstFour[2]?.l ?? "",
          db: firstFour[3]?.b ?? "",
          dl: firstFour[3]?.l ?? "",
        };
        setPlayerscore(playerScores);
      } else {
        setPlayerscore({});
      }
    } else {
      setPlayerscore({});
      setPlayersData([]);
    }
  }, [gameData]);

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      // Handle different API response structures for mid
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
      // Handle different API response structures for mid
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

  const handleBetClick = (value, playerName, type, betData) => {
    setBetValue(value);
    setSelectedPlayerName(playerName);
    setSelectedSelection(betData?.nat || playerName);
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
  // Handle different API response structures for mid - same as roundId
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658";
  const gameId = roundId?.toString() || "98765";
  const gameNameForApi = extractCasinoGame(pathname) || "race2";
  const playerNameForApi = selectedPlayerName;

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
        <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />

        <div className={styles.tableContainer}>
          <div style={{ width: "100%" }}>
                <BetTableRace2 
                  data={Playerscore}
                  playersData={playersData}
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
        <ResultRace2 
          data={[]} 
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

      <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
        {
          betValue && selectedBetData && (
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
          )
        }
        <div className={styles.myBetContainer}>
          <MyBet bets={myBets} />
        </div>
      </div>
    </div>
  );
}
