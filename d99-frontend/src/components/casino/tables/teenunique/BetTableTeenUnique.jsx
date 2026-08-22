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

const BetTableTeenUnique = memo(function BetTableTeenUnique({ gameData, onBetClick, onClearSelection }) {
  const sub = gameData?.sub || gameData?.data?.data?.sub || [];
  const cardString = gameData?.card || gameData?.data?.data?.card || "";
  const cards = cardString ? cardString.split(",").map((c) => c.trim()) : [];
  const mainItem = sub[0];
  const susp = isSusp(mainItem);

  const [selectedCards, setSelectedCards] = useState([]);

  const mid = gameData?.mid || gameData?.data?.data?.mid;
  useEffect(() => { setSelectedCards([]); }, [mid]);

  const openBetModal = useCallback((selections, keepStake = false) => {
    if (!mainItem || !selections.length) return;
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
    onBetClick?.(odds, nat, betItem, "back", { keepStake });
  }, [mainItem, onBetClick]);

  // Open the bet panel on the FIRST card picked, then keep it in step as cards 2
  // and 3 refine the selection — so the player can start typing a stake straight
  // away instead of waiting until all three are chosen. (It used to fire only at
  // 3 of 3; on desktop the mobile-only "Placebet" button is hidden, so that was
  // the sole trigger and nothing showed before then.)
  //
  // keepStake is set from the second pick onwards: the panel is already open and
  // this is the same bet being refined, so a stake already typed must survive.
  // The bet itself still needs all three — the slip's submit stays disabled until
  // then (see submitDisabled in TeenUniquePage), because settlement requires
  // exactly three positions and would reject a partial selection.
  //
  // Keyed on the selection signature so it fires once per pick, not on every
  // 500ms poll refresh of mainItem.
  const selectionKey = [...selectedCards].sort((a, b) => a - b).join("");
  const openRef = useRef(openBetModal);
  openRef.current = openBetModal;
  useEffect(() => {
    if (!selectionKey) return;
    openRef.current(selectedCards, selectionKey.length > 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  const toggleCard = useCallback((idx) => {
    setSelectedCards((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, idx];
    });
  }, []);

  // Clearing the picks must also close the slip — it is now open from the first
  // card, so leaving it up with no selection behind it would be stale.
  const handleReset = useCallback(() => {
    setSelectedCards([]);
    onClearSelection?.();
  }, [onClearSelection]);

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
