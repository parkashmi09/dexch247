import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router';
import { Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./AAA2.module.css";
import BetTableA2 from "../../casinoComponents/betTableA2";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import MyBet from "../../casinoComponents/myBet";
import ResultLucky7 from "../resultui/resultLucky7/ResultLucky7";
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



export default function AAA2() {
  const [gameData, setGameData] = useState([])
  const [betValue, setBetValue] = useState("")
  const [selectedPlayerName, setSelectedPlayerName] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState("back");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setiframesrc] = useState("")
  const [data1, setData1] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  let { pathname } = useLocation();

  useEffect(() => {
    let name = extractCasinoGame(pathname)
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`)

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("aaa2");
        setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();

    const gameDataInterval = setInterval(fetchGameData, 1500);

    return () => {
      clearInterval(gameDataInterval);
    };
  }, [pathname]);

  useEffect(() => {
    if (gameData) {
      const subData = gameData?.data?.data?.sub || [];
      setData1([
        subData[0],
        subData[1],
        subData[2],
        subData[3],
        subData[4],
        subData[5],
        subData[6],
        subData[7],
        subData[8],
        subData[9],
        subData[10],
        subData[11],
        subData[12],
        subData[13],
        subData[14],
        subData[15],
        subData[16],
        subData[17],
        subData[18],
        subData[19],
        subData[20],
        subData[21],
      ]);
    }
  }, [gameData]);

  const handleBetClick = (value, player, betType, betData) => {
    setBetValue(value);
    // Only set betType if it's provided (from PlayerOdds), otherwise don't set it
    if (betType !== null && betType !== undefined) {
      setBetType(betType);
    } else {
      setBetType(""); // Clear betType for OptionColumn and cards
    }
    setShowPlaceBet(true);
    setSelectedPlayerName(player);
    setSelectedSelection(betData?.nat || player);
    setSelectedBetData(betData);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setSelectedPlayerName("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setBetType("back");
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString();

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
  }, [gameData?.data?.data?.mid, gameData?.data?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString();

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
  }, [gameData?.data?.data?.mid, gameData?.data?.mid]);

  useEffect(() => {
    const matchId = gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString();
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
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, fetchExposure, fetchMyBetsData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || "157250124095658";
  const playerNameForApi = selectedBetData?.nat || selectedPlayerName;
  const placedBetCount = myBets.length;

  const gameName = extractCasinoGame(pathname) || "AAA2";

  return (
    <>
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
                  <BetTableA2
                    data={data1}
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

              <ResultLucky7
                data={gameData?.lrs || []}
                gameData={gameData}
                gameType="aaa2"
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
                setShowPlaceBet={setShowPlaceBet}
                playerName={selectedPlayerName}
                playerNameForApi={playerNameForApi}
                gameId={roundId?.toString() || "98765"}
                gameName="aaa2"
                roundId={roundId || 0}
                selection={selectedSelection}
                betData={selectedBetData}
                betType={betType && betType.trim() !== "" ? betType : undefined}
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
