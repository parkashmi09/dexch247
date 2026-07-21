import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./TeenPatti.module.css";
import BetTeenTable from "../../casinoComponents/betTeenTable";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import VideoBox from "../../casinoComponents/videoBox";
import CasinoLastResult from "../../casinoComponents/casinoLastResult";
import MyBet from "../../casinoComponents/myBet";
import CasinoTableLayout from "../../casinoComponents/casinoTableLayout";
import { getCasinoGameDetails, getMatchExposure, getCasinoOpenBets } from "../../../apiservices/CasionApi";
import ViewMoreModal from "../../../components/ViewMoreModal";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function TeenPatti3() {
  const [gameData, setGameData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [subData, setSubData] = useState([]);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);

  const { pathname } = useLocation();
  const gameName = extractCasinoGame(pathname);

  useEffect(() => {
    const gameName = extractCasinoGame(pathname);
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${gameName}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(gameName);
        setGameData(response);
      } catch (err) {
        console.error("API Fetch Error:", err.message);
        setGameData(null); // clear data on error
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (gameData?.data?.data?.sub) {
      const sub = gameData.data.data.sub;
      setSubData(sub || []);
    } else {
      setSubData([]);
    }
  }, [gameData]);

  const handleBetClick = (value, betLabel, type, betData = null) => {
    if (!value) return;
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
          const exposureMap = {};
          response.data.forEach((item) => {
            const teamName = item.team_name || item.selection || item.player_name || "";
            const exposureAmount = parseFloat(item.exposure_amount) || 0;
            if (teamName && exposureAmount !== 0) {
              exposureMap[teamName] = exposureAmount;
              exposureMap[teamName.toLowerCase()] = exposureAmount;
              exposureMap[teamName.trim()] = exposureAmount;
            }
          });
          setExposures(exposureMap);
        }
      }
    } catch (error) {
      console.error('Error fetching exposure:', error);
    }
  }, [gameData?.data?.data?.mid]);

  // My Bets: same API as lord-admin – GET /lords/bet-list/casino/open-downline?gameName=...
  const fetchMyBetsData = useCallback(async () => {
    const gameName = extractCasinoGame(pathname);
    if (!gameName) return;
    try {
      const response = await getCasinoOpenBets(gameName);
      if (response?.success && Array.isArray(response.data)) {
        const formattedBets = response.data.map((bet) => ({
          userName: bet.username || bet.userName || "-",
          matchedBet: bet.matchedBet || bet.nation || bet.selection || bet.player_name || "-",
          selection: bet.selection || bet.player_name || bet.matchedBet || "",
          player_name: bet.player_name || "",
          odds: bet.odds ?? bet.userrate ?? "0",
          stake: bet.stake ?? bet.amount ?? "0",
          placeDate: bet.placeDate ?? bet.created_at ?? "-",
          gametype: bet.gametype ?? bet.game_type ?? (bet.type === "lay" ? "Lay" : bet.type === "back" ? "Back" : "-"),
          type: bet.type || null,
          exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0
        }));
        setMyBets(formattedBets);
      }
    } catch (error) {
      console.error("Error fetching my bets (open-downline):", error);
    }
  }, [pathname]);

  // Fetch exposure and My Bets on mount and periodically (My Bets every 5s like lord-admin)
  useEffect(() => {
    const matchId = gameData?.data?.data?.mid?.toString();
    if (matchId) {
      const t = setTimeout(() => {
        fetchExposure();
      }, 2000);
      const exposureInterval = setInterval(fetchExposure, 2000);
      return () => {
        clearTimeout(t);
        clearInterval(exposureInterval);
      };
    }
  }, [fetchExposure, gameData?.data?.data?.mid]);

  useEffect(() => {
    fetchMyBetsData();
    const intervalId = setInterval(fetchMyBetsData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchMyBetsData]);

  // Last result: same as lord-admin — from getCasinoGameDetails response (lrs) or empty
  const resultData = gameData?.lrs ?? gameData?.data?.data?.lrs ?? gameData?.data?.lrs ?? [];

  return (
    <CasinoTableLayout rightSide={<MyBet bets={myBets} onViewMore={() => setShowViewMoreModal(true)} />}>
      <>
        <CasinoHeading
          name="Premium Teenpati 1 Day"
          roundId={gameData?.data?.data?.mid || gameData?.data?.mid || "157250124095658"}
          placedBetCount={myBets.length}
          activeTab="game"
          onTabChange={() => {}}
        />
        <VideoBox
          iframeSrc={iframeSrc}
          timerValue={gameData?.data?.data?.lt}
          gameType={gameName || "teen"}
          resultData={gameData?.data?.data?.card ?? gameData?.data?.card ?? (Array.isArray(gameData?.lrs) && gameData.lrs[0]?.card ? gameData.lrs[0].card : undefined)}
        />

        <div className={styles.tableContainer}>
          <BetTeenTable
            data={subData}
            onBetClick={handleBetClick}
            exposures={exposures}
            myBets={myBets}
          />
        </div>

        <CasinoLastResult
          gameType="teen"
          data={resultData}
          gameData={gameData}
        />
      </>
      <ViewMoreModal
        show={showViewMoreModal}
        onHide={() => setShowViewMoreModal(false)}
        title="View More"
        sectionKey={gameName || 'teen'}
      />
    </CasinoTableLayout>
  );
}
