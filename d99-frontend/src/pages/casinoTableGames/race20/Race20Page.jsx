import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import {
  CasinoHeader,
  CasinoMobileTabs,
  CasinoHiddenBetTable,
  CasinoRightSidebar,
  CasinoLoader,
  CasinoResultModal,
  CasinoMobileBetTable,
} from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import {
  BetTableRace20,
  Race20VideoCards,
} from "../../../components/casino/tables/race20/index.jsx";
import {
  CASINO_GAME_IDS,
  formatRace20Result,
} from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = CASINO_GAME_IDS.RACE20;

const SUIT_ICONS = {
  "1": "/assets/img/icons/spade.png",
  "2": "/assets/img/icons/heart.png",
  "3": "/assets/img/icons/club.png",
  "4": "/assets/img/icons/diamond.png",
};

export default function Race20Page() {
  const {
    gameData,
    tableData,
    iframeSrc,
    myBets,
    lastResults,
    roundId,
    exposures,
    timer,
    cardString,
    handleBetClick,
    showPlaceBet,
    betValue,
    betType,
    selectedSelection,
    selectedBetData,
    stakeAmount,
    setStakeAmount,
    placing,
    handlePlaceBet,
    closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult: formatRace20Result });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar
          bets={myBets}
          showPlaceBet={showPlaceBet}
          betValue={betValue}
          betType={betType}
          selection={selectedSelection}
          min={selectedBetData?.min}
          max={selectedBetData?.max}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          placing={placing}
          onClosePlaceBet={closeBetPanel}
          onSubmitBet={handlePlaceBet}
        />
      }
    >
      <div className="casino-page-container race20">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Race 20" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <div className="casino-video">
            <div className="video-box-container">
              <div className="casino-video-box">
                {iframeSrc ? (
                  <iframe src={iframeSrc} title="Race 20" allowFullScreen allow="autoplay" />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-white">
                    Loading stream...
                  </div>
                )}
              </div>
            </div>
            <Race20VideoCards cardString={cardString} />
            <FlipClock value={timer} />
          </div>

          {tableData.length > 0 && (
            <div className="casino-detail">
              <BetTableRace20
                tableData={tableData}
                onBetClick={handleBetClick}
                exposures={exposures}
              />

              <div className="casino-last-result-title">
                <span>Last Result</span>
                <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
              </div>
              <div className="casino-last-results">
                {lastResults.map((r, i) => {
                  const icon = SUIT_ICONS[String(r.win)] || null;
                  return (
                    <span
                      key={i}
                      className="result"
                      style={{ cursor: "pointer" }}
                      onClick={() => setResultModal({ show: true, mid: r.mid || "" })}
                    >
                      {icon
                        ? <img src={icon} alt={r.suit || ""} style={{ width: 18, height: 18 }} />
                        : (r.suit || r.win || "-")}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {mobilePanelTab === "bets" && (
          <CasinoMobileBetTable bets={myBets} />
        )}

        <PlaceBetMobile
          show={showPlaceBet}
          betValue={betValue}
          betType={betType}
          selection={selectedSelection}
          min={selectedBetData?.min}
          max={selectedBetData?.max}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          placing={placing}
          onClose={closeBetPanel}
          onSubmit={handlePlaceBet}
        />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType="race20"
        mid={resultModal.mid}
        title="Race 20 Result"
      />
    </Layout>
  );
}
