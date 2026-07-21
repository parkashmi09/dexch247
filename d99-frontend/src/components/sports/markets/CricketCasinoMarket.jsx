import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { MARKET_TYPE, formatSize, formatLimit, getExposureForSelection } from "../../../utils/gameDetailsUtils.js";

export default function CricketCasinoMarket({ market, exposures, onBetClick }) {
  const isSuspended = market.status === "SUSPENDED";
  const minMax = `Min: ${formatLimit(market.min)} Max: ${formatLimit(market.max)}`;

  function handleOddClick(runner, oddObj) {
    if (!oddObj || !oddObj.odds || oddObj.odds === "-") return;
    if (isSuspended || runner.gstatus === "SUSPENDED") return;
    onBetClick({ market, marketType: MARKET_TYPE.CRICKETCASINO, runner, betType: "back", odds: oddObj.odds });
  }

  return (
    <div className="game-market market-9">
      <div className="market-title">
        <span>{market.mname}</span>
      </div>
      <div className="market-header">
        <div className="market-nation-detail">
          <span className="market-nation-name">{minMax}</span>
        </div>
        <div className="market-odd-box back"><b>Back</b></div>
      </div>
      <div className="market-body " data-title={isSuspended ? "SUSPENDED" : (market.status || "OPEN")}>
        {market.section?.map((runner) => {
          const gs = (runner.gstatus || "").toLowerCase();
          const susp = gs === "suspended" || gs === "ball running" || gs === "ballrunning";
          const backOdd = runner.odds?.find((o) => o.otype?.toLowerCase() === "back");
          const exposure = getExposureForSelection(exposures, runner, market.mid);
          return (
            <div key={runner.sid || runner.nat} className={`market-row${susp ? " suspended-box" : ""}`} data-title={runner.gstatus || ""}>
              <div className="market-nation-detail">
                <span className="market-nation-name">{runner.nat}</span>
                <div className="market-nation-book"><ExposureValue value={exposure} /></div>
              </div>
              <BlinkBox
                value={backOdd?.odds ?? "-"}
                size={backOdd?.size}
                className="market-odd-box back "
                onClick={backOdd?.odds && backOdd.odds !== "-" ? () => handleOddClick(runner, backOdd) : undefined}
              >
                <span className="market-odd">{backOdd?.odds ?? "-"}</span>
                {backOdd?.size ? <span className="market-volume">{formatSize(backOdd.size)}</span> : null}
              </BlinkBox>
            </div>
          );
        })}
      </div>
    </div>
  );
}
