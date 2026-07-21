import React from "react";
import { getCardImage } from "../../resultVisuals/cardAssets";
import styles from "../VideoBox.module.css";

/**
 * Mogambo cards overlay: Daga/Teja (2 cards) + Mogambo (1 card) + Total.
 * mogamboCards: { dagaTeja, mogambo, allPlaceholder, total }
 */
export default function MogamboCardsOverlay({ mogamboCards }) {
  if (!mogamboCards) return null;
  const { dagaTeja, mogambo, allPlaceholder, total } = mogamboCards;
  return (
    <div
      className={`${styles.casinoVideoCards} ${allPlaceholder ? styles.hideCards : ""}`}
    >
      {/* <div className={styles.casinoCardsShuffle}>
        <i className="fas fa-grip-lines-vertical" />
      </div> */}
      <div className={styles.casinoVideoCardsContainer}>
        <div className={styles.raceTotal}>Total: {total}</div>
        <div>
          <span className={styles.mr2}>Daga/Teja</span>
          {dagaTeja.map((token, i) => (
            <span key={`dt-${i}`}>
              <img src={getCardImage(token)} alt="" />
            </span>
          ))}
        </div>
        <div className={styles.textCenter}>
          <span className={styles.mr2}>Mogambo</span>
          {mogambo.map((token, i) => (
            <span key={`mb-${i}`}>
              <img src={getCardImage(token)} alt="" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
