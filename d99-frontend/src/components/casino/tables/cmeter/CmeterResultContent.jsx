const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getCardCategory(code) {
  if (!code || code === "1") return null;
  const rank = code.replace(/[HDCS]{2}$/i, "").toUpperCase();
  if (rank === "A") return "low";
  const num = parseInt(rank, 10);
  if (!isNaN(num)) return num <= 9 ? "low" : "high";
  return ["J", "Q", "K"].includes(rank) ? "high" : null;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function CmeterResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const tokens = card ? card.split(",").map((t) => t.trim()) : [];
  const lowCards = tokens.filter((t) => getCardCategory(t) === "low");
  const highCards = tokens.filter((t) => getCardCategory(t) === "high");

  const winLabel = winnat || (String(win) === "1" ? "Low" : String(win) === "2" ? "High" : win || "-");

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2 align-items-center">
        <div className="col-10 text-center">
          <div className="row align-items-center">
            <div className="col-2">Low Cards</div>
            <div className="col-10">
              <div className="casino-result-cards">
                {lowCards.map((code, i) => {
                  const img = getCardImg(code);
                  return img ? <img key={i} src={img} alt={code} /> : null;
                })}
              </div>
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-2">High Cards</div>
            <div className="col-10">
              <div className="casino-result-cards">
                {highCards.map((code, i) => {
                  const img = getCardImg(code);
                  return img ? <img key={i} src={img} alt={code} /> : null;
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="col-2 text-center">
          <div className="casino-result-cards"></div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
