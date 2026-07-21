function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureSpan({ exposures, nat }) {
  const raw = getExp(exposures, nat);
  if (raw === null || raw === undefined) return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return null;
  return (
    <div style={{ color: n < 0 ? "#ff0000" : "#00ff00", fontSize: 10, marginTop: 2 }}>
      {n < 0 ? n.toFixed(2) : `+${n.toFixed(2)}`}
    </div>
  );
}

const DRAGON_CARD_NATS = [
  "Dragon Card 1", "Dragon Card 2", "Dragon Card 3", "Dragon Card 4",
  "Dragon Card 5", "Dragon Card 6", "Dragon Card 7", "Dragon Card 8",
  "Dragon Card 9", "Dragon Card 10", "Dragon Card J", "Dragon Card Q", "Dragon Card K",
];

const TIGER_CARD_NATS = [
  "Tiger Card 1", "Tiger Card 2", "Tiger Card 3", "Tiger Card 4",
  "Tiger Card 5", "Tiger Card 6", "Tiger Card 7", "Tiger Card 8",
  "Tiger Card 9", "Tiger Card 10", "Tiger Card J", "Tiger Card Q", "Tiger Card K",
];

const CARD_LABELS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

function getOdds(item) {
  return item?.b || 0;
}

export default function BetTableDT20({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);

  // Detect ace format: DT20 uses "Dragon Card 1", DT202 uses "Dragon Card A"
  const aceLabel = find("Dragon Card A") ? "A" : "1";

  const dragon = find("Dragon");
  const tiger = find("Tiger");
  const tie = find("Tie");
  const pair = find("Pair");

  const dragonEven = find("Dragon Even");
  const dragonOdd = find("Dragon Odd");
  const dragonRed = find("Dragon Red");
  const dragonBlack = find("Dragon Black");

  const tigerEven = find("Tiger Even");
  const tigerOdd = find("Tiger Odd");
  const tigerRed = find("Tiger Red");
  const tigerBlack = find("Tiger Black");

  const dragonCardNats = [`Dragon Card ${aceLabel}`, "Dragon Card 2", "Dragon Card 3", "Dragon Card 4",
    "Dragon Card 5", "Dragon Card 6", "Dragon Card 7", "Dragon Card 8",
    "Dragon Card 9", "Dragon Card 10", "Dragon Card J", "Dragon Card Q", "Dragon Card K"];
  const tigerCardNats = [`Tiger Card ${aceLabel}`, "Tiger Card 2", "Tiger Card 3", "Tiger Card 4",
    "Tiger Card 5", "Tiger Card 6", "Tiger Card 7", "Tiger Card 8",
    "Tiger Card 9", "Tiger Card 10", "Tiger Card J", "Tiger Card Q", "Tiger Card K"];

  const dragonCards = dragonCardNats.map((nat) => ({ nat, item: find(nat) }));
  const tigerCards = tigerCardNats.map((nat) => ({ nat, item: find(nat) }));

  // Show per-card odds (e.g. 12), not sum of all 13 cards
  const dragonCardOdds = dragonCards[0]?.item?.b || 0;
  const tigerCardOdds = tigerCards[0]?.item?.b || 0;

  function renderMainBox(item, label, className) {
    const sus = isSus(item);
    const nat = item?.nat || label;
    return (
      <div className={`dt20-odd-box ${className}`}>
        <div className="casino-odds text-center">{sus ? 0 : getOdds(item)}</div>
        <div
          className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
        >
          <span className="casino-odds">{label}</span>
          <ExposureSpan exposures={exposures} nat={nat} />
        </div>
      </div>
    );
  }

  function renderOddsBox(item, label, nat) {
    const sus = isSus(item);
    const playerName = item?.nat || nat;
    return (
      <div className="dt20-odd-box dt20odds">
        <div className="casino-odds text-center">{sus ? 0 : getOdds(item)}</div>
        <div
          className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, playerName, item, "back")}
        >
          <span className="casino-odds">{label}</span>
          <ExposureSpan exposures={exposures} nat={playerName} />
        </div>
      </div>
    );
  }

  function renderColorBox(item, nat, colorClass, chars) {
    const sus = isSus(item);
    const playerName = item?.nat || nat;
    return (
      <div className="dt20-odd-box dt20odds">
        <div className="casino-odds text-center">{sus ? 0 : getOdds(item)}</div>
        <div
          className={`casino-odds-box back casino-odds-box-theme${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, playerName, item, "back")}
        >
          <div className="casino-odds">
            {chars.map((ch, i) => (
              <span key={i} className="card-icon ms-1"><span className={colorClass}>{ch}</span></span>
            ))}
          </div>
          <ExposureSpan exposures={exposures} nat={playerName} />
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      {/* Section 1: Main bets - Dragon, Tie, Tiger, Pair */}
      <div className="casino-table-full-box">
        {renderMainBox(dragon, "Dragon", "dt20dragon")}
        {renderMainBox(tie, "Tie", "dt20tie")}
        {renderMainBox(tiger, "Tiger", "dt20tiger")}
        {renderMainBox(pair, "Pair", "dt20pair")}
      </div>

      {/* Section 2: Even/Odd/Color */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <h4 className="w-100 text-center mb-2"><b>DRAGON</b></h4>
          {renderOddsBox(dragonEven, "Even", "Dragon Even")}
          {renderOddsBox(dragonOdd, "Odd", "Dragon Odd")}
          {renderColorBox(dragonRed, "Dragon Red", "card-red", ["{", "["])}
          {renderColorBox(dragonBlack, "Dragon Black", "card-black", ["}", "]"])}
        </div>
        <div className="casino-table-right-box">
          <h4 className="w-100 text-center mb-2"><b>TIGER</b></h4>
          {renderOddsBox(tigerEven, "Even", "Tiger Even")}
          {renderOddsBox(tigerOdd, "Odd", "Tiger Odd")}
          {renderColorBox(tigerRed, "Tiger Red", "card-red", ["{", "["])}
          {renderColorBox(tigerBlack, "Tiger Black", "card-black", ["}", "]"])}
        </div>
      </div>

      {/* Section 3: Individual cards */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <div className="dt20cards">
            <h4 className="w-100 text-center mb-2"><b>DRAGON {dragonCardOdds}</b></h4>
            {dragonCards.map(({ nat, item }, idx) => {
              const sus = isSus(item);
              const exp = getExp(exposures, nat);
              const expNum = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
              return (
                <div
                  key={nat}
                  className="card-odd-box"
                  onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
                >
                  <div className={sus ? "suspended-box" : ""}>
                    <img src={`/assets/img/cards/${CARD_LABELS[idx]}.png`} alt={CARD_LABELS[idx]} />
                  </div>
                  {!isNaN(expNum) && expNum !== 0 && (
                    <div className={`casino-nation-book text-center ${expNum >= 0 ? "text-success" : "text-danger"}`}>{expNum}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="casino-table-right-box">
          <div className="dt20cards">
            <h4 className="w-100 text-center mb-2"><b>TIGER {tigerCardOdds}</b></h4>
            {tigerCards.map(({ nat, item }, idx) => {
              const sus = isSus(item);
              const exp = getExp(exposures, nat);
              const expNum = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
              return (
                <div
                  key={nat}
                  className="card-odd-box"
                  onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
                >
                  <div className={sus ? "suspended-box" : ""}>
                    <img src={`/assets/img/cards/${CARD_LABELS[idx]}.png`} alt={CARD_LABELS[idx]} />
                  </div>
                  {!isNaN(expNum) && expNum !== 0 && (
                    <div className={`casino-nation-book text-center ${expNum >= 0 ? "text-success" : "text-danger"}`}>{expNum}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="casino-remark mt-1">
        <marquee scrollamount="3"> </marquee>
      </div>
    </div>
  );
}
