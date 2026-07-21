import { memo } from "react";

const MAIN_ITEMS = [
  { nat: "Don", label: "A.Don" },
  { nat: "Amar Akbar Anthony", label: "B.Amar Akbar Anthony" },
  { nat: "Sahib Bibi Aur Ghulam", label: "C.Sahib Bibi Aur Ghulam" },
  { nat: "Dharam Veer", label: "D.Dharam Veer" },
  { nat: "Kis Kis ko Pyaar Karoon", label: "E.Kis Kis Ko Pyaar Karoon" },
  { nat: "Ghulam", label: "F.Ghulam" },
];

const CARD_FACES = ["J", "Q", "K", "A"];
const CARD_NATS = ["Card J", "Card Q", "Card K", "Card A"];

function findByNat(sub, nat) {
  return (
    sub.find((s) => s.nat === nat) ||
    sub.find((s) => s.nat?.toLowerCase() === nat.toLowerCase())
  );
}

function isSusp(item) {
  return !item || item.gstatus !== "OPEN" || !parseFloat(item.b);
}

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureBook({ nat, exposures, className = "casino-nation-book text-center" }) {
  const val = getExp(exposures, nat);
  if (val === null || val === undefined) return <div className={className} />;
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return <div className={className} />;
  return (
    <div
      className={className}
      style={{
        color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)",
        fontSize: "10px",
        fontWeight: "bold",
      }}
    >
      {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
    </div>
  );
}

const BetTableBtable = memo(function BetTableBtable({ gameData, onBet, exposures = {} }) {
  const raw = gameData?.data?.data || gameData?.data || gameData || {};
  const sub = raw.sub || [];
  const handleBet = onBet || (() => {});

  const odd = findByNat(sub, "Odd");
  const red = findByNat(sub, "Red");
  const black = findByNat(sub, "Black");
  const dulha = findByNat(sub, "Dulha Dulhan K-Q");
  const barati = findByNat(sub, "Barati J-A");

  const cardItems = CARD_NATS.map((nat) => findByNat(sub, nat));
  const cardOdds = cardItems.find((it) => it?.b)?.b || 0;

  return (
    <div className="casino-table">
      {/* Section 1: 6 main players with back/lay */}
      <div className="casino-table-box">
        {MAIN_ITEMS.map(({ nat, label }) => {
          const item = findByNat(sub, nat);
          const suspBack = isSusp(item);
          const suspLay = !item || item.gstatus !== "OPEN" || !parseFloat(item.l);
          return (
            <div key={nat} className="casino-odd-box-container">
              <div className="casino-nation-name">
                {label}
                <div className="casino-nation-book d-md-none">
                  <ExposureBook nat={item?.nat} exposures={exposures} className="" />
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
                <ExposureBook nat={item?.nat} exposures={exposures} className="" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2: Odd (back/lay) + Dulha Dulhan / Barati */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box left-odd-box">
          {(() => {
            const suspBack = isSusp(odd);
            const suspLay = !odd || odd.gstatus !== "OPEN" || !parseFloat(odd.l);
            return (
              <div className="casino-odd-box-container">
                <div className="casino-nation-name">
                  Odd
                  <div className="casino-nation-book text-danger d-md-none">
                    <ExposureBook nat={odd?.nat} exposures={exposures} className="" />
                  </div>
                </div>
                <div
                  className={`casino-odds-box back${suspBack ? " suspended-box" : ""}`}
                  onClick={suspBack ? undefined : () => handleBet(odd.b, odd.nat, odd, "back")}
                  style={{ cursor: suspBack ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{odd?.b || 0}</span>
                </div>
                <div
                  className={`casino-odds-box lay${suspLay ? " suspended-box" : ""}`}
                  onClick={suspLay ? undefined : () => handleBet(odd.l, odd.nat, odd, "lay")}
                  style={{ cursor: suspLay ? "default" : "pointer" }}
                >
                  <span className="casino-odds">{odd?.l || 0}</span>
                </div>
                <div className="casino-nation-book text-center d-none d-md-block w-100">
                  <ExposureBook nat={odd?.nat} exposures={exposures} className="" />
                </div>
              </div>
            );
          })()}
        </div>

        <div className="casino-table-right-box right-odd-box">
          {[
            { item: dulha, label: "Dulha Dulhan K-Q" },
            { item: barati, label: "Barati J-A" },
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
                <div className="casino-nation-book text-center">
                  <ExposureBook nat={item?.nat} exposures={exposures} className="" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Red/Black + Card grid (J, Q, K, A only) */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          {[
            {
              item: red,
              label: (
                <div className="casino-odds">
                  <span className="card-icon ms-1"><span className="card-red">{"{"}</span></span>
                  <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
                </div>
              ),
            },
            {
              item: black,
              label: (
                <div className="casino-odds">
                  <span className="card-icon ms-1"><span className="card-black">{"}"}</span></span>
                  <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
                </div>
              ),
            },
          ].map(({ item, label }, idx) => {
            const susp = isSusp(item);
            return (
              <div key={idx} className="aaa-odd-box">
                <div className="casino-odds text-center">{item?.b || 0}</div>
                <div
                  className={`casino-odds-box back casino-odds-box-theme${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  {label}
                </div>
                <div className="casino-nation-book text-center">
                  <ExposureBook nat={item?.nat} exposures={exposures} className="" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="casino-table-right-box right-cards">
          <h4 className="w-100 text-center mb-2"><b>{cardOdds}</b></h4>
          {CARD_FACES.map((face, i) => {
            const item = cardItems[i];
            const susp = isSusp(item);
            return (
              <div
                key={face}
                className="card-odd-box"
                onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                style={{ cursor: susp ? "default" : "pointer" }}
              >
                <div className={susp ? "suspended-box" : ""}>
                  <img src={`/assets/img/cards/${face}.png`} alt={face} />
                </div>
                <div className="casino-nation-book">
                  <ExposureBook nat={item?.nat} exposures={exposures} className="" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default BetTableBtable;
