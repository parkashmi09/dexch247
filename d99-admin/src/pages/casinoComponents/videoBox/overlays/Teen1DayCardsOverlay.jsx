import React from "react";
import { getCardImage } from "../../resultVisuals/cardAssets";
import styles from "../VideoBox.module.css";

/**
 * Teen 1-day card overlay for VideoBox.
 * Shows Player A cards (row 1) and Player B cards (row 2).
 * Card ordering: 1-day = A=[0,2,4], B=[1,3,5] from 6-card string.
 * Uses casino-video-cards positioning (top-right for teenpatti1day).
 */
export default function Teen1DayCardsOverlay({ normalizedResultData }) {
  const cards = String(normalizedResultData || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  // 1-day ordering: A=[0,2,4], B=[1,3,5]
  const playerACards = [0, 2, 4].map((i) => cards[i]).filter(Boolean);
  const playerBCards = [1, 3, 5].map((i) => cards[i]).filter(Boolean);

  const allPlaceholder =
    cards.length === 0 ||
    cards.every((c) => !c || c === "0" || c === "1");

  if (allPlaceholder) return null;

  return (
    <div className={`${styles.casinoVideoCards} ${styles.teen1dayCards}`}>
      <div className={styles.casinoCardsShuffle}>
        {/* <i className="fas fa-grip-lines-vertical" /> */}
      </div>
      <div className={styles.casinoVideoCardsContainer}>
        <div>
          {playerACards.map((token, idx) => (
            <span key={`a-${idx}`}>
              <img src={getCardImage(token)} alt={`Player A Card ${idx + 1}`} />
            </span>
          ))}
        </div>
        <div>
          {playerBCards.map((token, idx) => (
            <span key={`b-${idx}`}>
              <img src={getCardImage(token)} alt={`Player B Card ${idx + 1}`} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
