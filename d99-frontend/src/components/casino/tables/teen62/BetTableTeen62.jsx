/**
 * Teen62 bet table:
 * - Player A Main (subtype=teen) + Consecutive (subtype=con)
 * - Player B Main (subtype=teen) + Consecutive (subtype=con)
 * - Odd/Even × 6 cards (subtype=oddeven, each card has odds[] with Odd/Even)
 */

function getExposure(exposures, nat, subtype) {
  if (!nat || !exposures) return null;
  // For con subtype, try "Player A con" first, then fall back to "Player A"
  const suffix = subtype === "con" ? " con" : "";
  const withSuffix = nat + suffix;
  const keys = [
    withSuffix, withSuffix.toLowerCase(),
    nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim(),
  ];
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
    <div className={`casino-nation-book ${num >= 0 ? "text-success" : "text-danger"}`}>
      {num}
    </div>
  );
}

export default function BetTableTeen62({ tableData = [], onBetClick, exposures = {} }) {
  const playerAMain = tableData.find((d) => d.subtype === "teen" && d.nat?.includes("Player A"));
  const playerACon = tableData.find((d) => d.subtype === "con" && d.nat?.includes("Player A"));
  const playerAItems = [playerAMain, playerACon].filter(Boolean);

  const playerBMain = tableData.find((d) => d.subtype === "teen" && d.nat?.includes("Player B"));
  const playerBCon = tableData.find((d) => d.subtype === "con" && d.nat?.includes("Player B"));
  const playerBItems = [playerBMain, playerBCon].filter(Boolean);

  const cardItems = tableData
    .filter((d) => d.subtype === "oddeven")
    .sort((a, b) => (a.sr || 0) - (b.sr || 0));

  function renderPlayerBox(title, items, side) {
    return (
      <div className={`casino-table-${side}-box`}>
        <div className="casino-table-header">
          <div className="casino-nation-detail">{title}</div>
          <div className="casino-odds-box back">Back</div>
          <div className="casino-odds-box lay">Lay</div>
        </div>
        <div className="casino-table-body">
          {items.map((item, idx) => {
            const suspended = item.gstatus !== "OPEN";
            const label = item.subtype === "con" ? "Consecutive" : "Main";
            const exp = getExposure(exposures, item.nat, item.subtype);
            return (
              <div key={idx} className={`casino-table-row${suspended ? " suspended-row" : ""}`}>
                <div className="casino-nation-detail">
                  <div className="casino-nation-name">
                    {label}
                    <ExposureDisplay value={exp} />
                  </div>
                </div>
                <div
                  className="casino-odds-box back"
                  onClick={() => !suspended && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
                >
                  <span className="casino-odds">{item.b || 0}</span>
                </div>
                <div
                  className="casino-odds-box lay"
                  onClick={() => !suspended && item.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}
                >
                  <span className="casino-odds">{item.l || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderOddEvenRow(label, oddIndex) {
    return (
      <div className="casino-table-row">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const card = cardItems[i];
          if (!card) {
            return (
              <div key={i} className="casino-odds-box back suspended-box">
                <span className="casino-odds">0</span>
              </div>
            );
          }
          const suspended = card.gstatus !== "OPEN";
          const oddEvenItem = card.odds?.[oddIndex];
          const rate = oddEvenItem?.b || 0;
          const natLabel = `${card.nat} ${label}`;
          const exp = getExposure(exposures, natLabel);

          return (
            <div
              key={i}
              className={`casino-odds-box back${suspended || rate === 0 ? " suspended-box" : ""}`}
              onClick={() => !suspended && rate > 0 && onBetClick?.(rate, natLabel, { ...card, ...oddEvenItem, nat: natLabel }, "back")}
            >
              <span className="casino-odds">{rate}</span>
              <ExposureDisplay value={exp} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {renderPlayerBox("Player A", playerAItems, "left")}
        <div className="casino-table-box-divider"></div>
        {renderPlayerBox("Player B", playerBItems, "right")}
      </div>

      <div className="casino-table-full-box teenpatti1day-other-odds mt-3">
        <div className="casino-table-header">
          <div className="casino-nation-detail"></div>
          <div className="casino-odds-box">Card 1</div>
          <div className="casino-odds-box">Card 2</div>
          <div className="casino-odds-box">Card 3</div>
          <div className="casino-odds-box">Card 4</div>
          <div className="casino-odds-box">Card 5</div>
          <div className="casino-odds-box">Card 6</div>
        </div>
        <div className="casino-table-body">
          {renderOddEvenRow("Odd", 0)}
          {renderOddEvenRow("Even", 1)}
        </div>
      </div>
    </div>
  );
}
