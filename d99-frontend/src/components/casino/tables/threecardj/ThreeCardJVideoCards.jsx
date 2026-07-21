import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function ThreeCardJVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  const card1 = getCardImage(tokens[0]);
  const card2 = getCardImage(tokens[1]);
  const card3 = getCardImage(tokens[2]);

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          <FlipCard src={card1} />
          <FlipCard src={card2} />
          <FlipCard src={card3} />
        </div>
      </div>
    </div>
  );
}
