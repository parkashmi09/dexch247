import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Teen20bVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // First 3 = Player A, last 3 = Player B
  const playerACards = [0, 1, 2].map((i) => getCardImage(tokens[i]));
  const playerBCards = [3, 4, 5].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <h5>Player A</h5>
        <div className="flip-card-container">
          {playerACards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
      <div className="mt-1">
        <h5>Player B</h5>
        <div className="flip-card-container">
          {playerBCards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
