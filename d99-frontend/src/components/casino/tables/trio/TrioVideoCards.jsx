import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BACK = "/assets/img/cards/1.jpg";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function TrioVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  const cards = [0, 1, 2].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          {cards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
