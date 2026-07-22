function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function NationBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  return (
    <div className="casino-nation-book text-center">
      {show && <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>}
    </div>
  );
}

// Card label → API nat name mapping (individual cards)
// API uses "Card 1" for Ace, "Card J", "Card Q", "Card K" for face cards
const INDIVIDUAL_CARDS = [
  { label: "A", nat: "Card 1" },
  { label: "2", nat: "Card 2" },
  { label: "3", nat: "Card 3" },
  { label: "4", nat: "Card 4" },
  { label: "5", nat: "Card 5" },
  { label: "6", nat: "Card 6" },
  { label: "7", nat: "Card 7" },
  { label: "8", nat: "Card 8" },
  { label: "9", nat: "Card 9" },
  { label: "10", nat: "Card 10" },
  { label: "J", nat: "Card J" },
  { label: "Q", nat: "Card Q" },
  { label: "K", nat: "Card K" },
];

// Card groups (7 is skipped from groups) - Line 1/2/3/4
const CARD_GROUPS = [
  { nat: "Line 1", cards: ["A", "2", "3"] },
  { nat: "Line 2", cards: ["4", "5", "6"] },
  { nat: "Line 3", cards: ["8", "9", "10"] },
  { nat: "Line 4", cards: ["J", "Q", "K"] },
];

const CARD_IMG = (label) => `/assets/img/cards/${label}.png`;

export default function BetTableLucky7({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);

  const lowCard = find("Low Card");
  const highCard = find("High Card");
  const even = find("Even");
  const odd = find("Odd");
  const red = find("Red");
  const black = find("Black");

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderSimpleOddsBox(item, label, customLabel) {
    const sus = isSus(item);
    const displayLabel = customLabel || label;
    return (
      <div className="lucky7odds">
        <div className="casino-odds text-center">{item?.b || 0}</div>
        <div
          className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, label, item, "back")}
        >
          <span className="casino-odds">{displayLabel}</span>
        </div>
        <NationBook value={getExp(exposures, label)} />
      </div>
    );
  }

  // All individual cards share a single odds row header display
  const anyIndividualItem = INDIVIDUAL_CARDS.map((c) => find(c.nat)).find((i) => i);
  const individualCardOdds = anyIndividualItem && !isSus(anyIndividualItem) ? anyIndividualItem.b || 0 : 0;

  return (
    <div className="casino-table">
      {/* Section 1: Low Card | 7 image | High Card */}
      <div className="casino-table-full-box">
        <div className="lucky7low">
          <div className="casino-odds text-center">{lowCard?.b || 0}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme${isSus(lowCard) ? " suspended-box" : ""}`}
            onClick={() => !isSus(lowCard) && lowCard?.b > 0 && onBetClick?.(lowCard.b, lowCard.nat, lowCard, "back")}
          >
            <span className="casino-odds">Low Card</span>
          </div>
          <NationBook value={getExp(exposures, "Low Card")} />
        </div>

        <div className="lucky7">
          <img src={CARD_IMG("7")} alt="7" />
        </div>

        <div className="lucky7high">
          <div className="casino-odds text-center">{highCard?.b || 0}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme${isSus(highCard) ? " suspended-box" : ""}`}
            onClick={() => !isSus(highCard) && highCard?.b > 0 && onBetClick?.(highCard.b, highCard.nat, highCard, "back")}
          >
            <span className="casino-odds">High Card</span>
          </div>
          <NationBook value={getExp(exposures, "High Card")} />
        </div>
      </div>

      {/* Section 2: Even/Odd | Red/Black */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          {renderSimpleOddsBox(even, "Even")}
          {renderSimpleOddsBox(odd, "Odd")}
        </div>
        <div className="casino-table-right-box">
          {/* Red */}
          <div className="lucky7odds">
            <div className="casino-odds text-center">{red?.b || 0}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme${isSus(red) ? " suspended-box" : ""}`}
              onClick={() => !isSus(red) && red?.b > 0 && onBetClick?.(red.b, red.nat, red, "back")}
            >
              <span className="casino-odds">
                <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
                <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
              </span>
            </div>
            <NationBook value={getExp(exposures, "Red")} />
          </div>
          {/* Black */}
          <div className="lucky7odds">
            <div className="casino-odds text-center">{black?.b || 0}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme${isSus(black) ? " suspended-box" : ""}`}
              onClick={() => !isSus(black) && black?.b > 0 && onBetClick?.(black.b, black.nat, black, "back")}
            >
              <span className="casino-odds">
                <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
                <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
              </span>
            </div>
            <NationBook value={getExp(exposures, "Black")} />
          </div>
        </div>
      </div>

      {/* Section 3: Card groups (A-3, 4-6, 8-10, J-K) */}
      <div className="casino-table-box mt-3">
        {CARD_GROUPS.map(({ nat, cards }) => {
          const item = find(nat);
          const sus = isSus(item);
          return (
            <div
              key={nat}
              className="lucky7cards"
              onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
              style={{ cursor: sus ? "default" : "pointer" }}
            >
              <div className="casino-odds w-100 text-center">{item?.b || 0}</div>
              <div className={`card-odd-box-container${sus ? " suspended-box" : ""}`}>
                {cards.map((card) => (
                  <div key={card} className="card-odd-box">
                    <div>
                      <img src={CARD_IMG(card)} alt={card} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="casino-nation-book text-center w-100">
                {(() => {
                  const exp = getExp(exposures, nat);
                  if (exp === null || exp === undefined) return null;
                  const n = parseFloat(exp);
                  if (isNaN(n) || n === 0) return null;
                  return <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>;
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 4: Individual cards A through K */}
      <div className="casino-table-full-box lucky7acards mt-3">
        <div className="casino-odds w-100 text-center">{individualCardOdds}</div>
        {INDIVIDUAL_CARDS.map(({ label, nat }) => {
          const item = find(nat);
          const sus = isSus(item);
          return (
            <div
              key={label}
              className="card-odd-box"
              onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
            >
              <div className={sus ? "suspended-box" : ""}>
                <img src={CARD_IMG(label)} alt={label} />
              </div>
              <div className="casino-nation-book">
                {(() => {
                  const exp = getExp(exposures, nat);
                  if (exp === null || exp === undefined) return null;
                  const n = parseFloat(exp);
                  if (isNaN(n) || n === 0) return null;
                  return <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>;
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
