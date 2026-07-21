function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  if (!show) return null;
  return <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>;
}

export default function BetTablePoison({ tableData = [], onBetClick, exposures = {}, prefix = "Poison" }) {
  const find = (name) => tableData.find((d) => d.nat === name);

  const playerA = find("Player A");
  const playerB = find("Player B");
  const poisonEven = find(`${prefix} Even`);
  const poisonOdd = find(`${prefix} Odd`);
  const poisonRed = find(`${prefix} Red`);
  const poisonBlack = find(`${prefix} Black`);
  const poisonSpade = find(`${prefix} Spade`);
  const poisonHeart = find(`${prefix} Heart`);
  const poisonDiamond = find(`${prefix} Diamond`);
  const poisonClub = find(`${prefix} Club`);

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  function renderPlayerRow(item) {
    if (!item) return null;
    const sus = isSus(item);
    const exp = getExp(exposures, item.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    const showExp = !isNaN(expN) && expN !== 0;
    return (
      <div className="casino-table-row ">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{item.nat}</div>
          {showExp && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
        </div>
        <div
          className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
        >
          <span className="casino-odds">{sus ? 0 : item.b || 0}</span>
        </div>
        <div
          className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && item.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}
        >
          <span className="casino-odds">{sus ? 0 : item.l || 0}</span>
        </div>
      </div>
    );
  }

  function renderPoisonOdds(item) {
    if (!item) return null;
    const sus = isSus(item);
    const exp = getExp(exposures, item.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    const showExp = !isNaN(expN) && expN !== 0;
    return (
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <span className="casino-odds">{sus ? 0 : item.b || 0}</span>
        {showExp && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {/* Left: Player A / Player B with Back & Lay */}
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail"></div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderPlayerRow(playerA)}
            {renderPlayerRow(playerB)}
          </div>
        </div>

        {/* Right: Poison side bets */}
        <div className="casino-table-right-box joker-other-odds">
          {/* Even / Odd / Red / Black */}
          <div className="joker-other-odds">
            <div className="casino-table-header">
              <div className="casino-nation-detail"></div>
              <div className="casino-odds-box ">Even</div>
              <div className="casino-odds-box ">Odd</div>
              <div className="casino-odds-box ">
                <span>Red</span>
                <span className="card-icon ms-1">
                  <span className="card-red ">{"{"}</span>
                  <span className="card-red ">{"["}</span>
                </span>
              </div>
              <div className="casino-odds-box">
                <span>Black</span>
                <span className="card-icon ms-1">
                  <span className="card-black ">{"}"}</span>
                  <span className="card-black ">{"]"}</span>
                </span>
              </div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">
                  <div className="casino-nation-name">{prefix}</div>
                </div>
                {renderPoisonOdds(poisonEven)}
                {renderPoisonOdds(poisonOdd)}
                {renderPoisonOdds(poisonRed)}
                {renderPoisonOdds(poisonBlack)}
              </div>
            </div>
          </div>

          {/* Individual suits: Spade / Heart / Diamond / Club */}
          <div className="joker-other-odds dtredblack">
            <div className="casino-table-header">
              <div className="casino-nation-detail"></div>
              <div className="casino-odds-box"><span className="card-icon ms-1"><span className="card-black ">{"}"}</span></span></div>
              <div className="casino-odds-box"><span className="card-icon ms-1"><span className="card-red ">{"{"}</span></span></div>
              <div className="casino-odds-box"><span className="card-icon ms-1"><span className="card-red ">{"["}</span></span></div>
              <div className="casino-odds-box"><span className="card-icon ms-1"><span className="card-black ">{"]"}</span></span></div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row ">
                <div className="casino-nation-detail">
                  <div className="casino-nation-name">{prefix}</div>
                </div>
                {renderPoisonOdds(poisonSpade)}
                {renderPoisonOdds(poisonHeart)}
                {renderPoisonOdds(poisonDiamond)}
                {renderPoisonOdds(poisonClub)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
