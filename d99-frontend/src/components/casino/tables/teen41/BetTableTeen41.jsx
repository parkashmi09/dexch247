function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

export default function BetTableTeen41({ tableData = [], onBetClick, exposures = {}, remark = "" }) {
  const find = (name) => tableData.find((d) => d.nat === name);
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  const playerA = find("Player A");
  const playerB = find("Player B");
  const underB = find("Player B Under 21");
  const overB = find("Player B Over 21");

  function renderRow(item, label) {
    const sus = isSus(item);
    const exp = getExp(exposures, item?.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    return (
      <div className="casino-table-row ">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
          {!isNaN(expN) && expN !== 0 && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
        </div>
        <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
          <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
        </div>
        <div className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}>
          <span className="casino-odds">{sus ? 0 : item?.l || 0}</span>
        </div>
      </div>
    );
  }

  function renderUOBox(item) {
    const sus = isSus(item);
    const exp = getExp(exposures, item?.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    return (
      <div className="uo-box">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{item?.nat || ""}</div>
          {!isNaN(expN) && expN !== 0 && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
        </div>
        <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
          <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {/* Player A */}
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player A</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderRow(playerA, "Main")}
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        {/* Player B */}
        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player B</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderRow(playerB, "Main")}
            {/* Under/Over row */}
            <div className="casino-table-row under-over-row">
              {renderUOBox(underB)}
              {renderUOBox(overB)}
            </div>
          </div>
        </div>
      </div>

      {remark && (
        <div className="casino-remark mt-1">
          <marquee scrollAmount="3">{remark}</marquee>
        </div>
      )}
    </div>
  );
}
