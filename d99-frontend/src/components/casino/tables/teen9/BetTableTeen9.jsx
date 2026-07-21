function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

const PLAYERS = ["Tiger", "Lion", "Dragon"];
const ROWS = ["Winner", "Pair", "Flush", "Straight", "Trio", "Straight Flush"];

export default function BetTableTeen9({ tableData = [], onBetClick, exposures = {} }) {
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  // Build a map: "Tiger Winner" -> item, "Lion Pair" -> item, etc.
  const findItem = (player, row) => {
    const nat = row === "Winner" ? player : `${player} ${row}`;
    return tableData.find((d) => d.nat === nat) || tableData.find((d) => d.nat?.toLowerCase() === nat.toLowerCase());
  };

  return (
    <div className="casino-table">
      <div className="casino-table-full-box">
        <div className="casino-table-header">
          <div className="casino-nation-detail"></div>
          {PLAYERS.map((p) => (
            <div key={p} className="casino-odds-box back">{p}</div>
          ))}
        </div>
        <div className="casino-table-body">
          {ROWS.map((row) => (
            <div key={row} className="casino-table-row">
              <div className="casino-nation-detail">
                <div className="casino-nation-name">{row}</div>
              </div>
              {PLAYERS.map((player) => {
                const item = findItem(player, row);
                const sus = isSus(item);
                const odds = item?.b || 0;
                return (
                  <div key={player}
                    className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                    onClick={() => !sus && odds > 0 && onBetClick?.(odds, item.nat, item, "back")}
                  >
                    <span className="casino-odds">{odds}</span>
                    <ExpBook value={getExp(exposures, item?.nat)} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
