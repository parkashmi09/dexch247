import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function DT202VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  const dragonSrc = getCardImage(tokens[0]);
  const tigerSrc = getCardImage(tokens[1]);

  return (
    <div className="casino-video-cards">
      <div className="d-flex flex-wrap justify-content-between">
        <div>
          <div className="flip-card-container">
            <FlipCard src={dragonSrc} />
            <FlipCard src={tigerSrc} />
          </div>
        </div>
      </div>
    </div>
  );
}
