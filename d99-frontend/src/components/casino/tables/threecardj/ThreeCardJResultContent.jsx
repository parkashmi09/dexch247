const CARD_BASE = "/assets/img/cards/";

function cardSrc(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}${code.trim()}.jpg`;
}

export default function ThreeCardJResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", rdesc = "", rid = "", mtime = "" } = t1;

  const cards = card
    ? card.split(",").map((c) => c.trim()).filter((c) => c && c !== "1")
    : [];

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
        <div className="col-md-12 text-center">
          <div className="casino-result-cards">
            {cards.map((code, i) => {
              const src = cardSrc(code);
              return src ? <img key={i} src={src} alt="" /> : null;
            })}
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Result</div>
              <div>{rdesc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
