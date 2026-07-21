export default function Card32Rules() {
  return (
    <div className="rules-section">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Cards Deck</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>6(SPADE) 6(HEART) 6(CLUB) 6(DIAMOND)</td><td>6 POINT</td></tr>
            <tr><td>7(SPADE) 7(HEART) 7(CLUB) 7(DIAMOND)</td><td>7 POINT</td></tr>
            <tr><td>8(SPADE) 8(HEART) 8(CLUB) 8(DIAMOND)</td><td>8 POINT</td></tr>
            <tr><td>9(SPADE) 9(HEART) 9(CLUB) 9(DIAMOND)</td><td>9 POINT</td></tr>
            <tr><td>10(SPADE) 10(HEART) 10(CLUB) 10(DIAMOND)</td><td>10 POINT</td></tr>
            <tr><td>J(SPADE) J(HEART) J(CLUB) J(DIAMOND)</td><td>11 POINT</td></tr>
            <tr><td>Q(SPADE) Q(HEART) Q(CLUB) Q(DIAMOND)</td><td>12 POINT</td></tr>
            <tr><td>K(SPADE) K(HEART) K(CLUB) K(DIAMOND)</td><td>13 POINT</td></tr>
          </tbody>
        </table>
      </div>
      <ul className="pl-4 pr-4 list-style">
        <li>This is a value card game &amp; Winning result will count on Highest cards total.</li>
        <li>There are total 4 players, every player have default prefix points. Default points will be consider as following table.</li>
      </ul>
      <h6 className="rules-highlight">Playing Game Rules:</h6>
      <div className="table-responsive">
        <table className="table">
          <tbody>
            <tr>
              <td><div><b>PLAYER 8</b></div><div>8 Point</div></td>
              <td><div><b>PLAYER 9</b></div><div>9 Point</div></td>
              <td><div><b>PLAYER 10</b></div><div>10 Point</div></td>
              <td><div><b>PLAYER 11</b></div><div>11 Point</div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="pl-4 pr-4 list-style">
        <li>In game, every player has to count sum of default points and their own opened card's point.</li>
        <li>If in first level, the sum is same with more than one player, then that will be tie and winner tied players go for next level.</li>
        <li>This sum will go and go upto Single Player Highest Sum of Point.</li>
        <li>At last Highest Point Cards's Player declare as a Winner.</li>
      </ul>
    </div>
  );
}
