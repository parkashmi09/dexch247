export default function BetTable({ title = "My Bet", bets = [] }) {
  return (
    <div className="sidebar-box my-bet-container">
      <div className="sidebar-title"><h4>{title}</h4></div>
      <div className="my-bets">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Matched Bet</th>
                <th className="text-end">Odds</th>
                <th className="text-end">Stake</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet, idx) => (
                <tr key={idx} className={bet.type === "back" ? "back" : bet.type === "lay" ? "lay" : "back"}>
                  <td>{bet.matchedBet || bet.nation || bet.nat || "-"}</td>
                  <td className="text-end">{bet.odds || "-"}</td>
                  <td className="text-end">{bet.stake || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
