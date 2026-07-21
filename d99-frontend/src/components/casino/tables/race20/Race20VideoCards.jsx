import FlipCard from "../teen62/FlipCard.jsx";

const SUIT_ORDER = ["spade", "heart", "club", "diamond"];
const SUIT_ICONS = {
  spade: "/assets/img/icons/spade.png",
  heart: "/assets/img/icons/heart.png",
  club: "/assets/img/icons/club.png",
  diamond: "/assets/img/icons/diamond.png",
};
const SUIT_KING = {
  spade: "/assets/img/cards/KSS.jpg",
  heart: "/assets/img/cards/KHH.jpg",
  club: "/assets/img/cards/KCC.jpg",
  diamond: "/assets/img/cards/KDD.jpg",
};

const CARD_VALUES = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

function getSuit(token) {
  if (!token || token === "1") return null;
  if (token.endsWith("SS")) return "spade";
  if (token.endsWith("HH")) return "heart";
  if (token.endsWith("CC")) return "club";
  if (token.endsWith("DD")) return "diamond";
  return null;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.slice(0, -2).toUpperCase();
}

function getCardValue(token) {
  if (!token || token === "1") return 0;
  return CARD_VALUES[getRank(token)] || 0;
}

function getCardImage(token) {
  if (!token || token === "1") return null;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Race20VideoCards({ cardString = "" }) {
  const tokens = cardString ? cardString.split(",").map((t) => t.trim()) : [];

  // Group dealt cards by suit, excluding Kings (Kings are always shown at end)
  const bySuit = { spade: [], heart: [], club: [], diamond: [] };
  let totalCards = 0;
  let totalPoints = 0;

  for (const token of tokens) {
    if (!token || token === "1") continue;
    const suit = getSuit(token);
    if (!suit) continue;
    const rank = getRank(token);
    if (rank === "K") continue; // Kings shown separately as finish line
    bySuit[suit].push(token);
    totalCards++;
    totalPoints += getCardValue(token);
  }

  if (totalCards === 0 && totalPoints === 0) return null;

  return (
    <div className="casino-video-cards">
      <div className="race-total-point">
        <div className="text-white">
          <div>Cards</div>
          <div>{totalCards}</div>
        </div>
        <div className="text-white">
          <div>Points</div>
          <div>{totalPoints}</div>
        </div>
      </div>

      {SUIT_ORDER.map((suit, idx) => (
        <div key={suit} className={idx > 0 ? "mt-1" : ""}>
          <div className="flip-card-container">
            <div className="flip-card">
              <img src={SUIT_ICONS[suit]} alt={suit} />
            </div>
            {bySuit[suit].map((token, i) => (
              <FlipCard key={i} src={getCardImage(token)} />
            ))}
            {/* King is always the finish line for each suit */}
            <FlipCard src={SUIT_KING[suit]} />
          </div>
        </div>
      ))}
    </div>
  );
}
