import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { formatSize, formatLimit, getOddByTier, getExposureForSelection, hasCashoutPosition, detectMarketType } from "../../../utils/gameDetailsUtils.js";

export default function TwoColumnMarket({ market, exposures, onBetClick, onCashout, widthClass, showCashout = true, marketClass }) {
  // Real type (Bookmaker 2 / Tied / Score More Runs all render here) — the raw
  // `market` still drives payload/scale, but a correct label keeps display and
  // exposure re-mapping honest instead of tagging everything BOOKMAKER2.
  const resolvedType = detectMarketType(market);
  // Whole-market overlay is driven by per-runner gstatus, NOT the top-level
  // market.status. A match1 "Tied Match" bookmaker can report status:"SUSPENDED"
  // while one runner is still ACTIVE with live odds — that runner must stay
  // visible/bettable, and only the suspended runner gets its own per-row overlay
  // below. We only blank the whole table when every runner is suspended.
  const sections = market.section || [];
  const isSuspended = sections.length
    ? sections.every((s) => s.gstatus === "SUSPENDED")
    : market.status === "SUSPENDED";
  const label = market.mname;
  const minMax = `Min: ${formatLimit(market.min)}\u00a0 Max: ${formatLimit(market.max)}`;
  const canCashout = !!onCashout && hasCashoutPosition(market, exposures);

  function handleOddClick(runner, betType, odd) {
    if (!onBetClick || odd.odds === "-") return;
    onBetClick({ market, marketType: resolvedType, runner, betType, odds: odd.odds });
  }

  return (
    <div className={`game-market ${marketClass || "market-2"} ${widthClass || ""}`}>
      <div className="market-title">
        <span>{label}</span>
        {showCashout && (
          <button
            className="btn btn-success btn-sm"
            disabled={!canCashout}
            onClick={() => canCashout && onCashout(market, resolvedType)}
          >Cashout</button>
        )}
      </div>
      <div className="market-header">
        <div className="market-nation-detail">
          <span className="market-nation-name">{minMax}</span>
        </div>
        <div className="market-odd-box back"><b>Back</b></div>
        <div className="market-odd-box lay"><b>Lay</b></div>
      </div>
      <div className={`market-body${isSuspended ? " suspended-table" : ""} `} data-title={isSuspended ? "SUSPENDED" : (market.status || "OPEN")}>
        {sections.map((runner) => {
          const susp = runner.gstatus === "SUSPENDED";
          const back1 = getOddByTier(runner.odds, "back", 0);
          const lay1 = getOddByTier(runner.odds, "lay", 0);
          const exposure = getExposureForSelection(exposures, runner, market.mid);

          return (
            <div
              key={runner.sid || runner.nat}
              className={`market-row${susp ? " suspended-row" : ""}`}
              data-title={susp ? "SUSPENDED" : (runner.gstatus || "ACTIVE")}
            >
              <div className="market-nation-detail">
                <span className="market-nation-name">{runner.nat}</span>
                <div className="market-nation-book">
                  <ExposureValue value={exposure} />
                </div>
              </div>
              <BlinkBox
                value={back1.odds}
                size={back1.size}
                className="market-odd-box back   "
                onClick={back1.odds !== "-" ? () => handleOddClick(runner, "back", back1) : undefined}
              >
                <span className="market-odd">{back1.odds}</span>
                {back1.size ? <span className="market-volume">{formatSize(back1.size)}</span> : null}
              </BlinkBox>
              <BlinkBox
                value={lay1.odds}
                size={lay1.size}
                className="market-odd-box lay   "
                onClick={lay1.odds !== "-" ? () => handleOddClick(runner, "lay", lay1) : undefined}
              >
                <span className="market-odd">{lay1.odds}</span>
                {lay1.size ? <span className="market-volume">{formatSize(lay1.size)}</span> : null}
              </BlinkBox>
            </div>
          );
        })}
      </div>
      {market.rem && (
        <div className="market-row">
          <p className="market-remark">{market.rem}</p>
        </div>
      )}
    </div>
  );
}
