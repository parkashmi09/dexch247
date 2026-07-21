export default function BetChip({ value, color = "#1f6179", selected, onClick }) {
  const label = value >= 1000 ? `${value / 1000}K` : value;
  return (
    <div
      className={`casino-coin${selected ? " selected" : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      <div className="bet-chip-holder" style={{ "--g-chip-inner-color": color }}>
        <div className="bet-chip">
          <div className="bet-chip-front"></div>
          <div className="bet-chip-top"></div>
          <div className="bet-chip-amount">
            <svg className="bet-chip-amount-in" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 108 108">
              <text className="bet-chip-amount-label" x="50%" y="53.5%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="700">{label}</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
