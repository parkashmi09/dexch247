import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router';
import { Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./TeenPatti42.module.css";
import BetTableTeenPatti3 from "../../casinoComponents/betTableTeenPatti3";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import { MdLock } from "react-icons/md";
import ResultTeen42 from "../resultui/resultTeen42/ResultTeen42";
import MyBet from "../../casinoComponents/myBet";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function TeenPatti42() {
  let { pathname } = useLocation();
  const gameName = "Jack Top Open Teenpatti";

  const [gameData, setGameData] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  console.log("gameData", gameData);

  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedPlayerNameForApi, setSelectedPlayerNameForApi] = useState("Player A");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [betType, setBetType] = useState("");
  const [iframeSrc, setiframesrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);


  const [data1, setData1] = useState({});
  const [data2, setData2] = useState({});
  const [data3, setData3] = useState({ b: 0 });
  const [data4, setData4] = useState({ b: 0 });

  useEffect(() => {
    let name = extractCasinoGame(pathname);
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("teen42");
        setGameData(response);
      } catch (err) {
        console.error(err.message);
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
      setData1(subData[0] || {});
      setData2(subData[1] || {});
      setData3(subData[2] || { b: 0 });
      setData4(subData[3] || { b: 0 });
    }
  }, [gameData]);



  const handleBetClick = (value, betLabel, type, betData = null) => {
    if (!value) return;
    console.log("handleBetClick called - value:", value, "betLabel:", betLabel, "type:", type, "betData:", betData);
    setBetValue(value);
    setSelectedPlayer(betLabel);
    setSelectedSelection(betLabel);
    // Ensure type is set correctly - it should be "back" or "lay"
    const betTypeValue = type && type.trim() !== "" ? type.trim() : "";
    console.log("Setting betType to:", betTypeValue);
    setBetType(betTypeValue);
    setSelectedBetData(betData || { b: value, nat: betLabel });
    // Determine player name for API based on bet label
    if (betLabel.includes("Box A")) {
      setSelectedPlayerNameForApi("Player A");
    } else if (betLabel.includes("Box B")) {
      setSelectedPlayerNameForApi("Player B");
    } else if (betLabel.includes("Player B")) {
      setSelectedPlayerNameForApi("Player B");
    } else {
      setSelectedPlayerNameForApi("Player A");
    }
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    // Clear all bet-related state to hide PlaceBet UI
    setBetValue("");
    setSelectedPlayer("");
    setSelectedSelection("");
    setSelectedBetData(null);
    setBetType("");
    setSelectedPlayerNameForApi("Player A");
    setShowPlaceBet(false);
    // Fetch exposure and my bets after bet placement
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response.success && response.data) {
          // Convert array to object keyed by team_name
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
  }, [gameData?.data?.data?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMyBets(userId, matchId);
        if (response.success && response.bets) {
          // Map bets data to format needed for MyBet component
          const formattedBets = response.bets.map((bet) => ({
            matchedBet: bet.player_name || bet.selection || "",
            selection: bet.selection || bet.player_name || "",
            player_name: bet.player_name || "",
            odds: bet.odds || "0",
            stake: bet.stake || "0",
            type: bet.type || null, // Include type field for background color
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
          }));
          setMyBets(formattedBets);
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData?.data?.data?.mid]);

  // Fetch exposure on mount and periodically with debounce
  useEffect(() => {
    const matchId = gameData?.data?.data?.mid?.toString();
    if (!matchId) return;

    // Initial fetch after 2 seconds
    const timeoutId = setTimeout(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    // Periodic fetch every 2 seconds
    const intervalId = setInterval(() => {
      fetchExposure();
      fetchMyBetsData();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchExposure, fetchMyBetsData, gameData?.data?.data?.mid]);

  const resultdata = ['A', 'A', 'B', 'A', 'A', 'A', 'B', 'B'];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name={gameName.toUpperCase()}
            roundId={gameData?.data?.data?.mid || "157250124095658"}
            placedBetCount={myBets.length}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          {activeTab === "game" && (
            <>
              <VideoBox
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
                gameType="teen42"
                resultData={gameData?.data?.data?.card}
              />

              <div className={styles.tableContainer}>
                <div className={styles.bettable}>
                  <BetTableTeenPatti3
                    data={data1}
                    onBetClick={(val, label, type, betData) =>
                      handleBetClick(val, `Box A - ${label}`, type, betData || data1)
                    }
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
                <div className={styles.bettable}>
                  <BetTableTeenPatti3
                    data={data2}
                    onBetClick={(val, label, type, betData) =>
                      handleBetClick(val, `Box B - ${label}`, type, betData || data2)
                    }
                    exposures={exposures}
                    myBets={myBets}
                  />
                </div>
              </div>

              <div className={styles.row1}>
                <div className={styles.cellContainer}>
                  <div className={styles.row3}>
                    <span>Player B Under 21</span>
                    {data3?.b ? (
                      <div
                        className={styles.col1}
                        onClick={() => handleBetClick(data3.b, "Player B Under 21", "", data3)}
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <span>{data3.b}</span>
                        {exposures["Player B Under 21"] !== undefined && exposures["Player B Under 21"] !== 0 && (
                          <div style={{
                            fontSize: '10px',
                            color: exposures["Player B Under 21"] < 0 ? '#ff0000' : '#00ff00',
                            marginTop: '2px',
                            fontWeight: 'bold',
                          }}>
                            {exposures["Player B Under 21"] < 0 ? exposures["Player B Under 21"].toFixed(2) : `+${exposures["Player B Under 21"].toFixed(2)}`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.col1} style={{ background: '#333' }}>
                        <span className={styles.lockIcon}><MdLock color="white" size={15} /></span>
                      </div>
                    )}
                  </div>

                  <div className={styles.row3}>
                    <span>Player B Over 21</span>
                    {data4?.b ? (
                      <div
                        className={styles.col2}
                        onClick={() => handleBetClick(data4.b, "Player B Over 21", "", data4)}
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <span>{data4.b}</span>
                        {exposures["Player B Over 21"] !== undefined && exposures["Player B Over 21"] !== 0 && (
                          <div style={{
                            fontSize: '10px',
                            color: exposures["Player B Over 21"] < 0 ? '#ff0000' : '#00ff00',
                            marginTop: '2px',
                            fontWeight: 'bold',
                          }}>
                            {exposures["Player B Over 21"] < 0 ? exposures["Player B Over 21"].toFixed(2) : `+${exposures["Player B Over 21"].toFixed(2)}`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.col2} style={{ background: '#333' }}>
                        <span className={styles.lockIcon}><MdLock color="white" size={15} /></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.heading}>
                <div>Last Result</div>
                <Link to="/casino/results">
                  <div style={{ cursor: "pointer" }}>View All</div>
                </Link>
              </div>

              <ResultTeen42 data={resultdata} gameData={gameData} />
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
                playerName={selectedPlayer}
                playerNameForApi={selectedPlayerNameForApi}
                gameId={gameData?.data?.data?.mid?.toString() || "98765"}
                gameName="teen42"
                roundId={gameData?.data?.data?.mid || 0}
                selection={selectedSelection}
                betData={selectedBetData}
                betType={betType}
                setShowPlaceBet={setShowPlaceBet}
                onBetPlaced={handleBetPlaced}
              />
            )
          }
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
            {/* <RulesCard subHeader="Pair Plus" rules={rules} /> */}
          </div>
        </div>
      </div>
    </>
  );
}
