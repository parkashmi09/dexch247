import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import BetTable from "../../../components/casino/common/BetTable.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { BetTableTeen62, FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import { CASINO_GAME_IDS, formatTeen62Result } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = CASINO_GAME_IDS.TEEN62;

export default function Teen62Page() {
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
    // Bet placement
    handleBetClick,
    showPlaceBet,
    setShowPlaceBet,
    betValue,
    betType,
    selectedSelection,
    selectedBetData,
    stakeAmount,
    setStakeAmount,
    placing,
    handlePlaceBet,
    closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult: formatTeen62Result });

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
      <div className="casino-page-container teenpatti1day position-relative">
        {loading && <CasinoLoader />}

        <CasinoHeader name="V VIP Teenpatti 1-day" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox
            src={iframeSrc}
            gameName="V VIP Teenpatti 1-day"
            gameType="teen62"
            cardString={cardString}
            clock={<FlipClock value={timer} />}
          />

          {tableData.length > 0 && <div className="casino-detail">
            <BetTableTeen62
              tableData={tableData}
              onBetClick={handleBetClick}
              exposures={exposures}
            />

            <div className="casino-last-result-title">
              <span>Last Result</span>
              <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.map((r, i) => (
                <span
                  key={i}
                  className={`result ${r.type || "result-b"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setResultModal({ show: true, mid: r.mid || "" })}
                >
                  {r.label}
                </span>
              ))}
            </div>
          </div>}
        </div>

        {mobilePanelTab === "bets" && (
          <div className="d-xl-none">
            <BetTable title="My Bet" bets={myBets} />
          </div>
        )}

        {/* Mobile PlaceBet — shown inline below bet table on mobile */}
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

        <CasinoHiddenBetTable />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType="teen62"
        mid={resultModal.mid}
        title="V VIP Teenpatti 1-day Result"
      />
    </Layout>
  );
}
