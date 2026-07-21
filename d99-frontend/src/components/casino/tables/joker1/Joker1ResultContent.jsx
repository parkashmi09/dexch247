const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Joker1ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  // [0]=pA card1, [1]=pB card1, [2]=pA card2, [3]=pB card2, [4]=pA card3, [5]=pB card3
  const playerACards = [0, 2, 4].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const playerBCards = [1, 3, 5].map((i) => getCardImg(tokens[i])).filter(Boolean);

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-12 text-center">
          <h4 className="result-title">Joker</h4>
          <div className="casino-result-cards">
            <img src="/assets/img/joker1/14.png" alt="Joker" />
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player A</h4>
          <div className="casino-result-cards">
            {playerACards.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {playerBCards.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
