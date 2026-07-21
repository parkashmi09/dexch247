const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function Teen62ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", ename = "", mtime = "", rdesc = "", rid = "", winnat = "" } = t1;

  // Parse cards: indices 0,2,4 = Player A; 1,3,5 = Player B
  const tokens = card.split(",").map((t) => t.trim());
  const playerACards = [0, 2, 4].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const playerBCards = [1, 3, 5].map((i) => getCardImg(tokens[i])).filter(Boolean);

  // Parse rdesc: "Player B#Club Spade...#Odd Odd Even...#A : Yes | B : Yes"
  const descParts = rdesc.split("#");
  const oddEvenStr = descParts[2] || "";
  const consecutiveStr = descParts[3] || "";

  const isPlayerBWinner = winnat?.includes("Player B");
  const isPlayerAWinner = winnat?.includes("Player A");

  // Format time
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
            {isPlayerAWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
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
            {isPlayerBWinner && (
              <div className="casino-winner-icon">
                <i className="fas fa-trophy"></i>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner:</div>
              <div>{winnat || "-"}</div>
            </div>
            {oddEvenStr && (
              <div className="casino-result-desc-item">
                <div>Odd/Even:</div>
                <div>{oddEvenStr}</div>
              </div>
            )}
            {consecutiveStr && (
              <div className="casino-result-desc-item">
                <div>Consecutive:</div>
                <div>{consecutiveStr}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
