const CARD_BASE = "/assets/img/cards";

function cardValue(token) {
  if (!token || token === "1" || token === "0") return 0;
  const t = token.trim();
  // Remove suit suffix (last 2 chars): e.g. "ADD" → "A", "10HH" → "10", "JCC" → "J"
  const rank = t.slice(0, t.length - 2);
  if (rank === "A") return 1;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  const n = parseInt(rank, 10);
  return isNaN(n) ? 0 : n;
}

function cardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function TrapVideoCards({ cardString = "" }) {
  if (!cardString) return <div className="casino-video-cards"></div>;

  const tokens = cardString.split(",").map((t) => t.trim());

  // Positions: A = 0,2,4,6,8,10,12 (even indices), B = 1,3,5,7,9,11,13 (odd indices)
  const playerATokens = [0, 2, 4, 6, 8, 10, 12].map((i) => tokens[i]).filter((t) => t && t !== "1" && t !== "0");
  const playerBTokens = [1, 3, 5, 7, 9, 11, 13].map((i) => tokens[i]).filter((t) => t && t !== "1" && t !== "0");

  const playerATotal = playerATokens.reduce((sum, t) => sum + cardValue(t), 0);
  const playerBTotal = playerBTokens.reduce((sum, t) => sum + cardValue(t), 0);

  if (playerATokens.length === 0 && playerBTokens.length === 0) {
    return <div className="casino-video-cards"></div>;
  }

  return (
    <div className="casino-video-cards">
      <div className="row row5">
        <div className="col-6">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div><b>A</b></div>
            <div className="text-fancy">{playerATotal}</div>
          </div>
          <div className="v-slider">
            {playerATokens.map((token, i) => (
              <img
                key={i}
                src={cardImg(token)}
                alt={token}
                style={{ width: "100%", display: "inline-block" }}
              />
            ))}
          </div>
        </div>
        <div className="col-6">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div><b>B</b></div>
            <div className="text-fancy">{playerBTotal}</div>
          </div>
          <div className="v-slider">
            {playerBTokens.map((token, i) => (
              <img
                key={i}
                src={cardImg(token)}
                alt={token}
                style={{ width: "100%", display: "inline-block" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
