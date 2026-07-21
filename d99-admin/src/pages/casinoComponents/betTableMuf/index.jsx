import React from "react";

/**
 * BetTableMuf – Teenpatti Muflis: Player A vs Player B.
 * 3 columns per player: Winner, Top 9, M Baccarat (back only, no lay).
 * Uses teen1daycasino-container + muflis layout matching reference HTML.
 * Top 9 displays player letter ("A"/"B") instead of odds.
 */
export default function BetTableMuf({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  // Find items by nat
  const findItem = (nat) => data.find((item) => item.nat === nat) || {};

  const playerAWinner = findItem("Player A");
  const playerBWinner = findItem("Player B");
  const top9A = findItem("Top 9 A");
  const top9B = findItem("Top 9 B");
  const mBaccA = findItem("M Baccarat A");
  const mBaccB = findItem("M Baccarat B");

  const getExposure = (selection) => {
    if (!selection) return 0;
    const key = [selection, selection.toLowerCase().trim(), selection.trim()]
      .find((k) => k && exposures[k] !== undefined && exposures[k] !== 0);
    if (key != null) return parseFloat(exposures[key]) || 0;
    const match = myBets.find((b) => {
      const sel = (b.matchedBet || b.selection || b.player_name || "").toLowerCase().trim();
      return sel === selection.toLowerCase().trim();
    });
    if (match && match.exposer !== undefined && match.exposer !== null && match.exposer !== 0)
      return parseFloat(match.exposer) || 0;
    return 0;
  };

  const isSuspended = (item) =>
    item?.gstatus === "SUSPENDED" || !item?.b || item.b === 0;

  const renderCell = (item, label, nat, displayValue) => {
    const suspended = isSuspended(item);
    const exposure = getExposure(nat || label);
    const oddValue = displayValue || (suspended ? "0" : (item?.b ?? "0"));

    return (
      <div className="col-4">
        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b>{label}</b>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspended ? " suspended lock-top" : ""}`}
              onClick={() =>
                !suspended && item?.b && onBetClick && onBetClick(item.b, label, "back", { ...item, nat: nat || label })
              }
            >
              <span className="casino-box-odd">{oddValue}</span>
              <span className="book-red">{exposure || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="teen1daycasino-container d-none-small casino-table muflis">
      {/* Player A */}
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playera text-left">Player A</div>
          </div>
        </div>
        <div className="row row5">
          {renderCell(playerAWinner, "Winner", "Player A")}
          {renderCell(top9A, "Top 9", "Top 9 A", "A")}
          {renderCell(mBaccA, "M Baccarat A", "M Baccarat A")}
        </div>
      </div>

      <div className="teen1daycenter" />

      {/* Player B */}
      <div className="teen1dayright">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playerb text-left">Player B</div>
          </div>
        </div>
        <div className="row row5">
          {renderCell(playerBWinner, "Winner", "Player B")}
          {renderCell(top9B, "Top 9", "Top 9 B", "B")}
          {renderCell(mBaccB, "M Baccarat B", "M Baccarat B")}
        </div>
      </div>
    </div>
  );
}
