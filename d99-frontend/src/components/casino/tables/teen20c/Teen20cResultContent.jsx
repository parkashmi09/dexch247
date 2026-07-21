const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Teen20cResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const playerACards = [0, 2, 4].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const playerBCards = [1, 3, 5].map((i) => getCardImg(tokens[i])).filter(Boolean);

  // rdesc: "Player B#Player B(High Baccarat)~(A : 5 | B : 8)#Player B (A : 15 | B : 30)#B : Pair#A : Red | B : Red"
  const parts = rdesc.split("#");
  const winner = parts[0] || winnat || "";
  const baccaratRaw = parts[1] || "";
  const baccaratParts = baccaratRaw.split("~");
  const baccarat = baccaratParts[0] || "";
  const baccaratScores = baccaratParts[1] || "";
  const total = parts[2] || "";
  const pairPlus = parts[3] || "";
  const redBlack = parts[4] || "";

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
            {playerACards.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
            {isAWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy "></i>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player B</h4>
          <div className="casino-result-cards">
            {playerBCards.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
            {!isAWinner && winner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy "></i>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winner && (
              <div className="casino-result-desc-item">
                <div>Winner:</div>
                <div>{winner}</div>
              </div>
            )}
            {baccarat && (
              <div className="casino-result-desc-item">
                <div>3 Baccarat:</div>
                <div>{baccarat}</div>
              </div>
            )}
            {baccaratScores && (
              <div className="casino-result-desc-item">
                <div>&nbsp;</div>
                <div>{baccaratScores}</div>
              </div>
            )}
            {total && (
              <div className="casino-result-desc-item">
                <div>Total:</div>
                <div>{total}</div>
              </div>
            )}
            {pairPlus && (
              <div className="casino-result-desc-item">
                <div>Pair Plus:</div>
                <div>{pairPlus}</div>
              </div>
            )}
            {redBlack && (
              <div className="casino-result-desc-item">
                <div>Red Black:</div>
                <div>{redBlack}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
