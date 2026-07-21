import { memo } from "react";

const CARD_VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === "SUSPENDED" || item.gstatus === "0" || item.gstatus !== "OPEN" || !parseFloat(item.b);
}

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureBook({ nat, exposures }) {
  const val = getExp(exposures, nat);
  if (val === null || val === undefined) return <div className="casino-nation-book text-center" />;
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return <div className="casino-nation-book text-center" />;
  return (
    <div
      className="casino-nation-book text-center"
      style={{ color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)", fontSize: "10px", fontWeight: "bold" }}
    >
      {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
    </div>
  );
}

const BetTableAAA = memo(function BetTableAAA({ gameData, onBet, exposures = {} }) {
  const raw = gameData?.data?.data || gameData?.data || gameData || {};
  const sub = raw.sub || [];
  const handleBet = onBet || (() => {});

  // Main markets
  const amar = findByNat(sub, "Amar");
  const akbar = findByNat(sub, "Akbar");
  const anthony = findByNat(sub, "Anthony");
  const players = [
    { item: amar, label: "A. Amar" },
    { item: akbar, label: "B. Akbar" },
    { item: anthony, label: "C. Anthony" },
  ];

  // Fancy markets
  const even = findByNat(sub, "Even");
  const odd = findByNat(sub, "Odd");
  const red = findByNat(sub, "Red");
  const black = findByNat(sub, "Black");
  const under7 = findByNat(sub, "Under 7");
  const over7 = findByNat(sub, "Over 7");

  // Card markets — nats are "Card A", "Card 2", ..., "Card K"
  const cardItems = CARD_VALUES.map((v) => findByNat(sub, `Card ${v}`));
  const cardOdds = cardItems.find((it) => it?.b)?.b || 0;

  return (
    <div className="casino-table-box">
      {/* Section 1: 3 players with back/lay */}
      <div className="casino-table-box">
        {players.map(({ item, label }) => {
          const suspBack = isSusp(item);
          const suspLay = !item || item.gstatus !== "OPEN" || !parseFloat(item.l);
          return (
            <div key={label} className="casino-odd-box-container">
              <div className="casino-nation-name">
                {label}
                <div className="casino-nation-book d-md-none">
                  <ExposureBook nat={item?.nat} exposures={exposures} />
                </div>
              </div>
              <div
                className={`casino-odds-box back${suspBack ? " suspended-box" : ""}`}
                onClick={suspBack ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                style={{ cursor: suspBack ? "default" : "pointer" }}
              >
                <span className="casino-odds">{item?.b || 0}</span>
              </div>
              <div
                className={`casino-odds-box lay${suspLay ? " suspended-box" : ""}`}
                onClick={suspLay ? undefined : () => handleBet(item.l, item.nat, item, "lay")}
                style={{ cursor: suspLay ? "default" : "pointer" }}
              >
                <span className="casino-odds">{item?.l || 0}</span>
              </div>
              <div className="casino-nation-book text-center d-none d-md-block w-100">
                <ExposureBook nat={item?.nat} exposures={exposures} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2: Even/Odd, Red/Black, Under7/Over7 */}
      <div className="casino-table-box mt-3">
        {/* Even / Odd */}
        <div className="casino-table-left-box">
          {[
            { item: even, label: "Even" },
            { item: odd, label: "Odd" },
          ].map(({ item, label }) => {
            const susp = isSusp(item);
            return (
              <div key={label} className="aaa-odd-box">
                <div className="casino-odds text-center">{item?.b || 0}</div>
                <div
                  className={`casino-odds-box back casino-odds-box-theme${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{label}</span>
                </div>
                <ExposureBook nat={item?.nat} exposures={exposures} />
              </div>
            );
          })}
        </div>

        {/* Red / Black */}
        <div className="casino-table-center-box">
          {[
            {
              item: red,
              label: (
                <>
                  <span className="card-icon"><span className="card-red">{"{"}</span></span>
                  <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
                </>
              ),
              nat: "Red",
            },
            {
              item: black,
              label: (
                <>
                  <span className="card-icon"><span className="card-black">{"}"}</span></span>
                  <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
                </>
              ),
              nat: "Black",
            },
          ].map(({ item, label, nat }) => {
            const susp = isSusp(item);
            return (
              <div key={nat} className="aaa-odd-box">
                <div className="casino-odds text-center">{item?.b || 0}</div>
                <div
                  className={`casino-odds-box back casino-odds-box-theme${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{label}</span>
                </div>
                <ExposureBook nat={item?.nat} exposures={exposures} />
              </div>
            );
          })}
        </div>

        {/* Under 7 / Over 7 */}
        <div className="casino-table-right-box">
          {[
            { item: under7, label: "Under 7" },
            { item: over7, label: "Over 7" },
          ].map(({ item, label }) => {
            const susp = isSusp(item);
            return (
              <div key={label} className="aaa-odd-box">
                <div className="casino-odds text-center">{item?.b || 0}</div>
                <div
                  className={`casino-odds-box back casino-odds-box-theme${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{label}</span>
                </div>
                <ExposureBook nat={item?.nat} exposures={exposures} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Card grid A–K */}
      <div className="casino-table-full-box aaacards mt-3">
        <h4 className="w-100 text-center mb-2"><b>{cardOdds}</b></h4>
        <div className="d-flex flex-wrap justify-content-center">
          {CARD_VALUES.map((val, i) => {
            const item = cardItems[i];
            const susp = isSusp(item);
            return (
              <div
                key={val}
                className="card-odd-box"
                onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                style={{ cursor: susp ? "default" : "pointer" }}
              >
                <div className={susp ? "suspended-box" : ""}>
                  <img
                    src={`/assets/img/cards/${val}.png`}
                    alt={val}
                    style={{ height: "32px", display: "block" }}
                  />
                </div>
                <ExposureBook nat={item?.nat} exposures={exposures} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default BetTableAAA;
