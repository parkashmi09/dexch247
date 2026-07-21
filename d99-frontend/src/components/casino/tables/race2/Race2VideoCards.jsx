import FlipCard from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1") return null;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

const PLAYER_LABELS = ["Player A", "Player B", "Player C", "Player D"];

export default function Race2VideoCards({ cardString = "" }) {
  const tokens = cardString
    ? cardString.split(",").map((t) => t.trim())
    : [];

  // Only show players whose card has been dealt (not "1" / empty)
  const players = PLAYER_LABELS.map((label, i) => ({
    label,
    token: tokens[i] || "",
  })).filter(({ token }) => token && token !== "1");

  if (players.length === 0) return null;

  return (
    <div className="casino-video-cards">
      <div>
        {players.map(({ label, token }, i) => (
          <div key={label} className={i > 0 ? "mt-1" : ""}>
            <h5>{label}</h5>
            <div className="flip-card-container">
              <FlipCard src={getCardImage(token)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
