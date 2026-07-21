import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardSrc(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function AAA2VideoCards({ cardString = "" }) {
  const token = cardString.split(",")[0]?.trim();
  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          <FlipCard src={getCardSrc(token)} />
        </div>
      </div>
    </div>
  );
}
