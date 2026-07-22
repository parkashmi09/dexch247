/**
 * Teen20b bet table:
 * 4-column layout (Player/3Baccarat/Total/PairPlus) + Black/Red color section.
 * All bets are back-only. Pair Plus shows "A"/"B" as display text.
 */

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

const SPADE_CLUB = (
  <>
    <img src="/assets/img/icons/spade.png" alt="" />
    <img src="/assets/img/icons/club.png" alt="" />
  </>
);
const HEART_DIAMOND = (
  <>
    <img src="/assets/img/icons/heart.png" alt="" />
    <img src="/assets/img/icons/diamond.png" alt="" />
  </>
);

export default function BetTableTeen20b({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name);

  const playerA = find("Player A");
  const playerB = find("Player B");
  const baccA = find("3 Baccarat A");
  const baccB = find("3 Baccarat B");
  const totalA = find("Total A");
  const totalB = find("Total B");
  const pairPlusA = find("Pair Plus A");
  const pairPlusB = find("Pair Plus B");
  const blackA = find("Black A");
  const redA = find("Red A");
  const blackB = find("Black B");
  const redB = find("Red B");

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderOddsBox(item, displayLabel) {
    const sus = isSus(item);
    return (
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <span className="casino-odds">{displayLabel !== undefined ? displayLabel : item?.b || 0}</span>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  function renderColorBox(item, icons) {
    const sus = isSus(item);
    return (
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <div>{icons}</div>
        <div><span className="casino-odds">{item?.b || 0}</span></div>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {/* Player A left box */}
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player A</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-odds-box">Player A</div>
              <div className="casino-odds-box">3 Baccarat A</div>
              <div className="casino-odds-box">Total A</div>
              <div className="casino-odds-box">Pair Plus A</div>
            </div>
            <div className="casino-table-row">
              {renderOddsBox(playerA)}
              {renderOddsBox(baccA)}
              {renderOddsBox(totalA)}
              {renderOddsBox(pairPlusA, "A")}
            </div>
          </div>
        </div>

        {/* Mobile color A — shown after Player A on mobile */}
        <div className="teenpatti20-other-oods d-md-none">
          <div className="casino-table-left-box">
            {renderColorBox(blackA, SPADE_CLUB)}
            {renderColorBox(redA, HEART_DIAMOND)}
          </div>
        </div>

        {/* Player B right box */}
        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player B</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-odds-box">Player B</div>
              <div className="casino-odds-box">3 Baccarat B</div>
              <div className="casino-odds-box">Total B</div>
              <div className="casino-odds-box">Pair Plus B</div>
            </div>
            <div className="casino-table-row">
              {renderOddsBox(playerB)}
              {renderOddsBox(baccB)}
              {renderOddsBox(totalB)}
              {renderOddsBox(pairPlusB, "B")}
            </div>
          </div>
        </div>

        {/* Mobile color B — shown after Player B on mobile */}
        <div className="teenpatti20-other-oods d-md-none">
          <div className="casino-table-right-box">
            {renderColorBox(blackB, SPADE_CLUB)}
            {renderColorBox(redB, HEART_DIAMOND)}
          </div>
        </div>
      </div>

      {/* Desktop color section — both players side by side */}
      <div className="teenpatti20-other-oods d-none d-md-flex">
        <div className="casino-table-left-box">
          {renderColorBox(blackA, SPADE_CLUB)}
          {renderColorBox(redA, HEART_DIAMOND)}
        </div>
        <div className="casino-table-right-box">
          {renderColorBox(blackB, SPADE_CLUB)}
          {renderColorBox(redB, HEART_DIAMOND)}
        </div>
      </div>
    </div>
  );
}
