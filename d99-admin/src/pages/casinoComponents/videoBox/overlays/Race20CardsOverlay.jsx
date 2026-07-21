import React from "react";
import { getCardImage } from "../../resultVisuals/cardAssets";
import styles from "../VideoBox.module.css";

const BASE = import.meta.env.BASE_URL;

const SUITS = [
  { key: "SS", icon: `${BASE}img/cardIcons/spade.png`,   label: "Spade" },
  { key: "HH", icon: `${BASE}img/cardIcons/heart.png`,   label: "Heart" },
  { key: "CC", icon: `${BASE}img/cardIcons/club.png`,    label: "Club" },
  { key: "DD", icon: `${BASE}img/cardIcons/diamond.png`, label: "Diamond" },
];

// Group card tokens by suit suffix; filter placeholder "0"/"1" tokens
const parseCardsBySuit = (cardString) => {
  const groups = { SS: [], HH: [], CC: [], DD: [] };
  if (!cardString) return groups;
  const tokens = cardString.split(",").map((t) => t.trim()).filter(Boolean);
  for (const token of tokens) {
    if (token === "0" || token === "1") continue;
    if (token.length >= 2) {
      const suffix = token.slice(-2).toUpperCase();
      if (suffix in groups) groups[suffix].push(token);
    }
  }
  return groups;
};

/**
 * Race 20 live cards overlay for VideoBox.
 * Shows 4 suit rows: suit icon + dealt cards; King card gets k-margin class.
 * Structure matches reference:
 *   casino-video-cards > casino-cards-shuffle + casino-video-cards-container
 *   Each row: span(suit icon) + span*(card) + span.k-margin(King card)
 */
export default function Race20CardsOverlay({ normalizedResultData }) {
  const cardsBySuit = parseCardsBySuit(normalizedResultData);
  const hasAnyCard = Object.values(cardsBySuit).some((c) => c.length > 0);

  return (
    <div
      className={`${styles.casinoVideoCards} ${!hasAnyCard ? styles.hideCards : ""}`}
    >
      {/* <div className={styles.casinoCardsShuffle}>
        <i className="fas fa-grip-lines-vertical" />
      </div> */}
      <div className={styles.casinoVideoCardsContainer}>
        {SUITS.map((suit) => {
          const cards = cardsBySuit[suit.key] || [];
          return (
            <div key={suit.key}>
              <span>
                <img src={suit.icon} alt={suit.label} />
              </span>
              {cards.map((token, idx) => {
                const isKing = token.startsWith("K");
                return (
                  <span key={idx} className={isKing ? styles.kMargin : ""}>
                    <img src={getCardImage(token)} alt={token} />
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
