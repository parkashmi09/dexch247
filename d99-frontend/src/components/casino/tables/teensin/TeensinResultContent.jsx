const CARD_BASE = "/assets/img/cards";
const CARD_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 0, J: 0, Q: 0, K: 0 };

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function baccaratValue(token) {
  return CARD_VALUES[getRank(token)] || 0;
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

export default function TeensinResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "", rdesc = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const aTokens = tokens.slice(0, 3).filter((t) => t && t !== "1");
  const bTokens = tokens.slice(3, 6).filter((t) => t && t !== "1");

  const isAWinner = String(win) === "1";
  const isBWinner = String(win) === "2";

  // Baccarat values (last digit of sum)
  const aBacc = aTokens.reduce((s, t) => s + baccaratValue(t), 0) % 10;
  const bBacc = bTokens.reduce((s, t) => s + baccaratValue(t), 0) % 10;

  // Parse rdesc if available: "Winner#HighCard#Pair#ColorPlus#Lucky9"
  let winnerText = winnat || (isAWinner ? "Player A" : isBWinner ? "Player B" : "");
  let highCardText = "";
  let pairText = "";
  let colorPlusText = "-";
  let lucky9Text = "";

  if (rdesc) {
    const parts = rdesc.split("#");
    if (parts[0]) winnerText = parts[0];
    if (parts[1]) highCardText = parts[1];
    if (parts[2]) pairText = parts[2];
    if (parts[3]) colorPlusText = parts[3] || "-";
    if (parts[4]) lucky9Text = parts[4];
  }

  // Fallback computations if rdesc not available
  if (!highCardText) {
    const aHigh = Math.max(...aTokens.map((t) => CARD_VALUES[getRank(t)] || 0));
    const bHigh = Math.max(...bTokens.map((t) => CARD_VALUES[getRank(t)] || 0));
    highCardText = aHigh >= bHigh ? "Player A" : "Player B";
  }
  if (!pairText) {
    const aPair = hasPair(aTokens);
    const bPair = hasPair(bTokens);
    pairText = aPair && bPair ? "Both" : aPair ? "Player A" : bPair ? "Player B" : "-";
  }
  if (!lucky9Text) {
    lucky9Text = (aBacc === 9 || bBacc === 9) ? "Yes" : "No";
  }

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
            {aTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {isBWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {bTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner:</div>
              <div>{winnerText}  (A: {aBacc} | B: {bBacc})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>High Card:</div>
              <div>{highCardText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Pair:</div>
              <div>{pairText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Color Plus:</div>
              <div>{colorPlusText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Lucky 9:</div>
              <div>{lucky9Text}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
