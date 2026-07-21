import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BASE = "/assets/img/cards";

function resolveCard(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}/${code}.jpg`;
}

export default function Cmatch20VideoCards({ cardString }) {
  const parts = (cardString || "").split(",").map((c) => c.trim());
  const card1 = resolveCard(parts[0]);
  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          <FlipCard src={card1} />
        </div>
      </div>
    </div>
  );
}
