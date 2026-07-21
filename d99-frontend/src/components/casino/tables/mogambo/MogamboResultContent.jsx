const CARD_BASE = "/assets/img/cards";
const CARD_BACK = "/assets/img/cards/1.jpg";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function MogamboResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  // Daga/Teja: [0],[1]  Mogambo: [2]
  const dagaCards = [getCardImg(tokens[0]), getCardImg(tokens[1])].filter(Boolean);
  const mogamboCard = getCardImg(tokens[2]);

  // rdesc: "Daga/Teja#20"
  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const total = parts[1] || "";

  const isDagaWinner = winner.toLowerCase().includes("daga") || winner.toLowerCase().includes("teja");

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
        <div className="col-md-6 text-center">
          <h4 className="result-title">Daga / Teja</h4>
          <div className="casino-result-cards">
            {dagaCards.map((src, i) => (
              <span key={i}>
                {i > 0 && <span className="card-devider"></span>}
                <img src={src} alt="" />
              </span>
            ))}
            {isDagaWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Mogambo</h4>
          <div className="casino-result-cards">
            {mogamboCard && <img src={mogamboCard} alt="" />}
            {!isDagaWinner && winner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winner}</div>
            </div>
            {total && (
              <div className="casino-result-desc-item">
                <div>Total</div>
                <div>{total}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
