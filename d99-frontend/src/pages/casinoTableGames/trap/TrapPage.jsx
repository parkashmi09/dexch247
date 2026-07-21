import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import BetTable from "../../../components/casino/common/BetTable.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import {
  CasinoHeader,
  CasinoMobileTabs,
  CasinoHiddenBetTable,
  CasinoRightSidebar,
  CasinoLoader,
  CasinoResultModal,
} from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { BetTableTrap, TrapVideoCards } from "../../../components/casino/tables/trap/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import { CASINO_GAME_IDS, formatTrapResult } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = CASINO_GAME_IDS.TRAP;

export default function TrapPage() {
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
  } = useCasinoGame(GAME_ID, { formatResult: formatTrapResult });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  const remark = gameData?.data?.data?.remark || "";

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
        >
          <div className="trap-number-icon d-none d-md-flex mt-3">
            <img src="/assets/img/trap13.png" alt="13" />
            <img src="/assets/img/trap14.png" alt="14" />
            <img src="/assets/img/trap15.png" alt="15" />
          </div>
        </CasinoRightSidebar>
      }
    >
      <div className="casino-page-container trap position-relative">
        {loading && <CasinoLoader />}

        <CasinoHeader name="The Trap" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox
            src={iframeSrc}
            gameName="The Trap"
            gameType="trap"
            cardString={cardString}
            clock={<FlipClock value={timer} />}
          />

          {tableData.length > 0 && (
            <div className="casino-detail">
              <BetTableTrap
                tableData={tableData}
                onBetClick={handleBetClick}
                exposures={exposures}
                remark={remark}
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

              {/* Trap number icons — mobile only, after last results */}
              <div className="trap-number-icon d-xl-none mt-2">
                <img src="/assets/img/trap13.png" alt="13" />
                <img src="/assets/img/trap14.png" alt="14" />
                <img src="/assets/img/trap15.png" alt="15" />
              </div>
            </div>
          )}
        </div>

        {mobilePanelTab === "bets" && (
          <div className="d-xl-none">
            <BetTable title="My Bet" bets={myBets} />
          </div>
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

        <CasinoHiddenBetTable />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType="trap"
        mid={resultModal.mid}
        title="The Trap Result"
      />
    </Layout>
  );
}
