import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./Race20.module.css";
import BetTableRace20 from "../../casinoComponents/betTableRace20";
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

export default function Race20() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [activeTab, setActiveTab] = useState("game");

  const { pathname } = useLocation();
  const gameName = extractCasinoGame(pathname) || "race20";

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
        const formattedBets = response.data.map((bet) => ({
          userName: bet.username || bet.userName || "-",
          matchedBet:
            bet.matchedBet ||
            bet.nation ||
            bet.selection ||
            bet.player_name ||
            "-",
          selection:
            bet.selection || bet.player_name || bet.matchedBet || "",
          player_name: bet.player_name || "",
          odds: bet.odds ?? bet.userrate ?? "0",
          stake: bet.stake ?? bet.amount ?? "0",
          placeDate: bet.placeDate ?? bet.created_at ?? "-",
          gametype:
            bet.gametype ??
            bet.game_type ??
            (bet.type === "lay"
              ? "Lay"
              : bet.type === "back"
                ? "Back"
                : "-"),
          type: bet.type || null,
          exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0,
        }));
        setMyBets(formattedBets);
      }
    } catch (error) {
      console.error("Error fetching my bets (open-downline):", error);
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

  return (
    <CasinoTableLayout
      rightSide={
        <MyBet bets={myBets} onViewMore={() => setShowViewMoreModal(true)} />
      }
    >
      <>
        <CasinoHeading
          name={gameData?.data?.data?.t1?.ename || "RACE 20"}
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
              gameType="race20"
              resultData={gameData?.data?.data?.card || gameData?.data?.data?.t1?.card}
              roundId={roundId}
            />

            <div
              className={`detail-page-container race20 ${styles.tableContainer}`}
            >
              <BetTableRace20
                onBetClick={handleBetClick}
                data={subData}
                exposures={exposures}
                myBets={myBets}
              />
            </div>

            <CasinoLastResult
              gameType="race20"
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
