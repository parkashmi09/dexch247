import { useState } from "react";

const CARD_BASE = "/assets/img/cards";
const CARDS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const TABS = [
  { key: "single", label: "Single", nat: "Single", randomBets: null },
  { key: "double", label: "Double", nat: "Double", randomBets: [5, 10, 15, 20, 25, 50, 75] },
  { key: "tripple", label: "Tripple", nat: "Triple", randomBets: [5, 10, 15, 20, 25, 50, 100] },
];

const isItemLocked = (item) =>
  !item || item?.gstatus?.toUpperCase() === "SUSPENDED" || !item?.b || item.b === 0;

export default function BetTableLottcard({ tableData = [], onBetClick, exposures = {} }) {
  const [activeTabKey, setActiveTabKey] = useState("single");
  const [selectedCards, setSelectedCards] = useState({ single: [], double: [], tripple: [] });

  const items = Array.isArray(tableData) ? tableData : [];
  const findByNat = (n) => items.find((i) => i?.nat === n);

  const activeTab = TABS.find((t) => t.key === activeTabKey);
  const activeItem = findByNat(activeTab?.nat);

  const cardToBall = (c) => (c === "A" ? "1" : c === "10" ? "0" : c);

  const handleCardClick = (card) => {
    if (isItemLocked(activeItem)) return;
    setSelectedCards((prev) => {
      const cur = prev[activeTabKey] || [];
      const isSelected = cur.includes(card);
      const next = isSelected ? cur.filter((c) => c !== card) : [...cur, card];
      return { ...prev, [activeTabKey]: next };
    });
    const ballNum = cardToBall(card);
    onBetClick(activeItem.b, activeItem.nat, { ...activeItem, lotteryBall: ballNum }, "back");
  };

  const handleRandomClick = (n) => {
    if (isItemLocked(activeItem)) return;
    onBetClick(activeItem.b, activeItem.nat, activeItem, "back");
  };

  const handleClear = () => {
    setSelectedCards((prev) => ({ ...prev, [activeTabKey]: [] }));
  };

  const placedCount = (key) => (selectedCards[key] || []).length;

  return (
    <div className="casino-table">
      <div className="nav nav-pills" role="tablist">
        {TABS.map((tab) => (
          <div key={tab.key} className="nav-item">
            <a
              role="tab"
              aria-selected={activeTabKey === tab.key}
              className={`nav-link ${activeTabKey === tab.key ? "active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActiveTabKey(tab.key); }}
              href="#"
            >
              {tab.label} ({placedCount(tab.key)})
            </a>
          </div>
        ))}
      </div>

      <div className="w-100 tab-content">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            role="tabpanel"
            className={`fade tab-pane ${activeTabKey === tab.key ? "active show" : ""}`}
          >
            {activeTabKey === tab.key && (
              <div className={`${tab.key} ${isItemLocked(activeItem) ? "suspended-box" : ""}`}>
                <div className="lottery-box">
                  {CARDS.map((card) => {
                    const isSelected = (selectedCards[activeTabKey] || []).includes(card);
                    return (
                      <div
                        key={card}
                        className={`lottery-card ${isSelected ? "active" : ""}`}
                        onClick={() => handleCardClick(card)}
                        style={{ cursor: "pointer" }}
                      >
                        <img src={`${CARD_BASE}/${card}.png`} alt={card} />
                      </div>
                    );
                  })}
                </div>
                {tab.randomBets && (
                  <div className="random-bets">
                    <h4 className="w-100 text-center mb-1">Random Bets</h4>
                    {tab.randomBets.map((n) => (
                      <button
                        key={n}
                        className="lottery-btn active"
                        onClick={() => handleRandomClick(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lottery-buttons d-xl-none">
        <button className={`btn btn-lottery${isItemLocked(activeItem) ? " suspended-box" : ""}`} onClick={handleClear}>Repeat</button>
        <button className={`btn btn-lottery${isItemLocked(activeItem) ? " suspended-box" : ""}`} onClick={handleClear}>Clear</button>
        <button className={`btn btn-lottery${isItemLocked(activeItem) ? " suspended-box" : ""}`} onClick={handleClear}>Remove</button>
      </div>
    </div>
  );
}
