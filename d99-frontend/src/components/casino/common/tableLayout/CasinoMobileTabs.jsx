export default function CasinoMobileTabs({ activeTab, onTabChange, placedBetsCount = 0, roundId }) {
  return (
    <div className="casino-title-header-mobile d-xl-none">
      <ul className="nav nav-tabs menu-tabs">
        <li className="nav-item">
          <div
            className={`nav-link${activeTab === "game" ? " active" : ""}`}
            onClick={() => onTabChange("game")}
          >
            Game
          </div>
        </li>
        <li className="nav-item">
          <div
            className={`nav-link${activeTab === "bets" ? " active" : ""}`}
            onClick={() => onTabChange("bets")}
          >
            Placed Bet ({placedBetsCount})
          </div>
        </li>
      </ul>
      <div className="pe-2">
        {roundId && (
          <span className="casino-rid">Round ID: <span>{roundId}</span></span>
        )}
      </div>
    </div>
  );
}
