const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

export default function Teen120ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", winnat = "" } = t1;

  const tokens = card.split(",").map((t) => t.trim());
  const playerToken = tokens[0];
  const dealerToken = tokens[1];

  const w = String(win);
  const isPlayerWin = w === "1";
  const isDealerWin = w === "2";
  const winnerLabel = winnat || (isPlayerWin ? "Player" : isDealerWin ? "Dealer" : "Tie");

  const isPair = getRank(playerToken) === getRank(dealerToken) && getRank(playerToken) !== "";

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 text-center">
          <h4 className="result-title">Player</h4>
          <div className="casino-result-cards">
            {isPlayerWin && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {getCardImg(playerToken) && <img src={getCardImg(playerToken)} alt={playerToken} />}
          </div>
        </div>
        <div className="col-md-6 text-center">
          <h4 className="result-title">Dealer</h4>
          <div className="casino-result-cards">
            {isDealerWin && <div className="casino-winner-icon"><i className="fas fa-trophy "></i></div>}
            {getCardImg(dealerToken) && <img src={getCardImg(dealerToken)} alt={dealerToken} />}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winnerLabel}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Pair</div>
              <div>{isPair ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
