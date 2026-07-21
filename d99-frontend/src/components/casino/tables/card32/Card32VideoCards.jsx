import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

// Extract numeric value from card token: "10CC"→10, "JSS"→11, "QDD"→12, "KCC"→13, "AHH"→1, "7HH"→7
function getCardValue(token) {
  if (!token || token === "1" || token === "0") return 0;
  const t = token.trim().replace(/(SS|HH|CC|DD)$/i, "");
  if (t === "A") return 1;
  if (t === "J") return 11;
  if (t === "Q") return 12;
  if (t === "K") return 13;
  const n = parseInt(t, 10);
  return isNaN(n) ? 0 : n;
}

const PLAYERS = [
  { label: "Player 8", offset: 0, base: 8 },
  { label: "Player 9", offset: 1, base: 9 },
  { label: "Player 10", offset: 2, base: 10 },
  { label: "Player 11", offset: 3, base: 11 },
];

export default function Card32VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // Each player's cards are at indices: offset, offset+4, offset+8, ...
  const playerData = PLAYERS.map((player) => {
    const cards = [];
    let cardScore = 0;
    let lastCard = CARD_BACK;
    for (let i = player.offset; i < tokens.length; i += 4) {
      const token = tokens[i];
      if (token && token !== "1" && token !== "0") {
        cards.push(token);
        cardScore += getCardValue(token);
        lastCard = getCardImage(token);
      }
    }
    // Score = player number (base) + sum of card values
    const score = cards.length > 0 ? player.base + cardScore : 0;
    return { ...player, score, lastCard, hasCards: cards.length > 0 };
  });

  const maxScore = Math.max(...playerData.map((p) => p.score));
  const hasWinner = maxScore > 0 && playerData.some((p) => p.hasCards);

  return (
    <div className="casino-video-cards">
      {playerData.map((player, idx) => {
        const isWinner = hasWinner && player.score === maxScore;
        return (
          <div key={player.label} className={idx > 0 ? "mt-1" : ""}>
            <h5 className={isWinner ? "text-success" : ""}>
              {player.label}:{" "}
              <span className="text-warning">{player.score || 0}</span>
            </h5>
            <div className="flip-card-container">
              <FlipCard src={player.lastCard} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
