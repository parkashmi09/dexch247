import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import { BetTableLottcard } from "../../../components/casino/tables/lottcard/index.jsx";
import { CASINO_GAME_IDS } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = CASINO_GAME_IDS.LOTTCARD;

function formatLottcardResult(r) {
  const digits = String(r?.win || "").split(/\s+/).filter(Boolean);
  return {
    label: digits.join(" "),
    digits,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "",
  };
}

export default function LottcardPage() {
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
  } = useCasinoGame(GAME_ID, { formatResult: formatLottcardResult });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;
  const isSuspended = tableData.length > 0 && tableData.every((item) => !item?.b || item.b === 0 || item?.gstatus?.toUpperCase() === "SUSPENDED");
  const suspCls = isSuspended ? " suspended-box" : "";

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
          gameType="lottcard"
          lotteryBall={selectedBetData?.lotteryBall}
        >
          <div className="lottery-buttons">
            <button className={`btn btn-lottery${suspCls}`}>Repeat</button>
            <button className={`btn btn-lottery${suspCls}`}>Clear</button>
            <button className={`btn btn-lottery${suspCls}`}>Remove</button>
          </div>
        </CasinoRightSidebar>
      }
    >
      <div className="casino-page-container lottery">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Lottery" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox
            src={iframeSrc}
            gameName="Lottery"
            gameType="lottcard"
            cardString={cardString}
            clock={<FlipClock value={timer} />}
          />

          {tableData.length > 0 && (
            <div className="casino-detail">
              <BetTableLottcard
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
                  const digits = r.digits || String(r.label || "").split(/\s+/).filter(Boolean);
                  return (
                    <div
                      key={i}
                      className="lottery-result-group"
                      style={{ cursor: "pointer" }}
                      onClick={() => setResultModal({ show: true, mid: r.mid || "" })}
                    >
                      {digits.map((d, j) => (
                        <div key={j} className="lottery-result-icon">{d}</div>
                      ))}
                    </div>
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
          gameType="lottcard"
          lotteryBall={selectedBetData?.lotteryBall}
        />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType="lottcard"
        mid={resultModal.mid}
        title="Lottery Result"
      />
    </Layout>
  );
}
