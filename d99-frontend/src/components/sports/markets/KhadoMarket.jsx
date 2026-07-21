import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { MARKET_TYPE, formatSize, formatLimit, getExposureForSelection } from "../../../utils/gameDetailsUtils.js";

export default function KhadoMarket({ market, exposures, onBetClick }) {
  const isSuspended = market.status === "SUSPENDED";

  function handleOddClick(runner, oddObj) {
    if (!oddObj || !oddObj.odds || oddObj.odds === "-") return;
    if (isSuspended || runner.gstatus === "SUSPENDED") return;
    onBetClick({
      market,
      marketType: MARKET_TYPE.KHADO,
      runner,
      betType: "back",
      odds: oddObj.odds,
    });
  }

  return (
    <div className="game-market market-10">
      <div className="market-title">
        <span>{market.mname}</span>
      </div>

      <div className="market-header">
        <div className="market-nation-detail" />
        <div className="market-odd-box back">
          <b>Back</b>
        </div>
        <div className="fancy-min-max-box" />
      </div>

      <div className="market-body " data-title={isSuspended ? "SUSPENDED" : (market.status || "OPEN")}>
        {market.section?.map((runner) => {
          const susp = runner.gstatus === "SUSPENDED";
          const backOdd = runner.odds?.find((o) => o.otype?.toLowerCase() === "back");
          const exposure = getExposureForSelection(exposures, runner, market.mid);

          return (
            <div
              key={runner.sid || runner.nat}
              className={`market-row${susp ? " suspended-row" : ""}`}
              data-title={susp ? "SUSPENDED" : runner.gstatus}
            >
              <div className="market-nation-detail">
                <span className="market-nation-name">{runner.nat}</span>
                <div className="market-nation-book"><ExposureValue value={exposure} /></div>
              </div>
              <BlinkBox
                value={backOdd?.odds ?? "-"}
                size={backOdd?.size}
                className="market-odd-box back"
                onClick={() => handleOddClick(runner, backOdd)}
              >
                <span className="market-odd">{backOdd?.odds ?? "-"}</span>
                <span className="market-volume">{formatSize(backOdd?.size)}</span>
              </BlinkBox>
              <div className="fancy-min-max-box">
                <div className="fancy-min-max">
                  <span className="w-100 d-block">Min: {formatLimit(runner.min)}</span>
                  <span className="w-100 d-block">Max: {formatLimit(runner.max)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
