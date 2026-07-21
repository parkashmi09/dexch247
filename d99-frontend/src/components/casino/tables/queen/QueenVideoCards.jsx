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

export default function QueenVideoCards({ cardString = "" }) {
  const tokens = cardString ? cardString.split(",").map((t) => t.trim()) : [];
  const dealt = tokens.filter((t) => t && t !== "1");
  if (dealt.length === 0) return null;

  // Distribute dealt cards evenly across 4 groups, filled sequentially.
  // With N cards: first (N % 4) groups get ceil(N/4) cards, rest get floor(N/4).
  const n = dealt.length;
  const base = Math.floor(n / 4);
  const extra = n % 4;
  const groupSizes = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    groupSizes[i] = base + (i < extra ? 1 : 0);
  }

  const groups = [[], [], [], []];
  let pos = 0;
  for (let gi = 0; gi < 4; gi++) {
    for (let j = 0; j < groupSizes[gi]; j++) {
      groups[gi].push(dealt[pos++]);
    }
  }

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
