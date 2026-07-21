import { SPORTS_QUICK_STAKES, calcProfitLoss, calcOutcomeProjection, isFancyType } from "../../utils/gameDetailsUtils.js";

export default function PlaceBetPanel({ betState, exposures, onOddsChange, onStakeChange, onQuickStake, onClear, onReset, onSubmit, placing }) {
  const { open, market, marketType, runner, betType, odds, stake, originalOdds } = betState;

  if (!open || !market) return null;

  const stakeNum = Number(stake) || 0;
  const oddsNum = Number(odds) || 0;
  const { profit } = calcProfitLoss(marketType, betType, oddsNum, stakeNum);
  const spinnerEnabled = !isFancyType(marketType);

  const selectionName = runner?.nat || runner?.name || "";
  const min = runner?.min ?? market?.min ?? 0;
  const max = runner?.max ?? market?.max ?? 0;

  // Normal / Ball By Ball / Over By Over: no real-time profit number (matches old frontend)
  const mname = String(market?.mname || marketType || "").toLowerCase();
  const isNormalLike = mname.includes("normal") || mname.includes("ball by ball") || mname.includes("over by over");
  const displayProfit = isNormalLike ? 0 : profit;

  // Projected book per outcome = existing exposure (by market mid) + this pending bet
  const projection = stakeNum > 0 && oddsNum >= 1.01
    ? calcOutcomeProjection({ market, marketType, selectedRunner: runner, betType, odds: oddsNum, stake: stakeNum, exposures })
    : null;

  function handleSpinUp() {
    if (!spinnerEnabled) return;
    const next = Math.min(1000, Math.round((oddsNum + 0.01) * 100) / 100);
    onOddsChange(String(next));
  }

  function handleSpinDown() {
    if (!spinnerEnabled) return;
    const next = Math.max(1.01, Math.round((oddsNum - 0.01) * 100) / 100);
    onOddsChange(String(next));
  }

  const submitDisabled = placing || stakeNum <= 0 || oddsNum < 1.01;

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
              className="form-control"
              disabled
              value={oddsNum}
            />
            {spinnerEnabled && (
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
