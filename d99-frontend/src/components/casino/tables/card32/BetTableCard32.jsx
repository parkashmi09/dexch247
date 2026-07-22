function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureSpan({ exposures, nat }) {
  const raw = getExp(exposures, nat);
  if (raw === null || raw === undefined) return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return null;
  return (
    <div style={{ color: n < 0 ? "#ff0000" : "#00ff00", fontSize: 10, marginTop: 2 }}>
      {n < 0 ? n.toFixed(2) : `+${n.toFixed(2)}`}
    </div>
  );
}

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

function BackLayRow({ item, label, onBetClick, exposures }) {
  const sus = isSus(item);
  const nat = item?.nat || label;
  const backOdds = (item?.b || 0);
  const layOdds = (item?.l || 0);

  return (
    <div className="casino-table-row">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">{label}</div>
        <ExposureSpan exposures={exposures} nat={nat} />
      </div>
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
      >
        <span className="casino-odds">{backOdds}</span>
      </div>
      <div
        className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, nat, item, "lay")}
      >
        <span className="casino-odds">{layOdds}</span>
      </div>
    </div>
  );
}

export default function BetTableCard32({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);

  const p8 = find("Player 8");
  const p9 = find("Player 9");
  const p10 = find("Player 10");
  const p11 = find("Player 11");

  return (
    <div className="casino-table cards32a">
      <div className="casino-table-box">
        {/* Left: Player 8 & 9 */}
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <BackLayRow item={p8} label="Player 8" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={p9} label="Player 9" onBetClick={onBetClick} exposures={exposures} />
          </div>
        </div>

        {/* Divider */}
        <div className="casino-table-box-divider"></div>

        {/* Right: Player 10 & 11 */}
        <div className="casino-table-right-box">
          <div className="casino-table-header d-none d-md-flex">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <BackLayRow item={p10} label="Player 10" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={p11} label="Player 11" onBetClick={onBetClick} exposures={exposures} />
          </div>
        </div>
      </div>
    </div>
  );
}
