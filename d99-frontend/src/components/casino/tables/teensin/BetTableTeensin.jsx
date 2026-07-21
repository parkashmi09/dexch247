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
  return item.gstatus !== "OPEN" || (!item.b && !item.l);
}

function BackOddsBox({ item, label, exposures, onBetClick }) {
  if (!item) {
    return (
      <div className="casino-odds-box back suspended-box">
        <span className="casino-odds">0</span>
        <span className="casino-nation-book"></span>
      </div>
    );
  }
  const suspended = isSuspended(item);
  const odds = item.b || 0;
  const exp = getExposure(exposures, item.nat);

  return (
    <div
      className={`casino-odds-box back${suspended ? " suspended-box" : ""}`}
      onClick={() => !suspended && odds > 0 && onBetClick?.(odds, item.nat, item, "back")}
    >
      <span className="casino-odds">{odds}</span>
      <ExposureDisplay value={exp} />
    </div>
  );
}

export default function BetTableTeensin({ tableData = [], onBetClick, exposures = {} }) {
  // Map by sid
  const bySid = {};
  tableData.forEach((d) => { bySid[d.sid] = d; });

  const sid1 = bySid[1];  // Player A (Winner)
  const sid2 = bySid[2];  // Player B (Winner)
  const sid3 = bySid[3];  // High Card A
  const sid4 = bySid[4];  // High Card B
  const sid5 = bySid[5];  // Pair A
  const sid6 = bySid[6];  // Pair B
  const sid7 = bySid[7];  // Color Plus A
  const sid8 = bySid[8];  // Color Plus B
  const sid9 = bySid[9];  // Lucky 9

  const lucky9Suspended = !sid9 || sid9.gstatus !== "OPEN";
  const lucky9Back = sid9?.b || 0;
  const lucky9Lay = sid9?.l || 0;
  const lucky9BackSuspended = lucky9Suspended || lucky9Back === 0;
  const lucky9LaySuspended = lucky9Suspended || lucky9Lay === 0;
  const lucky9Exp = getExposure(exposures, sid9?.nat || "Lucky 9");

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
              <div className="casino-odds-box">High Card</div>
              <div className="casino-odds-box">Pair</div>
              <div className="casino-odds-box">Color Plus</div>
            </div>
            {/* Odds row */}
            <div className="casino-table-row">
              <BackOddsBox item={sid1} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid3} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid5} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid7} exposures={exposures} onBetClick={onBetClick} />
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
              <div className="casino-odds-box">High Card</div>
              <div className="casino-odds-box">Pair</div>
              <div className="casino-odds-box">Color Plus</div>
            </div>
            {/* Odds row */}
            <div className="casino-table-row">
              <BackOddsBox item={sid2} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid4} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid6} exposures={exposures} onBetClick={onBetClick} />
              <BackOddsBox item={sid8} exposures={exposures} onBetClick={onBetClick} />
            </div>
          </div>
        </div>
      </div>

      {/* Lucky 9 full-width section */}
      <div className="casino-table-full-box mt-3">
        <img src="/assets/img/lucky9.png" alt="Lucky 9" />
        <div className="casino-odd-box-container">
          <div
            className={`casino-odds-box back${lucky9BackSuspended ? " suspended-box" : ""}`}
            onClick={() => !lucky9BackSuspended && onBetClick?.(lucky9Back, sid9?.nat || "Lucky 9", sid9, "back")}
          >
            <span className="casino-odds">{lucky9Back}</span>
          </div>
          <div
            className={`casino-odds-box lay${lucky9LaySuspended ? " suspended-box" : ""}`}
            onClick={() => !lucky9LaySuspended && onBetClick?.(lucky9Lay, sid9?.nat || "Lucky 9", sid9, "lay")}
          >
            <span className="casino-odds">{lucky9Lay}</span>
          </div>
          <div className="casino-nation-book text-center w-100">
            <ExposureDisplay value={lucky9Exp} />
          </div>
        </div>
      </div>
    </div>
  );
}
