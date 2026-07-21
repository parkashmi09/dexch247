export default function PokerBonusTable({ className = "" }) {
  return (
    <div className={`sidebar-box my-bet-container ${className}`}>
      <div className="sidebar-title"><h4>Rules</h4></div>
      <div>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead><tr><th colSpan="2" className="text-center">Bonus 1 (2 Cards Bonus)</th></tr></thead>
            <tbody>
              <tr><td>Pair (2-10)</td><td>1 TO 3</td></tr>
              <tr><td>A/Q or A/J Off Suited</td><td>1 TO 5</td></tr>
              <tr><td>Pair (JQK)</td><td>1 TO 10</td></tr>
              <tr><td>A/K Off Suited</td><td>1 TO 15</td></tr>
              <tr><td>A/Q or A/J Suited</td><td>1 TO 20</td></tr>
              <tr><td>A/K Suited</td><td>1 TO 25</td></tr>
              <tr><td>A/A</td><td>1 TO 30</td></tr>
            </tbody>
          </table>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead><tr><th colSpan="2" className="text-center">Bonus 2 (7 Cards Bonus)</th></tr></thead>
            <tbody>
              <tr><td>Three of a Kind</td><td>1 TO 3</td></tr>
              <tr><td>Straight</td><td>1 TO 4</td></tr>
              <tr><td>Flush</td><td>1 TO 6</td></tr>
              <tr><td>Full House</td><td>1 TO 8</td></tr>
              <tr><td>Four of a Kind</td><td>1 TO 30</td></tr>
              <tr><td>Straight Flush</td><td>1 TO 50</td></tr>
              <tr><td>Royal Flush</td><td>1 TO 100</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
