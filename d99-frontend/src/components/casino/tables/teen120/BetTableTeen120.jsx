function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return (
    <div className={`casino-nation-book text-center ${n >= 0 ? "text-success" : "text-danger"}`}>
      {n}
    </div>
  );
}

export default function BetTableTeen120({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name);

  const player = find("Player");
  const dealer = find("Dealer");
  const tie = find("Tie");
  const pair = find("Pair");

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderBox(item, colorClass, label) {
    const sus = isSus(item);
    return (
      <div className={`onecard20oddbox ${colorClass}`}>
        <div className="casino-odds text-center">{sus ? 0 : item?.b || 0}</div>
        <div
          className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
        >
          <span className="casino-odds">{label}</span>
        </div>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-full-box">
        {renderBox(player, "onecard20player", "Player")}
        {renderBox(tie, "onecard20tie", "Tie")}
        {renderBox(dealer, "onecard20dealer", "Dealer")}
        {renderBox(pair, "onecard20pair", "Pair")}
      </div>
    </div>
  );
}
