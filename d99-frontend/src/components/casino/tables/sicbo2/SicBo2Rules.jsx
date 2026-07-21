export default function SicBo2Rules() {
  return (
    <>
      <div className="rules-section">
        <h6 className="rules-highlight">Game Rules :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>This casino operates similarly to Sicbo, with the key difference being that each round alternates between two Sicbo machines.</li>
          <li>Sic Bo is an exciting game of chance played with three regular dice with face value 1 to 6. The objective of Sic Bo is to predict the outcome of the shake of the three dice.</li>
          <li>After betting time has expired, the dice are shaken in a dice shaker. Random bet spots then have multipliers applied before the dice come to rest and the result is known.</li>
        </ul>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Bet Type :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>You can place many kinds of bets on the Sic Bo table, and each type of bet has its own payout.
            <ul className="pl-4 pr-4 list-style">
              <li><b>Small/Big</b> — bet on the total being Small (4-10) or Big (11-17). Pays 1:1, loses to any Triple.</li>
              <li><b>Even/Odd</b> — bet on the total being Odd or Even. Pays 1:1, loses to any Triple.</li>
              <li><b>Total</b> — bet on totals 4-17. Payouts vary by total.</li>
              <li><b>Single</b> — bet on a dice face value. 1 match = 1:1, 2 matches = 2:1, 3 matches = 3:1.</li>
              <li><b>Double</b> — 2 of 3 dice must match. Pays 8:1.</li>
              <li><b>Triple</b> — all 3 dice must match. Pays 150:1.</li>
              <li><b>Any Triple</b> — covers all six triples. Pays 30:1.</li>
              <li><b>Combination</b> — 15 possible 2-dice combinations. Pays 5:1.</li>
            </ul>
          </li>
        </ul>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Payouts :</h6>
        <table className="table">
          <thead><tr><th>Bet</th><th>Payout</th></tr></thead>
          <tbody>
            <tr><td>Small/Big</td><td>1:1</td></tr>
            <tr><td>Even/Odd</td><td>1:1</td></tr>
            <tr><td>Double</td><td>8:1</td></tr>
            <tr><td>Triple</td><td>150:1</td></tr>
            <tr><td>Any Triple</td><td>30:1</td></tr>
            <tr><td>Total 4 or 17</td><td>50:1</td></tr>
            <tr><td>Total 5 or 16</td><td>20:1</td></tr>
            <tr><td>Total 6 or 15</td><td>15:1</td></tr>
            <tr><td>Total 7 or 14</td><td>12:1</td></tr>
            <tr><td>Total 8 or 13</td><td>8:1</td></tr>
            <tr><td>Total 9 or 12</td><td>6:1</td></tr>
            <tr><td>Total 10 or 11</td><td>6:1</td></tr>
            <tr><td>Combination</td><td>5:1</td></tr>
            <tr><td colSpan="2">
              <div className="d-flex justify-content-between">
                <div><ul className="list-style"><li>Single</li><li>Double</li><li>Triple</li></ul></div>
                <div><div>1:1</div><div>2:1</div><div>3:1</div></div>
              </div>
            </td></tr>
          </tbody>
        </table>
        <p>Malfunction voids all pays and play.</p>
      </div>
    </>
  );
}
