const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function PokerResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const playerACards = [0, 1].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const playerBCards = [2, 3].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const boardCards = [4, 5, 6, 7, 8].map((i) => getCardImg(tokens[i])).filter(Boolean);

  // rdesc: "Player B#A : -  |  B : -#A : -  |  B : -"
  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const twoCard = parts[1] || "";
  const sevenCard = parts[2] || "";

  const isAWinner = winner.toLowerCase().includes("a");
  const isBWinner = winner.toLowerCase().includes("b");

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
            {playerBCards.map((src, i) => <img key={i} src={src} alt="" />)}
            {isBWinner && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
          </div>
        </div>
        <div className="col-md-12 text-center">
          <h4 className="result-title">Board</h4>
          <div className="casino-result-cards">
            {boardCards.map((src, i) => <img key={i} src={src} alt="" />)}
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winner && <div className="casino-result-desc-item"><div>Winner</div><div>{winner}</div></div>}
            {twoCard && <div className="casino-result-desc-item"><div>2 Card</div><div>{twoCard}</div></div>}
            {sevenCard && <div className="casino-result-desc-item"><div>7 Card</div><div>{sevenCard}</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
