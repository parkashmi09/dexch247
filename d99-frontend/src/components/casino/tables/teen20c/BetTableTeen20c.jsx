function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

const SPADE_CLUB = <><img src="/assets/img/icons/spade.png" alt="" /><img src="/assets/img/icons/club.png" alt="" /></>;
const HEART_DIAMOND = <><img src="/assets/img/icons/heart.png" alt="" /><img src="/assets/img/icons/diamond.png" alt="" /></>;

export default function BetTableTeen20c({ tableData = [], onBetClick, exposures = {} }) {
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

  function renderOddsBox(item, label) {
    const sus = isSus(item);
    return (
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <span className="casino-odds">{label || (sus ? 0 : item?.b || 0)}</span>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  function renderColorBox(item) {
    const sus = isSus(item);
    return (
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <div><span className="casino-odds">{sus ? 0 : item?.b || 0}</span></div>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {/* Player A */}
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

        {/* Mobile color bets A */}
        <div className="teenpatti20-other-oods d-md-none">
          <div className="casino-table-left-box">
            <div className={`casino-odds-box back${isSus(blackA) ? " suspended-box" : ""}`}
              onClick={() => !isSus(blackA) && blackA?.b > 0 && onBetClick?.(blackA.b, blackA.nat, blackA, "back")}>
              <div>{SPADE_CLUB}</div>
              <div><span className="casino-odds">{isSus(blackA) ? 0 : blackA?.b || 0}</span></div>
            </div>
            <div className={`casino-odds-box back${isSus(redA) ? " suspended-box" : ""}`}
              onClick={() => !isSus(redA) && redA?.b > 0 && onBetClick?.(redA.b, redA.nat, redA, "back")}>
              <div>{HEART_DIAMOND}</div>
              <div><span className="casino-odds">{isSus(redA) ? 0 : redA?.b || 0}</span></div>
            </div>
          </div>
        </div>

        {/* Player B */}
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

        {/* Mobile color bets B */}
        <div className="teenpatti20-other-oods d-md-none">
          <div className="casino-table-right-box">
            <div className={`casino-odds-box back${isSus(blackB) ? " suspended-box" : ""}`}
              onClick={() => !isSus(blackB) && blackB?.b > 0 && onBetClick?.(blackB.b, blackB.nat, blackB, "back")}>
              <div>{SPADE_CLUB}</div>
              <div><span className="casino-odds">{isSus(blackB) ? 0 : blackB?.b || 0}</span></div>
            </div>
            <div className={`casino-odds-box back${isSus(redB) ? " suspended-box" : ""}`}
              onClick={() => !isSus(redB) && redB?.b > 0 && onBetClick?.(redB.b, redB.nat, redB, "back")}>
              <div>{HEART_DIAMOND}</div>
              <div><span className="casino-odds">{isSus(redB) ? 0 : redB?.b || 0}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop color bets */}
      <div className="teenpatti20-other-oods d-none d-md-flex">
        <div className="casino-table-left-box">
          <div className={`casino-odds-box back${isSus(blackA) ? " suspended-box" : ""}`}
            onClick={() => !isSus(blackA) && blackA?.b > 0 && onBetClick?.(blackA.b, blackA.nat, blackA, "back")}>
            <div>{SPADE_CLUB}</div>
            <div><span className="casino-odds">{isSus(blackA) ? 0 : blackA?.b || 0}</span></div>
          </div>
          <div className={`casino-odds-box back${isSus(redA) ? " suspended-box" : ""}`}
            onClick={() => !isSus(redA) && redA?.b > 0 && onBetClick?.(redA.b, redA.nat, redA, "back")}>
            <div>{HEART_DIAMOND}</div>
            <div><span className="casino-odds">{isSus(redA) ? 0 : redA?.b || 0}</span></div>
          </div>
        </div>
        <div className="casino-table-right-box">
          <div className={`casino-odds-box back${isSus(blackB) ? " suspended-box" : ""}`}
            onClick={() => !isSus(blackB) && blackB?.b > 0 && onBetClick?.(blackB.b, blackB.nat, blackB, "back")}>
            <div>{SPADE_CLUB}</div>
            <div><span className="casino-odds">{isSus(blackB) ? 0 : blackB?.b || 0}</span></div>
          </div>
          <div className={`casino-odds-box back${isSus(redB) ? " suspended-box" : ""}`}
            onClick={() => !isSus(redB) && redB?.b > 0 && onBetClick?.(redB.b, redB.nat, redB, "back")}>
            <div>{HEART_DIAMOND}</div>
            <div><span className="casino-odds">{isSus(redB) ? 0 : redB?.b || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
