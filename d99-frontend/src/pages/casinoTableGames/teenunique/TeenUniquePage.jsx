import { useState } from "react";
import Layout from "../../../components/layout/Layout.jsx";
import PlaceBetMobile from "../../../components/casino/common/PlaceBetMobile.jsx";
import { CasinoHeader, CasinoMobileTabs, CasinoHiddenBetTable, CasinoRightSidebar, CasinoLoader, CasinoResultModal, CasinoMobileBetTable } from "../../../components/casino/common/tableLayout/index.jsx";
import { CasinoVideoBox } from "../../../components/casino/video/index.jsx";
import { FlipClock } from "../../../components/casino/tables/teen62/index.jsx";
import BetTableTeenUnique from "../../../components/casino/tables/teenunique/BetTableTeenUnique.jsx";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = "teenunique";

function formatTeenUniqueResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

export default function TeenUniquePage() {
  const {
    gameData,
    iframeSrc,
    myBets,
    lastResults,
    roundId,
    timer,
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
  } = useCasinoGame(GAME_ID, { formatResult: formatTeenUniqueResult });

  // The slip is open from the first card picked, but a bet needs all THREE
  // positions — settlement splits the six dealt cards on them and rejects any
  // other count. Block submit until the selection is complete.
  const picksComplete = String(selectedSelection || "").replace(/\D/g, "").length === 3;

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  // Pass raw gameData to BetTableTeenUnique (it needs card string + sub directly)
  const rawGameData = gameData?.data?.data || gameData?.data || gameData || {};

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
          submitDisabled={!picksComplete}
          gameType="teenunique"
        />
      }
    >
      <div className="casino-page-container unique-teen20">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Unique Teenpatti" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <CasinoVideoBox
            src={iframeSrc}
            gameName="Unique Teenpatti"
            gameType={null}
            clock={<FlipClock value={timer} />}
          />

          {gameData && <div className="casino-detail">
            <div className="casino-table">
              <BetTableTeenUnique
                gameData={rawGameData}
                onBetClick={handleBetClick}
                onClearSelection={closeBetPanel}
              />
            </div>

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
          submitDisabled={!picksComplete}
          gameType="teenunique"
        />

        <CasinoHiddenBetTable bets={myBets} />
      </div>

      <CasinoResultModal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, mid: "" })}
        gameId={GAME_ID}
        gameType="teenunique"
        mid={resultModal.mid}
        title="Unique Teenpatti Result"
      />
    </Layout>
  );
}
