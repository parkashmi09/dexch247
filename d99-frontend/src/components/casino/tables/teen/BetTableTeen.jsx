function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

export default function BetTableTeen({ tableData = [], onBetClick, exposures = {} }) {
  // Main players: sid 1/2, subtype "teen", etype "match"
  const playerA = tableData.find((d) => d.sid === 1 && d.subtype === "teen") || tableData.find((d) => d.sid === 1);
  const playerB = tableData.find((d) => d.sid === 2 && d.subtype === "teen") || tableData.find((d) => d.sid === 2);

  // Consecutive: sid 17/18, subtype "con"
  const consA = tableData.find((d) => d.sid === 17 && d.subtype === "con") || tableData.find((d) => d.sid === 17);
  const consB = tableData.find((d) => d.sid === 18 && d.subtype === "con") || tableData.find((d) => d.sid === 18);

  // Card Odd/Even: sid 11-16, subtype "oddeven", etype "fancy"
  // Each card has nested odds array: [{b, nat:"Odd"}, {b, nat:"Even"}]
  const cardNumbers = [1, 2, 3, 4, 5, 6];
  const cards = cardNumbers.map((n) => {
    const found = tableData.find((d) => d.sid === (10 + n) && d.subtype === "oddeven");
    if (found) return found;
    return { sid: 10 + n, nat: `Card ${n}`, b: 0, l: 0, gstatus: "SUSPENDED", odds: [{ b: 0, nat: "Odd" }, { b: 0, nat: "Even" }] };
  });

  const isSus = (item) => !item || item.gstatus !== "OPEN";

  // Main is a two-way A-vs-B book — the backed player holds +profit, the other
  // −stake — so read each Main row under the player nat ("Player A"/"Player B").
  // Consecutive reuses the same nats in the feed, but its exposure is stored
  // namespaced ("Player A Consecutive") so it no longer bleeds the Main loss
  // into both rows; read it under that key. expKey defaults to the item nat.
  function renderRow(item, label, expKey) {
    const sus = isSus(item);
    const exp = getExp(exposures, expKey || item?.nat);
    const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
    return (
      <div className={`casino-table-row${sus ? " suspended-row" : ""}`}>
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{label}</div>
          {!isNaN(expN) && expN !== 0 && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
        </div>
        <div className="casino-odds-box back"
          onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}>
          <span className="casino-odds">{item?.b || 0}</span>
        </div>
        <div className="casino-odds-box lay"
          onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}>
          <span className="casino-odds">{item?.l || 0}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      {/* Player A / Player B with Main + Consecutive */}
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player A</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderRow(playerA, "Main", "Player A")}
            {renderRow(consA, "Consecutive", "Player A Consecutive")}
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        <div className="casino-table-right-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Player B</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            {renderRow(playerB, "Main", "Player B")}
            {renderRow(consB, "Consecutive", "Player B Consecutive")}
          </div>
        </div>
      </div>

      {/* Odd/Even Card 1-6 grid */}
      <div className="casino-table-full-box teenpatti1day-other-odds mt-3">
        <div className="casino-table-header">
          <div className="casino-nation-detail"></div>
          {cardNumbers.map((n) => (
            <div key={n} className="casino-odds-box">Card {n}</div>
          ))}
        </div>
        <div className="casino-table-body">
          {/* Odd row - uses odds[0].b (nat="Odd") from each Card item */}
          <div className="casino-table-row">
            <div className="casino-nation-detail">
              <div className="casino-nation-name">Odd</div>
            </div>
            {cards.map((card, i) => {
              const sus = isSus(card);
              const oddItem = card.odds?.find((o) => o.nat === "Odd");
              const oddVal = oddItem?.b || 0;
              const cellSus = sus || !oddVal;
              const selName = `${card.nat} Odd`;
              const exp = getExp(exposures, selName);
              const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
              return (
                <div key={i} className={`casino-odds-box back${cellSus ? " suspended-box" : ""}`}
                  onClick={() => !cellSus && oddVal > 0 && onBetClick?.(oddVal, selName, { ...card, nat: selName, b: oddVal }, "back")}>
                  <span className="casino-odds">{oddVal}</span>
                  {!isNaN(expN) && expN !== 0 && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
                </div>
              );
            })}
          </div>
          {/* Even row - uses odds[1].b (nat="Even") from each Card item */}
          <div className="casino-table-row">
            <div className="casino-nation-detail">
              <div className="casino-nation-name">Even</div>
            </div>
            {cards.map((card, i) => {
              const sus = isSus(card);
              const evenItem = card.odds?.find((o) => o.nat === "Even");
              const evenVal = evenItem?.b || 0;
              const cellSus = sus || !evenVal;
              const selName = `${card.nat} Even`;
              const exp = getExp(exposures, selName);
              const expN = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
              return (
                <div key={i} className={`casino-odds-box back${cellSus ? " suspended-box" : ""}`}
                  onClick={() => !cellSus && evenVal > 0 && onBetClick?.(evenVal, selName, { ...card, nat: selName, b: evenVal }, "back")}>
                  <span className="casino-odds">{evenVal}</span>
                  {!isNaN(expN) && expN !== 0 && <div className={`casino-nation-book ${expN >= 0 ? "text-success" : "text-danger"}`}>{expN}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
