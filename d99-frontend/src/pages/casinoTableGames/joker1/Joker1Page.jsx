import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import { BetTableJoker1, Joker1VideoCards } from "../../../components/casino/tables/joker1/index.jsx";
import { formatPoisonResult } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";
import { CASINO_STREAM_URL } from "../../../config.js";

const GAME_ID = "joker1";

function formatJoker1Result(r) {
  return { label: "R", mid: r.mid != null ? String(r.mid) : "", win: r.win || "", type: "result-b" };
}

export default function Joker1Page() {
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
  } = useCasinoGame(GAME_ID, { formatResult: formatJoker1Result });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  // Extract joker card number from gameData (card field position or separate field)
  const rawCard = gameData?.data?.data?.card || gameData?.data?.card || cardString || "";

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
          jokerCardSrc={selectedBetData?.jokerCardSrc}
        />
      }
    >
      <div className="casino-page-container teenpatti-joker1">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Unlimited Joker Oneday" gameId={GAME_ID} roundId={roundId} />

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
                {iframeSrc && <iframe src={iframeSrc} title="Unlimited Joker Oneday" allowFullScreen allow="autoplay" />}
              </div>
            </div>
            <Joker1VideoCards cardString={cardString} />
            <FlipClock value={timer} />
          </div>

          {tableData.length > 0 && <div className="casino-detail">
            <BetTableJoker1
              tableData={tableData}
              onBetClick={handleBetClick}
              exposures={exposures}
              showPlaceBet={showPlaceBet}
            />

            <div className="casino-last-result-title">
              <span>Last Result</span>
              <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
            </div>
            <div className="casino-last-results">
              {lastResults.map((r, i) => (
                <span
                  key={i}
                  className={`result ${r.type || ""}`}
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
          jokerCardSrc={selectedBetData?.jokerCardSrc}
        />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType="joker1"
        mid={resultModal.mid}
        title="Unlimited Joker Oneday Result"
      />
    </Layout>
  );
}
