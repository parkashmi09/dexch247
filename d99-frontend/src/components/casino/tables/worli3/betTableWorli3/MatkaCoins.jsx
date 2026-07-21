import BetChip from "../../../common/BetChip.jsx";

const COIN_VALUES = [25, 50, 100, 200, 500, 1000];

export default function MatkaCoins({ selectedCoin, onCoinSelect, onReset }) {
  return (
    <div className="matka-coins">
      <div className="matka-coin-title">
        <span className="d-none d-md-flex">SET YOUR COIN AMOUNT<br /> AND START 1-CLICK BET!</span>
        <span className="d-md-none">SET YOUR COIN AMOUNT AND START 1-CLICK BET!</span>
        <button className="btn btn-danger btn-sm" onClick={onReset} type="button">Reset</button>
      </div>
      <div className="matka-total-coin">
        <BetChip value={selectedCoin || 0} color="#502b63" />
        <div>=</div>
      </div>
      <div className="matka-other-coins">
        {COIN_VALUES.map((val, i) => (
          <span key={val} style={{ display: "contents" }}>
            <BetChip
              value={val}
              color="#1f6179"
              selected={selectedCoin === val}
              onClick={() => onCoinSelect(val)}
            />
            {i < COIN_VALUES.length - 1 && <div>+</div>}
          </span>
        ))}
      </div>
    </div>
  );
}
