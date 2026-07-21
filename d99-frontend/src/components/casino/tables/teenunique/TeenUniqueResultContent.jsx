const SEQUENCE_ICONS = [
  "/assets/front/img/sequence/s1-icon.png",
  "/assets/front/img/sequence/s2-icon.png",
  "/assets/front/img/sequence/s3-icon.png",
  "/assets/front/img/sequence/s4-icon.png",
  "/assets/front/img/sequence/s5-icon.png",
  "/assets/front/img/sequence/s6-icon.png",
];

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `/assets/img/cards/${token.trim()}.jpg`;
}

export default function TeenUniqueResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "" } = t1;

  const cards = card ? card.split(",").map((c) => c.trim()) : [];

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
        <div className="col-12 text-center">
          <div className="casino-result-cards d-flex justify-content-center flex-wrap gap-2">
            {cards.map((code, i) => {
              const img = getCardImg(code);
              return (
                <div key={i} className="text-center">
                  <img src={SEQUENCE_ICONS[i]} alt="" style={{ height: 20, marginBottom: 4 }} />
                  <br />
                  {img && <img src={img} alt={code} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
