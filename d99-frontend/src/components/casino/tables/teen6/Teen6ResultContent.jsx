const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

function getSuit(code) {
  if (!code) return "";
  const s = code.slice(-2).toUpperCase();
  if (s === "HH") return "Heart";
  if (s === "SS") return "Spade";
  if (s === "CC") return "Club";
  if (s === "DD") return "Diamond";
  return "";
}

function getRank(code) {
  if (!code || code === "1") return "";
  return code.replace(/[HDCS]{2}$/i, "");
}

function rankValue(rank) {
  if (rank === "A") return 1;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  return parseInt(rank, 10) || 0;
}

function isOdd(rank) {
  const v = rankValue(rank);
  return v % 2 !== 0;
}

export default function Teen6ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const tokens = card.split(",").map((c) => c.trim()).filter(Boolean);
  // Cards are dealt ALTERNATELY: 1st→A, 2nd→B, 3rd→A, 4th→B, 5th→A, 6th→B. So a
  // player's cards are its every-other index, NOT a contiguous block — Player A =
  // positions 0,2,4; Player B = positions 1,3,5. Matches the feed's rdesc scoring.
  const pACards = [tokens[0], tokens[2], tokens[4]].filter(Boolean);
  const pBCards = [tokens[1], tokens[3], tokens[5]].filter(Boolean);

  const winner = winnat || (String(win) === "1" ? "Player A" : String(win) === "2" ? "Player B" : "");
  const isAWinner = winner === "Player A" || String(win) === "1";
  const isBWinner = winner === "Player B" || String(win) === "2";

  const allCards = [...pACards, ...pBCards];
  const allSuits = allCards.map(getSuit).filter(Boolean);
  const allRanks = allCards.map(getRank).filter(Boolean);
  const allOddEven = allRanks.map((r) => isOdd(r) ? "Odd" : "Even");

  const pATotal = pACards.reduce((s, c) => s + rankValue(getRank(c)), 0);
  const pBTotal = pBCards.reduce((s, c) => s + rankValue(getRank(c)), 0);
  const pAUO = pATotal <= 21 ? "Under 21" : "Over 22";
  const pBUO = pBTotal <= 21 ? "Under 21" : "Over 22";

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
            {pACards.map((code, i) => {
              const img = getCardImg(code);
              return img ? <img key={i} src={img} alt={code} /> : null;
            })}
            {isAWinner && (
              <div className="casino-winner-icon"><i className="fas fa-trophy"></i></div>
            )}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {pBCards.map((code, i) => {
              const img = getCardImg(code);
              return img ? <img key={i} src={img} alt={code} /> : null;
            })}
            {isBWinner && (
              <div className="casino-winner-icon"><i className="fas fa-trophy"></i></div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner:</div>
              <div>{winner}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Suit:</div>
              <div>{allSuits.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Odd/Even:</div>
              <div>{allOddEven.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Cards:</div>
              <div>{allRanks.join("  ")}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Under/Over:</div>
              <div>A : {pAUO}({pATotal})  |  B : {pBUO}({pBTotal})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
