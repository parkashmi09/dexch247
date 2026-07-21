const CARD_BASE = "/assets/img/cards";
const CARD_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };

function getCardImg(token) {
  if (!token || token === "1") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function Cmeter1ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "", rdesc = "" } = t1;

  const tokens = card ? card.split(",").map((t) => t.trim()) : [];
  const cardA = tokens[0];
  const cardB = tokens[1];

  const isAWinner = String(win) === "1";
  const isBWinner = String(win) === "2";
  const winLabel = winnat || (isAWinner ? "Fighter A" : isBWinner ? "Fighter B" : "Tie");

  // Points from rdesc or compute difference
  const valA = CARD_VALUES[getRank(cardA)] || 0;
  const valB = CARD_VALUES[getRank(cardB)] || 0;
  const points = rdesc || String(Math.abs(valA - valB));

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 text-center">
          <h4 className="result-title">Fighter A</h4>
          <div className="casino-result-cards">
            {getCardImg(cardA) && <img src={getCardImg(cardA)} alt={cardA} />}
            {isAWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Fighter B</h4>
          <div className="casino-result-cards">
            {getCardImg(cardB) && <img src={getCardImg(cardB)} alt={cardB} />}
            {isBWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winLabel}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Points</div>
              <div>{points}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
