const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function DTL20ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;
  const tokens = card.split(",").map((t) => t.trim());
  const dragonCard = getCardImg(tokens[0]);
  const tigerCard = getCardImg(tokens[1]);
  const lionCard = getCardImg(tokens[2]);

  const winLower = winnat?.toLowerCase() || "";
  const isDragonWinner = winLower.includes("dragon");
  const isTigerWinner = winLower.includes("tiger");
  const isLionWinner = winLower.includes("lion");

  // rdesc: "Dragon#D : Black  |  T : Black  |  L : Black#D : Even  |  T : Odd  |  L : Odd#D : 10  |  T : A  |  L : 3"
  const descParts = rdesc ? rdesc.split("#") : [];
  const winner = descParts[0] || winnat || "";
  const redBlack = descParts[1] || "";
  const oddEven = descParts[2] || "";
  const cardDesc = descParts[3] || "";

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
        <div className="col-md-4 text-center">
          <h4 className="result-title">Dragon</h4>
          <div className="casino-result-cards">
            {dragonCard && <img src={dragonCard} alt="" />}
            {isDragonWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-4 text-center">
          <h4 className="result-title">Tiger</h4>
          <div className="casino-result-cards">
            {tigerCard && <img src={tigerCard} alt="" />}
            {isTigerWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-4 text-center">
          <h4 className="result-title">Lion</h4>
          <div className="casino-result-cards">
            {lionCard && <img src={lionCard} alt="" />}
            {isLionWinner && (
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
            {winner && (
              <div className="casino-result-desc-item">
                <div>Winner</div>
                <div>{winner}</div>
              </div>
            )}
            {redBlack && (
              <div className="casino-result-desc-item">
                <div>Red/Black</div>
                <div>{redBlack}</div>
              </div>
            )}
            {oddEven && (
              <div className="casino-result-desc-item">
                <div>Odd/Even</div>
                <div>{oddEven}</div>
              </div>
            )}
            {cardDesc && (
              <div className="casino-result-desc-item">
                <div>Card</div>
                <div>{cardDesc}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
