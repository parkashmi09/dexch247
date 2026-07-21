import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Lucky7VideoCards({ cardString = "" }) {
  const token = cardString.split(",")[0]?.trim();
  const src = getCardImage(token);

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
