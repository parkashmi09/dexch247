import FlipCard from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return null;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function TeenmufVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // Alternating: even positions = Player A, odd positions = Player B
  const playerACards = [0, 2, 4].map((i) => getCardImage(tokens[i]));
  const playerBCards = [1, 3, 5].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          {playerACards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
      <div className="mt-1">
        <div className="flip-card-container">
          {playerBCards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
