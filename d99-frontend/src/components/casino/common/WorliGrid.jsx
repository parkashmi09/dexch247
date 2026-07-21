const ROW1 = ["1", "2", "3", "4", "5"];
const ROW2 = ["6", "7", "8", "9", "0"];

function WorliOddBox({ label, selected, onClick }) {
  return (
    <div
      className={`worli-odd-box back${selected ? " selected" : ""}`}
      onClick={onClick}
    >
      <span className="worli-odd">{label}</span>
    </div>
  );
}

function useIsSelected(selectedBets, tab) {
  return (label) => selectedBets.some((b) => b.label === label && b.tab === tab);
}

/**
 * Two-row digit grid (1-5 / 6-0) inside worli-full.
 * Used by: CommonSP, CommonDP
 */
export function WorliFullGrid({ tab, onBetSelect, selectedBets = [], suspended, rate }) {
  const isSelected = useIsSelected(selectedBets, tab);
  const handleClick = (label) => !suspended && onBetSelect({ label, tab });
  return (
    <div className={`worli-full${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title">{rate ? <b>{rate}</b> : null}</div>
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
  );
}

/**
 * Left/right split: left has two-row digits, right has a single "ALL" box.
 * Used by: SP, DP, Chart56, Chart64, ColorDP
 */
export function WorliLeftRightGrid({ tab, allLabel, onBetSelect, selectedBets = [], leftRows, suspended, rate }) {
  const isSelected = useIsSelected(selectedBets, tab);
  const handleClick = (label) => !suspended && onBetSelect({ label, tab });
  const r1 = leftRows?.[0] || ROW1;
  const r2 = leftRows?.[1] || ROW2;
  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title">{rate ? <b>{rate}</b> : null}</div>
      <div className="worli-left">
        <div className="worli-box-row">
          {r1.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {r2.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
      <div className="worli-right">
        <div className="worli-box-row">
          <WorliOddBox label={allLabel} selected={isSelected(allLabel)} onClick={() => handleClick(allLabel)} />
        </div>
      </div>
    </div>
  );
}

export { WorliOddBox, useIsSelected, ROW1, ROW2 };
