const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function AAAResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "" } = t1;

  const token = card.split(",")[0]?.trim();
  const imgSrc = getCardImg(token);

  // rdesc: "Amar#Even#Black#Under 7#6"
  const parts = (rdesc || "").split("#");
  const winner = parts[0] || "";
  const oddEven = parts[1] || "";
  const color = parts[2] || "";
  const underOver = parts[3] || "";
  const cardValue = parts[4] || "";

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch {
    /* keep original */
  }

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-12 text-center">
          <div className="casino-result-cards">
            {imgSrc && <img src={imgSrc} alt="" />}
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
            {underOver && (
              <div className="casino-result-desc-item">
                <div>Under/Over</div>
                <div>{underOver}</div>
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
