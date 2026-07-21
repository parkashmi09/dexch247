import FlipCard from "../teen62/FlipCard.jsx";

// Baccarat-style card value: A=1, 2-9=pip, 10/J/Q/K=0
function getCardValue(token) {
  if (!token || token === "1") return 0;
  const rank = token.slice(0, -2).toUpperCase();
  if (rank === "A") return 1;
  const n = parseInt(rank, 10);
  if (!isNaN(n)) return n <= 9 ? n : 0;
  // J, Q, K, 10 → 0
  return 0;
}

function getCardImage(token) {
  if (!token || token === "1") return null;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Race17VideoCards({ cardString = "" }) {
  const tokens = cardString
    ? cardString.split(",").map((t) => t.trim())
    : [];

  // Total of dealt cards (skip face-down "1" tokens)
  const total = tokens.reduce(
    (sum, t) => (t && t !== "1" ? sum + getCardValue(t) : sum),
    0
  );

  const hasCards = tokens.some((t) => t && t !== "1");

  if (!hasCards) return null;

  return (
    <div className="casino-video-cards">
      <h5>Total: {total}</h5>
      {tokens.map((token, i) => (
        <div key={i} className="mt-1">
          <FlipCard src={getCardImage(token)} />
        </div>
      ))}
    </div>
  );
}
