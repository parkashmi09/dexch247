import React from "react";
import styles from "../VideoBox.module.css";

/**
 * Fallback Player A / Player B cards when no gameType is set.
 * playerA / playerB: { cards: string[] } (card image URLs).
 */
export default function DefaultPlayerCards({ playerA, playerB }) {
  if (!playerA && !playerB) return null;
  return (
    <>
      <div className={styles.playerSection}>
        <div className={styles.playerName}>Player A</div>
        <div className={styles.playerCards}>
          {playerA?.cards?.map((card, index) => (
            <img
              key={`${index}-${card}`}
              src={card}
              alt={`Player A card ${index + 1}`}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )) || <div>No cards</div>}
        </div>
      </div>
      <div className={styles.playerSection}>
        <div className={styles.playerName}>Player B</div>
        <div className={styles.playerCards}>
          {playerB?.cards?.map((card, index) => (
            <img
              key={`${index}-${card}`}
              src={card}
              alt={`Player B card ${index + 1}`}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )) || <div>No cards</div>}
        </div>
      </div>
    </>
  );
}
