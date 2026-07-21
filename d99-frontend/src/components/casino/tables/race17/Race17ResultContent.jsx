const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function getCardValue(token) {
  const rank = getRank(token);
  if (rank === "A") return 1;
  const n = parseInt(rank, 10);
  if (!isNaN(n)) return n <= 9 ? n : 0;
  return 0; // J/Q/K = 0
}

function isBigCard(token) {
  const rank = getRank(token);
  return ["7", "8", "9"].includes(rank) ? "Big" : "Small";
}

function isZeroCard(token) {
  const rank = getRank(token);
  return ["10", "J", "Q", "K"].includes(rank) ? "Yes" : "No";
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function Race17ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "" } = t1;

  const tokens = card ? card.split(",").map((t) => t.trim()) : [];
  const dealt = tokens.filter((t) => t && t !== "1");
  const total = dealt.reduce((sum, t) => sum + getCardValue(t), 0);

  const raceResult = total >= 17 ? "Yes" : "No";
  const bigCardValues = dealt.map(isBigCard);
  const zeroCardValues = dealt.map(isZeroCard);
  const hasAnyZero = dealt.some((t) => isZeroCard(t) === "Yes");

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="casino-result-cards">
        {dealt.map((token, i) => (
          <img key={i} src={getCardImg(token)} alt={token} />
        ))}
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Race to 17</div>
              <div>{raceResult} ({total})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Big Card</div>
              <div>{bigCardValues.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Zero Card</div>
              <div>{zeroCardValues.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>One Zero Card</div>
              <div>{hasAnyZero ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
