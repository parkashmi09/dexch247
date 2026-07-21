const CARD_BASE = "/assets/img/cards";
const SUIT_ICONS = {
  spade: "/assets/img/icons/spade.png",
  heart: "/assets/img/icons/heart.png",
  club: "/assets/img/icons/club.png",
  diamond: "/assets/img/icons/diamond.png",
};
const SUIT_KING = {
  spade: "KSS", heart: "KHH", club: "KCC", diamond: "KDD",
};
const SUIT_ORDER = ["spade", "heart", "club", "diamond"];
const SUIT_LABELS = { spade: "K Spade", heart: "K Heart", club: "K Club", diamond: "K Diamond" };

function getSuit(token) {
  if (!token || token === "1") return null;
  if (token.endsWith("SS")) return "spade";
  if (token.endsWith("HH")) return "heart";
  if (token.endsWith("CC")) return "club";
  if (token.endsWith("DD")) return "diamond";
  return null;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.slice(0, -2).toUpperCase();
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function Race20ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "", rdesc = "" } = t1;

  const tokens = card ? card.split(",").map((t) => t.trim()) : [];

  // Group by suit, skip Kings (they're added manually) and face-down cards
  const bySuit = { spade: [], heart: [], club: [], diamond: [] };
  for (const token of tokens) {
    if (!token || token === "1") continue;
    const suit = getSuit(token);
    if (!suit) continue;
    if (getRank(token) === "K") continue;
    bySuit[suit].push(token);
  }

  // Winner
  const suitMap = { "1": "spade", "2": "heart", "3": "club", "4": "diamond" };
  const winnerSuit = suitMap[String(win)] || "";
  const winnerLabel = winnat || SUIT_LABELS[winnerSuit] || "";

  // Parse rdesc: "K Heart#101#15"
  const rdParts = rdesc.split("#");
  const rdPoints = rdParts[1] || "";
  const rdCards = rdParts[2] || "";

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="race-result-box">
        {SUIT_ORDER.map((suit) => {
          const cards = bySuit[suit];
          const isWinner = suit === winnerSuit;
          const kingCode = SUIT_KING[suit];
          return (
            <div key={suit} className="casino-result-cards">
              <img src={SUIT_ICONS[suit]} alt={suit} />
              {cards.map((token, i) => (
                <img key={i} src={`${CARD_BASE}/${token}.jpg`} alt={token} />
              ))}
              {/* Always show King at end of each suit that has cards or is winner */}
              {(cards.length > 0 || isWinner) && (
                <img src={`${CARD_BASE}/${kingCode}.jpg`} alt={kingCode} className={isWinner ? "k-image" : ""} />
              )}
              {isWinner && (
                <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>
              )}
            </div>
          );
        })}
        <div className="video-winner-text">
          {"WINNER".split("").map((c, i) => <div key={i}>{c}</div>)}
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
              <div>Points</div>
              <div>{rdPoints}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Cards</div>
              <div>{rdCards}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
