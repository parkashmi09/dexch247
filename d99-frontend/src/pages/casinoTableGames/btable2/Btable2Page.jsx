import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableBtable2 from "../../../components/casino/tables/btable2/BetTableBtable2.jsx";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = "btable2";

function formatBtable2Result(r) {
  const win = String(r.win);
  const map = { "1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "F" };
  return { label: map[win] || win, mid: r.mid != null ? String(r.mid) : "", win: r.win || "", type: "result-b" };
}

export default function Btable2Page() {
  const {
    gameData, tableData, iframeSrc, myBets, lastResults, roundId, exposures, timer, cardString,
    handleBetClick, showPlaceBet, betValue, betType, selectedSelection, selectedBetData,
    stakeAmount, setStakeAmount, placing, handlePlaceBet, closeBetPanel,
  } = useCasinoGame(GAME_ID, { formatResult: formatBtable2Result });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  return (
    <Layout
      variant="casino-page"
      rightSidebar={
        <CasinoRightSidebar bets={myBets} showPlaceBet={showPlaceBet} betValue={betValue}
          betType={betType} selection={selectedSelection} min={selectedBetData?.min}
          max={selectedBetData?.max} stakeAmount={stakeAmount} setStakeAmount={setStakeAmount}
          placing={placing} onClosePlaceBet={closeBetPanel} onSubmitBet={handlePlaceBet} />
      }
    >
      <div className="casino-page-container bollywood">
        {loading && <CasinoLoader />}
        <CasinoHeader name="Bollywood Casino 2" gameId={GAME_ID} roundId={roundId} />
        <CasinoMobileTabs activeTab={mobilePanelTab} onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length} roundId={roundId} />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox src={iframeSrc} gameName="Bollywood Casino 2" gameType="btable2"
            cardString={cardString} clock={<FlipClock value={timer} />} />

          {tableData.length > 0 && <div className="casino-detail">
            <BetTableBtable2 tableData={tableData} onBetClick={handleBetClick} exposures={exposures} />
            <div className="casino-last-result-title">
              <span>Last Result</span><span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
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
        gameId={GAME_ID} gameType="btable2" mid={resultModal.mid} title="Bollywood Casino 2 Result" />
    </Layout>
  );
}
