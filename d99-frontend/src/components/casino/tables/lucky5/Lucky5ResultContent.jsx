const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Lucky5ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "" } = t1;

  const cardImg = getCardImg(card);

  // rdesc: "Low Card#Odd#Black#3"
  const parts = rdesc.split("#");
  const winner = parts[0] || t1.winnat || "";
  const oddEven = parts[1] || "";
  const color = parts[2] || "";
  const cardValue = parts[3] || "";

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
          <div className="casino-result-cards">
            {cardImg && <img src={cardImg} alt="" />}
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
            {cardValue && (
              <div className="casino-result-desc-item">
                <div>Card</div>
                <div>{cardValue}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
