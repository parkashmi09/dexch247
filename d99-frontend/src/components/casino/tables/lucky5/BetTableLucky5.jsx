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

const CARD_LABELS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J"];

// Card icon images (small icons showing rank + suits)
const CARD_ICON = (label) => `/assets/img/cards/icons/${label}.png`;

export default function BetTableLucky5({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name);

  const lowCard = find("Low Card");
  const highCard = find("High Card");
  const even = find("Even");
  const odd = find("Odd");
  const red = find("Red");
  const black = find("Black");

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderOddsBox(item, label) {
    const sus = isSus(item);
    return (
      <div className="lucky7odds">
        <div className="casino-odds text-center">{sus ? 0 : item?.b || 0}</div>
        <div
          className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
        >
          <span className="casino-odds">{label}</span>
        </div>
        <NationBook value={getExp(exposures, label)} />
      </div>
    );
  }

  // Get per-card odds from API (Card 1, Card 2, ... Card J)
  const cardItems = CARD_LABELS.map((lbl) => {
    const natName = lbl === "A" ? "Card 1" : lbl === "J" ? "Card J" : `Card ${lbl}`;
    return { label: lbl, item: find(natName), natName };
  });

  // All individual cards share a single odds row
  const anyCardItem = cardItems.find((c) => c.item)?.item;
  const cardOdds = anyCardItem && !isSus(anyCardItem) ? anyCardItem.b || 0 : 0;

  return (
    <div className="casino-table">
      {/* Top: Low Card | Center Card (6) | High Card */}
      <div className="casino-table-full-box">
        <div className="lucky7low">
          <div className="casino-odds text-center">{isSus(lowCard) ? 0 : lowCard?.b || 0}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme${isSus(lowCard) ? " suspended-box" : ""}`}
            onClick={() => !isSus(lowCard) && lowCard.b > 0 && onBetClick?.(lowCard.b, lowCard.nat, lowCard, "back")}
          >
            <span className="casino-odds">Low Card</span>
          </div>
          <NationBook value={getExp(exposures, "Low Card")} />
        </div>

        <div className="lucky7">
          <img src="/assets/img/cards/icons/6.png" alt="6" />
        </div>

        <div className="lucky7high">
          <div className="casino-odds text-center">{isSus(highCard) ? 0 : highCard?.b || 0}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme${isSus(highCard) ? " suspended-box" : ""}`}
            onClick={() => !isSus(highCard) && highCard.b > 0 && onBetClick?.(highCard.b, highCard.nat, highCard, "back")}
          >
            <span className="casino-odds">High Card</span>
          </div>
          <NationBook value={getExp(exposures, "High Card")} />
        </div>
      </div>

      {/* Middle: Even / Odd | Red / Black */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          {renderOddsBox(even, "Even")}
          {renderOddsBox(odd, "Odd")}
        </div>
        <div className="casino-table-right-box">
          {/* Red (hearts + diamonds) */}
          <div className="lucky7odds">
            <div className="casino-odds text-center">{isSus(red) ? 0 : red?.b || 0}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme${isSus(red) ? " suspended-box" : ""}`}
              onClick={() => !isSus(red) && red.b > 0 && onBetClick?.(red.b, red.nat, red, "back")}
            >
              <span className="casino-odds">
                <span className="card-icon ms-1"><span className="card-red ">{"{"}</span></span>
                <span className="card-icon ms-1"><span className="card-red ">{"["}</span></span>
              </span>
            </div>
            <NationBook value={getExp(exposures, "Red")} />
          </div>
          {/* Black (spades + clubs) */}
          <div className="lucky7odds">
            <div className="casino-odds text-center">{isSus(black) ? 0 : black?.b || 0}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme${isSus(black) ? " suspended-box" : ""}`}
              onClick={() => !isSus(black) && black.b > 0 && onBetClick?.(black.b, black.nat, black, "back")}
            >
              <span className="casino-odds">
                <span className="card-icon ms-1"><span className="card-black ">{"}"}</span></span>
                <span className="card-icon ms-1"><span className="card-black ">{"]"}</span></span>
              </span>
            </div>
            <NationBook value={getExp(exposures, "Black")} />
          </div>
        </div>
      </div>

      {/* Bottom: Individual cards A through J */}
      <div className="casino-table-full-box lucky7acards mt-3">
        <div className="casino-odds w-100 text-center">{cardOdds}</div>
        {cardItems.map(({ label, item, natName }) => {
          const sus = isSus(item);
          return (
            <div
              key={label}
              className="card-odd-box"
              onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, natName, item, "back")}
            >
              <div className={sus ? "suspended-box" : ""}>
                <img src={CARD_ICON(label)} alt={label} />
              </div>
              <div className="casino-nation-book">
                {(() => {
                  const exp = getExp(exposures, natName);
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
