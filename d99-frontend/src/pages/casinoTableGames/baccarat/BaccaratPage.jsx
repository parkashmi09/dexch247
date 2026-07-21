import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableBaccarat from "../../../components/casino/tables/baccarat/BetTableBaccarat.jsx";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = "baccarat";

function formatResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "P" : win === "2" ? "B" : win === "3" ? "T" : "-",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

export default function BaccaratPage() {
  const {
    gameData, tableData, iframeSrc, myBets, lastResults, roundId, exposures, timer, cardString,
    handleBetClick, showPlaceBet, betValue, betType, selectedSelection, selectedBetData,
    stakeAmount, setStakeAmount, placing, handlePlaceBet, closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  return (
    <Layout variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar bets={myBets} showPlaceBet={showPlaceBet} betValue={betValue} betType={betType}
          selection={selectedSelection} min={selectedBetData?.min} max={selectedBetData?.max}
          stakeAmount={stakeAmount} setStakeAmount={setStakeAmount} placing={placing}
          onClosePlaceBet={closeBetPanel} onSubmitBet={handlePlaceBet} />
      }>
      <div className="casino-page-container baccarat">
        {loading && <CasinoLoader />}
        <CasinoHeader name="Baccarat" gameId={GAME_ID} roundId={roundId} />
        <CasinoMobileTabs activeTab={mobilePanelTab} onTabChange={setMobilePanelTab} placedBetsCount={myBets.length} roundId={roundId} />
        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox src={iframeSrc} gameName="Baccarat" gameType="baccarat" cardString={cardString} clock={<FlipClock value={timer} />} />
          {tableData.length > 0 && <div className="casino-detail">
            <BetTableBaccarat tableData={tableData} onBetClick={handleBetClick} exposures={exposures} cardString={cardString} lastResults={lastResults} />
            <div className="casino-last-result-title"><span>Last Result</span><span><a href={`/casino-results/${GAME_ID}`}>View All</a></span></div>
            <div className="casino-last-results">
              {lastResults.map((r, i) => (<span key={i} className={`result ${r.type || ""}`} style={{ cursor: "pointer" }} onClick={() => setResultModal({ show: true, mid: r.mid || "" })}>{r.label}</span>))}
            </div>
          </div>}
        </div>
        {mobilePanelTab === "bets" && <CasinoMobileBetTable bets={myBets} />}
        <PlaceBetMobile show={showPlaceBet} betValue={betValue} betType={betType} selection={selectedSelection} min={selectedBetData?.min} max={selectedBetData?.max} stakeAmount={stakeAmount} setStakeAmount={setStakeAmount} placing={placing} onClose={closeBetPanel} onSubmit={handlePlaceBet} />
        <CasinoHiddenBetTable bets={myBets} />
      </div>
      <CasinoResultModal show={resultModal.show} onHide={() => setResultModal({ show: false, mid: "" })} gameId={GAME_ID} gameType="baccarat" mid={resultModal.mid} title="Baccarat Result" />
    </Layout>
  );
}
