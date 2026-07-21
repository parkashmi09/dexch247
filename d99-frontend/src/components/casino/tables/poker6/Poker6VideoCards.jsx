import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Poker6VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  // Board cards: 5 cards after 12 player cards (6 players × 2 cards)
  const boardCards = [12, 13, 14, 15, 16].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          {boardCards.map((src, i) => <FlipCard key={i} src={src} />)}
        </div>
      </div>
    </div>
  );
}
