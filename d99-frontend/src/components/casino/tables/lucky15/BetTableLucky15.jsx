import { useRef, useState } from "react";

function formatAmount(n) {
  if (!n && n !== 0) return "";
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

function MarketRow({ item, onBetClick, exposures }) {
  const suspended = item.gstatus !== "OPEN";
  const backVal = item.b || 0;
  const isEmpty = !backVal || Number(backVal) === 0;
  const exp = exposures?.[item.nat] ?? null;
  const expN = exp !== null ? parseFloat(exp) : NaN;

  const prevOddsRef = useRef(item.b);
  const [blink, setBlink] = useState(false);
  const timerRef = useRef(null);

  if (item.b !== prevOddsRef.current && item.b > 0) {
    prevOddsRef.current = item.b;
    if (!blink) {
      setBlink(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { setBlink(false); timerRef.current = null; }, 300);
    }
  }

  return (
    <div className="col-12 col-md-4">
      <div className="fancy-market" data-title={suspended ? "SUSPENDED" : "OPEN"}>
        <div className="market-row">
          <div className="market-nation-detail">
            <span className="market-nation-name pointer">{item.nat}</span>
            {!isNaN(expN) && expN !== 0 && (
              <div className={`market-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>
            )}
          </div>
          <div className={`blb-box${suspended ? " suspended-box" : ""}`}>
            <div
              className={`market-odd-box back ${blink ? "blink" : ""}`}
              onClick={() => !isEmpty && !suspended && onBetClick?.(backVal, item.nat, item, "back")}
            >
              <span className="market-odd">{isEmpty || suspended ? "-" : backVal}</span>
              {!isEmpty && !suspended && <span className="market-volume">{item.bs || ""}</span>}
            </div>
          </div>
          <div className="fancy-min-max-box">
            <div className="fancy-min-max">
              <span className="w-100 d-block">Min: {formatAmount(item.min || 50)}</span>
              <span className="w-100 d-block">Max: {formatAmount(item.max || 25000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BetTableLucky15({ tableData = [], onBetClick, exposures = {} }) {
  return (
    <div className="game-market market-6 container-fluid container-fluid-5">
      <div className="market-title row row5">Runs</div>
      <div className="market-header row row5">
        <div className="col-12 col-md-4 d-none d-md-block">
          <div className="market-row">
            <div className="market-nation-detail"></div>
            <div className="market-odd-box back"><b>Back</b></div>
          </div>
        </div>
        <div className="col-12 col-md-4 d-none d-md-block">
          <div className="market-row">
            <div className="market-nation-detail"></div>
            <div className="market-odd-box back"><b>Back</b></div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="market-row">
            <div className="market-nation-detail"></div>
            <div className="market-odd-box back"><b>Back</b></div>
          </div>
        </div>
        <div className="fancy-min-max-box"></div>
      </div>
      <div className="market-body row row5">
        {tableData.map((item) => (
          <MarketRow key={item.sid} item={item} onBetClick={onBetClick} exposures={exposures} />
        ))}
      </div>
    </div>
  );
}
