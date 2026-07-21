// TeenPatti2.jsx
import { Link } from "react-router";
// import PlaceBet from "../../casinoComponents/placeBet";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./TeenPatti2.module.css";
import BetTableTeenPatti2 from "../../casinoComponents/betTableTeenPatti2";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import ResultPatti2 from "../resultui/resultPatti2/ResultPatti2";
import card1 from '../../../assets/img/card/10.jpg';
import card2 from '../../../assets/img/card/11.jpg';
import card3 from '../../../assets/img/card/12.jpg';
import cardPattiBack from '../../../assets/img/card/patti_back.jpg';
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function TeenPatti2() {
  const [gameData, setGameData] = useState(null);
  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);

  const [PlayerAscore, setPlayerAscore] = useState({});
  const [PlayerBscore, setPlayerBscore] = useState({});

  const { pathname } = useLocation();

  useEffect(() => {
    const fetchGameData = async () => {
      let name = extractCasinoGame(pathname);
      setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

      try {
        const response = await getCasinoGameDetails("patti2");
        setGameData(response);
      } catch (err) {
        console.error(err);
        setGameData(null);
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
      setData1([subData[0], subData[2], subData[4]]);
      setData2([subData[1], subData[3], subData[5]]);
    } else {
      setData1([]);
      setData2([]);
    }
  }, [gameData]);

  useEffect(() => {
    if (Array.isArray(data1) && data1.length > 0) {
      setPlayerAscore({
        ab: data1[0]?.b,
        al: data1[0]?.l,
        tb: data1[1]?.b,
        tbb: data1[1]?.bbhav,
        tl: data1[1]?.l,
        tlb: data1[1]?.lbhav,
        c: data1[2]?.b,
        // Pass full item objects for exposure and bet data
        playerAItem: data1[0] || {},
        totalAItem: data1[1] || {},
        miniBaccaratAItem: data1[2] || {},
      });
    } else {
      setPlayerAscore({});
    }
  }, [data1]);

  useEffect(() => {
    if (Array.isArray(data2) && data2.length > 0) {
      setPlayerBscore({
        ab: data2[0]?.b,
        al: data2[0]?.l,
        tb: data2[1]?.b,
        tbb: data2[1]?.bbhav,
        tl: data2[1]?.l,
        tlb: data2[1]?.lbhav,
        c: data2[2]?.b,
        // Pass full item objects for exposure and bet data
        playerBItem: data2[0] || {},
        totalBItem: data2[1] || {},
        miniBaccaratBItem: data2[2] || {},
      });
    } else {
      setPlayerBscore({});
    }
  }, [data2]);

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
              // Store with original case
              exposureMap[teamName] = exposureAmount;
              // Store with lowercase
              exposureMap[teamName.toLowerCase().trim()] = exposureAmount;
              // Store with trimmed version
              exposureMap[teamName.trim()] = exposureAmount;
              // Store with lowercase trimmed
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

  const playerA = { cards: [card1, card2, card3] };
  const playerB = { cards: [cardPattiBack, cardPattiBack, cardPattiBack] };
  const placedBetCount = myBets.length;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="2 CARDS TEENPATTI"
            roundId={gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "157250124095658"}
            placedBetCount={placedBetCount}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          {activeTab === "game" && (
            <>
              <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />

              <div className={styles.tableContainer}>
                <div className={styles.table}>
                  <BetTableTeenPatti2
                    data={PlayerAscore}
                    onBetClick={handleBetClick}
                    Player="A"
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
                <div className={styles.table}>
                  <BetTableTeenPatti2
                    data={PlayerBscore}
                    onBetClick={handleBetClick}
                    Player="B"
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

              <ResultPatti2
                data={[]}
                gameData={gameData}
                playerA={playerA}
                playerB={playerB}
              />

              <div className={styles.blueBar}>
                <span>Color Plus</span>
              </div>
            </>
          )}
          {activeTab === "placedBet" && (
            <div className={styles.myBetMobileContainer}>
              <MyBet bets={myBets} />
            </div>
          )}
        </div>

        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ""}`}>
          {betValue && selectedBetData && (
            <PlaceBet
              betValue={betValue}
              playerName={selectedPlayer}
              playerNameForApi={selectedBetData?.nat || selectedPlayer}
              setShowPlaceBet={setShowPlaceBet}
              gameId={gameData?.data?.data?.mid?.toString() || gameData?.data?.mid?.toString() || gameData?.mid?.toString() || "98765"}
              gameName="patti2"
              roundId={gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || 0}
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
