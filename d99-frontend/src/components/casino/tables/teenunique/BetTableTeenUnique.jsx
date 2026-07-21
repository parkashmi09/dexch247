import { memo, useState, useCallback, useEffect, useRef } from "react";

const SEQUENCE_ICONS = [
  "/assets/front/img/sequence/s1-icon.png",
  "/assets/front/img/sequence/s2-icon.png",
  "/assets/front/img/sequence/s3-icon.png",
  "/assets/front/img/sequence/s4-icon.png",
  "/assets/front/img/sequence/s5-icon.png",
  "/assets/front/img/sequence/s6-icon.png",
];

const SELECTION_BALLS = [
  "/assets/front/img/sequence/s1.png",
  "/assets/front/img/sequence/s2.png",
  "/assets/front/img/sequence/s3.png",
  "/assets/front/img/sequence/s4.png",
  "/assets/front/img/sequence/s5.png",
  "/assets/front/img/sequence/s6.png",
];

const FACEDOWN_CARD = "/assets/front/img/sequence/1.jpg";
const LOST_CARD = "/assets/front/img/sequence/0.png";
const MAX_SELECTIONS = 3;

function isSusp(item) {
  return !item || item.gstatus === "0" || item.gstatus === "SUSPENDED";
}

const BetTableTeenUnique = memo(function BetTableTeenUnique({ gameData, onBetClick }) {
  const sub = gameData?.sub || gameData?.data?.data?.sub || [];
  const cardString = gameData?.card || gameData?.data?.data?.card || "";
  const cards = cardString ? cardString.split(",").map((c) => c.trim()) : [];
  const mainItem = sub[0];
  const susp = isSusp(mainItem);

  const [selectedCards, setSelectedCards] = useState([]);

  const mid = gameData?.mid || gameData?.data?.data?.mid;
  useEffect(() => { setSelectedCards([]); }, [mid]);

  const openBetModal = useCallback((selections) => {
    if (!mainItem) return;
    const nat = selections.map((i) => i + 1).sort((a, b) => a - b).join("");
    // Odds/limits fall back to the standard 3-card teenpatti values when the
    // feed omits them, so the panel always opens with a valid Range/Odds.
    const odds = Number(mainItem.b) || Number(mainItem.odds) || 1.98;
    const betItem = {
      ...mainItem,
      nat,
      sid: mainItem.sid || mainItem.sr || 1,
      min: Number(mainItem.min) || 100,
      max: Number(mainItem.max) || 100000,
    };
    onBetClick?.(odds, nat, betItem, "back");
  }, [mainItem, onBetClick]);

  // Auto-open the side bet panel the moment 3 cards are picked. On desktop the
  // mobile-only "Placebet" button is hidden, so without this there's no trigger.
  // Keyed on the selection signature so it fires once per pick (not on every
  // poll refresh of mainItem).
  const selectionKey =
    selectedCards.length === MAX_SELECTIONS
      ? [...selectedCards].sort((a, b) => a - b).join("")
      : "";
  const openRef = useRef(openBetModal);
  openRef.current = openBetModal;
  useEffect(() => {
    if (selectionKey) openRef.current(selectedCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  const toggleCard = useCallback((idx) => {
    setSelectedCards((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, idx];
    });
  }, []);

  const handleReset = useCallback(() => { setSelectedCards([]); }, []);

  return (
    <>
      <h4 className="unique-teen-title">
        Select any 3 cards of your choice and experience TeenPatti in a unique way.
        <i className="fas fa-hand-point-down ms-1"></i>
      </h4>

      <div className="unique-teen20-box">
        {SEQUENCE_ICONS.map((iconSrc, idx) => {
          const cardCode = cards[idx] || "1";
          const isRevealed = cardCode !== "1" && cardCode !== "0" && cardCode !== "";
          const isLost = cardCode === "0";
          const isFaceDown = !isRevealed && !isLost;
          const isSelected = selectedCards.includes(idx);
          const canSelect = !susp && isFaceDown && (isSelected || selectedCards.length < MAX_SELECTIONS);
          const showLost = isLost || (isFaceDown && susp);

          let cardImg;
          if (isRevealed) {
            cardImg = `/assets/img/cards/${cardCode}.jpg`;
          } else if (showLost) {
            cardImg = LOST_CARD;
          } else {
            cardImg = FACEDOWN_CARD;
          }

          return (
            <div
              key={idx}
              className="unique-teen20-card"
              onClick={canSelect ? () => toggleCard(idx) : undefined}
              style={canSelect ? { cursor: "pointer" } : undefined}
            >
              <img src={iconSrc} alt="" />
              <img src={cardImg} className={isSelected ? "select" : ""} />
            </div>
          );
        })}
        {/* Selection balls + Clear/Placebet - INSIDE unique-teen20-box */}
        {selectedCards.length > 0 && (
          <div className="unique-teen20-place-balls d-xl-none">
            <div>
              {selectedCards.map((idx) => (
                <img key={idx} src={SELECTION_BALLS[idx]} alt={`s${idx + 1}`} />
              ))}
            </div>
            <div>
              <button className="btn btn-danger btn-sm me-1" onClick={handleReset}>Clear</button>
              <button
                className="btn btn-success btn-sm"
                disabled={selectedCards.length !== MAX_SELECTIONS}
                onClick={() => openBetModal(selectedCards)}
              >
                Placebet
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default BetTableTeenUnique;
