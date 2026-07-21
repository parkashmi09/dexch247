import { useState } from "react";
import "./BetTableTeenPatti9.css";

const BET_COLUMNS = [
  { label: "Winner", rangeMin: "100", rangeMax: "3L" },
  { label: "Pair", rangeMin: "100", rangeMax: "25K" },
  { label: "Flush", rangeMin: "100", rangeMax: "10K" },
  { label: "Straight", rangeMin: "100", rangeMax: "10K" },
  { label: "Trio", rangeMin: "100", rangeMax: "5K" },
  { label: "Straight Flush", rangeMin: "100", rangeMax: "5K" },
];

const ROWS = [
  { name: "Tiger", startIndex: 0 },
  { name: "Lion", startIndex: 6 },
  { name: "Dragon", startIndex: 12 },
];

export default function BetTableTeenPatti9({ subData = [], onBetClick, exposures = {} }) {
  const [openRanges, setOpenRanges] = useState({});

  const toggleRange = (id) => {
    setOpenRanges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getExposure = (nat) => {
    if (!nat) return 0;
    return exposures[nat] ?? exposures[nat.toLowerCase()] ?? exposures[nat.trim()] ?? 0;
  };

  return (
    <div className="teenpattitest">
      <div className="casino-detail">
        <div className="teentestother">
          {/* Header row */}
          <div className="casino-box-row">
            <div className="casino-nation-name no-border"></div>
            {BET_COLUMNS.map((col, i) => {
              const rangeId = `range${i + 1}`;
              const isOpen = !!openRanges[rangeId];
              return (
                <div key={i} className="casino-bl-box">
                  <div className="casino-bl-box-item">
                    <b>{col.label}</b>
                    <div className="float-right">
                      <i
                        className={`fas fa-info-circle${!isOpen ? " collapsed" : ""}`}
                        aria-expanded={isOpen ? "true" : "false"}
                        onClick={() => toggleRange(rangeId)}
                      />
                      <div
                        id={rangeId}
                        className={`icon-range collapse${isOpen ? " show" : ""}`}
                      >
                        R:<span>{col.rangeMin}</span>-<span>{col.rangeMax}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data rows: Tiger, Lion, Dragon */}
          {ROWS.map((row) => (
            <div key={row.name} className="casino-box-row mb-4">
              <div className="casino-nation-name">
                <b>{row.name}</b>
              </div>
              {BET_COLUMNS.map((_, colIndex) => {
                const dataIndex = row.startIndex + colIndex;
                const item = subData[dataIndex] || {};
                const odds = item.b;
                const nat = item.nat || "";
                const isLocked =
                  !odds ||
                  parseFloat(odds) <= 0 ||
                  item.gstatus === "SUSPENDED" ||
                  item.gstatus === "Ball Running";
                const exposure = getExposure(nat);

                return (
                  <div key={colIndex} className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item${isLocked ? " suspended lock-top" : ""}`}
                      onClick={() => !isLocked && onBetClick && onBetClick(odds, nat, item)}
                    >
                      <span className="casino-box-odd">{odds || "-"}</span>
                      <span className={`casino-book ${exposure < 0 ? "book-red" : exposure > 0 ? "book-green" : "book-red"}`}>
                        {exposure !== 0 ? (exposure < 0 ? exposure.toFixed(2) : `+${exposure.toFixed(2)}`) : "0"}
                      </span>
                    </div>
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
