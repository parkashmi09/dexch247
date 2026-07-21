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

function getSuit(token) {
  if (!token || token === "1") return "";
  const s = token.slice(-2).toUpperCase();
  if (s === "HH" || s === "DD") return "Red";
  return "Black";
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function TrioResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", rdesc = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim()).filter((t) => t && t !== "1");

  // Session total
  const total = tokens.reduce((s, t) => s + (CARD_VALUES[getRank(t)] || 0), 0);

  // 1 2 4 / J Q K classification
  const is124 = (r) => ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(r);
  const judgement124 = tokens.filter((t) => is124(getRank(t))).length;
  const judgementJQK = tokens.filter((t) => ["J", "Q", "K"].includes(getRank(t))).length;
  const judgementText = judgement124 >= 2 ? "1 2 4" : judgementJQK >= 2 ? "J Q K" : "1 2 4  |  J Q K";

  // Red/Black majority
  const reds = tokens.filter((t) => getSuit(t) === "Red").length;
  const redBlackText = reds >= 2 ? "Red" : "Black";

  // Odd/Even majority
  const odds = tokens.filter((t) => { const v = CARD_VALUES[getRank(t)] || 0; return v % 2 !== 0; }).length;
  const oddEvenText = odds >= 2 ? "Odd" : "Even";

  // Pattern detection
  const ranks = tokens.map(getRank);
  let pattern = "";
  if (new Set(ranks).size === 1 && ranks.length === 3) pattern = "Trio";
  else if (ranks.length === 3) {
    const vals = ranks.map((r) => CARD_VALUES[r] || 0).sort((a, b) => a - b);
    const isSeq = vals[2] - vals[1] === 1 && vals[1] - vals[0] === 1;
    const suits = tokens.map(getSuit);
    const isFlush = new Set(suits).size === 1;
    const hasPair = new Set(ranks).size < ranks.length;
    if (isSeq && isFlush) pattern = "Straight Flush";
    else if (isSeq) pattern = "Straight";
    else if (isFlush) pattern = "Flush";
    else if (hasPair) pattern = "Pair";
  }

  // Session result (21 is the line)
  const sessionLine = 21;
  const sessionResult = total >= sessionLine ? "Yes" : "No";

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
              <div>Session ({sessionLine})</div>
              <div>{sessionResult} ({total})</div>
            </div>
            <div className="casino-result-desc-item">
              <div>1 2 4 / J Q K</div>
              <div>{judgementText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Red/Black</div>
              <div>{redBlackText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{oddEvenText}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Pattern</div>
              <div>{pattern}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
