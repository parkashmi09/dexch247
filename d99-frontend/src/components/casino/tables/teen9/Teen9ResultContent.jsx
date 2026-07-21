const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Teen9ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const tigerCards = [0, 3, 6].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const lionCards = [1, 4, 7].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const dragonCards = [2, 5, 8].map((i) => getCardImg(tokens[i])).filter(Boolean);

  // rdesc: "Lion#L : Pair"
  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const others = parts[1] || "";

  const isWinner = (name) => winner.toLowerCase().includes(name.toLowerCase());

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  const renderPlayer = (name, cards) => (
    <div className="col-md-4 text-center">
      <h4 className="result-title">{name}</h4>
      <div className="casino-result-cards">
        {cards.map((src, i) => <img key={i} src={src} alt="" />)}
        {isWinner(name) && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
      </div>
    </div>
  );

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>
      <div className="row mt-2">
        {renderPlayer("Tiger", tigerCards)}
        {renderPlayer("Lion", lionCards)}
        {renderPlayer("Dragon", dragonCards)}
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
            {others && (
              <div className="casino-result-desc-item">
                <div>Others</div>
                <div>{others}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
