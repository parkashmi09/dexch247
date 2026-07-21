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

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function TeenmufResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "", rdesc = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  // Alternating: 0,2,4 = Player A; 1,3,5 = Player B
  const aTokens = [tokens[0], tokens[2], tokens[4]].filter((t) => t && t !== "1");
  const bTokens = [tokens[1], tokens[3], tokens[5]].filter((t) => t && t !== "1");

  const isAWinner = String(win) === "1";
  const isBWinner = String(win) === "2";
  const winnerLabel = winnat || (isAWinner ? "Player A" : isBWinner ? "Player B" : "");

  // Baccarat values
  const aBacc = aTokens.reduce((s, t) => s + baccaratValue(t), 0) % 10;
  const bBacc = bTokens.reduce((s, t) => s + baccaratValue(t), 0) % 10;
  const baccWinner = aBacc > bBacc ? "Player A" : bBacc > aBacc ? "Player B" : "Tie";

  // Top 9: check if any card is 9
  const allTokens = [...aTokens, ...bTokens];
  const hasNine = allTokens.some((t) => getRank(t) === "9");
  const top9Text = hasNine ? (rdesc?.includes("Top 9") ? rdesc.split("#").find((p) => p.includes("Top 9")) || "Yes" : "Yes") : "-";

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
            {aTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
            {isAWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {bTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
            {isBWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
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
              <div>Top 9:</div>
              <div>{top9Text}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>M Baccarat:</div>
              <div>{baccWinner} (A : {aBacc}  |  B : {bBacc})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
