function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpSpan({ value }) {
  if (value === null || value === undefined) return null;
  const n = parseFloat(value);
  if (isNaN(n) || n === 0) return null;
  return (
    <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>
      {n}
    </div>
  );
}

// Head-to-head book for the 2-outcome Mogambo vs Daga/Teja market. A back on one
// side wins (odds-1)*stake if it lands and loses the stake if the OTHER side lands
// (lay is the mirror). The backend only persists the -stake liability on the backed
// side, so we derive the per-outcome book here from the user's open bets on this
// round purely for display (no wallet/liability math is touched).
function headToHeadBook(bets, names) {
  const book = { [names[0]]: 0, [names[1]]: 0 };
  const norm = (s) => String(s || "").trim().toLowerCase();
  for (const b of bets || []) {
    const i = names.findIndex((n) => norm(n) === norm(b.selection ?? b.nat));
    if (i < 0) continue; // ignore non head-to-head bets (e.g. 3 Card Total)
    const O = Number(b.odds) || 0;
    const S = Number(b.stake) || 0;
    if (!O || !S) continue;
    const win = (O - 1) * S;
    const other = names[1 - i];
    if (norm(b.type) === "lay") { book[names[i]] -= win; book[other] += S; }
    else { book[names[i]] += win; book[other] -= S; }
  }
  return { [names[0]]: Math.round(book[names[0]]), [names[1]]: Math.round(book[names[1]]) };
}

// "3 Card Total" is a Fancy2 line market: each bet is on a specific size/line, stored
// as "3 Card Total <N>". The net position is the sum of per-bet spreads — lay adds
// +N, back adds -N, scaled by stake/100. E.g. back 110 + lay 80 (stake 100 each)
// => -110 + 80 = -30. Returns null when there are no such bets.
function threeCardTotalBook(bets, baseName) {
  const re = new RegExp(`^${baseName}\\s+(\\d+(?:\\.\\d+)?)$`, "i");
  let sum = 0, any = false;
  for (const b of bets || []) {
    const m = String(b.selection ?? b.nat ?? "").trim().match(re);
    if (!m) continue;
    const size = Number(m[1]);
    const S = Number(b.stake) || 0;
    if (!size || !S) continue;
    sum += (String(b.type).toLowerCase() === "lay" ? 1 : -1) * size * (S / 100);
    any = true;
  }
  return any ? Math.round(sum) : null;
}

export default function BetTableMogambo({ tableData = [], onBetClick, exposures = {}, bets = [] }) {
  const mogambo = tableData.find((d) => d.nat === "Mogambo");
  const dagaTeja = tableData.find((d) => d.nat === "Daga / Teja");
  const total = tableData.find((d) => d.subtype === "total");
  // Per-outcome book derived from the user's round bets (backend stores only the
  // backed-side liability, which can't show the +win / -loss on both outcomes).
  const book = headToHeadBook(bets, ["Mogambo", "Daga / Teja"]);
  const totalBook = threeCardTotalBook(bets, "3 Card Total");

  function renderMainRow(item, side) {
    if (!item) return null;
    const sus = item.gstatus !== "OPEN";
    const exp = book[item.nat] !== undefined ? book[item.nat] : getExp(exposures, item.nat);
    return (
      <div className={`casino-table-${side}-box`}>
        <div className="casino-table-body">
          <div className="casino-table-row mini-baccarat">
            <div className="casino-nation-detail">
              <div className="casino-nation-name">{item.nat}</div>
              <ExpSpan value={exp} />
            </div>
            <div
              className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
              onClick={() => !sus && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
            >
              <span className="casino-odds">{item.b || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      {/* Daga/Teja (left) + Mogambo (right) */}
      <div className="casino-table-box">
        {renderMainRow(dagaTeja, "left")}
        {renderMainRow(mogambo, "right")}
      </div>

      {/* 3 Card Total */}
      {total && (
        <div className="casino-table-box three-card-total">
          <div className="casino-table-left-box">
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">
                  <div className="casino-nation-name">{total.nat}</div>
                  <ExpSpan value={totalBook !== null ? totalBook : getExp(exposures, total.nat)} />
                </div>
                <div
                  className={`casino-odds-box lay${total.gstatus !== "OPEN" ? " suspended-box" : ""}`}
                  onClick={() => total.gstatus === "OPEN" && total.l > 0 && onBetClick?.(total.l, total.nat, total, "lay")}
                >
                  <span className="casino-odds">{total.l || 0}</span>
                  <span className="casino-volume">{total.lbhav || ""}</span>
                </div>
                <div
                  className={`casino-odds-box back${total.gstatus !== "OPEN" ? " suspended-box" : ""}`}
                  onClick={() => total.gstatus === "OPEN" && total.b > 0 && onBetClick?.(total.b, total.nat, total, "back")}
                >
                  <span className="casino-odds">{total.b || 0}</span>
                  <span className="casino-volume">{total.bbhav || ""}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
