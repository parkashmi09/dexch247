import { useState, useCallback, useEffect, useRef } from "react";

const JOKER_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

export default function BetTableJoker1({ tableData = [], onBetClick, exposures = {}, showPlaceBet = false }) {
  const playerA = tableData.find((d) => d.nat === "Player A");
  const playerB = tableData.find((d) => d.nat === "Player B");

  const isSus = (item) => !item || item.gstatus !== "OPEN";
  const isOpen = !isSus(playerA) || !isSus(playerB);

  const [selectedJoker, setSelectedJoker] = useState(null);

  // Reset on round change
  const mid = playerA?.mid || playerB?.mid;
  useEffect(() => { setSelectedJoker(null); }, [mid]);

  // Reset the picked joker once the bet panel closes (bet placed / reset).
  const prevPanel = useRef(showPlaceBet);
  useEffect(() => {
    if (prevPanel.current && !showPlaceBet) setSelectedJoker(null);
    prevPanel.current = showPlaceBet;
  }, [showPlaceBet]);

  const handleBetClick = useCallback((value, nat, item, type) => {
    const jokerImg = selectedJoker ? `/assets/img/joker1/${selectedJoker}.png` : null;
    onBetClick?.(value, nat, { ...item, jokerCardSrc: jokerImg }, type);
  }, [onBetClick, selectedJoker]);

  function renderPlayerRow(item) {
    if (!item) return null;
    const sus = isSus(item);
    const exp = getExp(exposures, item.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    const showExp = !isNaN(expN) && expN !== 0;

    return (
      <div className="casino-table-left-box">
        <div className="casino-table-row">
          <div className="casino-nation-detail">
            <div className="casino-nation-name">{item.nat}</div>
            {showExp && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
          </div>
          <div
            className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
            onClick={() => !sus && item.b > 0 && handleBetClick(item.b, item.nat, item, "back")}
          >
            <span className="casino-odds">{item.b || 0}</span>
          </div>
          <div
            className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
            onClick={() => !sus && item.l > 0 && handleBetClick(item.l, item.nat, item, "lay")}
          >
            <span className="casino-odds">{item.l || 0}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {/* Optional Joker pick — only while betting is open (hidden when both
            players are suspended) */}
        {isOpen && (
          <div className="joker1-box">
            <div className="joker1-other-cards">
              <h4>Select your Joker</h4>
              <div>
                {JOKER_CARDS.map((n) => (
                  <img
                    key={n}
                    className={selectedJoker === n ? "select" : ""}
                    src={`/assets/img/joker1/${n}.png`}
                    alt={`Joker ${n}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedJoker((prev) => (prev === n ? null : n))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {renderPlayerRow(playerA)}
        {renderPlayerRow(playerB)}
      </div>
    </div>
  );
}
