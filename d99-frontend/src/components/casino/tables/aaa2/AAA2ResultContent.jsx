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

export default function AAA2ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const token = card.split(",")[0]?.trim();
  const rank = getRank(token);
  const val = CARD_VALUES[rank] || 0;

  const winner = winnat || (String(win) === "1" ? "Amar" : String(win) === "2" ? "Akbar" : String(win) === "3" ? "Anthony" : "");
  const oddEven = ["A", "3", "5", "7", "9", "J", "K"].includes(rank) ? "Odd" : "Even";
  const color = getSuitColor(token);
  const underOver = val === 7 ? "7" : val < 7 ? "Under 7" : "Over 7";

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-12 text-center">
          <div className="casino-result-cards">
            {getCardImg(token) && <img src={getCardImg(token)} alt={token} />}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winner}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{oddEven}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Color</div>
              <div>{color}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Under/Over</div>
              <div>{underOver}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Card</div>
              <div>{rank}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
