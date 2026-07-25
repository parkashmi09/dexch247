import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function PoisonVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // token[0] = poison card, then player cards are dealt alternately —
  // [1]=pA card1, [2]=pB card1, [3]=pA card2, [4]=pB card2, [5]=pA card3, [6]=pB card3
  const poisonCard = getCardImage(tokens[0]);
  const playerACards = [1, 3, 5].map((i) => getCardImage(tokens[i]));
  const playerBCards = [2, 4, 6].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div className="joker-card">
        <h5 className="text-playerb">Poison</h5>
        <div className="flip-card-container">
          <FlipCard src={poisonCard} />
        </div>
      </div>
      <div className="mt-1">
        <h5>Player A</h5>
        <div className="flip-card-container">
          {playerACards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
      <div className="mt-1">
        <h5>Player B</h5>
        <div className="flip-card-container">
          {playerBCards.map((src, i) => (
            <FlipCard key={i} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
