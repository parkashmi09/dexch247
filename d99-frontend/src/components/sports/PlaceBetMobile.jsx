import { useMemo } from "react";
import { Modal } from "react-bootstrap";
import { SPORTS_QUICK_STAKES, calcProfitLoss, calcOutcomeProjection, stepOdds } from "../../utils/gameDetailsUtils.js";
import { isOddsInRange, isOddsLocked } from "../../utils/sportsBetRules.js";

export default function PlaceBetMobile({
  betState, exposures, onOddsChange, onStakeChange, onQuickStake, onClear, onReset, onClose, onSubmit, placing
}) {
  const { open, market, marketType, runner, betType, odds, stake, isCashout } = betState;

  const stakeNum = Number(stake) || 0;
  const oddsNum = Number(odds) || 0;
  const clickedSize = Number(runner?.odds?.find?.((o) => Number(o?.odds) === oddsNum)?.size) || 0;
  const { profit } = calcProfitLoss(marketType, betType, oddsNum, stakeNum, market, clickedSize);
  // Manual editing is only possible on `gtype: 'match'` markets (spec §6.4).
  const oddsEditable = !!market && !isOddsLocked(market) && !isCashout;
  const selectionName = runner?.nat || runner?.name || "";

  // Normal / Ball By Ball / Over By Over: no real-time profit number (matches old frontend)
  const mname = String(market?.mname || marketType || "").toLowerCase();
  const isNormalLike = mname.includes("normal") || mname.includes("ball by ball") || mname.includes("over by over");
  const displayProfit = isNormalLike ? 0 : profit;

  // Projected book per outcome = existing exposure (by market mid) + this pending bet
  const runnerPL = useMemo(() => {
    if (stakeNum <= 0 || !isOddsInRange(market, oddsNum)) return null;
    return calcOutcomeProjection({ market, marketType, selectedRunner: runner, betType, odds: oddsNum, stake: stakeNum, exposures, rate: clickedSize });
  }, [market, marketType, runner, betType, oddsNum, stakeNum, exposures, clickedSize]);

  function handleSpinUp() {
    if (!oddsEditable) return;
    onOddsChange(stepOdds(odds, +1));
  }
  function handleSpinDown() {
    if (!oddsEditable) return;
    onOddsChange(stepOdds(odds, -1));
  }

  const submitDisabled = placing || stakeNum <= 0 || !isOddsInRange(market, oddsNum);

  return (
    <Modal show={open} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Place Bet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={`place-bet-modal position-relative ${betType === "lay" ? "lay" : "back"}`}>
          {placing && (
            <div id="loader-section">
              <div id="load-inner">
                <i className="fa fa-spinner fa-spin"></i>
              </div>
            </div>
          )}
          <div className="row row5">
            <div className="col-6"><b>{selectionName}</b></div>
            <div className="col-6 text-end"><span>Profit: {displayProfit > 0 ? Math.round(displayProfit) : 0}</span></div>
          </div>
          <div className="odd-stake-box">
            <div className="row row5 mt-1">
              <div className="col-6 text-center">Odds</div>
              <div className="col-6 text-center">Amount</div>
            </div>
            <div className="row row5 mt-1">
              <div className="col-6">
                <div className="float-end">
                  {oddsEditable && (
                    <button className="stakeactionminus btn" type="button" onClick={handleSpinDown}>
                      <span className="fa fa-minus"></span>
                    </button>
                  )}
                  <input
                    type="text"
                    inputMode="decimal"
                    className="stakeinput"
                    disabled={!oddsEditable}
                    value={odds}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) onOddsChange(v);
                    }}
                  />
                  {oddsEditable && (
                    <button className="stakeactionminus btn" type="button" onClick={handleSpinUp}>
                      <span className="fa fa-plus"></span>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="stakeinput w-100"
                  value={stake}
                  onChange={(e) => onStakeChange(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="place-bet-buttons mt-1">
            {SPORTS_QUICK_STAKES.map((qs) => (
              <button key={qs.label} className="btn btn-place-bet" type="button" onClick={() => onQuickStake(qs.value)}>
                {qs.label}
              </button>
            ))}
          </div>
          <div className="mt-1 place-bet-btn-box">
            <button className="btn btn-link" type="button" onClick={onClear}>Clear</button>
            <button className="btn btn-info" type="button">Edit</button>
            <button className="btn btn-danger" type="button" onClick={onReset}>Reset</button>
            <button className="btn btn-success" type="button" disabled={submitDisabled} onClick={onSubmit}>
              {placing ? <i className="fa fa-spinner fa-spin" /> : "Place Bet"}
            </button>
          </div>
          <div className="mt-1 d-flex"></div>
          {runnerPL && stakeNum > 0 && (
            <div className="odds-count mt-1">
              {runnerPL.map((r) => (
                <div key={r.name} className="row row5 mt-2">
                  <div className="col-6"><span>{r.name}</span></div>
                  <div className="col-3 text-center"></div>
                  <div className="col-3 text-end">
                    <span className={r.total > 0 ? "text-success" : r.total < 0 ? "text-danger" : ""}>{r.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
