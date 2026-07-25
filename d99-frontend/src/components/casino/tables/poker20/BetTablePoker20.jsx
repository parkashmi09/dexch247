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

  // The feed nats carry NO player suffix and are DUPLICATED — Player A = sid 11–19,
  // Player B = sid 21–29 (same nats "Winner"/"One Pair"/…). Match by nat + the sid's
  // tens digit (1 = A, 2 = B). The old code searched for "One Pair A" etc., which
  // the feed never sends, so every cell resolved to undefined → always suspended.
  const findItem = (player, betType) => {
    const matches = tableData.filter(
      (d) => d.nat === betType || d.nat?.toLowerCase() === betType.toLowerCase()
    );
    const tens = player === "A" ? 1 : 2;
    return matches.find((d) => Math.floor(Number(d.sid) / 10) === tens)
      || matches[player === "A" ? 0 : 1]
      || null;
  };

  function renderSide(player) {
    return (
      <div className={`casino-table-${player === "A" ? "left" : "right"}-box`}>
        <div className="w-100 d-xl-none mobile-nation-name">Player {player}</div>
        {BET_TYPES.map((betType) => {
          const item = findItem(player, betType);
          const sus = isSus(item);
          // Settlement expects the player-suffixed selection ("Player A", "One Pair B").
          const apiNat = betType === "Winner" ? `Player ${player}` : `${betType} ${player}`;
          return (
            <div key={betType} className="casino-odds-box-container">
              <div className="casino-nation-name text-center">{betType}</div>
              <div className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, apiNat, { ...item, nat: apiNat }, "back")}>
                <span className="casino-odds">{item?.b || 0}</span>
                <ExpBook value={getExp(exposures, apiNat)} />
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
