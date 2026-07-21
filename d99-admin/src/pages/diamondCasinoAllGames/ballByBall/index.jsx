import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./BallByBall.module.css";
import BetTableBallByBall from "../../casinoComponents/betTableBallByBall";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import ResultBallByBall from "../resultui/resultBallByBall/ResultBallByBall";
import MyBet from "../../casinoComponents/myBet";
import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function BallByBall() {
  const [gameData, setGameData] = useState([]);

  const [filteredData, setFilteredData] = useState([]);
  const [betValue, setBetValue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedSelection, setSelectedSelection] = useState("");
  const [selectedBetData, setSelectedBetData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    const subData = gameData?.data?.data?.sub || gameData?.data?.sub || [];
    const mappedData = subData
      .map((item) => ({
        runs: item.nat || "N/A",
        odds: item.b || 0,
        bs: item.bs || 0, // Back stake/volume to display below odds
        limit: item.bs || 0, // For display in the Back column
        min: item.min || 50,
        max: item.max || 25000,
        nat: item.nat || "N/A",
        gstatus: item.gstatus || "OPEN",
        sid: item.sid,
        ssid: item.ssid,
        sno: item.sno,
        sr: item.sr, // Sort order
        subtype: item.subtype,
        gtype: item.gtype,
        etype: item.etype,
        mid: item.mid,
      }))
      .sort((a, b) => {
        // Sort by sr (sort order) if available, otherwise maintain original order
        if (a.sr && b.sr) {
          return a.sr - b.sr;
        }
        return 0;
      });
    setFilteredData(mappedData);
  }, [gameData]);

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
              // Also store with lowercase for easier matching
              exposureMap[teamName.toLowerCase().trim()] = exposureAmount;
              // Store with trimmed version
              exposureMap[teamName.trim()] = exposureAmount;
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

  const handleBetClick = (odds, label, betData) => {
    setBetValue(odds);
    setSelectedPlayer(label);
    setSelectedSelection(betData?.nat || label);
    setSelectedBetData(betData);
    setShowPlaceBet(true);
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    setBetValue("");
    setSelectedPlayer("");
    setSelectedSelection("");
    setSelectedBetData(null);
    fetchExposure();
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const placedBetCount = myBets.length;
  const roundId = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "0000";
  const gameId = roundId?.toString() || "0000";
  const gameName = extractCasinoGame(pathname) || "ballbyball";
  const playerNameForApi = selectedPlayer;

  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name="BALL BY BALL"
          roundId={roundId}
          placedBetCount={placedBetCount}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {activeTab === "game" && (
          <>
            <VideoBox iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} gameType="ballbyball" />

            <div className={styles.tableContainer}>
              <BetTableBallByBall
                data={filteredData}
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

            <ResultBallByBall data={gameData?.data?.lrs || []} gameData={gameData} />
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
            playerName={selectedPlayer}
            playerNameForApi={playerNameForApi}
            setShowPlaceBet={setShowPlaceBet}
            gameId={gameId}
            gameName={gameName}
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
