import { useState, useEffect, useRef } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableLucky15 from "../../../components/casino/tables/lucky15/BetTableLucky15.jsx";
import useCasinoGame from "../../../hooks/useCasinoGame.js";
import { CASINO_STREAM_URL } from "../../../config.js";

const GAME_ID = "lucky15";

function formatLucky15Result(r) {
  const win = String(r.win || "");
  const map = { "0": "0", "1": "1", "2": "2", "4": "4", "6": "6", "W": "W", "w": "W" };
  return { label: map[win] || win, mid: r.mid != null ? String(r.mid) : "", win, type: "" };
}

export default function Lucky15Page() {
  const {
    gameData, tableData, myBets, lastResults, roundId, exposures, timer,
    handleBetClick, showPlaceBet, betValue, betType, selectedSelection, selectedBetData,
    stakeAmount, setStakeAmount, placing, handlePlaceBet, closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult: formatLucky15Result });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;
  const iframeSrc = `${CASINO_STREAM_URL}?id=${GAME_ID}`;

  const rawData = gameData?.data?.data || gameData?.data || {};
  const rdesc = rawData?.rdesc || "";

  const [popupText, setPopupText] = useState("");
  const prevRdescRef = useRef("");
  useEffect(() => {
    if (rdesc && rdesc !== prevRdescRef.current) {
      prevRdescRef.current = rdesc;
      setPopupText(rdesc);
      const t = setTimeout(() => setPopupText(""), 3000);
      return () => clearTimeout(t);
    }
    if (!rdesc) { prevRdescRef.current = ""; setPopupText(""); }
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
      <div className="casino-page-container ball-by-ball">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Lucky 15" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs activeTab={mobilePanelTab} onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length} roundId={roundId} />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <div className="casino-video">
            <div className="video-box-container">
              <div className="casino-video-box">
                {iframeSrc && <iframe src={iframeSrc} title="Lucky 15" allowFullScreen allow="autoplay" />}
                {popupText && (
                  <div className="cricket20ballpopup">
                    <img src="/assets/img/balls/ball-blank.png" alt="" />
                    <span>{popupText}</span>
                  </div>
                )}
              </div>
            </div>
            <FlipClock value={timer} className="lucky15" />
          </div>

          {tableData.length > 0 && <div className="casino-detail detail-page-container position-relative">
            <BetTableLucky15 tableData={tableData} onBetClick={handleBetClick} exposures={exposures} />

            <div className="casino-last-result-title">
              <span>Last Result</span>
              <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.map((r, i) => (
                <span key={i} className="result" style={{ cursor: "pointer" }}
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
        gameId={GAME_ID} gameType="lucky15" mid={resultModal.mid} title="Lucky 15 Result" />
    </Layout>
  );
}
