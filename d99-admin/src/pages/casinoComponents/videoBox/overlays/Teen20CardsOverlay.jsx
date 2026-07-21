import React from "react";
import { getCardImage } from "../../resultVisuals/cardAssets";
import styles from "../VideoBox.module.css";

/**
 * Teen20 / Teen20b card overlay for VideoBox.
 * Shows Player A cards (row 1) and Player B cards (row 2).
 * Card ordering: A=[0,1,2], B=[3,4,5] (sequential from 6-card string).
 * Uses casino-video-cards positioning (top-left for teenpatti20).
 * Adds hide-cards when all card values are placeholders ("1").
 */
export default function Teen20CardsOverlay({ normalizedResultData }) {
  const cards = String(normalizedResultData || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  // Sequential ordering: A=[0,1,2], B=[3,4,5]
  const playerACards = cards.slice(0, 3).filter(Boolean);
  const playerBCards = cards.slice(3, 6).filter(Boolean);

  const allPlaceholder =
    cards.length === 0 ||
    cards.every((c) => !c || c === "0" || c === "1");

  return (
    <div className={`${styles.casinoVideoCards} ${styles.teen20CardsOverlay} ${allPlaceholder ? styles.hideCardsOverlay : ""}`}>
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
