const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Teen41ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const playerACards = [0, 2, 4].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const playerBCards = [1, 3, 5].map((i) => getCardImg(tokens[i])).filter(Boolean);

  // rdesc: "Player A#B : Over 21(28)"
  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const underOver = parts[1] || "";
  const isAWinner = winner.toLowerCase().includes("a");

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
          <h4 className="result-title">Player A</h4>
          <div className="casino-result-cards">
            {isAWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {playerACards.map((src, i) => <img key={i} src={src} alt="" />)}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {!isAWinner && winner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {playerBCards.map((src, i) => <img key={i} src={src} alt="" />)}
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          {winner && (
            <div className="casino-result-desc">
              <div className="casino-result-desc-item">
                <div>Winner:</div>
                <div>{winner}</div>
              </div>
            </div>
          )}
          {underOver && (
            <div className="casino-result-desc">
              <div className="casino-result-desc-item">
                <div>Under/Over:</div>
                <div>{underOver}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
