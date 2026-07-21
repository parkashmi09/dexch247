const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Poker6ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const boardCards = [12, 13, 14, 15, 16].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const getPlayerCards = (n) => [n * 2, n * 2 + 1].map((i) => getCardImg(tokens[i])).filter(Boolean);

  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const pattern = parts[1] || "";

  const winNum = winner.replace(/\D/g, "");
  const isWinner = (n) => winNum === String(n);

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  const renderPlayer = (num) => {
    const cards = getPlayerCards(num - 1);
    return (
      <div className="col-md-4 text-center">
        <h4 className="result-title">{num}</h4>
        <div className="casino-result-cards">
          {cards.map((src, i) => <img key={i} src={src} alt="" />)}
          {isWinner(num) && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
        </div>
      </div>
    );
  };

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>

      {/* Board */}
      <div className="row mt-2">
        <div className="col-md-12 text-center">
          <h4 className="result-title">Board</h4>
          <div className="casino-result-cards">
            {boardCards.map((src, i) => <img key={i} src={src} alt="" />)}
          </div>
        </div>
      </div>

      {/* Row: Player 1 | Player 6 */}
      <div className="row mt-2">
        <div className="col-md-2"></div>
        {renderPlayer(1)}
        {renderPlayer(6)}
      </div>

      {/* Row: Player 2 | gap | Player 5 */}
      <div className="row mt-2">
        <div className="col-md-1"></div>
        {renderPlayer(2)}
        <div className="col-md-2"></div>
        {renderPlayer(5)}
      </div>

      {/* Row: Player 3 | Player 4 */}
      <div className="row mt-2">
        <div className="col-md-2"></div>
        {renderPlayer(3)}
        {renderPlayer(4)}
      </div>

      {/* Description */}
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winner && <div className="casino-result-desc-item"><div>Winner</div><div>{winner}</div></div>}
            {pattern && <div className="casino-result-desc-item"><div>Pattern</div><div>{pattern}</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
