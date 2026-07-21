import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BASE = "/assets/img/cards";

function resolveCard(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}/${code}.jpg`;
}

export default function LottcardVideoCards({ cardString }) {
  const parts = (cardString || "").split(",").map((c) => c.trim()).filter(Boolean);
  const card1 = resolveCard(parts[0]);
  const card2 = resolveCard(parts[1]);
  const card3 = resolveCard(parts[2]);

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          <FlipCard src={card1} />
        </div>
      </div>
      <div className="mt-1">
        <div className="flip-card-container">
          <FlipCard src={card2} />
        </div>
      </div>
      <div className="mt-1">
        <div className="flip-card-container">
          <FlipCard src={card3} />
        </div>
      </div>
    </div>
  );
}
