import { memo } from "react";

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

/**
 * Both sides of the main market's book, from the round's own bets.
 *
 * "Next Total N or More" is a two-outcome market on ONE row, so the table only
 * ever printed the stored exposure row — the risk — and never the reward. Both
 * figures are derived here instead, because the stored row cannot express this:
 * it is a running sum of per-bet liabilities, which for a lay bet is the "it
 * happens" side, and for a mixed back+lay book is neither side.
 *
 * Mirrors settlement: back wins stake*(odds−1) / loses stake; lay is the inverse.
 *
 * @returns {{ hit: number, miss: number }} P/L if the outcome lands / does not
 */
function calcOutcomeBook(bets, nat) {
  if (!nat || !bets?.length) return { hit: 0, miss: 0 };
  const target = nat.trim().toLowerCase();
  let hit = 0;
  let miss = 0;
  bets.forEach((bet) => {
    const sel = String(bet?.selection || bet?.nat || bet?.matchedBet || "").trim().toLowerCase();
    if (sel !== target) return;
    const stake = parseFloat(bet?.stake) || 0;
    const odds = parseFloat(bet?.odds) || 0;
    if (stake <= 0 || odds <= 0) return;
    const win = stake * (odds - 1);
    if (String(bet?.type || "back").toLowerCase() === "lay") {
      hit -= win;
      miss += stake;
    } else {
      hit += win;
      miss -= stake;
    }
  });
  const r2 = (n) => Math.round(n * 100) / 100;
  return { hit: r2(hit), miss: r2(miss) };
}

function BookValue({ value }) {
  if (!value) return null;
  return (
    <div
      className="casino-nation-book text-center"
      style={{ color: value >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)", fontSize: "10px", fontWeight: "bold" }}
    >
      {value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
    </div>
  );
}

const BetTableDum10 = memo(function BetTableDum10({ gameData, onBet, exposures = {}, bets = [] }) {
  const raw = gameData?.data?.data || gameData?.data || gameData || {};
  const sub = raw.sub || [];
  const handleBet = onBet || (() => {});

  // Main bet: subtype=dum10, first unique nat
  const mainBet = sub.find((s) => s.subtype === "dum10");

  // Fancy bets: subtype=dum10fancy
  const fancySub = sub.filter((s) => s.subtype === "dum10fancy");
  const findFancy = (nat) => fancySub.find((s) => s.nat === nat);
  const even = findFancy("Even");
  const odd = findFancy("Odd");
  const red = findFancy("Red");
  const black = findFancy("Black");

  const mainBook = calcOutcomeBook(bets, mainBet?.nat);

  const suspMain = isSusp(mainBet);
  const suspMainLay = !mainBet || mainBet.gstatus !== "OPEN" || !parseFloat(mainBet.l);

  return (
    <div>
      {/* Section 1: Main bet with Back/Lay header */}
      <div className="casino-table-box">
        <div className="casino-table-header">
          <div className="casino-nation-detail"></div>
          <div className="casino-odds-box back">Back</div>
          <div className="casino-odds-box lay">Lay</div>
        </div>
        <div className="casino-table-body">
          <div className="casino-table-row">
            <div className="casino-nation-detail">
              <div className="casino-nation-name">{mainBet?.nat || "—"}</div>
              {/* Stack the two figures. They need their own column because
                  `.duskadum .casino-nation-detail` sets flex-direction: revert
                  (row) + space-between, which would otherwise spread the name and
                  both values across the cell side by side.
                  First position is the side the punter took: the gain on a back,
                  the liability on a lay. The opposite outcome sits beneath it. */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
                <BookValue value={mainBook.hit} />
                <BookValue value={mainBook.miss} />
              </div>
            </div>
            <div
              className={`casino-odds-box back${suspMain ? " suspended-box" : ""}`}
              onClick={suspMain ? undefined : () => handleBet(mainBet.b, mainBet.nat, mainBet, "back")}
              style={{ cursor: suspMain ? "default" : "pointer" }}
            >
              <span className="casino-odds">{mainBet?.b || 0}</span>
            </div>
            <div
              className={`casino-odds-box lay${suspMainLay ? " suspended-box" : ""}`}
              onClick={suspMainLay ? undefined : () => handleBet(mainBet.l, mainBet.nat, mainBet, "lay")}
              style={{ cursor: suspMainLay ? "default" : "pointer" }}
            >
              <span className="casino-odds">{mainBet?.l || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Even/Odd + Red/Black */}
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
        <div className="casino-table-right-box">
          {[
            {
              item: red,
              nat: "Red",
              label: (
                <>
                  <span className="card-icon"><span className="card-red">{"{"}</span></span>
                  <span className="card-icon ms-1"><span className="card-red">{"["}</span></span>
                </>
              ),
            },
            {
              item: black,
              nat: "Black",
              label: (
                <>
                  <span className="card-icon"><span className="card-black">{"}"}</span></span>
                  <span className="card-icon ms-1"><span className="card-black">{"]"}</span></span>
                </>
              ),
            },
          ].map(({ item, nat, label }) => {
            const susp = isSusp(item);
            return (
              <div key={nat} className="aaa-odd-box">
                <div className="casino-odds text-center">{item?.b || 0}</div>
                <div
                  className={`casino-odds-box back casino-odds-box-theme${susp ? " suspended-box" : ""}`}
                  onClick={susp ? undefined : () => handleBet(item.b, item.nat, item, "back")}
                  style={{ cursor: susp ? "default" : "pointer" }}
                >
                  <div className="casino-odds">{label}</div>
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

export default BetTableDum10;
