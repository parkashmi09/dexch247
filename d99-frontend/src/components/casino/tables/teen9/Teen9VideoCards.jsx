import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token}.jpg`;
}

export default function Teen9VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());

  // teen9: 9 cards — Tiger: 0,1,2 / Lion: 3,4,5 / Dragon: 6,7,8
  // OR interleaved: Tiger: 0,3,6 / Lion: 1,4,7 / Dragon: 2,5,8
  // From API card pattern "10CC,2DD,8DD,4HH,3SS,4CC,..." it's interleaved
  const tigerCards = [0, 3, 6].map((i) => getCardImage(tokens[i]));
  const lionCards = [1, 4, 7].map((i) => getCardImage(tokens[i]));
  const dragonCards = [2, 5, 8].map((i) => getCardImage(tokens[i]));

  return (
    <div className="casino-video-cards">
      <div>
        <h5>Tiger</h5>
        <div className="flip-card-container">
          {tigerCards.map((src, i) => <FlipCard key={i} src={src} />)}
        </div>
      </div>
      <div className="mt-1">
        <h5>Lion</h5>
        <div className="flip-card-container">
          {lionCards.map((src, i) => <FlipCard key={i} src={src} />)}
        </div>
      </div>
      <div className="mt-1">
        <h5>Dragon</h5>
        <div className="flip-card-container">
          {dragonCards.map((src, i) => <FlipCard key={i} src={src} />)}
        </div>
      </div>
    </div>
  );
}
