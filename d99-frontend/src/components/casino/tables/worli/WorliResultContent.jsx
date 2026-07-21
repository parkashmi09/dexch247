const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function WorliResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "" } = t1;

  const cards = card
    ? card.split(",").map((c) => c.trim()).filter((c) => c && c !== "1")
    : [];

  // rdesc: "190#0" → Pana: 190, Ocada: 0
  const parts = (rdesc || "").split("#");
  const pana = parts[0] || "";
  const ocada = parts[1] || "";

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
            {cards.map((code, i) => {
              const src = getCardImg(code);
              return src ? <img key={i} src={src} alt="" /> : null;
            })}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {pana && (
              <div className="casino-result-desc-item">
                <div>Pana</div>
                <div>{pana}</div>
              </div>
            )}
            <div className="casino-result-desc-item">
              <div>Ocada</div>
              <div>{ocada || "0"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
