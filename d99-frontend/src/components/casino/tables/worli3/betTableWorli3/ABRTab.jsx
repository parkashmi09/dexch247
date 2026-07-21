import { useIsSelected, WorliOddBox } from "../../../common/WorliGrid.jsx";

export default function ABRTab({ onBetSelect, selectedBets = [], suspended }) {
  const isSelected = useIsSelected(selectedBets, "abr");
  const handleClick = (label) => !suspended && onBetSelect({ label, tab: "abr" });

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title"></div>
      <div className="worli-left">
        <div className="worli-box-row">
          {["A", "B", "R"].map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {["AB", "AR", "BR"].map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
      <div className="worli-right">
        <div className="worli-box-row">
          <WorliOddBox label="ABR" selected={isSelected("ABR")} onClick={() => handleClick("ABR")} />
        </div>
        <div className="worli-box-row">
          <WorliOddBox label="ABR CUT" selected={isSelected("ABR CUT")} onClick={() => handleClick("ABR CUT")} />
        </div>
      </div>
    </div>
  );
}
