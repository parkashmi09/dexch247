const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getPlayerCards(tokens, playerIndex) {
  return [0, 1, 2].map((r) => getCardImg(tokens[r * 9 + playerIndex])).filter(Boolean);
}

function getDealerCards(tokens) {
  return [8, 17, 26].map((i) => getCardImg(tokens[i])).filter(Boolean);
}

export default function Teen8ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());

  // rdesc: "1  5 #1 : Pair | 5 : Straight#1 : 35 | 2 : 18 | 3 : 24 | 4 : 18~5 : 36 | 6 : 22 | 7 : 16 | 8 : 24~Dealer : 16"
  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const pairPlus = parts[1] || "";
  const totalRaw = parts[2] || "";
  const totalParts = totalRaw.split("~");

  const winners = winner.toLowerCase().trim().split(/\s+/).map((w) => w.trim());
  const isWinner = (n) => winners.includes(String(n));

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  const renderPlayer = (num, colClass = "col-xl-3") => {
    const cards = getPlayerCards(tokens, num - 1);
    return (
      <div className={`${colClass} text-center`}>
        <h4 className="result-title">{num}</h4>
        <div className="casino-result-cards">
          {cards.map((src, i) => <img key={i} src={src} alt="" />)}
          {isWinner(num) && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
        </div>
      </div>
    );
  };

  const dealerCards = getDealerCards(tokens);

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>

      {/* Row 1: Player 1 | Dealer | Player 8 */}
      <div className="row mt-2">
        {renderPlayer(1)}
        <div className="col-xl-6 text-center">
          <h4 className="result-title">Dealer</h4>
          <div className="casino-result-cards">
            {dealerCards.map((src, i) => <img key={i} src={src} alt="" />)}
          </div>
        </div>
        {renderPlayer(8)}
      </div>

      {/* Row 2: Player 2 | empty | Player 7 */}
      <div className="row mt-2">
        {renderPlayer(2)}
        <div className="col-md-6 text-center"></div>
        {renderPlayer(7)}
      </div>

      {/* Row 3: Players 3, 4, 5, 6 */}
      <div className="row mt-2">
        {renderPlayer(3)}
        {renderPlayer(4)}
        {renderPlayer(5)}
        {renderPlayer(6)}
      </div>

      {/* Description */}
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winner && (
              <div className="casino-result-desc-item">
                <div>Winner</div>
                <div>{winner}</div>
              </div>
            )}
            {pairPlus && (
              <div className="casino-result-desc-item">
                <div>Pair Plus</div>
                <div>{pairPlus}</div>
              </div>
            )}
            {totalParts.map((tp, i) => (
              <div key={i} className="casino-result-desc-item">
                <div>{i === 0 ? "Total" : "\u00A0"}</div>
                <div>{tp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
