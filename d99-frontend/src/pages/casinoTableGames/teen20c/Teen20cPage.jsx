import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableTeen20c from "../../../components/casino/tables/teen20c/BetTableTeen20c.jsx";
import PairPlusTable from "../../../components/casino/tables/teen20c/PairPlusTable.jsx";
import { formatPoisonResult } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = "teen20c";

export default function Teen20cPage() {
  const {
    gameData, tableData, iframeSrc, myBets, lastResults, roundId, exposures, timer, cardString,
    handleBetClick, showPlaceBet, betValue, betType, selectedSelection, selectedBetData,
    stakeAmount, setStakeAmount, placing, handlePlaceBet, closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult: formatPoisonResult });

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
        >
          <PairPlusTable />
        </CasinoRightSidebar>
      }
    >
      <div className="casino-page-container teenpatti20">
        {loading && <CasinoLoader />}

        <CasinoHeader name="20-20 Teenpatti C" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox
            src={iframeSrc}
            gameName="20-20 Teenpatti C"
            gameType="teen20c"
            cardString={cardString}
            clock={<FlipClock value={timer} />}
          />

          {tableData.length > 0 && <div className="casino-detail">
            <BetTableTeen20c
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
                <span key={i} className={`result ${r.type || ""}`} style={{ cursor: "pointer" }}
                  onClick={() => setResultModal({ show: true, mid: r.mid || "" })}>{r.label}</span>
              ))}
            </div>

            <PairPlusTable className="mt-2 d-xl-none" />
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
        gameId={GAME_ID} gameType="teen20c" mid={resultModal.mid} title="20-20 Teenpatti C Result" />
    </Layout>
  );
}
