import React from "react";
import { getCardImage } from "../../resultVisuals/cardAssets";
import styles from "../VideoBox.module.css";

/**
 * Unique Teenpatti: 6 cards only in a single row (no Daga/Teja/Mogambo labels, no Total).
 * cardTokens: array of up to 6 card tokens (e.g. from comma-separated result string).
 */
export default function TeenUniqueCardsOverlay({ cardTokens = [] }) {
  const tokens = Array.isArray(cardTokens)
    ? cardTokens
    : String(cardTokens)
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
  const cards = Array.from({ length: 6 }, (_, i) => tokens[i] || "1");

  return (
    <div className={`${styles.casinoVideoCards} ${styles.casinoVideoCardsTeenunique}`}>
      {/* <div className={styles.casinoCardsShuffle}>
        <i className="fas fa-grip-lines-vertical" />
      </div> */}
      <div className={`${styles.casinoVideoCardsContainer} ${styles.teenuniqueCardsRow}`}>
        {cards.map((token, i) => (
          <div key={i}>
            <span>
              <img src={getCardImage(token)} alt="" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
