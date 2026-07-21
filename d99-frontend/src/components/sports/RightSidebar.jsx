import { useState } from "react";
import PlaceBetPanel from "./PlaceBetPanel.jsx";

export default function RightSidebar({ matchedBets, exposures, betState, onOddsChange, onStakeChange, onQuickStake, onClear, onReset, onSubmit, placing, streamUrl, isLive }) {
  const [tvOpen, setTvOpen] = useState(false);
  return (
    <div className="sidebar right-sidebar sticky">
      <a className="bet-nation-game-name blink-message" href="/casino/worli3">
        <i className="fas fa-info-circle me-1" />
        <div>Matka</div>
      </a>

      {/* Live Match TV — only when the match is actually in-play */}
      {isLive && streamUrl && (
        <div className="sidebar-box">
          <div
            className="sidebar-title"
            style={{ cursor: "pointer" }}
            onClick={() => setTvOpen((v) => !v)}
          >
            <h4>Live Match</h4>
          </div>
          {tvOpen && (
            <div className="live-tv">
              <iframe
                allow="autoplay"
                src={streamUrl}
                style={{ width: "100%", border: "0px" }}
                title="Live Match"
              />
            </div>
          )}
        </div>
      )}

      <PlaceBetPanel
        betState={betState}
        exposures={exposures}
        onOddsChange={onOddsChange}
        onStakeChange={onStakeChange}
        onQuickStake={onQuickStake}
        onClear={onClear}
        onReset={onReset}
        onSubmit={onSubmit}
        placing={placing}
      />

      <div className="sidebar-box my-bet-container">
        <div className="sidebar-title">
          <h4>My Bet</h4>
        </div>
        <div className="my-bets">
          <div className="table-responsive w-100">
            <table className="table">
              <thead>
                <tr>
                  <th>Matched Bet</th>
                  <th className="text-end">Odds</th>
                  <th className="text-end">Stake</th>
                </tr>
              </thead>
              <tbody>
                {matchedBets && matchedBets.length > 0 ? (
                  matchedBets.map((bet, i) => (
                    <tr key={bet.id || i} className={bet.bet_type || bet.betType || ""}>
                      <td>{bet.nation || bet.nat || bet.selection || bet.teamName || bet.selection_name || "-"}</td>
                      <td className="text-end">{bet.odds ?? "-"}</td>
                      <td className="text-end">{bet.stake ?? bet.amount ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No matched bets
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
