const CARD_BASE = "/assets/img/cards";
const CARD_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function cardValue(token) {
  return CARD_VALUES[getRank(token)] || 0;
}

function isHighLow(token) {
  const v = cardValue(token);
  if (v === 0) return "";
  return v >= 7 ? "High" : "Low";
}

function isPictureCard(token) {
  const r = getRank(token);
  return ["J", "Q", "K"].includes(r) ? "Yes" : "No";
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function TrapResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const aTokens = [0, 2, 4, 6, 8, 10, 12].map((i) => tokens[i]).filter((t) => t && t !== "1");
  const bTokens = [1, 3, 5, 7, 9, 11, 13].map((i) => tokens[i]).filter((t) => t && t !== "1");

  const aTotal = aTokens.reduce((s, t) => s + cardValue(t), 0);
  const bTotal = bTokens.reduce((s, t) => s + cardValue(t), 0);

  const isAWinner = String(win) === "1";
  const isBWinner = String(win) === "2";
  const winnerLabel = winnat || (isAWinner ? "Player A" : isBWinner ? "Player B" : "");

  // Seven (High/Low) for all dealt cards in order
  const allDealt = [];
  for (let i = 0; i < 14; i++) {
    if (tokens[i] && tokens[i] !== "1") allDealt.push(tokens[i]);
  }
  const sevenValues = allDealt.map(isHighLow).filter(Boolean);
  const pictureValues = allDealt.map(isPictureCard);

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player A ({aTotal})</h4>
          <div className="casino-result-cards">
            {aTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
            {isAWinner && (
              <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>
            )}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B ({bTotal})</h4>
          <div className="casino-result-cards">
            {bTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
            {isBWinner && (
              <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Main</div>
              <div>{winnerLabel}  (A:{aTotal}, B:{bTotal})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Seven</div>
              <div>{sevenValues.join(",")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Picture Card</div>
              <div>{pictureValues.join(",")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
