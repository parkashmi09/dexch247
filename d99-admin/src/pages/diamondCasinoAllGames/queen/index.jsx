import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./Queen.module.css";
import BetTableQueen from "../../casinoComponents/betTableQueen";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import CasinoLastResult from "../../casinoComponents/casinoLastResult";
import MyBet from "../../casinoComponents/myBet";
import CasinoTableLayout from "../../casinoComponents/casinoTableLayout";
import ViewMoreModal from "../../../components/ViewMoreModal";
import {
  getCasinoGameDetails,
  getMatchExposure,
  getCasinoOpenBets,
} from "../../../apiservices/CasionApi";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function Queen() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);

  const { pathname } = useLocation();
  const gameName = extractCasinoGame(pathname) || "queen";

  useEffect(() => {
    setIframeSrc(
      `https://casino-stream.softgamingapi.com/casino-tv?id=${gameName}`
    );

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(gameName);
        setGameData(response);
        setSubData(response?.data?.data?.sub || []);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();
    const gameDataInterval = setInterval(fetchGameData, 1500);
    return () => clearInterval(gameDataInterval);
  }, [gameName]);

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.id;
      const matchId =
        gameData?.data?.data?.t1?.gmid?.toString() ||
        gameData?.data?.data?.mid?.toString() ||
        gameData?.data?.mid?.toString() ||
        gameData?.mid?.toString();

      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response.success && response.data) {
          const exposureMap = {};
          response.data.forEach((item) => {
            const teamName =
              item.team_name || item.selection || item.player_name || "";
            const amount = parseFloat(item.exposure_amount) || 0;
            if (teamName) {
              exposureMap[teamName] = amount;
              exposureMap[teamName.toLowerCase()] = amount;
              exposureMap[teamName.trim()] = amount;
            }
          });
          setExposures(exposureMap);
        }
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  }, [
    gameData?.data?.data?.t1?.gmid,
    gameData?.data?.data?.mid,
    gameData?.data?.mid,
    gameData?.mid,
  ]);

  const fetchMyBetsData = useCallback(async () => {
    if (!gameName) return;
    try {
      const response = await getCasinoOpenBets(gameName);
      if (response?.success && Array.isArray(response.data)) {
        setMyBets(response.data);
      }
    } catch (error) {
      console.error("Error fetching my bets:", error);
    }
  }, [gameName]);

  useEffect(() => {
    const matchId =
      gameData?.data?.data?.t1?.gmid?.toString() ||
      gameData?.data?.data?.mid?.toString() ||
      gameData?.data?.mid?.toString() ||
      gameData?.mid?.toString();

    if (matchId) {
      const t = setTimeout(() => fetchExposure(), 2000);
      const exposureInterval = setInterval(fetchExposure, 2000);
      return () => {
        clearTimeout(t);
        clearInterval(exposureInterval);
      };
    }
  }, [fetchExposure, gameData]);

  useEffect(() => {
    fetchMyBetsData();
    const intervalId = setInterval(fetchMyBetsData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchMyBetsData]);

  const handleBetClick = () => {
    fetchExposure();
    fetchMyBetsData();
  };

  const resultData =
    gameData?.lrs ??
    gameData?.data?.data?.lrs ??
    gameData?.data?.lrs ??
    [];

  const roundId =
    gameData?.data?.data?.t1?.gmid ||
    gameData?.data?.data?.mid ||
    gameData?.data?.mid ||
    gameData?.mid ||
    "";

  // Winning group index from t1.win (1-based), -1 if not yet determined
  const t1Win = gameData?.data?.data?.t1?.win;
  const winIndex = t1Win != null ? parseInt(t1Win) - 1 : -1;

  return (
    <CasinoTableLayout
      rightSide={
        <MyBet bets={myBets} onViewMore={() => setShowViewMoreModal(true)} />
      }
    >
      <>
        <CasinoHeading
          name={gameData?.data?.data?.t1?.ename || "QUEEN TOP OPEN TEENPATTI"}
          roundId={roundId}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === "game" && (
          <>
            <VideoBox
              iframeSrc={iframeSrc}
              timerValue={gameData?.data?.data?.lt}
              gameType="queen"
              resultData={gameData?.data?.data?.card || gameData?.data?.data?.t1?.card}
              roundId={roundId}
              subData={subData.slice(0, 4)}
              winIndex={winIndex}
            />

            <div className={`detail-page-container casino-table casino-queen queen ${styles.tableContainer}`}>
              <BetTableQueen
                onBetClick={handleBetClick}
                data={subData}
                exposures={exposures}
              />
            </div>

            <CasinoLastResult
              gameType="queen"
              data={resultData}
              gameData={gameData}
            />
          </>
        )}
      </>
      <ViewMoreModal
        show={showViewMoreModal}
        onHide={() => setShowViewMoreModal(false)}
        title="View More"
        sectionKey={gameName}
      />
    </CasinoTableLayout>
  );
}
