"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import styles from "./Mogambo.module.css";
import CasinoHeading from "../../casinoComponents/casinoHeading";
import BetTableMogambo from "../../casinoComponents/betTableMogambo";
import VideoBox from "../../casinoComponents/videoBox";
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

export default function Mogambo() {
  const [gameData, setGameData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const [tableData, setTableData] = useState([]);
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);

  const { pathname } = useLocation();
  const gameName = extractCasinoGame(pathname) || "mogambo";

  useEffect(() => {
    setIframeSrc(
      `https://casino-stream.softgamingapi.com/casino-tv?id=${gameName}`
    );
    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails("mogambo");
        setGameData(response);
      } catch (err) {
        console.error("Error fetching game data:", err);
      }
    };
    fetchGameData();
    const gameDataInterval = setInterval(fetchGameData, 1500);
    return () => clearInterval(gameDataInterval);
  }, [pathname, gameName]);

  useEffect(() => {
    const subData = gameData?.data?.data?.sub ?? gameData?.data?.sub ?? [];
    setTableData(subData);
  }, [gameData]);

  const fetchExposure = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id ?? user?.id;
      const matchId =
        gameData?.data?.data?.mid?.toString() ??
        gameData?.data?.mid?.toString() ??
        gameData?.mid?.toString();
      if (userId && matchId) {
        const response = await getMatchExposure(userId, matchId);
        if (response?.success && response?.data) {
          const exposureMap = {};
          response.data.forEach((item) => {
            const name = item.team_name || item.selection || item.player_name || "";
            const amount = parseFloat(item.exposure_amount) || 0;
            if (name) {
              exposureMap[name] = amount;
              exposureMap[name.trim()] = amount;
              exposureMap[name.toLowerCase().trim()] = amount;
            }
          });
          setExposures(exposureMap);
        }
      }
    } catch (error) {
      console.error("Error fetching exposure:", error);
    }
  }, [gameData]);

  const fetchMyBetsData = useCallback(async () => {
    if (!gameName) return;
    try {
      const response = await getCasinoOpenBets(gameName);
      if (response?.success && Array.isArray(response.data)) {
        const formattedBets = response.data.map((bet) => ({
          userName: bet.username ?? bet.userName ?? "-",
          matchedBet:
            bet.matchedBet ?? bet.nation ?? bet.selection ?? bet.player_name ?? "-",
          selection:
            bet.selection ?? bet.player_name ?? bet.matchedBet ?? "",
          player_name: bet.player_name ?? "",
          odds: bet.odds ?? bet.userrate ?? "0",
          stake: bet.stake ?? bet.amount ?? "0",
          placeDate: bet.placeDate ?? bet.created_at ?? "-",
          gametype:
            bet.gametype ??
            bet.game_type ??
            (bet.type === "lay" ? "Lay" : bet.type === "back" ? "Back" : "-"),
          type: bet.type ?? null,
          exposer: parseFloat(bet.exposer ?? bet.exposure_amount ?? "0") || 0,
        }));
        setMyBets(formattedBets);
        const exposureMap = {};
        response.data.forEach((bet) => {
          const selection =
            bet.selection ?? bet.player_name ?? bet.matchedBet ?? "";
          const amount = parseFloat(bet.exposer ?? bet.exposure_amount ?? "0") || 0;
          if (selection && amount !== 0) {
            exposureMap[selection] = amount;
            exposureMap[selection.trim()] = amount;
            exposureMap[selection.toLowerCase().trim()] = amount;
          }
        });
        setExposures((prev) => ({ ...prev, ...exposureMap }));
      }
    } catch (error) {
      console.error("Error fetching my bets (open-downline):", error);
    }
  }, [gameName]);

  useEffect(() => {
    const matchId =
      gameData?.data?.data?.mid?.toString() ??
      gameData?.data?.mid?.toString() ??
      gameData?.mid?.toString();
    if (matchId) {
      fetchExposure();
      const exposureInterval = setInterval(fetchExposure, 2000);
      return () => clearInterval(exposureInterval);
    }
  }, [gameData, fetchExposure]);

  useEffect(() => {
    fetchMyBetsData();
    const intervalId = setInterval(fetchMyBetsData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchMyBetsData]);

  const handleBetClick = () => {
    fetchExposure();
    fetchMyBetsData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const roundId =
    gameData?.data?.data?.mid ??
    gameData?.data?.mid ??
    gameData?.mid ??
    "157250124095658";

  // Last result: from game details (res) – Mogambo API returns res not lrs
  const resultData =
    gameData?.data?.data?.res ?? gameData?.data?.res ?? [];

  return (
    <>
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
            name="MOGAMBO"
            roundId={roundId}
            placedBetCount={myBets.length}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "game" && (
            <>
              <VideoBox
                iframeSrc={iframeSrc}
                timerValue={gameData?.data?.data?.lt}
                gameType="mogambo"
                resultData={gameData?.data?.data?.card}
                roundId={roundId}
              />

              <div className={styles.tableContainer}>
                <BetTableMogambo
                  data={tableData}
                  onBetClick={handleBetClick}
                  exposures={exposures}
                  myBets={myBets}
                />
              </div>

              <CasinoLastResult
                gameType="mogambo"
                data={resultData}
                gameData={gameData}
                viewAllLink="/admin/reports/casinoresult/mogambo"
              />

              <div className={styles.blueBar}>
                <span>
                  {gameData?.data?.data?.remark ?? "Mogambo Khush Hua"}
                </span>
              </div>
            </>
          )}
        </>
      </CasinoTableLayout>

      <ViewMoreModal
        show={showViewMoreModal}
        onHide={() => setShowViewMoreModal(false)}
        title="View More"
        sectionKey={gameName}
      />
    </>
  );
}
