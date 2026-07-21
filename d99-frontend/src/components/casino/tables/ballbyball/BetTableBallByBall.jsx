import { memo } from "react";

function isSuspended(item) {
  return !item || item.gstatus !== "OPEN";
}

function formatAmount(val) {
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 1000) return Math.round(n / 1000) + "K";
  return String(n);
}

function getExposure(exposures, nat) {
  if (!nat || !exposures) return null;
  const variants = [nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim()];
  for (const k of variants) {
    if (exposures[k] !== undefined) return exposures[k];
  }
  return null;
}

function ExposureBook({ nat, exposures }) {
  const val = getExposure(exposures, nat);
  if (val === null || val === undefined) return null;
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return null;
  return (
    <div
      className="casino-nation-book text-center w-100"
      style={{
        color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)",
        fontSize: "10px",
        fontWeight: "bold",
      }}
    >
      {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
    </div>
  );
}

const BetTableBallByBall = memo(function BetTableBallByBall({ tableData = [], onBetClick, exposures = {} }) {
  function handleBet(item) {
    if (isSuspended(item)) return;
    const odds = parseFloat(item.b);
    if (!odds || odds <= 0) return;
    onBetClick?.(odds, item.nat, item, "back");
  }

  return (
    <div className="casino-detail detail-page-container position-relative">
      <div className="game-market market-6 container-fluid container-fluid-5">
        <div className="market-title row row5">Runs</div>

        {/* Header row */}
        <div className="market-header row row5">
          <div className="col-12 col-md-4 d-none d-md-block">
            <div className="market-row">
              <div className="market-nation-detail"></div>
              <div className="market-odd-box back"><b>Back</b></div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-none d-md-block">
            <div className="market-row">
              <div className="market-nation-detail"></div>
              <div className="market-odd-box back"><b>Back</b></div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="market-row">
              <div className="market-nation-detail"></div>
              <div className="market-odd-box back"><b>Back</b></div>
            </div>
          </div>
          <div className="fancy-min-max-box"></div>
        </div>

        {/* Body: 9 items in 3-column grid */}
        <div className="market-body row row5">
          {tableData.map((item) => {
            const susp = isSuspended(item);
            const dataTitle = susp ? "SUSPENDED" : "OPEN";

            return (
              <div className="col-12 col-md-4" key={item.sid}>
                <div className="fancy-market" data-title={dataTitle}>
                  <div className="market-row">
                    <div className="market-nation-detail">
                      <span
                        className="market-nation-name pointer"
                        onClick={() => !susp && handleBet(item)}
                        style={{ cursor: susp ? "default" : "pointer" }}
                      >
                        {item.nat}
                      </span>
                      <ExposureBook nat={item.nat} exposures={exposures} />
                    </div>

                    <div className={`blb-box${susp ? " suspended-box" : ""}`}>
                      <div
                        className="market-odd-box back"
                        onClick={() => !susp && handleBet(item)}
                        style={{ cursor: susp ? "default" : "pointer" }}
                      >
                        <span className="market-odd">{susp ? "-" : (item.b || "-")}</span>
                        {!susp && item.bs && (
                          <span className="market-volume">{formatAmount(item.bs)}</span>
                        )}
                      </div>
                    </div>

                    <div className="fancy-min-max-box">
                      <div className="fancy-min-max">
                        <span className="w-100 d-block">Min: {formatAmount(item.min || 0)}</span>
                        <span className="w-100 d-block">Max: {formatAmount(item.max || item.bs || 0)}</span>
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
});

export default BetTableBallByBall;
