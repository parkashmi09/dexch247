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
import { BetTableCmatch20, Cmatch20VideoCards } from "../../../components/casino/tables/cmatch20/index.jsx";
import { CASINO_GAME_IDS, formatCmatch20Result } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";

const GAME_ID = CASINO_GAME_IDS.CMATCH20;
const BALL_BASE = "/assets/img/balls/cricket20";

// Parse score string: "innings,teamA_runs,teamA_wkts,teamA_overs,teamB_runs,teamB_wkts,teamB_overs"
function parseScore(scoreStr) {
  if (!scoreStr) return {};
  const p = scoreStr.split(",");
  // p[0]=innings, p[1]=teamA_runs, p[2]=teamA_wkts, p[3]=teamA_overs, p[4]=teamB_runs, p[5]=teamB_wkts, p[6]=teamB_overs
  const taRuns = p[1] || "0";
  const taWkts = p[2] || "0";
  const taOvers = p[3] || "0";
  const tbRuns = p[4] || "0";
  const tbWkts = p[5] || "0";
  const tbOvers = p[6] || "0";
  return {
    teamAScore: `${taRuns}/${taWkts}`,
    teamAOvers: `${taOvers} Over`,
    teamBScore: `${tbRuns}/${tbWkts}`,
    teamBOvers: `${tbOvers} Overs`,
  };
}

export default function Cmatch20Page() {
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
  } = useCasinoGame(GAME_ID, { formatResult: formatCmatch20Result });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const loading = !gameData;

  const raw = gameData?.data?.data || gameData?.data || {};
  const scoreStr = raw?.score || "";
  const remark = raw?.remark || "";
  const { teamAScore, teamAOvers, teamBScore, teamBOvers } = parseScore(scoreStr);

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
      <div className="casino-page-container cricket20">
        {loading && <CasinoLoader />}

        <CasinoHeader name="Cricket Match 20-20" gameId={GAME_ID} roundId={roundId} />

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
                {iframeSrc && (
                  <iframe src={iframeSrc} title="Cricket Match 20-20" allowFullScreen allow="autoplay" />
                )}
              </div>
            </div>
            <div className="cricket20books"></div>
            <Cmatch20VideoCards cardString={cardString} />
            <FlipClock value={timer} />
          </div>

          {tableData.length > 0 && (
            <div className="casino-detail">
              <BetTableCmatch20
                tableData={tableData}
                teamAScore={teamAScore}
                teamBScore={teamBScore}
                teamAOvers={teamAOvers}
                teamBOvers={teamBOvers}
                remark={remark}
                onBetClick={handleBetClick}
              />

              <div className="casino-last-result-title">
                <span>Last Result</span>
                <span><a href={`/casino-results/${GAME_ID}`}>View All</a></span>
              </div>
              <div className="casino-last-results">
                {lastResults.map((r, i) => (
                  <span
                    key={i}
                    className="result"
                    style={{ cursor: "pointer" }}
                    onClick={() => setResultModal({ show: true, mid: r.mid || "" })}
                  >
                    {r.ballNum ? (
                      <img src={`${BALL_BASE}/ball${r.ballNum}.png`} alt={`Ball ${r.ballNum}`} />
                    ) : (
                      r.win || "-"
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {mobilePanelTab === "bets" && <CasinoMobileBetTable bets={myBets} />}

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
        gameType="cmatch20"
        mid={resultModal.mid}
        title="Cricket Match 20-20 Result"
      />
    </Layout>
  );
}
