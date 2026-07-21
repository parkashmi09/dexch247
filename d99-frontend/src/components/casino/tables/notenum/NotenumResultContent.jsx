const CARD_BASE = "/assets/img/cards";
const BACC_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 0 };
const CARD_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10 };

function getCardImg(token) {
  if (!token || token === "1") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function getSuitColor(token) {
  if (!token || token === "1") return "";
  const s = token.slice(-2).toUpperCase();
  return s === "HH" || s === "DD" ? "Red" : "Black";
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function NotenumResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim()).filter((t) => t && t !== "1");
  const ranks = tokens.map(getRank);

  const oddEvenValues = ranks.map((r) => ["A", "3", "5", "7", "9"].includes(r) ? "Odd" : "Even");
  const redBlackValues = tokens.map((t) => getSuitColor(t));
  const lowHighValues = ranks.map((r) => ["A", "2", "3", "4", "5"].includes(r) ? "Low" : "High");
  const cardValues = ranks.map((r) => CARD_VALUES[r] || 0);

  const b1 = ranks.slice(0, 3).reduce((s, r) => s + (BACC_VALUES[r] || 0), 0) % 10;
  const b2 = ranks.slice(3, 6).reduce((s, r) => s + (BACC_VALUES[r] || 0), 0) % 10;
  const baccWinner = b1 > b2 ? "Baccarat 1" : b2 > b1 ? "Baccarat 2" : "Tie";

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-12 text-center">
          <div className="casino-result-cards">
            {tokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{oddEvenValues.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Red/Black</div>
              <div>{redBlackValues.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Low/High</div>
              <div>{lowHighValues.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Cards</div>
              <div>{cardValues.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Baccarat</div>
              <div>{baccWinner} (B1 : {b1}  |  B2 : {b2})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
