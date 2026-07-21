import FlipCard, { CARD_BACK } from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return CARD_BACK;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function Cmeter1VideoCards({ cardString = "" }) {
  const tokens = cardString.split(",").map((t) => t.trim());
  const fighterASrc = getCardImage(tokens[0]);
  const fighterBSrc = getCardImage(tokens[1]);

  return (
    <div className="casino-video-cards">
      <div className="d-flex flex-wrap justify-content-between">
        <div>
          <div className="flip-card-container">
            <FlipCard src={fighterASrc} />
            <FlipCard src={fighterBSrc} />
          </div>
        </div>
      </div>
    </div>
  );
}
