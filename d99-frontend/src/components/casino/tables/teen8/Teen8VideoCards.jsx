import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Teen8VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  // Dealer cards are at separator positions: idx 8, 17, 26
  const dealerCards = [8, 17, 26].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <h5>Dealer</h5>
        <div className="flip-card-container">
          {dealerCards.map((src, i) => <FlipCard key={i} src={src} />)}
        </div>
      </div>
    </div>
  );
}
