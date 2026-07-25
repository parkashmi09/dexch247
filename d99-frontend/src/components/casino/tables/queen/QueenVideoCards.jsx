import FlipCard from "../teen62/FlipCard.jsx";

function getCardImage(token) {
  if (!token || token === "1" || token === "0") return null;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

function cardRankValue(token) {
  if (!token || token === "1" || token === "0") return 0;
  const rank = token.replace(/[HDCS]{2}$/i, "").toUpperCase();
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  if (rank === "A") return 1;
  if (rank === "J") return 11;
  const n = parseInt(rank, 10);
  return isNaN(n) ? 0 : n;
}

const GROUP_LABELS = ["Total 0", "Total 1", "Total 2", "Total 3"];
const GROUPS = 4;

// The feed sends the dealt cards DENSE (front-packed) followed by "1" padding —
// e.g. "6DD,5DD,4CC,5CC,5HH,1,1,…". Cards are dealt COLUMN-MAJOR: one to each lane
// per column (Total 0,1,2,3), then the next column, until a lane wins. So the
// n-th dealt card belongs to lane (n % 4): filter the placeholders to the dense
// list, then round-robin. This keeps each card's lane FIXED as more cards append
// (index n never changes lane), so the first column stays put when the second
// begins — unlike an even-split by count, which reshuffles earlier lanes.
function isRealCard(token) {
  return token && token !== "1" && token !== "0";
}

export default function QueenVideoCards({ cardString = "" }) {
  const tokens = cardString ? cardString.split(",").map((t) => t.trim()) : [];
  const dealt = tokens.filter(isRealCard);
  if (dealt.length === 0) return null;

  const groups = Array.from({ length: GROUPS }, () => []);
  dealt.forEach((token, i) => groups[i % GROUPS].push(token));

  // Group total = sum of pip values + group_index
  return (
    <div className="casino-video-cards">
      {groups.map((cards, gi) => {
        if (cards.length === 0) return null;
        const pipSum = cards.reduce((sum, t) => sum + cardRankValue(t), 0);
        const total = pipSum + gi;
        const scored = total >= 10;
        return (
          <div key={gi} className={gi > 0 ? "mt-1" : ""}>
            <h5 className={scored ? "text-success" : ""}>
              {GROUP_LABELS[gi]}: <span className="text-warning">{total}</span>
            </h5>
            <div className="flip-card-container">
              {cards.map((token, ci) => (
                <FlipCard key={ci} src={getCardImage(token)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
