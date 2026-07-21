import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function PokerVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  // Player A: idx 0,1 | Player B: idx 2,3 | Board: idx 4,5,6,7,8
  const playerACards = [0, 1].map((i) => getCardImage(tokens[i]));
  const playerBCards = [2, 3].map((i) => getCardImage(tokens[i]));
  const boardCards = [4, 5, 6, 7, 8].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div className="d-flex flex-wrap justify-content-between">
        <div>
          <h5>Player A</h5>
          <div className="flip-card-container">
            {playerACards.map((src, i) => <FlipCard key={i} src={src} />)}
          </div>
        </div>
        <div>
          <h5>Player B</h5>
          <div className="flip-card-container justify-content-end">
            {playerBCards.map((src, i) => <FlipCard key={i} src={src} />)}
          </div>
        </div>
      </div>
      <div className="mt-1">
        <h5>Board</h5>
        <div className="flip-card-container">
          {boardCards.map((src, i) => <FlipCard key={i} src={src} />)}
        </div>
      </div>
    </div>
  );
}
