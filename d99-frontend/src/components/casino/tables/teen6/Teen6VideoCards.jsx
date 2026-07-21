import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BASE = "/assets/img/cards";

function resolveCard(code) {
  if (!code || code === "1" || code === "0") return null;
  return `${CARD_BASE}/${code.trim()}.jpg`;
}

export default function Teen6VideoCards({ cardString = "" }) {
  const parts = cardString.split(",").map((c) => c.trim());
  const pA = [resolveCard(parts[0]), resolveCard(parts[1]), resolveCard(parts[2])];
  const pB = [resolveCard(parts[3]), resolveCard(parts[4]), resolveCard(parts[5])];

  return (
    <div className="casino-video-cards">
      <div>
        <h5>Player A</h5>
        <div className="flip-card-container">
          {pA.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
      <div className="mt-1">
        <h5>Player B</h5>
        <div className="flip-card-container">
          {pB.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
