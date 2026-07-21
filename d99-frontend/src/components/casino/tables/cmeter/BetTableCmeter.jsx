function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function NationBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  return (
    <div className="casino-nation-book text-center mt-2">
      {show && <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>}
    </div>
  );
}

// Card face value → is low (A-9) or high (10,J,Q,K)
function getCardCategory(code) {
  if (!code || code === "1") return null;
  const rank = code.slice(0, -2).toUpperCase(); // strip last 2 chars (suit+extra)
  if (rank === "1" || rank === "A") return "low";
  const num = parseInt(rank, 10);
  if (!isNaN(num)) {
    return num <= 9 ? "low" : "high";
  }
  // J, Q, K = high; anything else unknown
  return ["J", "Q", "K"].includes(rank) ? "high" : null;
}

function parseCards(cardString) {
  if (!cardString) return { lowCards: [], highCards: [] };
  const tokens = cardString.split(",").map((t) => t.trim());
  const lowCards = [];
  const highCards = [];
  tokens.forEach((token) => {
    if (!token || token === "1") return;
    const cat = getCardCategory(token);
    if (cat === "low") lowCards.push(token);
    else if (cat === "high") highCards.push(token);
  });
  return { lowCards, highCards };
}

function parseRdesc(rdesc) {
  if (!rdesc) return { lowTotal: 0, highTotal: 0 };
  const parts = rdesc.split(",");
  return {
    lowTotal: parseInt(parts[0], 10) || 0,
    highTotal: parseInt(parts[1], 10) || 0,
  };
}

const LOW_CARDS = ["A", "2", "3", "4", "5", "6", "7", "8", "9"];
const HIGH_CARDS = ["10", "J", "Q", "K"];
const CARD_IMG = (label) => `/assets/img/cards/${label}.png`;
const DEALT_IMG = (code) => `/assets/img/cards/${code}.jpg`;

export default function BetTableCmeter({ tableData = [], cardString = "", rdesc = "", onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);
  const lowItem = find("Low");
  const highItem = find("High");

  const isSus = (item) => !item || item.gstatus !== "OPEN";
  const lowSus = isSus(lowItem);
  const highSus = isSus(highItem);

  const { lowCards, highCards } = parseCards(cardString);
  const { lowTotal, highTotal } = parseRdesc(rdesc);
  const hasDealtCards = lowCards.length > 0 || highCards.length > 0;

  return (
    <div className="casino-table">
      {/* Dealt cards display */}
      {hasDealtCards && (
        <div className="casino-table-full-box">
          <div className="cmeter-video-cards-box">
            <div className="cmeter-low">
              <div>
                <span className="text-fancy">Low</span>
                {lowTotal > 0 && (
                  <span className="ms-2 text-success">
                    <b> {lowTotal}</b>
                  </span>
                )}
              </div>
              <div className="cmeter-low-cards">
                {lowCards.map((code, i) => (
                  <img key={i} src={DEALT_IMG(code)} alt={code} />
                ))}
              </div>
            </div>
            <div className="cmeter-high">
              <div>
                <span className="text-fancy">High</span>
                {highTotal > 0 && (
                  <span className="ms-2 text-success">
                    <b> {highTotal}</b>
                  </span>
                )}
              </div>
              <div className="cmeter-high-cards">
                {highCards.map((code, i) => (
                  <img key={i} src={DEALT_IMG(code)} alt={code} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bet table */}
      <div className="casino-table-box mt-3">
        {/* Low section */}
        <div
          className={`casino-table-left-box${lowSus ? " suspended-box" : ""}`}
          onClick={() => !lowSus && lowItem?.b > 0 && onBetClick?.(lowItem.b, "Low", lowItem, "back")}
          style={{ cursor: lowSus ? "default" : "pointer" }}
        >
          <div className="text-center">
            <b className="text-info">Low</b>
          </div>
          <div className="cmeter-card-box mt-2">
            {LOW_CARDS.map((label) => (
              <div key={label} className="card-odd-box">
                <div>
                  <img src={CARD_IMG(label)} alt={label} />
                </div>
              </div>
            ))}
          </div>
          <NationBook value={getExp(exposures, "Low")} />
        </div>

        {/* High section */}
        <div
          className={`casino-table-right-box${highSus ? " suspended-box" : ""}`}
          onClick={() => !highSus && highItem?.b > 0 && onBetClick?.(highItem.b, "High", highItem, "back")}
          style={{ cursor: highSus ? "default" : "pointer" }}
        >
          <div className="text-center">
            <b className="text-info">High</b>
          </div>
          <div className="cmeter-card-box mt-2">
            {HIGH_CARDS.map((label) => (
              <div key={label} className="card-odd-box">
                <div>
                  <img src={CARD_IMG(label)} alt={label} />
                </div>
              </div>
            ))}
          </div>
          <NationBook value={getExp(exposures, "High")} />
        </div>
      </div>
    </div>
  );
}
