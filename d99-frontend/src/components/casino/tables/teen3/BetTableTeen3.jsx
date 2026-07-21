function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

export default function BetTableTeen3({ tableData = [], onBetClick, exposures = {}, remark = "" }) {
  const playerA = tableData.find((d) => d.sid === 1) || null;
  const playerB = tableData.find((d) => d.sid === 2) || null;

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderBox(item, label) {
    const sus = isSus(item);
    const exp = getExp(exposures, item?.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    return (
      <div className={`casino-table-row${sus ? " suspended-row" : ""}`}>
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
          {!isNaN(expN) && expN !== 0 && (
            <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>
          )}
        </div>
        <div
          className="casino-odds-box back"
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
        >
          <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
        </div>
        <div
          className="casino-odds-box lay"
          onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}
        >
          <span className="casino-odds">{sus ? 0 : item?.l || 0}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player A</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderBox(playerA, "Main")}
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player B</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderBox(playerB, "Main")}
          </div>
        </div>
      </div>

      {remark && (
        <div className="casino-remark mt-1">
          <marquee scrollamount="3">{remark}</marquee>
        </div>
      )}
    </div>
  );
}
