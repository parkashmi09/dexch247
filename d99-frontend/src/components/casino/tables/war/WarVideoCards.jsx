import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardSrc(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function WarVideoCards({ cardString = "" }) {
  const codes = cardString ? cardString.split(",").map((c) => c.trim()) : [];
  const dealerCard = codes[6];
  const src = getCardSrc(dealerCard);

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          <FlipCard src={src} />
        </div>
      </div>
    </div>
  );
}
