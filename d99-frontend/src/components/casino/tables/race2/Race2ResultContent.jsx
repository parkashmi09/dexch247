const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

const PLAYERS = ["Player A", "Player B", "Player C", "Player D"];
const WIN_LABELS = { "1": "Player A", "2": "Player B", "3": "Player C", "4": "Player D" };

export default function Race2ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const tokens = card ? card.split(",").map((t) => t.trim()) : [];
  const winnerLabel = winnat || WIN_LABELS[String(win)] || "";

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        {PLAYERS.map((label, i) => {
          const img = getCardImg(tokens[i]);
          const isWinner = winnerLabel === label;
          return (
            <div key={label} className="col-md-3 text-center">
              <h4 className="result-title">{label}</h4>
              <div className="casino-result-cards">
                {img && <img src={img} alt={tokens[i]} />}
                {isWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winnerLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
