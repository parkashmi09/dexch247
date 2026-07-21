import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

// card value: A=1,2-9,10=10,J=11,Q=12,K=13
function cardValue(token) {
  if (!token || token === "1" || token === "0") return 0;
  const val = token.replace(/[SSHHCCDD]/g, "");
  if (val === "A") return 1;
  if (val === "J") return 11;
  if (val === "Q") return 12;
  if (val === "K") return 13;
  return parseInt(val) || 0;
}

export default function MogamboVideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  // Daga/Teja: cards[0], cards[1]; Mogambo: cards[2]
  const dagaCards = [tokens[0], tokens[1]].map(getCardImage);
  const mogamboCard = getCardImage(tokens[2]);

  const total = tokens.reduce((sum, t) => sum + cardValue(t), 0);

  return (
    <div className="casino-video-cards">
      <h5 className="mogambo-total">Total: {total}</h5>
      <div className="mt-1">
        <h5>Daga / Teja</h5>
        <div className="flip-card-container">
          <FlipCard src={dagaCards[0]} />
          <span className="card-devider"></span>
          <FlipCard src={dagaCards[1]} />
        </div>
      </div>
      <div>
        <h5>Mogambo</h5>
        <div className="flip-card-container">
          <FlipCard src={mogamboCard} />
        </div>
      </div>
    </div>
  );
}
