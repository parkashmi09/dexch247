const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function DT6ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;
  const tokens = card.split(",").map((t) => t.trim());
  const dragonCard = getCardImg(tokens[0]);
  const tigerCard = getCardImg(tokens[1]);

  const isDragonWinner = winnat?.toLowerCase().includes("dragon");
  const isTigerWinner = winnat?.toLowerCase().includes("tiger");

  // rdesc format: "Tiger#No#D : Odd  |  T : Even#D : Black  |  T : Black#D : 3  |  T : 6"
  const descParts = rdesc ? rdesc.split("#") : [];
  const winner = descParts[0] || winnat || "";
  const pair = descParts[1] || "";
  const oddEven = descParts[2] || "";
  const color = descParts[3] || "";
  const suit = descParts[4] || "";

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch {}

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>
      <div className="row mt-2">
        <div className="col-md-6 text-center">
          <h4 className="result-title">Dragon</h4>
          <div className="casino-result-cards">
            {isDragonWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
            {dragonCard && <img src={dragonCard} alt="" />}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Tiger</h4>
          <div className="casino-result-cards">
            {isTigerWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
            {tigerCard && <img src={tigerCard} alt="" />}
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
            {pair && (
              <div className="casino-result-desc-item">
                <div>Pair</div>
                <div>{pair}</div>
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
