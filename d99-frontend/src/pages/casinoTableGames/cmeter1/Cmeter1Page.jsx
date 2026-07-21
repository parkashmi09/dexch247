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
import { BetTableCmeter1, Cmeter1VideoCards } from "../../../components/casino/tables/cmeter1/index.jsx";
import { CASINO_GAME_IDS, formatCmeter1Result } from "../../../components/casino/tables/tableCasinoUtils.js";
import useCasinoGame from "../../../hooks/useCasinoGame.js";
import useInactivity from "../../../hooks/useInactivity.js";
import { Modal } from "react-bootstrap";

const GAME_ID = CASINO_GAME_IDS.CMETER1;

export default function Cmeter1Page() {
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
  } = useCasinoGame(GAME_ID, { formatResult: formatCmeter1Result });

  const [mobilePanelTab, setMobilePanelTab] = useState("game");
  const [resultModal, setResultModal] = useState({ show: false, mid: "" });
  const [isDisconnected, reconnect] = useInactivity();
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
      <div className="casino-page-container one-card-meter">
        {loading && <CasinoLoader />}

        <CasinoHeader name="1 Card Meter" gameId={GAME_ID} roundId={roundId} />

        <CasinoMobileTabs
          activeTab={mobilePanelTab}
          onTabChange={setMobilePanelTab}
          placedBetsCount={myBets.length}
          roundId={roundId}
        />

        <div className={mobilePanelTab === "bets" ? "d-none d-xl-block" : ""}>
          <div className="casino-video">
            {isDisconnected && (
              <div className="disconnected-box d-none d-xl-flex">
                <div className="disconnected-message">
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <b>Disconnection due to inactivity</b>
                  </div>
                  <div className="mt-3 text-center">
                    Are you there? You have been disconnected. Please go back to home or start playing again
                  </div>
                  <div className="disconnected-buttons mt-3">
                    <button type="button" className="btn btn-outline-primary" onClick={reconnect}>Reconnect</button>
                    <a className="btn btn-outline-danger" href="/home">Home</a>
                  </div>
                </div>
              </div>
            )}

            <Modal show={isDisconnected} centered dialogClassName="d-xl-none">
              <Modal.Body className="p-0">
                <div className="disconnected-message">
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <b>Disconnection due to inactivity</b>
                  </div>
                  <div className="mt-3 text-center">
                    Are you there? You have been disconnected. Please go back to home or start playing again
                  </div>
                  <div className="disconnected-buttons mt-3">
                    <button type="button" className="btn btn-outline-primary" onClick={reconnect}>Reconnect</button>
                    <a className="btn btn-outline-danger" href="/home"><span>Home</span></a>
                  </div>
                </div>
              </Modal.Body>
            </Modal>

            <div className="video-box-container">
              <div className="casino-video-box">
                {iframeSrc && !isDisconnected ? (
                  <iframe src={iframeSrc} title="1 Card Meter" allowFullScreen allow="autoplay" />
                ) : (
                  !isDisconnected && (
                    <div className="d-flex justify-content-center align-items-center h-100 text-white">
                      Loading stream...
                    </div>
                  )
                )}
              </div>
              {!isDisconnected && <Cmeter1VideoCards cardString={cardString} />}
            </div>
            <FlipClock value={timer} />
          </div>

          {tableData.length > 0 && (
            <div className="casino-detail">
              <BetTableCmeter1
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
                    className={`result ${r.type || ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setResultModal({ show: true, mid: r.mid || "" })}
                  >
                    {r.label}
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
        gameType="cmeter1"
        mid={resultModal.mid}
        title="1 Card Meter Result"
      />
    </Layout>
  );
}
