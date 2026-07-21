import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Joker1VideoCards({ cardString = "", jokerCard = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // joker1 card string: token[0]=playerA card1, [1]=playerB card1, [2]=pA card2, [3]=pB card2, [4]=pA card3, [5]=pB card3
  const playerACards = [0, 2, 4].map((i) => getCardImage(tokens[i]));
  const playerBCards = [1, 3, 5].map((i) => getCardImage(tokens[i]));

  return (
    <>
      <div className="joker-card">
        <h4 className="text-playerb">Joker</h4>
        <span>
          {jokerCard ? (
            <img src={`/assets/img/joker1/${jokerCard}.png`} alt="Joker" />
          ) : (
            <img src="/assets/img/joker1/14.png" alt="Joker" />
          )}
        </span>
      </div>
      <div className="casino-video-cards">
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
    </>
  );
}
