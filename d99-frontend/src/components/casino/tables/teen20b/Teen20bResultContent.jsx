const CARD_BASE = "/assets/img/cards";
const CARD_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };
const BACC_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 0, J: 0, Q: 0, K: 0 };

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function getSuit(token) {
  if (!token || token === "1") return "";
  const s = token.slice(-2).toUpperCase();
  if (s === "SS" || s === "CC") return "Black";
  if (s === "HH" || s === "DD") return "Red";
  return "";
}

function hasPair(tokens) {
  const ranks = tokens.map(getRank).filter(Boolean);
  return new Set(ranks).size < ranks.length;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function Teen20bResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const aTokens = tokens.slice(0, 3).filter((t) => t && t !== "1");
  const bTokens = tokens.slice(3, 6).filter((t) => t && t !== "1");

  const isAWinner = String(win) === "1";
  const isBWinner = String(win) === "2";
  const winnerLabel = winnat || (isAWinner ? "Player A" : isBWinner ? "Player B" : "");

  // 3 Baccarat
  const aBacc = aTokens.reduce((s, t) => s + (BACC_VALUES[getRank(t)] || 0), 0) % 10;
  const bBacc = bTokens.reduce((s, t) => s + (BACC_VALUES[getRank(t)] || 0), 0) % 10;
  const baccWinner = aBacc > bBacc ? "Player A" : bBacc > aBacc ? "Player B" : "Tie";

  // Total
  const aTotal = aTokens.reduce((s, t) => s + (CARD_VALUES[getRank(t)] || 0), 0);
  const bTotal = bTokens.reduce((s, t) => s + (CARD_VALUES[getRank(t)] || 0), 0);
  const totalWinner = aTotal > bTotal ? "Player A" : bTotal > aTotal ? "Player B" : "Tie";

  // Pair Plus
  const aPair = hasPair(aTokens);
  const bPair = hasPair(bTokens);
  const pairText = [aPair ? "A : Pair" : "", bPair ? "B : Pair" : ""].filter(Boolean).join(" | ") || "-";

  // Red/Black (majority color)
  const getColor = (tks) => {
    const blacks = tks.filter((t) => getSuit(t) === "Black").length;
    return blacks >= 2 ? "Black" : "Red";
  };
  const aColor = getColor(aTokens);
  const bColor = getColor(bTokens);

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player A</h4>
          <div className="casino-result-cards">
            {isAWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {aTokens.map((token, i) => <img key={i} src={getCardImg(token)} alt={token} />)}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {isBWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {bTokens.map((token, i) => <img key={i} src={getCardImg(token)} alt={token} />)}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner:</div>
              <div>{winnerLabel}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>3 Baccarat:</div>
              <div>{baccWinner}(High Baccarat)</div>
            </div>
            <div className="casino-result-desc-item">
              <div>&nbsp;</div>
              <div>(A : {aBacc} | B : {bBacc})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Total:</div>
              <div>{totalWinner} (A : {aTotal} | B : {bTotal})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Pair Plus:</div>
              <div>{pairText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Red Black:</div>
              <div>A : {aColor} | B : {bColor}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
