function getExposure(exposures, nat) {
  if (!nat || !exposures) return null;
  const keys = [nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim()];
  for (const k of keys) {
    if (exposures[k] !== undefined) return exposures[k];
  }
  return null;
}

function ExposureDisplay({ value }) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return null;
  return (
    <span className={`casino-nation-book ${num >= 0 ? "text-success" : "text-danger"}`}>
      {num}
    </span>
  );
}

function isSuspended(item) {
  if (!item) return true;
  return item.gstatus !== "OPEN";
}

/**
 * Back-only odds box.
 * displayText: if provided, renders this text instead of item.b (used for Top 9 A/B).
 */
function BackOddsBox({ item, displayText, exposures, onBetClick }) {
  if (!item) {
    return (
      <div className="casino-odds-box back suspended-box">
        <span className="casino-odds">{displayText || "0"}</span>
      </div>
    );
  }
  const suspended = isSuspended(item);
  const odds = item.b || 0;
  const exp = getExposure(exposures, item.nat);
  const label = displayText !== undefined ? displayText : odds;

  return (
    <div
      className={`casino-odds-box back${suspended ? " suspended-box" : ""}`}
      onClick={() => !suspended && odds > 0 && onBetClick?.(odds, item.nat, item, "back")}
    >
      <span className="casino-odds">{label}</span>
      <ExposureDisplay value={exp} />
    </div>
  );
}

export default function BetTableTeenmuf({ tableData = [], onBetClick, exposures = {} }) {
  const bySid = {};
  tableData.forEach((d) => { bySid[d.sid] = d; });

  const sid1 = bySid[1]; // Player A (Winner)
  const sid2 = bySid[2]; // Player B (Winner)
  const sid3 = bySid[3]; // Top 9 A
  const sid4 = bySid[4]; // Top 9 B
  const sid5 = bySid[5]; // M Baccarat A
  const sid6 = bySid[6]; // M Baccarat B

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {/* Player A side */}
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player A</div>
          </div>
          <div className="casino-table-body">
            {/* Labels row */}
            <div className="casino-table-row">
              <div className="casino-odds-box">Winner</div>
              <div className="casino-odds-box">Top 9</div>
              <div className="casino-odds-box">M Baccarat A</div>
            </div>
            {/* Odds row */}
            <div className="casino-table-row">
              <BackOddsBox item={sid1} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid3} displayText="A" exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid5} exposures={exposures} onBetClick={onBetClick} />
            </div>
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        {/* Player B side */}
        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player B</div>
          </div>
          <div className="casino-table-body">
            {/* Labels row */}
            <div className="casino-table-row">
              <div className="casino-odds-box">Winner</div>
              <div className="casino-odds-box">Top 9</div>
              <div className="casino-odds-box">M Baccarat B</div>
            </div>
            {/* Odds row */}
            <div className="casino-table-row">
              <BackOddsBox item={sid2} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid4} displayText="B" exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid6} exposures={exposures} onBetClick={onBetClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
