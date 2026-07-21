import React, { useState } from "react";

/**
 * BetTableTeen33 – Teen Patti 3-3: Player A vs Player B (Back/Lay only, no consecutive/oddeven).
 * Uses teen1daycasino-container layout matching reference HTML exactly.
 */
export default function BetTableTeen33({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  const [openRanges, setOpenRanges] = useState({});

  const toggleRange = (id) => {
    setOpenRanges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const playerA = data.find((item) => item.nat === "Player A") || {};
  const playerB = data.find((item) => item.nat === "Player B") || {};

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
    item?.gstatus === "SUSPENDED" || (!item?.b && !item?.l) || (item?.b === 0 && item?.l === 0);

  const renderPlayerRow = (item, label, playerName, rangeId, rangeMin = "100", rangeMax = "2L") => {
    const backSuspended = isSuspended(item) || !item?.b || item.b === 0;
    const laySuspended = isSuspended(item) || !item?.l || item.l === 0;
    const exposure = getExposure(item?.nat || label);
    const isOpen = !!openRanges[rangeId];

    return (
      <div className="casino-box-row">
        <div className="casino-nation-name">
          <b>{label}</b>
          <div className="float-right">
            <span className="mr-2 casino-book book-red">{exposure || 0}</span>
            <i
              className={`fas fa-info-circle${!isOpen ? " collapsed" : ""}`}
              aria-expanded={isOpen ? "true" : "false"}
              onClick={() => toggleRange(rangeId)}
              style={{ cursor: "pointer" }}
            />
            <div id={rangeId} className={`icon-range collapse${isOpen ? " show" : ""}`}>
              R:<span>{rangeMin}</span>-<span>{rangeMax}</span>
            </div>
          </div>
        </div>
        <div className="casino-bl-box">
          <div
            className={`back casino-bl-box-item${backSuspended ? " suspended" : ""}`}
            onClick={() => !backSuspended && item?.b && onBetClick && onBetClick(item.b, label, "back", { ...item, nat: playerName })}
          >
            <span className="casino-box-odd">{item?.b ?? "0"}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${laySuspended ? " suspended" : ""}`}
            onClick={() => !laySuspended && item?.l && onBetClick && onBetClick(item.l, label, "lay", { ...item, nat: playerName })}
          >
            <span className="casino-box-odd">{item?.l ?? "0"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="teen1daycasino-container d-none-small casino-table teenpatti1day">
      {/* Player A */}
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playera">Player A</div>
          </div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        {renderPlayerRow(playerA, "Main", "Player A", "range1", "100", "2L")}
      </div>

      <div className="teen1daycenter" />

      {/* Player B */}
      <div className="teen1dayright">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playerb">Player B</div>
          </div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        {renderPlayerRow(playerB, "Main", "Player B", "range7", "100", "2L")}
      </div>
    </div>
  );
}
