const CARD_BASE = "/assets/img/cards";
const CARD_BACK = "/assets/img/cards/1.jpg";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function PoisonResultContent({ detailData, label = "Poison" }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  // [0]=poison, [1,2,3]=Player A, [4,5,6]=Player B
  const poisonCard = getCardImg(tokens[0]);
  const playerACards = [1, 2, 3].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const playerBCards = [4, 5, 6].map((i) => getCardImg(tokens[i])).filter(Boolean);

  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const oddEven = parts[1] || "";
  const color = parts[2] || "";
  const suit = parts[3] || "";

  const isAWinner = winner.toLowerCase().includes("a");

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
          <h4 className="result-title">{label}</h4>
          <div className="casino-result-cards">
            {poisonCard && <img src={poisonCard} alt="" />}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player A</h4>
          <div className="casino-result-cards">
            {playerACards.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
            {isAWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy "></i>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {playerBCards.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
            {!isAWinner && winner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy "></i>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winner && (
              <div className="casino-result-desc-item">
                <div>Winner</div>
                <div>{winner}</div>
              </div>
            )}
            {oddEven && (
              <div className="casino-result-desc-item">
                <div>Odd/Even</div>
                <div>{oddEven}</div>
              </div>
            )}
            {color && (
              <div className="casino-result-desc-item">
                <div>Color</div>
                <div>{color}</div>
              </div>
            )}
            {suit && (
              <div className="casino-result-desc-item">
                <div>Suit</div>
                <div>{suit}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
