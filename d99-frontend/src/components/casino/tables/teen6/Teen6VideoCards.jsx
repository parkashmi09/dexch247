import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BASE = "/assets/img/cards";

function resolveCard(code) {
  if (!code || code === "1" || code === "0") return null;
  return `${CARD_BASE}/${code.trim()}.jpg`;
}

export default function Teen6VideoCards({ cardString = "" }) {
  const parts = cardString.split(",").map((c) => c.trim());
  // Cards are dealt ALTERNATELY: 1st→A, 2nd→B, 3rd→A, 4th→B, 5th→A, 6th→B. So a
  // player's cards are its every-other index, NOT a contiguous block — Player A =
  // positions 0,2,4; Player B = positions 1,3,5. This matches the feed's own
  // scoring (rdesc "A : … | B : …").
  const pA = [resolveCard(parts[0]), resolveCard(parts[2]), resolveCard(parts[4])];
  const pB = [resolveCard(parts[1]), resolveCard(parts[3]), resolveCard(parts[5])];

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
