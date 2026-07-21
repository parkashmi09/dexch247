import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { formatLimit, getExposureForSelection } from "../../../utils/gameDetailsUtils.js";

export default function HtftMarket({ market, exposures, onBetClick }) {
  const runners = market.section || [];
  const mname = market.mname || "HT/FT";
  const maxLabel = market.max ? `Max: ${formatLimit(market.max)}` : "";

  return (
    <div className="game-market market-1">
      <div className="market-title">
        <span>{mname}</span>
        {maxLabel && <span>{maxLabel}</span>}
      </div>
      <div className="market-row" data-title={market.status || "OPEN"}>
        {runners.map((runner, idx) => {
          const suspended = runner.gstatus === "SUSPENDED" || runner.gstatus === "Ball Running";
          const backOdd = runner.odds?.find((o) => o.otype === "back" || o.oname === "back1");
          const odds = suspended ? "-" : (backOdd?.odds || "-");
          const size = suspended ? "" : (backOdd?.size || "");
          const exposure = getExposureForSelection(exposures, runner, market.mid);

          return (
            <div key={idx} className={`market-1-item${suspended ? " suspended-box" : ""}`}>
              <div>
                {runner.nat}
                <div className="market-nation-book"><ExposureValue value={exposure} /></div>
              </div>
              <BlinkBox
                value={odds}
                size={size}
                className="market-odd-box back"
                onClick={odds !== "-" && odds !== 0 ? () => onBetClick?.({
                  market,
                  marketType: "HTFT",
                  runner,
                  betType: "back",
                  odds: parseFloat(odds),
                }) : undefined}
              >
                <span className="market-odd">{odds}</span>
                {size && <span className="market-volume">{size}</span>}
              </BlinkBox>
            </div>
          );
        })}
      </div>
    </div>
  );
}
