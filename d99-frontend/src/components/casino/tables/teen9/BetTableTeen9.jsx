import { useRef } from "react";

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
  // Remember the last valid (non-zero) odds per selection. At settlement the market
  // suspends and the feed drops odds to 0 — recomputing profit as |exp|×(0−1) would
  // flip it into a −loss right before it settles. Use the last real odds instead.
  const lastOdds = useRef({});

  // Feed nats are "Tiger Winner" / "Tiger Pair" / … (the Winner row is NOT just the
  // animal name), so build "<Player> <Row>" for every row. The old Winner special
  // case looked for "Tiger" and never matched → Winner cells always suspended.
  const findItem = (player, row) => {
    const nat = `${player} ${row}`;
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
                const natKey = `${player} ${row}`;
                const sus = isSus(item);
                const odds = item?.b || 0;
                if (odds > 1) lastOdds.current[natKey] = odds;
                const effOdds = odds > 1 ? odds : (lastOdds.current[natKey] || 0);
                // Winner is a book market: show only the PROFIT under the backed
                // animal (the positive book value) and nothing on the other two
                // (hide their −stake). The hand side bets are single back bets whose
                // stored value is −stake; show the PROFIT you'd win instead
                // (= |exposure| × (odds−1)). effOdds keeps the last real odds so the
                // value doesn't flip when the market suspends at settlement.
                const rawExp = getExp(exposures, natKey);
                let expVal = rawExp;
                if (row === "Winner") {
                  if (rawExp == null || Number(rawExp) <= 0) expVal = null;
                } else if (rawExp != null && Number(rawExp) < 0 && effOdds > 1) {
                  expVal = Math.abs(Number(rawExp)) * (effOdds - 1);
                }
                return (
                  <div key={player}
                    className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                    onClick={() => !sus && odds > 0 && onBetClick?.(odds, item.nat, item, "back")}
                  >
                    <span className="casino-odds">{odds}</span>
                    <ExpBook value={expVal} />
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
