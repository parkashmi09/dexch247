import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import ResultTrap from "../resultui/resultTrap/ResultTrap";
import styles from "./Trap.module.css";
import BetTableTrap from "../../casinoComponents/betTableTrap";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import card1 from "../../../assets/img/card/10.jpg";
import card2 from "../../../assets/img/card/11.jpg";
import card3 from "../../../assets/img/card/12.jpg";
import cardPattiBack from "../../../assets/img/card/patti_back.jpg";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

const playerA = {
  cards: [card1, card2, card3],
};
const playerB = {
  cards: [cardPattiBack, cardPattiBack, cardPattiBack],
};

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Trap() {
  const [gameData, setGameData] = useState({});
  const [iframeSrc, setIframeSrc] = useState("");
  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
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
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
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
            const teamName = item.team_name || item.selection || item.player_name || "";
            const exposureAmount = parseFloat(item.exposure_amount) || 0;
            if (teamName) {
              exposureMap[teamName] = exposureAmount;
              exposureMap[teamName.toLowerCase().trim()] = exposureAmount;
              exposureMap[teamName.trim()] = exposureAmount;
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
            type: bet.type || null,
            selection: bet.selection || bet.player_name || "",
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
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

  const handleBetClick = (value, selection, item, type) => {
    if (!value) return;
    setBetValue(value);
    setSelectedPlayer(selection);
    setSelectedSelection(item?.nat || selection);
    setSelectedBetData(item || { value, selection, type });
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
  const gameName = extractCasinoGame(pathname) || "trap";

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name="THE TRAP"
          roundId={roundId}
          placedBetCount={placedBetCount}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeTab === "game" && (
          <>
            <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />

            <div className={styles.tableContainer}>
              <BetTableTrap 
                data={gameData?.data?.data?.sub || gameData?.sub || []} 
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

            <ResultTrap
              data={[]}
              gameData={gameData}
              playerA={playerA}
              playerB={playerB}
            />
          </>
        )}
        {activeTab === "placedBet" && (
          <div className={styles.myBetMobileContainer}>
            <MyBet bets={myBets} />
          </div>
        )}
      </div>

      <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
        {betValue && selectedBetData && (
          <PlaceBet
            betValue={betValue}
            playerName={selectedPlayer}
            playerNameForApi={selectedBetData?.nat || selectedPlayer}
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
