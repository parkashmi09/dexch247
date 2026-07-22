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
 * Both sides of a two-outcome market that occupies one table row.
 *
 * "Next Total N or More" has no clickable runner for the losing outcome, so the
 * server books the two sides under suffixed names — the same convention the
 * sports fancy lines use. Must match, byte for byte (no separator),
 * d99-server/helper/casinoMarketBook.js → backRunner / layRunner.
 *
 * The bare `nat` row also exists, but it holds the worst case for net exposure
 * and the wallet — not something this table prints.
 */
const BACK_RUNNER = (nat) => `${nat.trim()}back`;
const LAY_RUNNER = (nat) => `${nat.trim()}lay`;

const BetTableDum10 = memo(function BetTableDum10({ gameData, onBet, exposures = {} }) {
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
                  First position is the P/L if the outcome lands, the one beneath
                  it the P/L if it does not. Both come straight from the two
                  exposure rows the server books for this market. */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
                <ExposureBook nat={mainBet?.nat && BACK_RUNNER(mainBet.nat)} exposures={exposures} />
                <ExposureBook nat={mainBet?.nat && LAY_RUNNER(mainBet.nat)} exposures={exposures} />
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
