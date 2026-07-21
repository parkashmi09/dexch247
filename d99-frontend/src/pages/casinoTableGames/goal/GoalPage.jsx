import { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import GoalMarkets from "../../../components/casino/tables/goal/GoalMarkets.jsx";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = "goal";

function formatGoalResult(r) {
  return { label: "R", mid: r.mid != null ? String(r.mid) : "", win: r.win || "", type: "result-b" };
}

export default function GoalPage() {
  const {
    gameData, tableData, iframeSrc, myBets, lastResults, roundId, exposures, timer,
    handleBetClick, showPlaceBet, betValue, betType, selectedSelection, selectedBetData,
    stakeAmount, setStakeAmount, placing, handlePlaceBet, closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult: formatGoalResult });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  const rawData = gameData?.data?.data || gameData?.data || {};
  const remark = rawData?.remark || "";
  const rdesc = rawData?.rdesc || "";

  // Show popup only briefly when rdesc changes, then hide after 3s
  const [popupText, setPopupText] = useState("");
  const prevRdescRef = useRef("");
  useEffect(() => {
    if (rdesc && rdesc !== prevRdescRef.current) {
      prevRdescRef.current = rdesc;
      setPopupText(rdesc);
      const timer = setTimeout(() => setPopupText(""), 3000);
      return () => clearTimeout(timer);
    }
    if (!rdesc) {
      prevRdescRef.current = "";
      setPopupText("");
    }
  }, [rdesc]);

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar
          bets={myBets} showPlaceBet={showPlaceBet} betValue={betValue} betType={betType}
          selection={selectedSelection} min={selectedBetData?.min} max={selectedBetData?.max}
          stakeAmount={stakeAmount} setStakeAmount={setStakeAmount} placing={placing}
          onClosePlaceBet={closeBetPanel} onSubmitBet={handlePlaceBet}
        />
      }
    >
      <div className="casino-page-container ball-by-ball goal">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Goal" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs activeTab={mobilePanelTab} onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length} roundId={roundId} />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <div className="casino-video">
            <div className="video-box-container">
              <div className="casino-video-box">
                {iframeSrc && <iframe src={iframeSrc} title="Goal" allowFullScreen allow="autoplay" />}
                {popupText && (
                  <div className="cricket20ballpopup">
                    <img src="/assets/img/balls/soccer-ball.png" alt="" />
                    <span>{popupText}</span>
                  </div>
                )}
              </div>
            </div>
            <FlipClock value={timer} />
          </div>

          {tableData.length > 0 && <div className="casino-detail detail-page-container position-relative">
            <GoalMarkets
              tableData={tableData}
              onBetClick={handleBetClick}
              exposures={exposures}
            />

            {remark && (
              <div className="casino-remark mt-1">
                <div className="remark-icon">
                  <img src="/assets/img/icons/remark.png" alt="" />
                </div>
                <marquee scrollAmount="3">{remark}</marquee>
              </div>
            )}

            <div className="casino-last-result-title">
              <span>Last Result</span>
              <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.map((r, i) => (
                <span key={i} className={`result ${r.type || ""}`} style={{ cursor: "pointer" }}
                  onClick={() => setResultModal({ show: true, mid: r.mid || "" })}>{r.label}</span>
              ))}
            </div>
          </div>}
        </div>

        {mobilePanelTab === "bets" && <CasinoMobileBetTable bets={myBets} />}

        <PlaceBetMobile show={showPlaceBet} betValue={betValue} betType={betType}
          selection={selectedSelection} min={selectedBetData?.min} max={selectedBetData?.max}
          stakeAmount={stakeAmount} setStakeAmount={setStakeAmount} placing={placing}
          onClose={closeBetPanel} onSubmit={handlePlaceBet} />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal show={resultModal.show} onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID} gameType="goal" mid={resultModal.mid} title="Goal Result" />
    </Layout>
  );
}
