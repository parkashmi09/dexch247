const JODI_ITEMS = [];
for (let i = 0; i <= 9; i++) {
  for (let j = 0; j <= 9; j++) {
    JODI_ITEMS.push(`${i}-${j}`);
  }
}

export default function JodiTab({ onBetSelect, selectedBets = [], suspended, rate }) {
  const isSelected = (label) =>
    selectedBets.some((b) => b.label === label && b.tab === "jodi");

  return (
    <div className="casino-table-full-box">
      <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
        <div className="worli-full">
          <div className="worli-box-title">{rate ? <b>{rate}</b> : null}</div>
          <div className="worli-box-row">
            {JODI_ITEMS.map((label) => (
              <div
                key={label}
                className={`worli-odd-box back${isSelected(label) ? " selected" : ""}`}
                onClick={() => !suspended && onBetSelect({ label, tab: "jodi" })}
              >
                <span className="worli-odd">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
