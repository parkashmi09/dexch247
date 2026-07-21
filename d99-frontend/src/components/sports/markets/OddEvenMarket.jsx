import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { MARKET_TYPE, formatSize, formatLimit, getExposureForSelection } from "../../../utils/gameDetailsUtils.js";

export default function OddEvenMarket({ market, exposures, onBetClick }) {
  const isSuspended = market.status === "SUSPENDED";
  const sections = market.section || [];

  function handleOddClick(runner, betType, oddObj) {
    if (!oddObj || !oddObj.odds || oddObj.odds === "-" || Number(oddObj.odds) === 0) return;
    const gs = (runner.gstatus || "").toUpperCase();
    if (gs === "SUSPENDED" || gs === "BALL RUNNING") return;
    onBetClick({
      market,
      marketType: MARKET_TYPE.ODDEVEN,
      runner,
      betType,
      odds: oddObj.odds,
    });
  }

  return (
    <div className="game-market market-6">
      <div className="market-title">
        <span>{market.mname}</span>
      </div>

      <div className="market-body " data-title={isSuspended ? "SUSPENDED" : (market.status || "OPEN")}>
        <div className="row row10">
          {sections.map((runner) => {
            const gs = (runner.gstatus || "").toUpperCase();
            const backOdd = runner.odds?.find((o) => o.otype?.toLowerCase() === "back");
            const layOdd = runner.odds?.find((o) => o.otype?.toLowerCase() === "lay");

            // Show "-" when odds is 0 or missing
            const backVal = backOdd?.odds && Number(backOdd.odds) !== 0 ? backOdd.odds : "-";
            const layVal = layOdd?.odds && Number(layOdd.odds) !== 0 ? layOdd.odds : "-";

            // Suspended when gstatus says so OR both odds are "-"
            const isSusp = gs === "SUSPENDED" || gs === "BALL RUNNING" || (backVal === "-" && layVal === "-");
            const exposure = getExposureForSelection(exposures, runner, market.mid);

            return (
              <div key={runner.sid || runner.nat} className="col-md-6">
                <div className={`fancy-market ${isSusp ? "suspended-row" : ""}`} data-title={isSusp ? (runner.gstatus || "SUSPENDED") : ""}>
                  <div className="market-row">
                    <div className="market-nation-detail">
                      <span className="market-nation-name">{runner.nat}</span>
                      <div className="market-nation-book"><ExposureValue value={exposure} /></div>
                    </div>
                    <BlinkBox
                      value={backVal}
                      size={backOdd?.size}
                      className="market-odd-box back "
                      onClick={backVal !== "-" ? () => handleOddClick(runner, "back", backOdd) : undefined}
                    >
                      <span className="market-odd">{backVal}</span>
                      {backVal !== "-" && backOdd?.size ? <span className="market-volume">{formatSize(backOdd.size)}</span> : null}
                    </BlinkBox>
                    <BlinkBox
                      value={layVal}
                      size={layOdd?.size}
                      className="market-odd-box back "
                      onClick={layVal !== "-" ? () => handleOddClick(runner, "lay", layOdd) : undefined}
                    >
                      <span className="market-odd">{layVal}</span>
                      {layVal !== "-" && layOdd?.size ? <span className="market-volume">{formatSize(layOdd.size)}</span> : null}
                    </BlinkBox>
                    <div className="fancy-min-max-box">
                      <div className="fancy-min-max">
                        <span className="w-100 d-block">Min: {formatLimit(runner.min)}</span>
                        <span className="w-100 d-block">Max: {formatLimit(runner.max)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
