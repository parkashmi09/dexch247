import { memo } from "react";

// Single card pip images for Odd/Even/Low/High labels
const SINGLE = "/assets/img/cards/single";
const ICONS = "/assets/img/icons";

const ODD_CARDS = ["A", "3", "5", "7", "9"];
const EVEN_CARDS = ["2", "4", "6", "8", "10"];
const LOW_CARDS = ["A", "2", "3", "4", "5"];
const HIGH_CARDS = ["6", "7", "8", "9", "10"];

// Fix Point card ranks in display order
const FIX_CARD_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function isSuspended(item) {
  return !item || item.gstatus !== "OPEN";
}

function findBySubtype(sub, subtype) {
  return sub.filter((s) => s.subtype === subtype);
}

function getFirstOpen(items) {
  return items.find((s) => s.gstatus === "OPEN") || items[0] || null;
}

function getExposure(exposures, nat) {
  if (!nat || !exposures) return null;
  const variants = [nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim()];
  for (const k of variants) {
    if (exposures[k] !== undefined) return exposures[k];
  }
  return null;
}

function ExposureBook({ nat, exposures, className = "casino-nation-book text-center w-100" }) {
  const val = getExposure(exposures, nat);
  if (val === null || val === undefined) return <div className={className} />;
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return <div className={className} />;
  return (
    <div
      className={className}
      style={{
        color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)",
        fontSize: "10px",
        fontWeight: "bold",
      }}
    >
      {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
    </div>
  );
}

const BetTableNotenum = memo(function BetTableNotenum({ tableData = [], onBetClick, exposures = {} }) {
  const sub = tableData;

  const oddItems = findBySubtype(sub, "odd");
  const evenItems = findBySubtype(sub, "even");
  const blackItems = findBySubtype(sub, "black");
  const redItems = findBySubtype(sub, "red");
  const lowItems = findBySubtype(sub, "low");
  const highItems = findBySubtype(sub, "high");
  const baccItems = findBySubtype(sub, "bacc");
  const cardItems = findBySubtype(sub, "card");

  // Use the first open (or first available) item for each group
  const oddItem = getFirstOpen(oddItems);
  const evenItem = getFirstOpen(evenItems);
  const blackItem = getFirstOpen(blackItems);
  const redItem = getFirstOpen(redItems);
  const lowItem = getFirstOpen(lowItems);
  const highItem = getFirstOpen(highItems);

  // Baccarat: first two
  const bacc1 = baccItems[0] || null;
  const bacc2 = baccItems[1] || null;

  // Fix point: use the first open card item which has nested odds
  const cardItem = getFirstOpen(cardItems);
  const cardOdds = cardItem?.odds || [];

  function handleBet(item, side) {
    if (!item || isSuspended(item)) return;
    const odds = side === "back" ? parseFloat(item.b) : parseFloat(item.l);
    if (!odds || odds <= 0) return;
    onBetClick?.(odds, item.nat, item, side);
  }

  function handleNestedBet(parentItem, odd) {
    if (!parentItem || isSuspended(parentItem)) return;
    const odds = parseFloat(odd.b);
    if (!odds || odds <= 0) return;
    // Use _parentSid pattern for buffer tracking
    onBetClick?.(odds, odd.nat, {
      ...parentItem,
      nat: odd.nat,
      b: odd.b,
      _parentSid: parentItem.sid,
      sid: odd.sno || odd.sid || parentItem.sid,
    }, "back");
  }

  function renderBackLayBox(item, side) {
    const susp = isSuspended(item) || !(side === "back" ? parseFloat(item?.b) : parseFloat(item?.l));
    return (
      <div
        className={`casino-odds-box ${side}${susp ? " suspended-box" : ""}`}
        onClick={() => !susp && handleBet(item, side)}
        style={{ cursor: susp ? "default" : "pointer" }}
      >
        <span className="casino-odds">{item?.[side === "back" ? "b" : "l"] || 0}</span>
      </div>
    );
  }

  function renderOddEvenRow(item, cardRanks, label) {
    const susp = isSuspended(item);
    return (
      <div className="casino-odd-box-container">
        <div className="casino-nation-name">
          <span className="me-2">{item?.nat || label}</span>
          {cardRanks.map((r) => (
            <img key={r} src={`${SINGLE}/${r}.jpg`} alt={r} />
          ))}
        </div>
        {renderBackLayBox(item, "back")}
        {renderBackLayBox(item, "lay")}
        <ExposureBook nat={item?.nat} exposures={exposures} />
      </div>
    );
  }

  function renderBlackRedRow(item, iconNames) {
    const susp = isSuspended(item);
    return (
      <div className="casino-odd-box-container">
        <div className="casino-nation-name">
          {iconNames.map((name) => (
            <img key={name} src={`${ICONS}/${name}.png`} alt={name} />
          ))}
        </div>
        {renderBackLayBox(item, "back")}
        {renderBackLayBox(item, "lay")}
        <ExposureBook nat={item?.nat} exposures={exposures} />
      </div>
    );
  }

  function renderBaccRow(item, label, subtitle) {
    const susp = isSuspended(item);
    const backSusp = susp || !parseFloat(item?.b);
    return (
      <div className="casino-odd-box-container">
        <div className="casino-nation-name">
          <b>{label}</b>
          <span>{subtitle}</span>
        </div>
        <div
          className={`casino-odds-box back${backSusp ? " suspended-box" : ""}`}
          onClick={() => !backSusp && handleBet(item, "back")}
          style={{ cursor: backSusp ? "default" : "pointer" }}
        >
          <span className="casino-odds">{item?.b || 0}</span>
          <ExposureBook nat={item?.nat} exposures={exposures} className="casino-nation-book text-center" />
        </div>
      </div>
    );
  }

  function renderFixPointCard(odd, parentItem) {
    if (!odd) return null;
    const rank = (odd.nat || "").replace(/^Card\s*/i, "").trim();
    const susp = isSuspended(parentItem) || !parseFloat(odd.b);
    const exp = getExposure(exposures, odd.nat);
    const expNum = exp !== null ? parseFloat(exp) : null;
    return (
      <div key={odd.nat || rank} className="card-odd-box">
        <div className="casino-odds">{odd.b || 0}</div>
        <div
          className={susp ? "suspended-box" : ""}
          onClick={() => !susp && handleNestedBet(parentItem, odd)}
          style={{ cursor: susp ? "default" : "pointer" }}
        >
          <img src={`/assets/img/cards/${rank}.png`} alt={rank} />
        </div>
        <div className="casino-nation-book">
          {expNum !== null && !isNaN(expNum) && expNum !== 0 ? (
            <span style={{ color: expNum >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)", fontSize: "10px", fontWeight: "bold" }}>
              {expNum >= 0 ? `+${expNum.toFixed(2)}` : expNum.toFixed(2)}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  // Build fix point card ordered list from nested odds
  const fixCardMap = {};
  for (const odd of cardOdds) {
    const rank = (odd.nat || "").replace(/^Card\s*/i, "").trim().toUpperCase();
    fixCardMap[rank] = odd;
  }

  return (
    <div className="casino-table">
      {/* Section 1: Odd/Even + Black/Red + Low/High */}
      <div className="casino-table-box">
        {/* Group 1: Odd / Even */}
        <div className="casino-odd-box-container-box">
          {renderOddEvenRow(oddItem, ODD_CARDS, "Odd Card")}
          {renderOddEvenRow(evenItem, EVEN_CARDS, "Even Card")}
        </div>

        {/* Group 2: Black / Red */}
        <div className="casino-odd-box-container-box">
          {renderBlackRedRow(blackItem, ["spade", "club"])}
          {renderBlackRedRow(redItem, ["heart", "diamond"])}
        </div>

        {/* Group 3: Low / High */}
        <div className="casino-odd-box-container-box">
          {renderOddEvenRow(lowItem, LOW_CARDS, "Low Card")}
          {renderOddEvenRow(highItem, HIGH_CARDS, "High Card")}
        </div>
      </div>

      {/* Section 2: Baccarat + Fix Point Cards */}
      <div className="casino-table-box mt-3">
        {/* Left: Baccarat 1 and Baccarat 2 */}
        <div className="casino-table-left-box">
          {renderBaccRow(bacc1, "Baccarat 1", "(1st, 2nd, 3rd card)")}
          {renderBaccRow(bacc2, "Baccarat 2", "(4th, 5th, 6th card)")}
        </div>

        {/* Right: Fix Point Cards A-10 */}
        <div className="casino-table-right-box">
          {FIX_CARD_RANKS.map((rank) => {
            const odd = fixCardMap[rank] || fixCardMap[rank.toLowerCase()];
            return renderFixPointCard(odd, cardItem);
          })}
        </div>
      </div>
    </div>
  );
});

export default BetTableNotenum;
