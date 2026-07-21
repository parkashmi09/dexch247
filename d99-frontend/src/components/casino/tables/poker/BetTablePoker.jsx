function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

export default function BetTablePoker({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name);
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  const playerA = find("Player A");
  const playerB = find("Player B");
  const bonus2A = find("2 Cards Bonus A") || find("Bonus A");
  const bonus7A = find("7 Cards Bonus A") || find("7 Bonus A");
  const bonus2B = find("2 Cards Bonus B") || find("Bonus B");
  const bonus7B = find("7 Cards Bonus B") || find("7 Bonus B");

  function renderPlayerRow(item, label) {
    const sus = isSus(item);
    return (
      <div className={`casino-table-row ${sus ? "" : ""}`}>
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
          <ExpBook value={getExp(exposures, item?.nat)} />
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

  function renderBonusBox(item, label) {
    const sus = isSus(item);
    return (
      <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
        <span className="casino-odds">{label}</span>
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-body">
            {renderPlayerRow(playerA, "Player A")}
          </div>
        </div>
        <div className="casino-table-box-divider"></div>
        <div className="casino-table-right-box">
          <div className="casino-table-body">
            {renderPlayerRow(playerB, "Player B")}
          </div>
        </div>
      </div>

      <div className="poker1day-other-odds">
        <div className="casino-table-left-box">
          <div className="w-100 d-xl-none mobile-nation-name">Player A</div>
          {renderBonusBox(bonus2A, "2 Cards Bonus")}
          {renderBonusBox(bonus7A, "7 Cards Bonus")}
        </div>
        <div className="casino-table-box-divider"></div>
        <div className="casino-table-right-box">
          <div className="w-100 d-xl-none mobile-nation-name">Player B</div>
          {renderBonusBox(bonus2B, "2 Cards Bonus")}
          {renderBonusBox(bonus7B, "7 Cards Bonus")}
        </div>
      </div>

      {tableData.some((d) => d.nat === "remark" || d.remark) && (
        <div className="casino-remark mt-1">
          <marquee scrollAmount="3">{tableData.find((d) => d.remark)?.remark || ""}</marquee>
        </div>
      )}
    </div>
  );
}
