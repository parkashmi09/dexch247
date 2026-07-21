import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardSrc(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function WorliVideoCards({ cardString = "" }) {
  const codes = cardString ? cardString.split(",").map((c) => c.trim()) : [];

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          {[0, 1, 2].map((i) => (
            <FlipCard key={i} src={getCardSrc(codes[i])} />
          ))}
        </div>
      </div>
    </div>
  );
}
