const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function cardRankValue(token) {
  if (!token || token === "1" || token === "0") return 0;
  const rank = token.replace(/[HDCS]{2}$/i, "").toUpperCase();
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  if (rank === "A") return 1;
  if (rank === "J") return 11;
  const n = parseInt(rank, 10);
  return isNaN(n) ? 0 : n;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

const GROUP_LABELS = ["Total 0", "Total 1", "Total 2", "Total 3"];

export default function QueenResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  // The feed sends the dealt cards DENSE (front-packed) followed by "1" padding —
  // e.g. "6DD,5DD,4CC,5CC,5HH,1,1,…". Cards are dealt COLUMN-MAJOR: one to each lane
  // per column (Total 0,1,2,3), then the next column, until a lane wins. So the
  // n-th dealt card belongs to lane (n % 4): filter the placeholders to the dense
  // list, then round-robin.
  const dealt = card ? card.split(",").map((t) => t.trim()).filter((t) => t && t !== "1" && t !== "0") : [];
  const groups = Array.from({ length: 4 }, () => []);
  dealt.forEach((token, i) => groups[i % 4].push(token));

  const groupTotals = groups.map((cards, gi) => {
    const pipSum = cards.reduce((sum, t) => sum + cardRankValue(t), 0);
    return cards.length > 0 ? pipSum + gi : 0;
  });

  // Feed `win` is 1-based (1 = Total 0, 4 = Total 3); lane index is 0-based.
  const winnerLabel = winnat || (win !== "" ? `Total ${parseInt(win, 10) - 1}` : "");
  const winnerGroupIdx = win !== "" ? parseInt(win, 10) - 1 : -1;

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        {groups.map((cards, gi) => {
          if (cards.length === 0) return null;
          const total = groupTotals[gi];
          const isWinner = gi === winnerGroupIdx;
          return (
            <div key={gi} className="col-md-3 text-center">
              <h4 className="result-title">
                {GROUP_LABELS[gi]} - <span className="badge bg-success">{total}</span>
              </h4>
              <div className="casino-result-cards">
                {cards.map((token, ci) => {
                  const img = getCardImg(token);
                  return img ? <img key={ci} src={img} alt={token} /> : null;
                })}
                {isWinner && (
                  <div className="casino-winner-icon"><i className="fas fa-trophy"></i></div>
                )}
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
