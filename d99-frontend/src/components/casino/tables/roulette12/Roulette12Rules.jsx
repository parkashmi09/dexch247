export default function Roulette12Rules() {
  return (
    <>
      <div className="rules-section">
        <h6 className="rules-highlight">Game Rules:</h6>
        <p>The objective in Roulette is to predict the number on which the ball will land by placing one or more bets that cover that particular number. The wheel in European Roulette includes the numbers 1-36 plus a single 0 (zero).</p>
        <p>After betting time has expired, the ball is spun within the Roulette wheel. The ball will eventually come to rest in one of the numbered pockets within the wheel. You win if you have placed a bet that covers that particular number.</p>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Bet Types:</h6>
        <p>You can place many different kinds of bets on the Roulette table. Bets can cover a single number or a certain range of numbers, and each type of bet has its own payout rate.</p>
        <p>Bets made on the numbered spaces on the betting area, or on the lines between them, are called Inside Bets, while bets made on the special boxes below and to the side of the main grid of numbers are called Outside Bets.</p>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">INSIDE BETS:</h6>
        <ul className="pl-2 pr-2 list-style">
          <li><b>Straight Up</b> — place your chip directly on any single number (including zero).</li>
          <li><b>Split Bet</b> — place your chip on the line between any two numbers, either on the vertical or horizontal.</li>
          <li><b>Street Bet</b> — place your chip at the end of any row of numbers. A Street Bet covers remaining numbers on that Street.</li>
          <li><b>Corner Bet</b> — place your chip at the corner (central intersection) where four numbers meet. All remaining numbers on that corner are covered.</li>
        </ul>
        <br /><br />
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">OUTSIDE BETS:</h6>
        <ul className="pl-2 pr-2 list-style">
          <li><b>Column Bet</b> — place your chip in one of the boxes marked "2 to 1" at the end of the column that covers all remaining numbers in that column. The zero is not covered by any column bet.</li>
          <li><b>Dozen Bet</b> — place your chip in one of the three boxes marked "1st 12," "2nd 12" or "3rd 12" to cover the remaining numbers alongside the box.</li>
          <li><b>Red/Black</b> — place your chip in the Red or Black box to cover the all remaining red or all remaining black numbers. The zero is not covered by these bets.</li>
          <li><b>Even/Odd</b> — place your chip in one of these boxes to cover the remaining even or remaining odd numbers. The zero is not covered by these bets.</li>
          <li><b>1-18/19-36</b> — place your chip in either of these boxes to cover the first or second set of remaining numbers. The zero is not covered by these bets.</li>
        </ul>
        <br />
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Winning Numbers:</h6>
        <p>The WINNING NUMBERS display shows the most recent winning numbers.</p>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Place Bets &amp; Payouts:</h6>
        <p>In Settings icon shows the minimum and maximum allowed bet limits at the table, which may change from time to time. Open the Bet Limits to check your current limits.</p>
        <p>In Settings icon also shows the payouts of all covers section.</p>
        <p>To participate in the game, you must have sufficient funds to cover your bets. You can see your current BALANCE on your screen.</p>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">PLACE YOUR BETS:</h6>
        <p>The CHIP DISPLAY allows you to select the value of each chip you wish to bet. Only chips of denominations that can be covered by your current balance will be enabled and you can change chips amount from Set Button Values.</p>
        <p>Once you have selected a chip, place your bet by simply clicking/tapping the appropriate betting spot on the game table. Each time you click/tap the betting spot, the amount of your bet increases by the value of the selected chip or up to the maximum limit for the type of bet you have selected. Once you have bet the maximum limit, no additional funds will be accepted for that bet, and a message will appear above your bet to notify you that you have bet the maximum.</p>
        <p><b>NOTE:</b> Please do not minimise your browser or open any other tab in your browser while betting time remains, and you have placed bets on the table. Such actions may be interpreted as leaving the game, and your bets will therefore be declined for that particular game round.</p>
      </div>
      <div className="rules-section">
        <p>The Clear button becomes available after you have placed any bet. that clear all your bets.</p>
        <p><span className="rule-inner-icon"><i className="fas fa-trash"></i></span></p>
        <p>The Rebet button allows you to repeat all bets from the previous game round. This button is available only before the first chip is placed.</p>
        <p><span className="rule-inner-icon"><i className="fas fa-redo"></i></span></p>
        <p>The Undo button removes the last bet you placed.</p>
        <p><span className="rule-inner-icon"><i className="fas fa-undo"></i></span></p>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Back table limits:</h6>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Covers</th><th>Team</th><th>Pays</th></tr>
            </thead>
            <tbody>
              <tr><td>1 Nr</td><td>Straight bet</td><td>35:1</td></tr>
              <tr><td>2 Nrs</td><td>Split bet</td><td>17:1</td></tr>
              <tr><td>3 Nrs</td><td>Street bet</td><td>11:1</td></tr>
              <tr><td>4 Nrs</td><td>Corner bet</td><td>8:1</td></tr>
              <tr><td>12 Nrs</td><td>Dozen bet</td><td>2:1</td></tr>
              <tr><td>18 Nrs</td><td>Half board</td><td>1:1</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Lay table limits:</h6>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Covers</th><th>Team</th><th>Pays</th></tr>
            </thead>
            <tbody>
              <tr><td>1 Nr</td><td>Straight bet</td><td>39:1</td></tr>
              <tr><td>2 Nrs</td><td>Split bet</td><td>19.5:1</td></tr>
              <tr><td>3 Nrs</td><td>Street bet</td><td>13:1</td></tr>
              <tr><td>4 Nrs</td><td>Corner bet</td><td>9.75:1</td></tr>
              <tr><td>12 Nrs</td><td>Dozen bet</td><td>3.25:1</td></tr>
              <tr><td>18 Nrs</td><td>Half board</td><td>2.1:1</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
