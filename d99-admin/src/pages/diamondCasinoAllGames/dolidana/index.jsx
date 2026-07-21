
"use client"

// eslint-disable-next-line
import { Link } from "react-router"
import { useState, useEffect, useCallback } from "react"
import { useLocation } from 'react-router';
import styles from "./DoliDana.module.css"
import CasinoHeading from "../../casinoComponents/casinoHeading"
import BetTableDoliDana from "../../casinoComponents/betTableDoliDana"
import VideoBox from "../../casinoComponents/videoBox"
import { getCasinoGameDetails, getMyBets } from "../../../apiservices/CasionApi"
import MyBet from "../../casinoComponents/myBet";
import ResultDoliDana from "../resultui/resultDoliDana/ResultDoliDana";
import DoliDanaRules from "../../casinoComponents/dolidanaRules";
// Using placeholder cards if needed for VideoBox default props, though DoliDana is dice


function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function DoliDana() {
  const [gameData, setGameData] = useState([])

  const [betValue, setBetValue] = useState("")
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [iframeSrc, setiframesrc] = useState("")
  const [tableData, setTableData] = useState([]);
  const [selection, setSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [betType, setBetType] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");

  let { pathname } = useLocation();

  useEffect(() => {
    let name = extractCasinoGame(pathname)
    setiframesrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`)
    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("dolidana"); // Assuming type is dolidana
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
      const subData = gameData?.data?.data?.sub || gameData?.data?.sub || [];
      const mappedData = subData.map((item) => ({
        ...item,
        nat: item.nat,
        gstatus: item.gstatus || "OPEN",
        mid: item.mid,
        sr: item.sr,
      }));
      // Sort by sr if available
      const sortedData = mappedData.sort((a, b) => (a.sr || 0) - (b.sr || 0));
      setTableData(sortedData);
    }
  }, [gameData]);

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

          // Map exposure from myBets to exposures object
          const exposureMap = {};
          response.bets.forEach((bet) => {
            const selection = bet.selection || bet.player_name || "";
            const exposureAmount = parseFloat(bet.exposer || bet.exposure_amount || "0") || 0;
            if (selection) {
              exposureMap[selection] = exposureAmount;
              exposureMap[selection.toLowerCase().trim()] = exposureAmount;
              exposureMap[selection.trim()] = exposureAmount;
              exposureMap[selection.toLowerCase()] = exposureAmount;
            }
          });
          setExposures(exposureMap);
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid]);

  useEffect(() => {
    if (gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid) {
      fetchMyBetsData();
      const exposureInterval = setInterval(() => {
        fetchMyBetsData();
      }, 2000);
      return () => clearInterval(exposureInterval);
    }
  }, [gameData?.data?.data?.mid, gameData?.data?.mid, gameData?.mid, fetchMyBetsData]);

  const handleBetClick = (value, sel, item, type = "back") => {
    if (!value) return;
    setBetValue(value)
    setSelection(item?.nat || sel)
    setSelectedBetData(item)
    setBetType(type)
    setShowPlaceBet(true)
  }

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setSelection("");
    setSelectedBetData(null);
    setBetType("");
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };



  const placedBetCount = myBets.length;
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "000000";
  const gameId = roundId?.toString() || "000000";
  const gameName = extractCasinoGame(pathname) || "dolidana";
  const playerNameForApi = selection;

  console.log(gameData?.data, "gameData");

  return (
    <>
      <div className={styles.container}>
        <div className={styles.sectionA}>
          <CasinoHeading
            name="DOLI DANA"
            roundId={roundId}
            placedBetCount={placedBetCount}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
                gameType="dolidana"
                resultData={gameData?.data?.data?.card}
              />

              <div className={styles.tableContainer}>
                <BetTableDoliDana
                  data={tableData}
                  onBetClick={handleBetClick}
                  exposures={exposures}
                  myBets={myBets}
                />
              </div>


              <div className={styles.mobileMyBetContainer}>
                <DoliDanaRules />
              </div>
              <div className={styles.heading}>
                <div>Last Result</div>
                <Link to="/casino/results/dolidana">
                  <div className={styles.viewAll}>View All</div>
                </Link>
              </div>
              <ResultDoliDana
                data={gameData?.data?.lrs || gameData?.lrs || []}
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
        <div className={`${styles.placeBet} ${showPlaceBet ? styles.visible : ''}`}>
          {betValue && selectedBetData && (
            <PlaceBet
              betValue={betValue}
              playerName={selection}
              playerNameForApi={playerNameForApi}
              setShowPlaceBet={setShowPlaceBet}
              gameId={gameId}
              gameName={gameName}
              roundId={roundId}
              selection={selection}
              betData={selectedBetData}
              betType={betType}
              onBetPlaced={handleBetPlaced}
            />
          )}
          <div className={styles.myBetContainer}>
            <MyBet bets={myBets} />
            <DoliDanaRules />
          </div>
        </div>
      </div>

    </>
  )
}
