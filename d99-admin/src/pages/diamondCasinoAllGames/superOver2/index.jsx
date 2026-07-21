import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import VideoBox from "../../casinoComponents/videoBox";
import styles from "./SuperOver2.module.css";

import CasinoHeading from "../../casinoComponents/casinoHeading";
import CasinoLastResult from "../../casinoComponents/casinoLastResult";
import MyBet from "../../casinoComponents/myBet";
import CasinoTableLayout from "../../casinoComponents/casinoTableLayout";
import BetTableSuperOver2 from "../../casinoComponents/betTableSuperOver2";
import { getCasinoGameDetails, getMatchExposure, getCasinoOpenBets } from "../../../apiservices/CasionApi";
import ViewMoreModal from "../../../components/ViewMoreModal";

function extractCasinoGame(url) {
  const match = url.match(/\/casino\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function SuperOver2() {
  const [gameData, setGameData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [iframeSrc, setIframeSrc] = useState("");
  const [exposures, setExposures] = useState({});
  const [myBets, setMyBets] = useState([]);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [activeTab, setActiveTab] = useState("game");

  const { pathname } = useLocation();
  const gameName = extractCasinoGame(pathname) || "superOver2";

  useEffect(() => {
    const name = extractCasinoGame(pathname) || "superOver2";
    setIframeSrc(`https://casino-stream.softgamingapi.com/casino-tv?id=${name}`);

    const fetchGameData = async () => {
      try {
        const response = await getCasinoGameDetails(name);
        setGameData(response);
        setSubData(response?.data?.data?.t2 || []);
      } catch (err) {
        console.error("Error fetching game data: ", err);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

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
            const teamName = item.team_name || item.selection || item.player_name || "";
            const exposureAmount = parseFloat(item.exposure_amount) || 0;
            if (teamName) {
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
  }, [
    gameData?.data?.data?.t1?.gmid,
    gameData?.data?.data?.mid,
    gameData?.data?.mid,
    gameData?.mid,
  ]);

  const fetchMyBetsData = useCallback(async () => {
    const name = extractCasinoGame(pathname) || "superOver2";
    if (!name) return;
    try {
      const response = await getCasinoOpenBets(name);
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
  }, [pathname]);

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
        <>
          <MyBet bets={myBets} onViewMore={() => setShowViewMoreModal(true)} />
          <div className={`card mb-2 ${styles.cricketRule}`}>
            <div className="card-header text-center">
              <span>{gameData?.data?.data?.t1?.ename || "Super Over 2"}<br />Inning's Card Rules</span>
            </div>
            <div className="card-body">
              <div className="card">
                <div className="card-header">
                  <div className="row row5 mt-1">
                    <div className="col-4">Cards</div>
                    <div className="col-3 text-center">Count</div>
                    <div className="col-5 text-right">Value</div>
                  </div>
                </div>
                <div className="card-body">
                  {[
                    { card: "cardA", count: 5, ball: "ball1" },
                    { card: "card2", count: 5, ball: "ball2" },
                    { card: "card3", count: 5, ball: "ball3" },
                    { card: "card4", count: 5, ball: "ball4" },
                    { card: "card6", count: 5, ball: "ball6" },
                    { card: "card10", count: 5, ball: "ball0" },
                    { card: "cardK", count: 5, ball: "wicket", isWicket: true },
                  ].map((item) => (
                    <div className="row row5 mt-1" key={item.card}>
                      <div className="col-4">
                        <img src={`https://versionobj.ecoassetsservice.com/v93/static/admin/img/superOver/cards/${item.card}.png`} alt="" />
                        <span className="ml-2">X</span>
                      </div>
                      <div className="col-3 text-center">{item.count}</div>
                      <div className={`col-5 text-right ${styles.ruleValue}`}>
                        {item.isWicket && "WICKET "}
                        <img src={`https://versionobj.ecoassetsservice.com/v93/static/admin/img/superOver/balls/${item.ball}.png`} alt="" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      }
    >
      <>
        <CasinoHeading
          name={gameData?.data?.data?.t1?.ename || gameName.replace(/([A-Z])/g, " $1").trim().toUpperCase() || "SUPER OVER 2"}
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
              gameType="superover2"
              resultData={
                gameData?.data?.data?.t1?.card || gameData?.data?.data?.card
              }
            />

            <div className={`detail-page-container super-over ${styles.tableContainer}`}>
              <BetTableSuperOver2
                data={subData}
                onBetClick={handleBetClick}
                exposures={exposures}
                myBets={myBets}
              />
            </div>

            <CasinoLastResult
              gameType="superover2"
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
