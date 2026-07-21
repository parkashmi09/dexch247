function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function BookValue({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  return (
    <div className="text-center book-green">
      <b>{show ? n : ""}</b>
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
