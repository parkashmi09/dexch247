export default function TrioTab({ onBetSelect, selectedBets = [], suspended }) {
  const isSelected = (label) =>
    selectedBets.some((b) => b.label === label && b.tab === "trio");

  return (
    <div className={`worli-full${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title"></div>
      <div className="worli-box-row">
        <div
          className={`worli-odd-box back${isSelected("ALL TRIO") ? " selected" : ""}`}
          onClick={() => !suspended && onBetSelect({ label: "ALL TRIO", tab: "trio" })}
        >
          <span className="worli-odd">ALL TRIO</span>
        </div>
      </div>
    </div>
  );
}
