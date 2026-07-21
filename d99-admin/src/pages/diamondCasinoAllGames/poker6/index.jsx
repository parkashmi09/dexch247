import { Link, useLocation } from "react-router";
import { useState, useEffect, useCallback } from "react";
import styles from "./Poker6.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTablePoker6 from "../../casinoComponents/betTablePoker6";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import PokerRulesCard from "../../casinoComponents/pokerRulesCard";
import ResultPoker6 from "../resultui/resultPoker6/ResultPoker6";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Poker6() {
  const [gameData, setGameData] = useState(null);
  const [hands, setHands] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [activeTab, setActiveTab] = useState("game");
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [showPlaceBet, setShowPlaceBet] = useState(false);

  const { pathname } = useLocation();

  const fetchGameData = useCallback(async () => {
    try {
      const name = extractCasinoGame(pathname);
      if (!name) return;

      setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

      const response = await getCasinoGameDetails(name);
      const actualData = response?.data?.data || null;
      if (!actualData) return;

      setGameData(actualData);

      const sub = actualData.sub || [];

      // Pass full API data objects, not just name and value
      setHands(sub.slice(0, 6));
      setPatterns(sub.slice(6));
    } catch (err) {
      console.error("Error fetching game data:", err);
    }
  }, [pathname]);

  useEffect(() => {
    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [fetchGameData]);

  const handleBetClick = (value, playerName, betData) => {
    setBetValue(value);
    setSelectedPlayerName(playerName);
    setSelectedSelection(betData?.nat || playerName);
    setSelectedBetData(betData);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setBetValue("");
    setSelectedPlayerName("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setShowPlaceBet(false);
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.mid?.toString();

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
  }, [gameData?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.mid?.toString();

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
  }, [gameData?.mid]);

  useEffect(() => {
    const matchId = gameData?.mid?.toString();
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
  }, [fetchExposure, fetchMyBetsData, gameData?.mid]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };



  const resultdata = ["A", "A", "B", "A", "A", "A", "B", "B"];

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name="POKER 6"
          roundId={gameData?.mid?.toString() || "157250124095658"}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {activeTab === "game" && (
          <>
            <VideoBox
              iframeSrc={iframeSrc}
              timerValue={gameData?.lt}
              gameType="poker6"
              resultData={gameData?.card}
            />

            <div className={styles.tableContainer}>
              <div className={styles.table}>
                <BetTablePoker6
                  hands={hands}
                  patterns={patterns}
                  onBetClick={handleBetClick}
                  exposures={exposures}
                  myBets={myBets}
                />
              </div>
            </div>

            <div className={styles.playAndWin}>Play & Win</div>

            <div className={styles.heading}>
              <div>Last Result</div>
              <Link to="/casino/results">
                <div className={styles.viewAll}>View All</div>
              </Link>
            </div>

            <ResultPoker6 data={resultdata} gameData={gameData} />
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
            playerName={selectedPlayerName}
            playerNameForApi={selectedPlayerName}
            setShowPlaceBet={setShowPlaceBet}
            gameId={gameData?.mid?.toString() || "98765"}
            gameName="poker6"
            roundId={gameData?.mid || 0}
            selection={selectedSelection}
            betData={selectedBetData}
            onBetPlaced={handleBetPlaced}
          />
        )}
        <div className={styles.myBetContainer}>
          <MyBet bets={myBets} />
          <PokerRulesCard />

        </div>
      </div>
    </div>
  );
}
