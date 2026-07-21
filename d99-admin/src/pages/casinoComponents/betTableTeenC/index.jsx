import { useState } from "react";
import imageSpade from "../../../assets/img/spade.png";
import imageClub from "../../../assets/img/club.png";
import imageHeart from "../../../assets/img/heart.png";
import imageDiamond from "../../../assets/img/diamond.png";

const LABELS = [
  { key: "player", label: "Player" },
  { key: "baccarat", label: "3 Baccarat" },
  { key: "total", label: "Total" },
  { key: "pairPlus", label: "Pair Plus" },
];

function formatStake(num) {
  if (num == null || num === undefined) return "0";
  const n = Number(num);
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

const BetTableTeenC = ({ data, onBetClick, playerName, exposures = {} }) => {
  const [openRange, setOpenRange] = useState(null);

  const getScore = (nat) => {
    return data?.find((item) => item?.nat === nat) || { b: 0, min: 0, max: 0 };
  };

  const toggleRange = (rangeId) => {
    setOpenRange((prev) => (prev === rangeId ? null : rangeId));
  };

  const score = {
    player: getScore(`Player ${playerName}`),
    baccarat: getScore(`3 Baccarat ${playerName}`),
    total: getScore(`Total ${playerName}`),
    pairPlus: getScore(`Pair Plus ${playerName}`),
    black: getScore(`Black ${playerName}`),
    red: getScore(`Red ${playerName}`),
  };

  const renderMainCell = (item, key, exposureKey) => {
    const value = item?.b ?? 0;
    const isSuspended = value === 0;
    const exposure = exposures[exposureKey] ?? 0;
    const exposureDisplay = exposure !== 0 ? (exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`) : "0";

    return (
      <div
        key={key}
        className={`back casino-bl-box-item ${isSuspended ? "suspended lock-top" : ""}`}
        onClick={() => !isSuspended && onBetClick(value, exposureKey, item)}
      >
        <span className="casino-box-odd">{value}</span>
        <span className="casino-book book-red">{exposureDisplay}</span>
      </div>
    );
  };

  const renderRbBox = (item, exposureKey, img1, img2, boxClass, rangeKey) => {
    const value = item?.b ?? 0;
    const isSuspended = value === 0;
    const exposure = exposures[exposureKey] ?? 0;
    const exposureDisplay = exposure !== 0 ? (exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`) : "0";
    const rangeId = `range-${playerName}-${rangeKey}`;
    const isOpen = openRange === rangeId;
    const minStr = formatStake(item?.min);
    const maxStr = formatStake(item?.max);

    return (
      <div className={`casino-rb-box ${boxClass}`}>
        <div
          className={`casino-rb-box-player back ${isSuspended ? "suspended" : ""}`}
          onClick={() => !isSuspended && onBetClick(value, exposureKey, item)}
        >
          <div>
            <img src={img1} alt="" />
            <img src={img2} alt="" className={boxClass === "redcontainer" ? "diamond-icon" : ""} />
          </div>
          <div className="text-right">
            <span className="d-block casino-box-odd">{value}</span>
            <span className="casino-book book-red">{exposureDisplay}</span>
          </div>
        </div>
        <div className="text-right casino-rb-box-player-range">
          <i
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); toggleRange(rangeId); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRange(rangeId); } }}
            className="fas fa-info-circle float-right"
            aria-expanded={isOpen}
            aria-controls={rangeId}
          />
          <div id={rangeId} className={`collapse icon-range ${isOpen ? "show" : ""}`}>
            R:<span>{minStr}</span>-<span>{maxStr}</span>
          </div>
        </div>
      </div>
    );
  };

  const playerClass = playerName === "A" ? "playera" : "playerb";

  return (
    <>
      <div className="casino-box-row">
        <div className="casino-nation-name no-border casino-bl-box-title">
          <div className={playerClass}>Player {playerName}</div>
        </div>
      </div>

      <div className="casino-bl-box casino-bl-box-title">
        {LABELS.map(({ key, label }) => {
          const item = score[key];
          const rangeId = `range-${playerName}-${key}`;
          const isOpen = openRange === rangeId;
          const minStr = formatStake(item?.min);
          const maxStr = formatStake(item?.max);
          return (
            <div key={key} className="casino-bl-box-item">
              <span>{label}</span>
              <div className="ml-1">
                <i
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggleRange(rangeId); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRange(rangeId); } }}
                  className="fas fa-info-circle float-right"
                  aria-expanded={isOpen}
                  aria-controls={rangeId}
                />
                <div id={rangeId} className={`collapse icon-range ${isOpen ? "show" : ""}`}>
                  R:<span>{minStr}</span>-<span>{maxStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="casino-bl-box mb-4">
        {renderMainCell(score.player, "player", `Player ${playerName}`)}
        {renderMainCell(score.baccarat, "baccarat", `3 Baccarat ${playerName}`)}
        {renderMainCell(score.total, "total", `Total ${playerName}`)}
        {renderMainCell(score.pairPlus, "pairPlus", `Pair Plus ${playerName}`)}
      </div>

      <div className="casino-rb-box-container mb-3">
        {renderRbBox(score.black, `Black ${playerName}`, imageSpade, imageClub, "blackcontainer", "black")}
        {renderRbBox(score.red, `Red ${playerName}`, imageHeart, imageDiamond, "redcontainer", "red")}
      </div>
    </>
  );
};

export default BetTableTeenC;
