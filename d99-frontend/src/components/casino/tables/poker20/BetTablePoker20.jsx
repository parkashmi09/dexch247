function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

const BET_TYPES = ["Winner", "One Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush"];

export default function BetTablePoker20({ tableData = [], onBetClick, exposures = {} }) {
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  const findItem = (player, betType) => {
    const nat = betType === "Winner" ? `Player ${player}` : `${betType} ${player}`;
    return tableData.find((d) => d.nat === nat) || tableData.find((d) => d.nat?.toLowerCase() === nat.toLowerCase());
  };

  function renderSide(player) {
    return (
      <div className={`casino-table-${player === "A" ? "left" : "right"}-box`}>
        <div className="w-100 d-xl-none mobile-nation-name">Player {player}</div>
        {BET_TYPES.map((betType) => {
          const item = findItem(player, betType);
          const sus = isSus(item);
          return (
            <div key={betType} className="casino-odds-box-container">
              <div className="casino-nation-name text-center">{betType}</div>
              <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
                <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
                <ExpBook value={getExp(exposures, item?.nat)} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="poker20-other-odds">
        <div className="casino-table-box">
          {renderSide("A")}
          <div className="casino-table-box-divider"></div>
          {renderSide("B")}
        </div>
      </div>
    </div>
  );
}
