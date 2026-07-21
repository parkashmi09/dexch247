import FlipCard from "../teen62/FlipCard.jsx";

const CARD_BACK = "/assets/img/cards/1.jpg";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function NotenumVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  const cards = [0, 1, 2, 3, 4, 5].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        {cards.map((src, i) => (
          <div key={i} className={`flip-card-container${i > 0 ? " mt-1" : ""}`}>
            <FlipCard src={src} />
          </div>
        ))}
      </div>
    </div>
  );
}
