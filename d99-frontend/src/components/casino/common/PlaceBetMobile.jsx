import { useMemo, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import CasinoLoader from "./tableLayout/CasinoLoader.jsx";

const QUICK_STAKES = [25, 50, 100, 200, 500, 1000];
const XL_BREAKPOINT = 1200;

const SELECTION_BALLS = [
  "/assets/front/img/sequence/s1.png",
  "/assets/front/img/sequence/s2.png",
  "/assets/front/img/sequence/s3.png",
  "/assets/front/img/sequence/s4.png",
  "/assets/front/img/sequence/s5.png",
  "/assets/front/img/sequence/s6.png",
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < XL_BREAKPOINT);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < XL_BREAKPOINT);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function PlaceBetMobile({
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
  const isMobile = useIsMobile();
  const odds = Number(betValue) || 0;
  // Odds box display — defaults to the bet odds; a market may show a different
  // figure (Trio Session shows its line). Profit always uses the real bet odds.
  const shownOdds = displayOdds != null && displayOdds !== "" ? displayOdds : betValue;
  const stakeNum = Number(stakeAmount) || 0;
  const profit = useMemo(() => {
    if (!odds || !stakeNum) return 0;
    // Lottery (lottcard) quotes a "1 to X" profit multiplier (Single 9.5, Double
    // 95, Triple 900), paid as the whole number — Single ×9, Double ×95, Triple
    // ×900 (the .5 is dropped) — not the decimal-odds stake×(odds−1).
    // Sic Bo (sicbo/sicbo2) likewise quotes the payout as a "X to 1" profit ratio
    // in `b` (Small/Big/Odd/Even 1, Double 8, Triple 150, Any Triple 30, Combo 5,
    // Total per size), so the profit is stake×ratio, not stake×(odds−1). Single
    // shows its base 1:1 here; it settles at the actual match count (1/2/3).
    const isRatioGame = gameType === "lottcard" || gameType === "sicbo" || gameType === "sicbo2";
    const mult = isRatioGame ? Math.floor(odds) : odds - 1;
    return Math.round(mult * stakeNum * 100) / 100;
  }, [odds, stakeNum, gameType]);

  function handleQuickStake(val) {
    setStakeAmount(String((Number(stakeAmount) || 0) + val));
  }

  const formatRange = `${min >= 100000 ? `${min / 100000}L` : min >= 1000 ? `${min / 1000}K` : min} to ${max >= 100000 ? `${max / 100000}L` : max >= 1000 ? `${max / 1000}K` : max}`;

  if (!isMobile) return null;

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Place Bet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={`place-bet-modal casino-bet-modal position-relative ${
          selection?.startsWith("Andar")
            ? "andarbg andarbg3"
            : selection?.startsWith("Bahar")
            ? "baharbg baharbg3"
            : (betType || "back")
        }`}>
          {placing && <CasinoLoader />}
          <div className="row row5">
            <div className="col-6">
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
                <b>{selection}</b>
              )}
            </div>
            <div className="col-6 text-end">
              <span>Profit: {profit > 0 ? profit : ""}</span>
            </div>
          </div>
          <div className="odd-stake-box">
            <div className="row row5 mt-1">
              <div className="col-6 text-center">Odds</div>
              <div className="col-6 text-center">Amount</div>
            </div>
            <div className="row row5 mt-1">
              <div className="col-6">
                <input type="text" className="stakeinput w-100" disabled value={shownOdds} />
              </div>
              <div className="col-6">
                <div className="float-end">
                  <input
                    type="number"
                    className="stakeinput w-100"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="place-bet-buttons mt-1">
            {QUICK_STAKES.map((val) => (
              <button key={val} className="btn btn-place-bet" onClick={() => handleQuickStake(val)}>
                +{val}
              </button>
            ))}
          </div>
          {jokerCardSrc && (
            <div className="joker-card mt-1">
              <span><img src={jokerCardSrc} alt="Joker" /></span>
            </div>
          )}
          <div className="mt-1 place-bet-btn-box">
            <button className="btn btn-link" onClick={() => setStakeAmount("")}>Clear</button>
            <button className="btn btn-info">Edit</button>
            <button className="btn btn-danger" onClick={() => setStakeAmount("")}>Reset</button>
            <button className="btn btn-success" disabled={!stakeNum || placing || submitDisabled} onClick={onSubmit}>
              {placing ? "..." : "Place Bet"}
            </button>
          </div>
          <div className="mt-1 d-flex">
            <span>Range: {formatRange}</span>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
