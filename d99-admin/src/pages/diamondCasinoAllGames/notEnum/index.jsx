import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./NotEnum.module.css";
import BetTableNotEnum from "../../casinoComponents/betTableNotEnum";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import ResultNotEnum from "../resultui/resultNotEnum/ResultNotEnum";
import card1 from "../../../assets/img/card/10.jpg";
import card2 from "../../../assets/img/card/11.jpg";
import card3 from "../../../assets/img/card/12.jpg";
import cardPattiBack from "../../../assets/img/card/patti_back.jpg";
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

export default function NotEnum() {
  const gameName = "Queen Top Open Teenpatti";

  const [gameData, setGameData] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const [exposures, setExposures] = useState({});

  const [betValue, setBetValue] = useState("");
  const [betLabel, setBetLabel] = useState("");
  const [betType, setBetType] = useState("back");
  const [betPayload, setBetPayload] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [showPlaceBet, setShowPlaceBet] = useState(false);

  const { pathname } = useLocation();

  useEffect(() => {
    const name = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();

    const intervalId = setInterval(fetchGameData, 1500);

    return () => clearInterval(intervalId);
  }, [pathname]);

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

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
  }, [gameData?.data?.data?.mid]);

  const fetchMyBetsData = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      const matchId = gameData?.data?.data?.mid?.toString();

      if (userId && matchId) {
        const response = await getMyBets(userId, matchId);
        if (response.success && response.bets) {
          const formattedBets = response.bets.map((bet) => ({
            matchedBet: bet.player_name || bet.selection || "",
            selection: bet.selection || bet.player_name || "",
            player_name: bet.player_name || "",
            odds: bet.odds || "0",
            stake: bet.stake || "0",
            type: bet.type || null,
            exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
          }));
          setMyBets(formattedBets);

          // Also update exposures from myBets
          const exposureMap = {};
          response.bets.forEach((bet) => {
            const selection = bet.selection || bet.player_name || "";
            const exposureAmount = parseFloat(bet.exposer || bet.exposure_amount || "0") || 0;
            if (selection && exposureAmount !== 0) {
              exposureMap[selection] = exposureAmount;
              exposureMap[selection.toLowerCase()] = exposureAmount;
              exposureMap[selection.trim()] = exposureAmount;
            }
          });
          setExposures(prev => ({ ...prev, ...exposureMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching my bets:', error);
    }
  }, [gameData?.data?.data?.mid]);

  useEffect(() => {
    if (gameData?.data?.data?.mid) {
      fetchExposure();
      fetchMyBetsData();

      const intervalId = setInterval(() => {
        fetchExposure();
        fetchMyBetsData();
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [gameData?.data?.data?.mid, fetchExposure, fetchMyBetsData]);

  const handleBetClick = (label, value, betType, payload = null) => {
    if (!value) return;
    setBetLabel(label);
    setBetValue(value);
    setBetType(betType);
    setBetPayload(payload);
    setShowPlaceBet(true);
  };

  // Get game info for PlaceBet
  const getGameInfo = () => {
    const matchId = gameData?.data?.data?.mid;
    const roundId = gameData?.data?.data?.mid || 0;
    const gameName = gameData?.data?.data?.cname || "Note Number";
    return { matchId, roundId, gameName };
  };

  const handleBetPlaced = () => {
    setShowPlaceBet(false);
    // Refresh my bets and exposures after placing bet
    fetchMyBetsData();
    fetchExposure();
  };



  return (
    <div className={styles.container}>
      <div className={styles.sectionA}>
        <CasinoHeading
          name={gameName.toUpperCase()}
          roundId={gameData?.data?.data?.mid?.toString() || "N/A"}
        />
        <VideoBox playerA={playerA} playerB={playerB} iframeSrc={iframeSrc} timerValue={gameData?.data?.data?.lt} />

        <div className={styles.tableContainer}>
          <div style={{ width: "100%" }}>

            <BetTableNotEnum
              data={gameData?.data?.data || {}}
              onBetClick={handleBetClick}
              myBets={myBets}
              exposures={exposures}
            />
          </div>
        </div>

        <div className={styles.heading}>
          <div>Last Result</div>
          <Link to="/casino/results">
            <div style={{ cursor: "pointer" }}>View All</div>
          </Link>
        </div>
        <ResultNotEnum data={[]} gameData={gameData} />
      </div>

      {showPlaceBet && (() => {
        const { matchId, roundId, gameName } = getGameInfo();
        const selection = betPayload?.nat || betLabel || "";
        return (
          <div className={styles.placeBet}>
            <PlaceBet
              betValue={betValue}
              playerName={betLabel}
              betType={betType}
              setShowPlaceBet={setShowPlaceBet}
              betPayload={betPayload}
              onBetPlaced={handleBetPlaced}
              gameId={matchId}
              gameName={gameName}
              roundId={roundId}
              selection={selection}
              betData={betPayload}
            />
          </div>
        );
      })()}
    </div>
  );
}
