function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function BookValue({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  // Sign-coloured and 2dp, like every other casino table. The figure here is the
  // worst case: 1 Card Meter can lose up to 12x the stake, so it is large.
  return (
    <div
      className="casino-nation-book text-center"
      style={show ? { color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)", fontWeight: "bold" } : undefined}
    >
      <b>{show ? (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)) : ""}</b>
    </div>
  );
}

export default function BetTableCmeter1({ tableData = [], onBetClick, exposures = {} }) {
  const find = (nat) => tableData.find((d) => d.nat === nat);
  const itemA = find("Fighter A");
  const itemB = find("Fighter B");

  const isSus = (item) => !item || item.gstatus !== "OPEN" || !(item.b > 0);

  const susA = isSus(itemA);
  const susB = isSus(itemB);

  const handleA = () => {
    if (!susA && itemA) onBetClick?.(itemA.b, itemA.nat, itemA, "back");
  };

  const handleB = () => {
    if (!susB && itemB) onBetClick?.(itemB.b, itemB.nat, itemB, "back");
  };

  return (
    <div className="casino-table">
      <div className="casino-table-full-box">
        <div className="meter-btns">
          <div className="meter-btn">
            <div className={`meter-btn-box${susA ? " suspended-box" : ""}`}>
              <button className="btn btn-fighter-1 back" onClick={handleA}>
                Fighter A
                <img src="/assets/img/fight.png" alt="Fight" />
              </button>
            </div>
            <BookValue value={getExp(exposures, "Fighter A")} />
          </div>

          <div className="meter-btn">
            <div className={`meter-btn-box${susB ? " suspended-box" : ""}`}>
              <button className="btn btn-fighter-2 back" onClick={handleB}>
                <img src="/assets/img/fight.png" alt="Fight" />
                Fighter B
              </button>
            </div>
            <BookValue value={getExp(exposures, "Fighter B")} />
          </div>
        </div>
      </div>
    </div>
  );
}
