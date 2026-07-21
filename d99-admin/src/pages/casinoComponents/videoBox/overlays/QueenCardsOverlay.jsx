import React from "react";
import { getCardImage } from "../../resultVisuals/cardAssets";
import styles from "../VideoBox.module.css";

const GROUPS = 4;

// Sequential pairs: G0=[0,1], G1=[2,3], G2=[4,5], G3=[6,7]
const parseCardsIntoGroups = (cardString) => {
  const groups = Array.from({ length: GROUPS }, () => []);
  if (!cardString) return groups;
  const valid = cardString
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t && t !== "0" && t !== "1");
  valid.forEach((token, idx) => {
    const gi = Math.floor(idx / 2);
    if (gi < GROUPS) groups[gi].push(token);
  });
  return groups;
};

/**
 * Queen game cards overlay for VideoBox.
 * Shows 4 groups (Total 0–3) with dealt card pairs + running total.
 * Winning group label gets text-success class.
 * Structure matches reference:
 *   casino-video-cards > casino-cards-shuffle + casino-video-cards-container
 *   Each group: dealer-name(label + total) + span*(card images)
 *
 * subData: first 4 items of gameData.data.data.sub (nat="Total X", b=running total)
 * winIndex: 0-based index of winning group (-1 = none yet)
 */
export default function QueenCardsOverlay({ normalizedResultData, subData = [], winIndex = -1 }) {
  const cardGroups = parseCardsIntoGroups(normalizedResultData);
  const hasAnyCard = cardGroups.some((g) => g.length > 0);

  return (
    <div
      className={`${styles.casinoVideoCards} ${!hasAnyCard ? styles.hideCards : ""}`}
    >
      {/* <div className={styles.casinoCardsShuffle}>
        <i className="fas fa-grip-lines-vertical" />
      </div> */}
      <div className={styles.casinoVideoCardsContainer}>
        {Array.from({ length: GROUPS }, (_, i) => {
          const sub = subData[i];
          const label = sub?.nat || `Total ${i}`;
          const total = sub?.b ?? "";
          const isWinner = i === winIndex;
          const cards = cardGroups[i] || [];
          return (
            <div key={i}>
              <div className={`${styles.dealerName} w-100 mb-1`}>
                <span className={isWinner ? "text-success" : ""}>
                  {label}:
                </span>
                {total !== "" && (
                  <span className="text-warning ml-1">{total}</span>
                )}
              </div>
              <div>
                {cards.map((token, ci) => (
                  <span key={ci}>
                    <img src={getCardImage(token)} alt={token} />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
