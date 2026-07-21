import React from "react";
import ResultVisuals from "../../resultVisuals";
import styles from "../VideoBox.module.css";
import DefaultPlayerCards from "./DefaultPlayerCards";

/**
 * Cards/result overlay: by gameType shows Mogambo cards (handled by parent),
 * ResultVisuals (teen, trio, etc.), or fallback Player A/B cards.
 * This component only handles the non-Mogambo branch (ResultVisuals or DefaultPlayerCards).
 */
export default function VideoBoxResultOverlay({
  gameType,
  normalizedResultData,
  poisonCard,
  playerA,
  playerB,
}) {
  return (
    <div className={styles.playerInfo}>
      {gameType ? (
        <ResultVisuals
          gameType={gameType}
          data={normalizedResultData}
          poisonCard={poisonCard}
          playerA={playerA}
          playerB={playerB}
        />
      ) : (
        <DefaultPlayerCards playerA={playerA} playerB={playerB} />
      )}
    </div>
  );
}
