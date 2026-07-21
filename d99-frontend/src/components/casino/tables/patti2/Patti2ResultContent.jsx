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

function baccaratValue(token) {
  const v = cardValue(token);
  return v >= 10 ? 0 : v;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function Patti2ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "", rdesc = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  // Cards: pos 0,2 = Player A, pos 1,3 = Player B
  const aTokens = [tokens[0], tokens[2]].filter((t) => t && t !== "1");
  const bTokens = [tokens[1], tokens[3]].filter((t) => t && t !== "1");

  const isAWinner = String(win) === "1";
  const isBWinner = String(win) === "2";
  const winnerLabel = winnat || (isAWinner ? "Player A" : isBWinner ? "Player B" : "");

  // Mini Baccarat: last digit of sum of baccarat values
  const aBacc = aTokens.reduce((s, t) => s + baccaratValue(t), 0) % 10;
  const bBacc = bTokens.reduce((s, t) => s + baccaratValue(t), 0) % 10;
  const baccWinner = aBacc > bBacc ? "Player A" : bBacc > aBacc ? "Player B" : "Tie";

  // Total: sum of card values
  const aTotal = aTokens.reduce((s, t) => s + cardValue(t), 0);
  const bTotal = bTokens.reduce((s, t) => s + cardValue(t), 0);

  // Color Plus: check from rdesc or default "No"
  let colorPlus = "No";
  if (rdesc) {
    const parts = rdesc.split("#");
    const cpPart = parts.find((p) => p.toLowerCase().includes("color") || p.toLowerCase().includes("plus"));
    if (cpPart) colorPlus = cpPart;
    else if (parts.length >= 4) colorPlus = parts[3] || "No";
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
            {aTokens.map((token, i) => (
              <img key={i} src={getCardImg(token)} alt={token} />
            ))}
            {isAWinner && (
              <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>
            )}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
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
              <div>Winner</div>
              <div>{winnerLabel}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Mini Baccarat</div>
              <div>{baccWinner} (A : {aBacc}  |  B : {bBacc})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Total</div>
              <div>A : {aTotal}  |  B : {bTotal}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Color Plus</div>
              <div>{colorPlus}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
