import { SPORTS_QUICK_STAKES, calcProfitLoss, calcOutcomeProjection, stepOdds } from "../../utils/gameDetailsUtils.js";
import { getStakeLimits, isOddsInRange, isOddsLocked } from "../../utils/sportsBetRules.js";

export default function PlaceBetPanel({ betState, exposures, onOddsChange, onStakeChange, onQuickStake, onClear, onReset, onSubmit, placing }) {
  const { open, market, marketType, runner, betType, odds, stake, isCashout } = betState;

  if (!open || !market) return null;

  const stakeNum = Number(stake) || 0;
  const oddsNum = Number(odds) || 0;
  const clickedSize = Number(betState.runner?.odds?.find?.((o) => Number(o?.odds) === oddsNum)?.size) || 0;
  const { profit } = calcProfitLoss(marketType, betType, oddsNum, stakeNum, market, clickedSize);
  // Only `gtype: 'match'` markets let the user move the price — everything else
  // is odds-locked, and a cashout price is solved, not chosen.
  const oddsEditable = !isOddsLocked(market) && !isCashout;

  const selectionName = runner?.nat || runner?.name || "";
  const { min, max } = getStakeLimits(market, runner, { isCashout });

  // Normal / Ball By Ball / Over By Over: no real-time profit number (matches old frontend)
  const mname = String(market?.mname || marketType || "").toLowerCase();
  const isNormalLike = mname.includes("normal") || mname.includes("ball by ball") || mname.includes("over by over");
  const displayProfit = isNormalLike ? 0 : profit;

  // Projected book per outcome = existing exposure (by market mid) + this pending bet
  const projection = stakeNum > 0 && isOddsInRange(market, oddsNum)
    ? calcOutcomeProjection({ market, marketType, selectedRunner: runner, betType, odds: oddsNum, stake: stakeNum, exposures, rate: clickedSize })
    : null;

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
    <div className="sidebar-box place-bet-container">
      <div className="sidebar-title">
        <h4>Place Bet</h4>
      </div>
      <div className={`place-bet-box position-relative ${betType === "lay" ? "lay" : "back"}`}>
        {placing && (
          <div id="loader-section">
            <div id="load-inner">
              <i className="fa fa-spinner fa-spin"></i>
            </div>
          </div>
        )}
        <div className="place-bet-box-header">
          <div className="place-bet-for">(Bet for)</div>
          <div className="place-bet-odds">Odds</div>
          <div className="place-bet-stake">Stake</div>
          <div className="place-bet-profit">Profit</div>
        </div>
        <div className="place-bet-box-body">
          <div className="place-bet-for">
            <span>{selectionName}</span>
          </div>
          <div className="place-bet-odds">
            <input
              type="text"
              inputMode="decimal"
              className="form-control"
              disabled={!oddsEditable}
              value={odds}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) onOddsChange(v);
              }}
            />
            {oddsEditable && (
              <div className="spinner-buttons input-group-btn btn-group-vertical">
                <button className="btn-default" onClick={handleSpinUp} type="button">
                  <i className="fa fa-angle-up" />
                </button>
                <button className="btn-default" onClick={handleSpinDown} type="button">
                  <i className="fa fa-angle-down" />
                </button>
              </div>
            )}
          </div>
          <div className="place-bet-stake">
            <input
              type="number"
              className="form-control"
              value={stake}
              onChange={(e) => onStakeChange(e.target.value)}
              min={min || 0}
              max={max || undefined}
            />
          </div>
          <div className="place-bet-profit">{displayProfit > 0 ? displayProfit : 0}</div>
        </div>
        <div className="place-bet-buttons">
          {SPORTS_QUICK_STAKES.map((qs) => (
            <button
              key={qs.label}
              className="btn btn-place-bet"
              type="button"
              onClick={() => onQuickStake(qs.value)}
            >
              {qs.label}
            </button>
          ))}
          <button
            className="btn btn-sm btn-link text-dark flex-fill text-end"
            type="button"
            onClick={onClear}
          >
            clear
          </button>
        </div>
        <div className="place-bet-action-buttons">
          <div>
            <button className="btn btn-info" type="button">Edit</button>
          </div>
          <div>
            <button className="btn btn-danger me-1" type="button" onClick={onReset}>
              Reset
            </button>
            <button
              className="btn btn-success"
              type="button"
              disabled={submitDisabled}
              onClick={onSubmit}
            >
              {placing ? "..." : "Submit"}
            </button>
          </div>
        </div>
        {projection && projection.length > 0 && (
          <div className="place-bet-book mt-1">
            {projection.map((p) => (
              <div key={p.name} className="place-bet-book-row d-flex justify-content-between px-2">
                <span>{p.name}</span>
                <span className={p.total > 0 ? "text-success" : p.total < 0 ? "text-danger" : ""}>
                  {p.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
