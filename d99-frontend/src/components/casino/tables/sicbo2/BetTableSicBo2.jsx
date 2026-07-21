const DICE = (n) => `/assets/img/dice/dice${n}.png`;

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

// Totals 4-17 with their payout ratios
const TOTALS = [
  { nat: "Total 4", label: "4", payout: "50:1" },
  { nat: "Total 5", label: "5", payout: "20:1" },
  { nat: "Total 6", label: "6", payout: "15:1" },
  { nat: "Total 7", label: "7", payout: "12:1" },
  { nat: "Total 8", label: "8", payout: "8:1" },
  { nat: "Total 9", label: "9", payout: "6:1" },
  { nat: "Total 10", label: "10", payout: "6:1" },
  { nat: "Total 11", label: "11", payout: "6:1" },
  { nat: "Total 12", label: "12", payout: "6:1" },
  { nat: "Total 13", label: "13", payout: "8:1" },
  { nat: "Total 14", label: "14", payout: "12:1" },
  { nat: "Total 15", label: "15", payout: "15:1" },
  { nat: "Total 16", label: "16", payout: "20:1" },
  { nat: "Total 17", label: "17", payout: "50:1" },
];

const COMBOS = [
  [1,2],[1,3],[1,4],[1,5],[1,6],[2,3],[2,4],[2,5],[2,6],[3,4],[3,5],[3,6],[4,5],[4,6],[5,6],
];

export default function BetTableSicBo2({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name);
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderBox(item, content, extraClass = "") {
    const sus = isSus(item);
    return (
      <div
        className={`sicbo-square-box${extraClass}${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
        style={!sus ? { cursor: "pointer" } : undefined}
      >
        {content}
      </div>
    );
  }

  // Desktop layout
  const desktopLayout = (
    <div className="d-none d-xl-block">
      {/* Top titles */}
      <div className="sicbo-top">
        <div className="sicbo-top-box sicbo-title-box">1:1 Lose to Any Triple</div>
        <div className="sicbo-top-box sicbo-title-box">30:1</div>
        <div className="sicbo-top-box sicbo-title-box">1:1 Lose to Any Triple</div>
      </div>

      <div className="sicbo-middle">
        {/* Small */}
        {renderBox(find("Small"), <><div>Small</div><div className="sicbo-box-value">4-10</div></>, " sicbo-middle-small")}

        <div className="sicbo-middle-midle">
          {/* Top row: ODD + Totals 4-17 + Any Triple + Even */}
          <div className="sicbo-middle-top-row">
            {renderBox(find("ODD"), <><div>ODD</div><div className="sicbo-box-value">1:1</div></>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
            {TOTALS.map((t) => renderBox(find(t.nat), <><div>{t.label}</div><div className="sicbo-box-value">{t.payout}</div></>, " sicbo-middle-top-box"))}
            {/* Any Triple in middle */}
            {renderBox(find("Any Triple"), <div>Any Triple</div>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
            {renderBox(find("Even"), <><div>Even</div><div className="sicbo-box-value">1:1</div></>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
          </div>

          {/* Middle row: Singles, Doubles, Triples */}
          <div className="sicbo-middle-middle-row">
            {/* Singles 1-6 */}
            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box"><span>1:1 on Sinlge</span><span>2:1 on Double</span><span>3:1 on Tripple</span></div>
              <div className="sicbo-cube-box-group">
                {[1,2,3,4,5,6].map((n) => renderBox(find(`Single ${n}`), <img src={DICE(n)} alt={`Dice ${n}`} />, " sicbo-cube-box sicbo-cube-single"))}
              </div>
            </div>
            {/* Doubles 1-6 */}
            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box">8:1 Double</div>
              <div className="sicbo-cube-box-group">
                {[1,2,3,4,5,6].map((n) => renderBox(find(`Double ${n}`), <><img src={DICE(n)} alt={`Dice ${n}`} /><img src={DICE(n)} alt={`Dice ${n}`} /></>, " sicbo-cube-box sicbo-cube-double"))}
              </div>
            </div>
            {/* Triples 1-6 */}
            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box">150:1 Each Tripple</div>
              <div className="sicbo-cube-box-group">
                {[1,2,3,4,5,6].map((n) => renderBox(find(`Triple ${n}`), <><img src={DICE(n)} alt={`Dice ${n}`} /><img src={DICE(n)} alt={`Dice ${n}`} /><img src={DICE(n)} alt={`Dice ${n}`} /></>, " sicbo-cube-box sicbo-cube-tripple"))}
              </div>
            </div>
          </div>
        </div>

        {/* Big */}
        {renderBox(find("BIG"), <><div>Big</div><div className="sicbo-box-value">11-17</div></>, " sicbo-middle-big")}
      </div>

      {/* Bottom: Two Dice Combinations */}
      <div className="sicbo-bottom">
        <div className="sicbo-cube-box-container">
          <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
          <div className="sicbo-cube-box-group">
            {COMBOS.map(([a, b]) => renderBox(find(`Combination ${a} and ${b}`), <><img src={DICE(a)} alt={`Dice ${a}`} /><img src={DICE(b)} alt={`Dice ${b}`} /></>, " sicbo-cube-box sicbo-cube-combination"))}
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile layout (rearranged)
  const mobileLayout = (
    <div className="d-xl-none w-100">
      {/* Top: Small/ODD + Any Triple + Even/Big */}
      <div className="sicbo-top">
        <div className="sicbo-cube-box-container">
          <div className="sicbo-top-box sicbo-title-box">1:1 Lose to Any Triple</div>
          <div className="sicbo-cube-box-group">
            {renderBox(find("Small"), <><div>Small</div><div className="sicbo-box-value">4-10</div></>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
            {renderBox(find("ODD"), <><div>ODD</div><div className="sicbo-box-value">1:1</div></>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
          </div>
        </div>
        <div className="sicbo-cube-box-container">
          <div className="sicbo-top-box sicbo-title-box">30:1</div>
          <div className="sicbo-cube-box-group">
            {renderBox(find("Any Triple"), <div>Any Triple</div>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
          </div>
        </div>
        <div className="sicbo-cube-box-container">
          <div className="sicbo-top-box sicbo-title-box">1:1 Lose to Any Triple</div>
          <div className="sicbo-cube-box-group">
            {renderBox(find("Even"), <><div>Even</div><div className="sicbo-box-value">1:1</div></>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
            {renderBox(find("BIG"), <><div>Big</div><div className="sicbo-box-value">11:17</div></>, " sicbo-middle-top-box sicbo-middle-top-box-odd")}
          </div>
        </div>
      </div>

      <div className="sicbo-middle">
        {/* Left: Doubles + Triples */}
        <div className="sicbo-middle-left">
          <div className="sicbo-cube-box-container">
            <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
            <div className="sicbo-cube-box-group">
              {[1,2,3,4,5,6].map((n) => renderBox(find(`Double ${n}`), <><img src={DICE(n)} alt="" /><img src={DICE(n)} alt="" /></>, " sicbo-cube-box sicbo-cube-double"))}
            </div>
          </div>
          <div className="sicbo-cube-box-container">
            <div className="sicbo-top-box sicbo-title-box">150:1 Each Tripple</div>
            <div className="sicbo-cube-box-group">
              {[1,2,3,4,5,6].map((n) => renderBox(find(`Triple ${n}`), <><img src={DICE(n)} alt="" /><img src={DICE(n)} alt="" /><img src={DICE(n)} alt="" /></>, " sicbo-cube-box sicbo-cube-tripple"))}
            </div>
          </div>
        </div>

        {/* Right: Totals + Combos + Singles */}
        <div className="sicbo-middle-right">
          <div className="sicbo-middle-top-row">
            {TOTALS.map((t) => renderBox(find(t.nat), <><div>{t.label}</div><div className="sicbo-box-value">{t.payout}</div></>, " sicbo-middle-top-box"))}
          </div>
          <div className="sicbo-bottom">
            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
              <div className="sicbo-cube-box-group">
                {COMBOS.map(([a, b]) => renderBox(find(`Combination ${a} and ${b}`), <><img src={DICE(a)} alt="" /><img src={DICE(b)} alt="" /></>, " sicbo-cube-box sicbo-cube-combination"))}
              </div>
            </div>
          </div>
          <div className="sicbo-middle-middle-row">
            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box"><span>1:1 on Sinlge</span><span>2:1 on Double</span><span>3:1 on Tripple</span></div>
              <div className="sicbo-cube-box-group">
                {[1,2,3,4,5,6].map((n) => renderBox(find(`Single ${n}`), <img src={DICE(n)} alt="" />, " sicbo-cube-box sicbo-cube-single"))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="casino-table">
      {desktopLayout}
      {mobileLayout}
    </div>
  );
}
