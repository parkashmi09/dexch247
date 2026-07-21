import React, { useState } from "react";

/**
 * BetTableTeen – naming: BetTable + gameName.
 * Renders teen 1-day layout matching reference: teen1daycasino-container, casino-box-row, casino-nation-name, casino-bl-box, casino-bl-box-item.
 * Exposure: consistently mapped; initially 0. Sections suspended consistently.
 * Info icon toggles range (R:1K-2L) collapse/show; state kept so context is preserved.
 */
export default function BetTableTeen({ data = [], onBetClick, exposures = {}, myBets = [] }) {
  const [openRanges, setOpenRanges] = useState({});

  const toggleRange = (id) => {
    setOpenRanges((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const playerAMain = data.find((item) => item.nat === "Player A" && item.subtype === "teen" && item.etype === "match") || {};
  const playerBMain = data.find((item) => item.nat === "Player B" && item.subtype === "teen" && item.etype === "match") || {};
  const playerACon = data.find((item) => item.nat === "Player A" && item.subtype === "con") || {};
  const playerBCon = data.find((item) => item.nat === "Player B" && item.subtype === "con") || {};

  const allCardData = data.filter((item) => item.subtype === "oddeven" && item.etype === "fancy");
  const cardNumbers = [1, 2, 3, 4, 5, 6];
  const sortedCards = cardNumbers.map((cardNum) => {
    const cardData = allCardData.find((item) => {
      const num = parseInt(item.nat.replace("Card ", ""), 10) || 0;
      return num === cardNum;
    });
    if (cardData) return cardData;
    return {
      sid: 100 + cardNum,
      nat: `Card ${cardNum}`,
      b: 0,
      l: 0,
      gstatus: "SUSPENDED",
      visible: 0,
      subtype: "oddeven",
      etype: "fancy",
      odds: [
        { b: 0, l: 0, nat: "Odd", sid: 1, sno: 1 },
        { b: 0, l: 0, nat: "Even", sid: 2, sno: 2 },
      ],
    };
  });

  /** Exposure: consistently mapped; initially 0 when no match. */
  const getExposure = (selection, betType = null) => {
    if (!selection) return 0;
    const key = [selection, selection.toLowerCase().trim(), selection.trim()].find((k) => k && exposures[k] !== undefined && exposures[k] !== 0);
    if (key != null) return parseFloat(exposures[key]) || 0;
    const typeKey = betType ? betType.toLowerCase() : "";
    const match = myBets.find((b) => {
      const sel = (b.matchedBet || b.selection || b.player_name || "").toLowerCase().trim();
      const type = (b.type || "").toLowerCase();
      return sel === selection.toLowerCase().trim() && (!typeKey || type === typeKey);
    });
    if (match && (match.exposer !== undefined && match.exposer !== null && match.exposer !== 0))
      return parseFloat(match.exposer) || 0;
    return 0;
  };

  const isSuspended = (item) => item?.gstatus === "SUSPENDED" || !item?.b && !item?.l || item?.b === 0 && item?.l === 0;

  const renderPlayerRow = (item, label, playerName, rangeText = "1K-2L") => {
    const backSuspended = isSuspended(item) || !item?.b || item.b === 0;
    const laySuspended = isSuspended(item) || !item?.l || item.l === 0;
    const backExposure = getExposure(item?.nat || label, "back");
    const layExposure = getExposure(item?.nat || label, "lay");
    const rangeId = `range-${playerName.replace(/\s/g, "")}-${label.replace(/\s/g, "")}`;
    const [minR, maxR] = rangeText.split("-");

    return (
      <div className="casino-box-row">
        <div className="casino-nation-name">
          <b>{label}</b>
          <div className="float-right">
            <span className="mr-2 casino-book book-red">{backExposure || layExposure || 0}</span>
            <i
              className={`fas fa-info-circle ${openRanges[rangeId] ? "" : "collapsed"}`}
              role="button"
              tabIndex={0}
              aria-expanded={!!openRanges[rangeId]}
              aria-controls={rangeId}
              onClick={() => toggleRange(rangeId)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRange(rangeId)}
              style={{ cursor: "pointer" }}
            />
            <div id={rangeId} className={`icon-range collapse ${openRanges[rangeId] ? "show" : ""}`}>
              R:<span>{minR || "1K"}</span>-<span>{maxR || "2L"}</span>
            </div>
          </div>
        </div>
        <div className="casino-bl-box">
          <div
            className={`back casino-bl-box-item ${backSuspended ? "suspended" : ""}`}
            onClick={() => !backSuspended && item?.b && onBetClick(item.b, label, "back", { ...item, nat: playerName })}
          >
            <span className="casino-box-odd">{item?.b ?? "0"}</span>
          </div>
          <div
            className={`lay casino-bl-box-item ${laySuspended ? "suspended" : ""}`}
            onClick={() => !laySuspended && item?.l && onBetClick(item.l, label, "lay", { ...item, nat: playerName })}
          >
            <span className="casino-box-odd">{item?.l ?? "0"}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCardCell = (cardItem, oddEvenType, index) => {
    const oddEvenItem = cardItem.odds?.find((o) => o.nat === oddEvenType);
    const cardSuspended = cardItem.gstatus === "SUSPENDED";
    const cellSuspended = !oddEvenItem || !oddEvenItem.b || oddEvenItem.b === 0 || cardSuspended;
    const exposure = getExposure(`${cardItem.nat} ${oddEvenType}`, "back");

    return (
      <div key={`${cardItem.nat}-${oddEvenType}-${index}`} className="casino-bl-box">
        <div
          className={`back casino-bl-box-item ${cellSuspended ? "suspended" : ""}`}
          onClick={() => !cellSuspended && oddEvenItem?.b && onBetClick(oddEvenItem.b, `${cardItem.nat} ${oddEvenType}`, "back", { ...cardItem, nat: `${cardItem.nat} ${oddEvenType}`, b: oddEvenItem.b })}
        >
          <span className="casino-box-odd">{oddEvenItem?.b ?? "0"}</span>
        </div>
        <div className="casino-book book-red">{exposure || 0}</div>
      </div>
    );
  };

  return (
    <div className="teen1daycasino-container d-none-small casino-table teenpatti1day">
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
        {renderPlayerRow(playerAMain, "Main", "Player A", "1K-2L")}
        {renderPlayerRow(playerACon, "Consecutive", "Player A", "1K-1L")}
      </div>

      <div className="teen1daycenter" />

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
        {renderPlayerRow(playerBMain, "Main", "Player B", "1K-2L")}
        {renderPlayerRow(playerBCon, "Consecutive", "Player B", "1K-1L")}
      </div>

      <div className="teen1dayother">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border" />
          <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Card 1</b></div></div>
          <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Card 2</b></div></div>
          <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Card 3</b></div></div>
          <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Card 4</b></div></div>
          <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Card 5</b></div></div>
          <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Card 6</b></div></div>
        </div>

        <div className="casino-box-row mb-3">
          <div className="casino-nation-name mb-4">
            <b>Odd</b>
            <div className="float-right">
              <i
                className={`fas fa-info-circle ${openRanges.range13 ? "" : "collapsed"}`}
                role="button"
                tabIndex={0}
                aria-expanded={!!openRanges.range13}
                aria-controls="range13"
                onClick={() => toggleRange("range13")}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRange("range13")}
                style={{ cursor: "pointer" }}
              />
              <div id="range13" className={`icon-range collapse ${openRanges.range13 ? "show" : ""}`}>R:<span>1K</span>-<span>50K</span></div>
            </div>
          </div>
          {sortedCards.map((card, index) => renderCardCell(card, "Odd", index))}
        </div>

        <div className="casino-box-row">
          <div className="casino-nation-name mb-4">
            <b>Even</b>
            <div className="float-right">
              <i
                className={`fas fa-info-circle ${openRanges.range14 ? "" : "collapsed"}`}
                role="button"
                tabIndex={0}
                aria-expanded={!!openRanges.range14}
                aria-controls="range14"
                onClick={() => toggleRange("range14")}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRange("range14")}
                style={{ cursor: "pointer" }}
              />
              <div id="range14" className={`icon-range collapse ${openRanges.range14 ? "show" : ""}`}>R:<span>1K</span>-<span>50K</span></div>
            </div>
          </div>
          {sortedCards.map((card, index) => renderCardCell(card, "Even", index))}
        </div>
      </div>
    </div>
  );
}
