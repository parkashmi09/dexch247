const CARD_BASE = "/assets/front/img/superover/cards";
const BALL_BASE = "/assets/front/img/superover/balls";

const RULES = [
  { card: "cardA", count: 5, ball: "ball1" },
  { card: "card2", count: 5, ball: "ball2" },
  { card: "card3", count: 5, ball: "ball3" },
  { card: "card4", count: 5, ball: "ball4" },
  { card: "card6", count: 5, ball: "ball6" },
  { card: "card10", count: 5, ball: "ball0" },
  { card: "cardK", count: 5, ball: "wicket", label: "Wicket" },
];

export default function SuperOverCardRules({ team1 = "IND", team2 = "AUS" }) {
  return (
    <div className="sidebar-box place-bet-container super-over-rule">
      <div className="sidebar-title">
        <h4>{team1} vs {team2} Inning's Card Rules</h4>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Cards</th>
              <th className="text-center">Count</th>
              <th className="text-end">Value</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((r) => (
              <tr key={r.card}>
                <td>
                  <img src={`${CARD_BASE}/${r.card}.png`} alt={r.card} />
                  <span className="ms-2">X</span>
                </td>
                <td className="text-center">{r.count}</td>
                <td className="text-end">
                  {r.label && <span>{r.label}</span>}
                  <img src={`${BALL_BASE}/${r.ball}.png`} alt={r.ball} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
