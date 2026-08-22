import { useState, useMemo } from "react";
import CasinoLoader from "./tableLayout/CasinoLoader.jsx";

const QUICK_STAKES = [25, 50, 100, 200, 500, 1000];

const SELECTION_BALLS = [
  "/assets/front/img/sequence/s1.png",
  "/assets/front/img/sequence/s2.png",
  "/assets/front/img/sequence/s3.png",
  "/assets/front/img/sequence/s4.png",
  "/assets/front/img/sequence/s5.png",
  "/assets/front/img/sequence/s6.png",
];

/**
 * PlaceBet UI — renders inside CasinoRightSidebar.
 * Actual bet submission logic lives in useCasinoGame hook (handlePlaceBet).
 */
export default function PlaceBet({
  show,
  betValue,
  displayOdds,
  betType,
  selection,
  min = 1000,
  max = 25000,
  stakeAmount,
  setStakeAmount,
  placing,
  onClose,
  onSubmit,
  gameType,
  lotteryBall,
  jokerCardSrc,
  // Optional extra gate on the submit button. Unique Teenpatti opens this slip
  // on the FIRST card picked so a stake can be entered early, but the bet needs
  // all three, so it blocks submission until then. Defaults off — every other
  // game is unaffected.
  submitDisabled = false,
}) {
  const odds = Number(betValue) || 0;
  // What the odds box shows — defaults to the bet odds, but a market may show a
  // different figure (e.g. Trio Session shows its line while betting at the bhav
  // decimal). Profit below always uses the real bet odds.
  const shownOdds = displayOdds != null && displayOdds !== "" ? displayOdds : betValue;
  const stakeNum = Number(stakeAmount) || 0;
  const profit = useMemo(() => {
    if (!odds || !stakeNum) return 0;
    // Lottery (lottcard) quotes a "1 to X" profit multiplier (Single 9.5, Double
    // 95, Triple 900), paid as the whole number — Single ×9, Double ×95, Triple
    // ×900 (the .5 is dropped) — not the decimal-odds stake×(odds−1).
    // Sic Bo (sicbo/sicbo2) likewise quotes the payout as a "X to 1" profit ratio
    // in `b`, so profit is stake×ratio. Single shows its base 1:1 here; it settles
    // at the actual match count (1/2/3).
    const isRatioGame = gameType === "lottcard" || gameType === "sicbo" || gameType === "sicbo2";
    const mult = isRatioGame ? Math.floor(odds) : odds - 1;
    return Math.round(mult * stakeNum * 100) / 100;
  }, [odds, stakeNum, gameType]);

  function handleQuickStake(val) {
    setStakeAmount(String((Number(stakeAmount) || 0) + val));
  }

  if (!show) return null;

  const formatRange = `${min >= 1000 ? `${min / 1000}K` : min} to ${max >= 1000 ? `${max / 1000}K` : max}`;

  return (
    <div className="sidebar-box place-bet-container">
      <div className="sidebar-title">
        <h4>Place Bet</h4>
        <span>Range: {formatRange}</span>
      </div>
      <div className={`place-bet-box position-relative ${
        selection?.startsWith("Andar")
          ? "andarbg andarbg3"
          : selection?.startsWith("Bahar")
          ? "baharbg baharbg3"
          : (betType || "back")
      }`}>
        {placing && <CasinoLoader />}
        <div className="place-bet-box-header">
          <div className="place-bet-for">(Bet for)</div>
          {/* Lottery has no meaningful decimal odds to show in the slip — the
              payout is a fixed 1-to-X multiplier — so its odds column is hidden. */}
          {gameType !== "lottcard" && <div className="place-bet-odds">Odds</div>}
          <div className="place-bet-stake">Stake</div>
          <div className="place-bet-profit">Profit</div>
        </div>
        <div className="place-bet-box-body">
          <div className="place-bet-for">
            {gameType === "lottcard" && lotteryBall != null ? (
              <div className="lottery-place-balls">
                {(Array.isArray(lotteryBall) ? lotteryBall : [lotteryBall]).map((d, i) => (
                  <img key={i} src={`/assets/img/lottery/ball${d}.png`} alt={`ball${d}`} />
                ))}
              </div>
            ) : gameType === "teenunique" ? (
              <div className="unique-teen20-place-balls">
                {selection && selection.split("").map((c) => {
                  const idx = parseInt(c, 10) - 1;
                  return idx >= 0 && idx <= 5 ? <img key={idx} src={SELECTION_BALLS[idx]} alt={`s${idx + 1}`} /> : null;
                })}
              </div>
            ) : (
              <>
                <i
                  className="fas fa-times text-danger me-1"
                  style={{ cursor: "pointer" }}
                  onClick={onClose}
                ></i>
                <span>{selection}</span>
              </>
            )}
          </div>
          {gameType !== "lottcard" && (
            <div className="place-bet-odds">
              <input type="text" className="form-control" disabled value={shownOdds} />
            </div>
          )}
          <div className="place-bet-stake">
            <input
              type="number"
              className="form-control"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
          </div>
          <div className="place-bet-profit">{profit > 0 ? profit : ""}</div>
        </div>
        <div className="place-bet-buttons">
          {QUICK_STAKES.map((val) => (
            <button key={val} className="btn btn-place-bet" onClick={() => handleQuickStake(val)}>
              +{val}
            </button>
          ))}
          <button className="btn btn-sm btn-link text-dark flex-fill text-end" onClick={() => setStakeAmount("")}>
            clear
          </button>
        </div>
        <div className="place-bet-action-buttons">
          <div>
            <button className="btn btn-info">Edit</button>
          </div>
          {jokerCardSrc && (
            <div className="joker-card">
              <span><img src={jokerCardSrc} alt="Joker" /></span>
            </div>
          )}
          <div>
            <button className="btn btn-danger me-1" onClick={() => setStakeAmount("")}>Reset</button>
            <button className="btn btn-success" disabled={!stakeNum || placing || submitDisabled} onClick={onSubmit}>
              {placing ? "..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
