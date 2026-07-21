const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getCardValue(token) {
  if (!token || token === "1" || token === "0") return 0;
  const t = token.trim().replace(/(SS|HH|CC|DD)$/i, "");
  if (t === "A") return 1;
  if (t === "J") return 11;
  if (t === "Q") return 12;
  if (t === "K") return 13;
  const n = parseInt(t, 10);
  return isNaN(n) ? 0 : n;
}

const PLAYERS = [
  { label: "Player 8", offset: 0, base: 8 },
  { label: "Player 9", offset: 1, base: 9 },
  { label: "Player 10", offset: 2, base: 10 },
  { label: "Player 11", offset: 3, base: 11 },
];

export default function Card32ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;
  const tokens = card.split(",").map((t) => t.trim());

  // Calculate scores: base + sum of card values (interleaved by 4)
  const playerData = PLAYERS.map((player) => {
    let cardScore = 0;
    let lastCard = null;
    for (let i = player.offset; i < tokens.length; i += 4) {
      const token = tokens[i];
      if (token && token !== "1" && token !== "0") {
        cardScore += getCardValue(token);
        lastCard = getCardImg(token);
      }
    }
    const score = cardScore > 0 ? player.base + cardScore : 0;
    const isWinner = winnat === player.label;
    return { ...player, score, lastCard, isWinner };
  });

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch {}

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>

      <div className="row mt-2">
        {playerData.map((player) => (
          <div key={player.label} className="col-md-3 text-center">
            <h4 className="result-title">
              {player.label} - <span className="text-warning">{player.score}</span>
            </h4>
            <div className="casino-result-cards">
              {player.lastCard && <img src={player.lastCard} alt="" />}
              {player.isWinner && (
                <div className="casino-winner-icon">
                  <i className="fas fa-trophy"></i>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winnat || rdesc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
