import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Patti2VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // 4 cards: positions 0,1 = row 1 (Player A); positions 2,3 = row 2 (Player B)
  const row1Cards = [0, 1].map((i) => getCardImage(tokens[i]));
  const row2Cards = [2, 3].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <div className="flip-card-container">
          {row1Cards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
      <div className="mt-1">
        <div className="flip-card-container">
          {row2Cards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
