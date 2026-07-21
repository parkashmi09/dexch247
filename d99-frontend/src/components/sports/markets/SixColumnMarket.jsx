import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { MARKET_TYPE, formatSize, formatLimit, getOddByTier, getExposureForSelection, hasCashoutPosition } from "../../../utils/gameDetailsUtils.js";

export default function SixColumnMarket({ market, exposures, marketType, onBetClick, widthClass, onCashout }) {
  // Suspension follows per-runner gstatus, NOT the top-level market.status:
  // if any runner is still ACTIVE (i.e. odds are coming), the market must not be
  // treated as fully suspended. Each runner gets its own per-row overlay below
  // based on its gstatus, so an active odds-bearing runner always stays visible.
  const sections = market.section || [];
  const isSuspended = sections.length
    ? sections.every((s) => {
        const gs = (s.gstatus || "").toUpperCase();
        return gs === "SUSPENDED" || gs === "BALL RUNNING";
      })
    : market.status === "SUSPENDED";
  const isBookmaker = marketType === MARKET_TYPE.BOOKMAKER;
  const label = market.mname;

  const minMax = isBookmaker
    ? `Min: ${formatLimit(market.min)}\u00a0 Max: ${formatLimit(market.max)}`
    : `Max: ${formatLimit(market.maxb || market.max)}`;

  // Enable Cashout only when the user actually holds a book on this 2-runner
  // market \u2014 otherwise the click just toasts "no position" (spec \u00a78.1).
  const canCashout = !!onCashout && hasCashoutPosition(market, exposures);

  function handleOddClick(runner, betType, oddObj) {
    if (!oddObj || oddObj.odds === "-" || !oddObj.odds) return;
    const gs = (runner.gstatus || "").toUpperCase();
    if (gs === "SUSPENDED" || gs === "BALL RUNNING") return;
    onBetClick({
      market,
      marketType,
      runner,
      betType,
      odds: oddObj.odds,
    });
  }

  return (
    <div className={`game-market market-4 ${widthClass || ""}`}>
      <div className="market-title">
        <span>{label}</span>
        <button
          className="btn btn-success btn-sm"
          disabled={!canCashout}
          onClick={() => canCashout && onCashout(market, marketType)}
        >
          Cashout
        </button>
      </div>

      <div className="market-header">
        <div className="market-nation-detail">
          <span className="market-nation-name">{minMax}</span>
        </div>
        <div className="market-odd-box no-border d-none d-md-block" />
        <div className="market-odd-box no-border d-none d-md-block" />
        <div className="market-odd-box back">
          <b>Back</b>
        </div>
        <div className="market-odd-box lay">
          <b>Lay</b>
        </div>
        <div className="market-odd-box" />
        <div className="market-odd-box no-border" />
      </div>

      <div className="market-body " data-title={isSuspended ? "SUSPENDED" : (market.status || "OPEN")}>
        {sections.map((runner) => {
          const gs = (runner.gstatus || "").toUpperCase();
          const susp = gs === "SUSPENDED" || gs === "BALL RUNNING";
          const back1 = getOddByTier(runner.odds, "back", 0);
          const back2 = getOddByTier(runner.odds, "back", 1);
          const back3 = getOddByTier(runner.odds, "back", 2);
          const lay1 = getOddByTier(runner.odds, "lay", 0);
          const lay2 = getOddByTier(runner.odds, "lay", 1);
          const lay3 = getOddByTier(runner.odds, "lay", 2);
          const allDash = back1.odds === "-" && back2.odds === "-" && back3.odds === "-" && lay1.odds === "-" && lay2.odds === "-" && lay3.odds === "-";
          const rowSusp = susp || allDash;
          const exposure = getExposureForSelection(exposures, runner, market.mid);

          return (
            <div
              key={runner.sid || runner.nat}
              className={`market-row ${rowSusp ? "suspended-row" : ""}`}
              data-title={susp ? "SUSPENDED" : (runner.gstatus || "ACTIVE")}
            >
              <div className="market-nation-detail">
                <span className="market-nation-name">{runner.nat}</span>
                <div className="market-nation-book">
                  <ExposureValue value={exposure} />
                </div>
              </div>
              <BlinkBox
                value={back3.odds}
                size={back3.size}
                className="market-odd-box back2"
                onClick={back3.odds !== "-" ? () => handleOddClick(runner, "back", back3) : undefined}
              >
                <span className="market-odd">{back3.odds}</span>
                <span className="market-volume">{formatSize(back3.size)}</span>
              </BlinkBox>
              <BlinkBox
                value={back2.odds}
                size={back2.size}
                className="market-odd-box back1"
                onClick={back2.odds !== "-" ? () => handleOddClick(runner, "back", back2) : undefined}
              >
                <span className="market-odd">{back2.odds}</span>
                <span className="market-volume">{formatSize(back2.size)}</span>
              </BlinkBox>
              <BlinkBox
                value={back1.odds}
                size={back1.size}
                className="market-odd-box back"
                onClick={back1.odds !== "-" ? () => handleOddClick(runner, "back", back1) : undefined}
              >
                <span className="market-odd">{back1.odds}</span>
                <span className="market-volume">{formatSize(back1.size)}</span>
              </BlinkBox>
              <BlinkBox
                value={lay1.odds}
                size={lay1.size}
                className="market-odd-box lay"
                onClick={lay1.odds !== "-" ? () => handleOddClick(runner, "lay", lay1) : undefined}
              >
                <span className="market-odd">{lay1.odds}</span>
                <span className="market-volume">{formatSize(lay1.size)}</span>
              </BlinkBox>
              <BlinkBox
                value={lay2.odds}
                size={lay2.size}
                className="market-odd-box lay1"
                onClick={lay2.odds !== "-" ? () => handleOddClick(runner, "lay", lay2) : undefined}
              >
                <span className="market-odd">{lay2.odds}</span>
                <span className="market-volume">{formatSize(lay2.size)}</span>
              </BlinkBox>
              <BlinkBox
                value={lay3.odds}
                size={lay3.size}
                className="market-odd-box lay2"
                onClick={lay3.odds !== "-" ? () => handleOddClick(runner, "lay", lay3) : undefined}
              >
                <span className="market-odd">{lay3.odds}</span>
                <span className="market-volume">{formatSize(lay3.size)}</span>
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
