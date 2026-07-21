import { useIsSelected, WorliOddBox } from "../../../common/WorliGrid.jsx";

const LEFT_ROW1 = ["1", "2", "3", "4", "5"];
const LEFT_ROW2 = ["6", "7", "8", "9", "0"];

const RIGHT_ITEMS = [
  [
    { label: "Line 1", sub: "1|2|3|4|5" },
    { label: "ODD", sub: "1|3|5|7|9" },
  ],
  [
    { label: "Line 2", sub: "6|7|8|9|0" },
    { label: "EVEN", sub: "2|4|6|8|0" },
  ],
];

export default function SingleTab({ onBetSelect, selectedBets = [], suspended, rate }) {
  const isSelected = useIsSelected(selectedBets, "single");
  const handleClick = (label) => !suspended && onBetSelect({ label, tab: "single" });

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-left">
        <div className="worli-box-title">{rate ? <b>{rate}</b> : null}</div>
        <div className="worli-box-row">
          {LEFT_ROW1.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {LEFT_ROW2.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
      <div className="worli-right">
        <div className="worli-box-title">{rate ? <b>{rate}</b> : null}</div>
        {RIGHT_ITEMS.map((row, ri) => (
          <div className="worli-box-row" key={ri}>
            {row.map((item) => (
              <div
                key={item.label}
                className={`worli-odd-box back${isSelected(item.label) ? " selected" : ""}`}
                onClick={() => handleClick(item.label)}
              >
                <span className="worli-odd">{item.label}</span>
                <span className="d-block">{item.sub}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
