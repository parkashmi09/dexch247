import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableJoker20 from "../../casinoComponents/betTableJoker20";
import VideoBox from "../../casinoComponents/videoBox";
import MyBet from "../../casinoComponents/myBet";
import CasinoLastResult from "../../casinoComponents/casinoLastResult";
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

export default function Joker20() {
  const [gameData, setGameData] = useState({});
  const [iframeSrc, setIframeSrc] = useState("");
  const { pathname } = useLocation();
  const gameName = extractCasinoGame(pathname) || "joker20";
  const [tableData, setTableData] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [activeTab, setActiveTab] = useState("game");

  useEffect(() => {
    const name = extractCasinoGame(pathname) || "joker20";
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response || {});
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    const subData = gameData?.data?.data?.sub || [];
    if (Array.isArray(subData) && subData.length > 0) {
      const sorted = [...subData].sort((a, b) => (a.sr || 0) - (b.sr || 0));
      setTableData(sorted);
    }
  }, [gameData?.data?.data?.sub]);

  const handleBetClick = (value, selection, betData, type) => {
    if (!value) return;
    fetchExposure();
    fetchMyBetsData();
  };

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
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
      console.error("Error fetching exposure:", error);
    }
  }, [gameData?.data?.data?.mid]);

  const fetchMyBetsData = useCallback(async () => {
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
          exposer: parseFloat(bet.exposer || bet.exposure_amount || "0") || 0,
        }));
        setMyBets(formattedBets);
      }
    } catch (error) {
      console.error("Error fetching my bets (open-downline):", error);
    }
  }, [gameName]);

  useEffect(() => {
    const matchId = gameData?.data?.data?.mid?.toString();
    if (matchId) {
      const t = setTimeout(() => fetchExposure(), 2000);
      const exposureInterval = setInterval(fetchExposure, 2000);
      return () => {
        clearTimeout(t);
        clearInterval(exposureInterval);
      };
    }
  }, [gameData?.data?.data?.mid, fetchExposure]);

  useEffect(() => {
    fetchMyBetsData();
    const intervalId = setInterval(fetchMyBetsData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchMyBetsData]);

  const resultData =
    gameData?.lrs ?? gameData?.data?.data?.lrs ?? gameData?.data?.lrs ?? [];

  const roundId =
    gameData?.data?.data?.t1?.gmid ||
    gameData?.data?.data?.mid ||
    gameData?.data?.mid ||
    gameData?.mid ||
    "";

  return (
    <CasinoTableLayout
      rightSide={
        <MyBet
          bets={myBets}
          onViewMore={() => setShowViewMoreModal(true)}
        />
      }
    >
      <>
        <CasinoHeading
          name={gameData?.data?.data?.t1?.ename || "Joker 20-20"}
          roundId={roundId}
          placedBetCount={myBets.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === "game" && (
          <>
            <VideoBox
              gameType={gameName}
              resultData={gameData?.data?.data?.card}
              iframeSrc={iframeSrc}
              timerValue={gameData?.data?.data?.lt}
              roundId={roundId}
            />

            <BetTableJoker20
              data={tableData}
              onBetClick={handleBetClick}
              exposures={exposures}
            />

            <CasinoLastResult
              gameType={gameName}
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
