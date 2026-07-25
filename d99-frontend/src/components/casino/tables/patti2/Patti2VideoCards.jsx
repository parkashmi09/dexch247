import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Patti2VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // Cards are dealt ALTERNATELY: 1st→Player A, 2nd→Player B, 3rd→Player A,
  // 4th→Player B. So a player's row is its every-other index, NOT a contiguous
  // pair — Player A = positions 0,2; Player B = positions 1,3. This matches the
  // feed's own scoring (rdesc "A : x | B : y") and Patti2ResultContent.
  const row1Cards = [0, 2].map((i) => getCardImage(tokens[i])); // Player A
  const row2Cards = [1, 3].map((i) => getCardImage(tokens[i])); // Player B

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
