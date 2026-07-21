const CARD_BASE = "/assets/img/cards";

function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function parseCards(str) {
  if (!str) return [];
  return str.split(",").map((c) => c.trim());
}

export default function WarResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rdesc = "", rid = "" } = t1;

  const cards = parseCards(card);
  // cards 0–5 are player cards, card 6 is dealer
  const playerCards = cards.slice(0, 6);
  const dealerCard = cards[6] || "1";

  // rdesc: "2  3  4  5  6#1:Black|2:Black|3:Black~4:Black|5:Red|6:Black#1:Even|..."
  const parts = (rdesc || "").split("#");
  const winnerText = parts[0] || "";
  const colorRows = (parts[1] || "").split("~").filter(Boolean);
  const oddEvenRows = (parts[2] || "").split("~").filter(Boolean);
  const suitRows = (parts[3] || "").split("~").filter(Boolean);

  // Winners from winnerText e.g. "2  3  4  5  6"
  const winners = new Set(
    winnerText.split(/\s+/).map((s) => s.trim()).filter(Boolean)
  );

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch {
    /* keep original */
  }

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>

      <div className="row mt-2">
        {/* Dealer card — full width */}
        <div className="col-md-12 text-center">
          <h4 className="result-title">Dealer</h4>
          <div className="casino-result-cards">
            {getCardImg(dealerCard) && (
              <img src={getCardImg(dealerCard)} alt="dealer" />
            )}
          </div>
        </div>

        {/* Player cards 1–6 */}
        {playerCards.map((code, i) => {
          const num = String(i + 1);
          const isWinner = winners.has(num);
          const imgSrc = getCardImg(code);
          return (
            <div key={num} className="col-md-2 text-center">
              <h4 className="result-title">{num}</h4>
              <div className="casino-result-cards">
                {imgSrc && <img src={imgSrc} alt={`card-${num}`} />}
                {isWinner && (
                  <div className="casino-winner-icon">
                    <i className="fas fa-trophy" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winnerText && (
              <div className="casino-result-desc-item">
                <div>Winner</div>
                <div>{winnerText}</div>
              </div>
            )}
            {colorRows.map((row, i) => (
              <div key={`color-${i}`} className="casino-result-desc-item">
                <div>{i === 0 ? "Color" : "\u00A0"}</div>
                <div>{row}</div>
              </div>
            ))}
            {oddEvenRows.map((row, i) => (
              <div key={`oe-${i}`} className="casino-result-desc-item">
                <div>{i === 0 ? "Odd/Even" : "\u00A0"}</div>
                <div>{row}</div>
              </div>
            ))}
            {suitRows.map((row, i) => (
              <div key={`suit-${i}`} className="casino-result-desc-item">
                <div>{i === 0 ? "Suit" : "\u00A0"}</div>
                <div>{row}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
