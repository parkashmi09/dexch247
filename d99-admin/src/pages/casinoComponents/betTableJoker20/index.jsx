import { useState } from "react";
import spadeIcon from "../../../assets/img/cardsIcons/spade.png";
import heartIcon from "../../../assets/img/cardsIcons/heart.png";
import diamondIcon from "../../../assets/img/cardsIcons/diamond.png";
import clubIcon from "../../../assets/img/cardsIcons/club.png";

function formatStake(num) {
  if (num == null || num === undefined) return "0";
  const n = Number(num);
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

const BetTableJoker20 = ({ data = [], onBetClick, exposures = {} }) => {
  const [openRange, setOpenRange] = useState(null);

  const toggleRange = (rangeId) => {
    setOpenRange((prev) => (prev === rangeId ? null : rangeId));
  };

  const find = (nat) => data.find((i) => i.nat === nat) || {};

  const playerA = find("Player A");
  const playerB = find("Player B");
  const jokerEven = find("Joker Even");
  const jokerOdd = find("Joker Odd");
  const jokerRed = find("Joker Red");
  const jokerBlack = find("Joker Black");
  const jokerSpade = find("Joker Spade");
  const jokerHeart = find("Joker Heart");
  const jokerDiamond = find("Joker Diamond");
  const jokerClub = find("Joker Club");

  const getExposure = (nat) => {
    const exp = exposures[nat] ?? exposures[nat?.toLowerCase()] ?? exposures[nat?.trim()] ?? 0;
    return exp;
  };

  const exposureDisplay = (nat) => {
    const exp = getExposure(nat);
    if (exp === 0) return "0";
    return exp < 0 ? exp.toFixed(2) : `+${exp.toFixed(2)}`;
  };

  const isSuspended = (item) =>
    item.gstatus?.toUpperCase() === "SUSPENDED" || (!item.b && item.b !== 0);

  const renderPlayerRow = (item, label, rangeIdx) => {
    const backLocked = isSuspended(item) || item.b === 0;
    const layLocked = isSuspended(item) || item.l === 0;
    const rangeId = `range${rangeIdx}`;
    const isOpen = openRange === rangeId;
    const minStr = formatStake(item?.min);
    const maxStr = formatStake(item?.max);

    return (
      <div className="casino-box-row">
        <div className="casino-nation-name">
          <b>{label}</b>
          <div className="float-right">
            <span className="mr-2 book-red">{exposureDisplay(label)}</span>
            <i
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); toggleRange(rangeId); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRange(rangeId); } }}
              className={`fas fa-info-circle${isOpen ? "" : " collapsed"}`}
              data-toggle="collapse"
              data-target={`#${rangeId}`}
              aria-expanded={isOpen}
            />
            <div id={rangeId} className={`icon-range collapse${isOpen ? " show" : ""}`}>
              R:<span>{minStr}</span>-<span>{maxStr}</span>
            </div>
          </div>
        </div>
        <div className="casino-bl-box">
          <div
            className={`back casino-bl-box-item${backLocked ? " suspended" : ""}`}
            onClick={() => !backLocked && onBetClick(item.b, label, item, "back")}
          >
            <span className="casino-box-odd">{item.b || 0}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${layLocked ? " suspended" : ""}`}
            onClick={() => !layLocked && onBetClick(item.l, label, item, "lay")}
          >
            <span className="casino-box-odd">{item.l || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderJokerBackCell = (item, label, rangeIdx, icons) => {
    const locked = isSuspended(item) || item.b === 0;
    const rangeId = `range${rangeIdx}`;
    const isOpen = openRange === rangeId;
    const minStr = formatStake(item?.min);
    const maxStr = formatStake(item?.max);
    const nat = item?.nat || label;

    return (
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${icons ? " casino-card-img" : ""}${locked ? " suspended" : ""}`}
          onClick={() => !locked && onBetClick(item.b, nat, item, "back")}
        >
          {icons ? (
            <>
              <span>
                {icons.map((icon, i) => (
                  <img key={i} src={icon} alt="" />
                ))}
              </span>
              <span className="book-red">{exposureDisplay(nat)}</span>
            </>
          ) : (
            <>
              <span className="casino-box-odd">{label}</span>
              <span className="book-red">{exposureDisplay(nat)}</span>
            </>
          )}
        </div>
        <div className="text-right casino-rb-box-player-range w-100 mt-1">
          <i
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); toggleRange(rangeId); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRange(rangeId); } }}
            className="fas fa-info-circle float-right"
            data-toggle="collapse"
            data-target={`#${rangeId}`}
          />
          <div id={rangeId} className={`collapse icon-range${isOpen ? " show" : ""}`}>
            R:<span>{minStr}</span>-<span>{maxStr}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSuitOddsCell = (item, rangeIdx) => {
    const locked = isSuspended(item) || item.b === 0;
    const rangeId = `range${rangeIdx}`;
    const isOpen = openRange === rangeId;
    const minStr = formatStake(item?.min);
    const maxStr = formatStake(item?.max);
    const nat = item?.nat || "";

    return (
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${locked ? " suspended" : ""}`}
          onClick={() => !locked && onBetClick(item.b, nat, item, "back")}
        >
          <span className="casino-box-odd">{item.b || 0}</span>
          <span className="book-red">{exposureDisplay(nat)}</span>
        </div>
        <div className="text-right casino-rb-box-player-range w-100 mt-1">
          <i
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); toggleRange(rangeId); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRange(rangeId); } }}
            className="fas fa-info-circle float-right"
            data-toggle="collapse"
            data-target={`#${rangeId}`}
          />
          <div id={rangeId} className={`collapse icon-range${isOpen ? " show" : ""}`}>
            R:<span>{minStr}</span>-<span>{maxStr}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="teenpatti-joker casino-table teen1daycasino-container mt-2">
      {/* Left - Player A & B */}
      <div className="teen1dayleft">
        {renderPlayerRow(playerA, "Player A", 1)}
        {renderPlayerRow(playerB, "Player B", 2)}
      </div>

      <div className="teen1daycenter" />

      {/* Right - Joker bets */}
      <div className="teen1dayright joker-other">
        {/* Section 1: Even / Odd / Red / Black */}
        <div>
          <div className="casino-box-row casino-odds">
            <div className="text-left w-100">
              <b className="text-playerb">Joker</b>
            </div>
          </div>
          <div className="casino-box-row">
            <div className="casino-bl-box"><b>{jokerEven.b || 0}</b></div>
            <div className="casino-bl-box"><b>{jokerOdd.b || 0}</b></div>
            <div className="casino-bl-box"><b>{jokerRed.b || 0}</b></div>
            <div className="casino-bl-box"><b>{jokerBlack.b || 0}</b></div>
          </div>
          <div className="casino-box-row">
            {renderJokerBackCell(jokerEven, "Even", 3)}
            {renderJokerBackCell(jokerOdd, "Odd", 4)}
            {renderJokerBackCell(jokerRed, "Red", 5, [heartIcon, diamondIcon])}
            {renderJokerBackCell(jokerBlack, "Black", 6, [spadeIcon, clubIcon])}
          </div>
        </div>

        {/* Section 2: Suit icons */}
        <div className="mt-1">
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src={spadeIcon} alt="" />
              </div>
            </div>
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src={heartIcon} alt="" />
              </div>
            </div>
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src={diamondIcon} alt="" />
              </div>
            </div>
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src={clubIcon} alt="" />
              </div>
            </div>
          </div>
          <div className="casino-box-row">
            {renderSuitOddsCell(jokerSpade, 7)}
            {renderSuitOddsCell(jokerHeart, 8)}
            {renderSuitOddsCell(jokerDiamond, 9)}
            {renderSuitOddsCell(jokerClub, 10)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableJoker20;
