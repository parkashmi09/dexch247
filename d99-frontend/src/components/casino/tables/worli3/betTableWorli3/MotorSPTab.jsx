import { useIsSelected, WorliOddBox, ROW1, ROW2 } from "../../../common/WorliGrid.jsx";

export default function MotorSPTab({ onBetSelect, selectedBets = [], suspended }) {
  const isSelected = useIsSelected(selectedBets, "motorsp");
  const handleClick = (label) => !suspended && onBetSelect({ label, tab: "motorsp" });

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-full">
        <div className="worli-box-title"></div>
        <div className="worli-box-row">
          {ROW1.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {ROW2.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
    </div>
  );
}
