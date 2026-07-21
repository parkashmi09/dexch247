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

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

function BackLayRow({ item, label, onBetClick, exposures }) {
  const sus = isSus(item);
  const nat = item?.nat || label;
  const backOdds = sus ? 0 : (item?.b || 0);
  const layOdds = sus ? 0 : (item?.l || 0);

  return (
    <div className="casino-table-row">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">{label}</div>
        <ExposureSpan exposures={exposures} nat={nat} />
      </div>
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
      >
        <span className="casino-odds">{backOdds}</span>
      </div>
      <div
        className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, nat, item, "lay")}
      >
        <span className="casino-odds">{layOdds}</span>
      </div>
    </div>
  );
}

function BackOnlyRow({ item, label, onBetClick, exposures }) {
  const sus = isSus(item);
  const nat = item?.nat || label;
  const backOdds = sus ? 0 : (item?.b || 0);

  return (
    <div className="casino-table-row">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">{label}</div>
        <ExposureSpan exposures={exposures} nat={nat} />
      </div>
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
      >
        <span className="casino-odds">{backOdds}</span>
      </div>
    </div>
  );
}

function OddEvenRow({ oddItem, evenItem, label, onBetClick, exposures }) {
  const oddSus = isSus(oddItem);
  const evenSus = isSus(evenItem);
  const oddNat = oddItem?.nat || `${label} Odd`;
  const evenNat = evenItem?.nat || `${label} Even`;

  return (
    <div className="casino-table-row">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">{label}</div>
      </div>
      <div
        className={`casino-odds-box back${oddSus ? " suspended-box" : ""}`}
        onClick={() => !oddSus && oddItem?.b > 0 && onBetClick?.(oddItem.b, oddNat, oddItem, "back")}
      >
        <span className="casino-odds">{oddSus ? 0 : (oddItem?.b || 0)}</span>
        <ExposureSpan exposures={exposures} nat={oddNat} />
      </div>
      <div
        className={`casino-odds-box back${evenSus ? " suspended-box" : ""}`}
        onClick={() => !evenSus && evenItem?.b > 0 && onBetClick?.(evenItem.b, evenNat, evenItem, "back")}
      >
        <span className="casino-odds">{evenSus ? 0 : (evenItem?.b || 0)}</span>
        <ExposureSpan exposures={exposures} nat={evenNat} />
      </div>
    </div>
  );
}

const PLAYERS = ["Player 8", "Player 9", "Player 10", "Player 11"];
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export default function BetTableCard32EU({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);

  const p8 = find("Player 8");
  const p9 = find("Player 9");
  const p10 = find("Player 10");
  const p11 = find("Player 11");

  const p8Odd = find("Player 8 Odd");
  const p8Even = find("Player 8 Even");
  const p9Odd = find("Player 9 Odd");
  const p9Even = find("Player 9 Even");
  const p10Odd = find("Player 10 Odd");
  const p10Even = find("Player 10 Even");
  const p11Odd = find("Player 11 Odd");
  const p11Even = find("Player 11 Even");

  const anyBlack = find("Any Three Card Black");
  const anyRed = find("Any Three Card Red");
  const twoBlackTwoRed = find("Two Black Two Red");

  const total89 = find("8 & 9 Total");
  const total1011 = find("10 & 11 Total");

  // Numbers section — get odds from first Single item (they're all the same)
  const singleOdds = find("Single 1")?.b || 0;
  const singleSus = !find("Single 1") || find("Single 1")?.gstatus !== "OPEN";

  return (
    <div className="casino-table cards32b">
      {/* Section 1: Players Back/Lay + Odd/Even */}
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <BackLayRow item={p8} label="Player 8" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={p9} label="Player 9" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={p10} label="Player 10" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={p11} label="Player 11" onBetClick={onBetClick} exposures={exposures} />
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Odd</div>
            <div className="casino-odds-box back">Even</div>
          </div>
          <div className="casino-table-body">
            <OddEvenRow oddItem={p8Odd} evenItem={p8Even} label="Player 8" onBetClick={onBetClick} exposures={exposures} />
            <OddEvenRow oddItem={p9Odd} evenItem={p9Even} label="Player 9" onBetClick={onBetClick} exposures={exposures} />
            <OddEvenRow oddItem={p10Odd} evenItem={p10Even} label="Player 10" onBetClick={onBetClick} exposures={exposures} />
            <OddEvenRow oddItem={p11Odd} evenItem={p11Even} label="Player 11" onBetClick={onBetClick} exposures={exposures} />
          </div>
        </div>
      </div>

      {/* Section 2: Color bets + Total bets */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <BackLayRow item={anyBlack} label="Any Three Card Black" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={anyRed} label="Any Three Card Red" onBetClick={onBetClick} exposures={exposures} />
            <BackLayRow item={twoBlackTwoRed} label="Two Black Two Red" onBetClick={onBetClick} exposures={exposures} />
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        <div className="casino-table-right-box cards32total">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
          </div>
          <div className="casino-table-body">
            <BackOnlyRow item={total89} label="8 & 9 Total" onBetClick={onBetClick} exposures={exposures} />
            <BackOnlyRow item={total1011} label="10 & 11 Total" onBetClick={onBetClick} exposures={exposures} />
          </div>
        </div>
      </div>

      {/* Section 3: Numbers grid */}
      <div className="casino-table-full-box mt-3 card32numbers">
        <h4 className="w-100 text-center mb-2">
          <b>{singleSus ? 0 : singleOdds}</b>
        </h4>
        <div className="card32numbers-container">
          {DIGITS.map((digit) => {
            const item = find(`Single ${digit}`);
            const sus = isSus(item);
            const nat = item?.nat || `Single ${digit}`;
            return (
              <div
                key={digit}
                className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
              >
                <span className="casino-odds">{digit}</span>
                <ExposureSpan exposures={exposures} nat={nat} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
