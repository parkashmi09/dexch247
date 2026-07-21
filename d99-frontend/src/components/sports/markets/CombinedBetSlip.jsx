import { SPORTS_QUICK_STAKES, splitCombinedStake } from "../../../utils/gameDetailsUtils.js";

/**
 * Inline COMBINED (dutched) bet slip — MOBILE ONLY.
 *
 * On web the combined slip lives in the right-sidebar Place Bet panel; on
 * mobile it is anchored under the first ticked runner instead. It is never
 * shown in both places at once.
 *
 * The price shown is the COMBINED price (locked — no spinner: it is derived
 * from the individual runner prices, not a rate the user may nudge). The
 * per-leg split is previewed live so the user can see where their stake goes.
 */
export default function CombinedBetSlip({
  betState, onStakeChange, onQuickStake, onClear, onReset, onSubmit, placing,
}) {
  const { legs, betType, odds, stake } = betState;
  const oddsNum = Number(odds) || 0;
  const stakeNum = Number(stake) || 0;

  const parts = stakeNum > 0
    ? splitCombinedStake(stakeNum, legs.map((l) => Number(l.odds)))
    : legs.map(() => 0);

  // Payout is identical on every winning leg, so a dutched slip behaves like a
  // single bet at the combined price.
  const isLaySide = betType === "lay" || betType === "no";
  const profit = stakeNum > 0
    ? Math.round((isLaySide ? stakeNum : stakeNum * (oddsNum - 1)) * 100) / 100
    : 0;

  const submitDisabled = placing || stakeNum <= 0 || oddsNum < 1.01;

  return (
    <div className={`combined-slip position-relative ${isLaySide ? "lay" : "back"}`}>
      {placing && (
        <div id="loader-section">
          <div id="load-inner"><i className="fa fa-spinner fa-spin" /></div>
        </div>
      )}

      <div className="combined-slip-header row row5">
        <div className="col-6"><b>COMBINED ({legs.length})</b></div>
        <div className="col-6 text-end"><span>Profit: {profit > 0 ? profit : 0}</span></div>
      </div>

      <div className="row row5 mt-1">
        <div className="col-6 text-center">Odds</div>
        <div className="col-6 text-center">Amount</div>
      </div>
      <div className="row row5 mt-1">
        <div className="col-6">
          <input type="text" className="stakeinput w-100" disabled value={oddsNum} />
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

      <div className="place-bet-buttons mt-1">
        {SPORTS_QUICK_STAKES.map((qs) => (
          <button key={qs.label} className="btn btn-place-bet" type="button" onClick={() => onQuickStake(qs.value)}>
            {qs.label}
          </button>
        ))}
      </div>

      <div className="mt-1 place-bet-btn-box">
        <button className="btn btn-link" type="button" onClick={onClear}>Clear</button>
        <button className="btn btn-danger" type="button" onClick={onReset}>Reset</button>
        <button className="btn btn-success" type="button" disabled={submitDisabled} onClick={onSubmit}>
          {placing ? <i className="fa fa-spinner fa-spin" /> : "Place Bet"}
        </button>
      </div>

      {stakeNum > 0 && (
        <div className="combined-slip-legs mt-1">
          {legs.map((leg, i) => (
            <div key={leg.runner?.sid ?? i} className="combined-slip-leg row row5">
              <div className="col-6">{leg.runner?.nat || leg.runner?.name}</div>
              <div className="col-3 text-center">{leg.odds}</div>
              <div className="col-3 text-end">{parts[i]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
