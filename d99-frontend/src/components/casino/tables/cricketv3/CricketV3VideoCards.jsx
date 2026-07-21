import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BASE = "/assets/img/cards";

function resolveCard(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}/${code}.jpg`;
}

export default function CricketV3VideoCards({ cardString }) {
  const sep = (cardString || "").includes("|") ? "|" : ",";
  const parts = (cardString || "").split(sep).map((c) => c.trim());
  const cards = [];
  for (let i = 0; i < 6; i++) {
    cards.push(resolveCard(parts[i]));
  }

  return (
    <div className="casino-video-cards">
      {cards.map((src, i) => (
        <div key={i} className="mt-1">
          <FlipCard src={src} />
        </div>
      ))}
    </div>
  );
}
