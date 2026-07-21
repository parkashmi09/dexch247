import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Teen1VideoCards({ cardString = "" }) {
  if (!cardString) return <div className="casino-video-cards"></div>;

  const tokens = cardString.split(",").map((t) => t.trim());
  const playerSrc = getCardImage(tokens[0]);
  const dealerSrc = getCardImage(tokens[1]);

  return (
    <div className="casino-video-cards">
      <div>
        <div>
          <h5>Player</h5>
          <div className="flip-card-container">
            <FlipCard src={playerSrc} />
          </div>
        </div>
        <div className="mt-1">
          <h5>Dealer</h5>
          <div className="flip-card-container mt-1">
            <FlipCard src={dealerSrc} />
          </div>
        </div>
      </div>
    </div>
  );
}
