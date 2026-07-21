import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTablePoker6 from "../../../components/casino/tables/poker6/BetTablePoker6.jsx";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = "poker6";

function formatResult(r) {
  const win = String(r.win);
  return {
    label: win === "0" ? "T" : win,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "0" ? "" : "result-b",
  };
}

export default function Poker6Page() {
  const {
    gameData, tableData, iframeSrc, myBets, lastResults, roundId, exposures, timer, cardString,
    handleBetClick, showPlaceBet, betValue, betType, selectedSelection, selectedBetData,
    stakeAmount, setStakeAmount, placing, handlePlaceBet, closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;
  const remark = gameData?.data?.data?.remark || "";

  return (
    <Layout variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar bets={myBets} showPlaceBet={showPlaceBet} betValue={betValue} betType={betType}
          selection={selectedSelection} min={selectedBetData?.min} max={selectedBetData?.max}
          stakeAmount={stakeAmount} setStakeAmount={setStakeAmount} placing={placing}
          onClosePlaceBet={closeBetPanel} onSubmitBet={handlePlaceBet} />
      }>
      <div className="casino-page-container poker6player">
        {loading && <CasinoLoader />}
        <CasinoHeader name="Poker 6 Players" gameId={GAME_ID} roundId={roundId} />
        <CasinoMobileTabs activeTab={mobilePanelTab} onTabChange={setMobilePanelTab} placedBetsCount={myBets.length} roundId={roundId} />
        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox src={iframeSrc} gameName="Poker 6 Players" gameType="poker6" cardString={cardString} clock={<FlipClock value={timer} />} />
          {tableData.length > 0 && <div className="casino-detail">
            <BetTablePoker6 tableData={tableData} onBetClick={handleBetClick} exposures={exposures} cardString={cardString} />
            {remark && remark.trim() && <div className="casino-remark mt-1"><marquee scrollAmount="3">{remark}</marquee></div>}
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
      <CasinoResultModal show={resultModal.show} onHide={() => setResultModal({ show: false, mid: "" })} gameId={GAME_ID} gameType="poker6" mid={resultModal.mid} title="Poker 6 Players Result" />
    </Layout>
  );
}
