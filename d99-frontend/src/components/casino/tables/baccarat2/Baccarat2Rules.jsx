export default function Baccarat2Rules() {
  return (
    <>
      <div className="rules-section">
        <ul className="pl-2 pr-2 list-style">
          <li>In the Baccarat game two hands are dealt; once for the banker and another for the player. The player best which will win or if they will tie. The winning hand has the closest value to nine. In case of Banker winning, if banker's point sum is equals to 6, then payout will be 50%.</li>
        </ul>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Rules for Players:</h6>
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td rowSpan="3">When Player's first two cards total:</td>
                  <td>0-1-2-3-4-5</td>
                  <td>Draw a card</td>
                </tr>
                <tr>
                  <td>6-7</td>
                  <td>Stands</td>
                </tr>
                <tr>
                  <td>8-9</td>
                  <td>Natural-Neither hand draws</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Rules for Banker:</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>When the PLAYER stands on 6 or 7, the BANKER will always draw on totals of 0-1-2-3-4 and 5, and stands on 6-7-8 and 9.When the PLAYER does not have a natural, the BANKER shall draw on the totals of 0-1 or 2, and then observe the following rules:</li>
          </ul>
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td>When Banker's first two cards total:</td>
                  <td>Draws when Player's third card is:</td>
                  <td>Does not draw when Player's third card is:</td>
                </tr>
                <tr><td>3</td><td>1-2-3-4-5-6-7-9-0</td><td>8</td></tr>
                <tr><td>4</td><td>2-3-4-5-6-7</td><td>1-8-9-0</td></tr>
                <tr><td>5</td><td>4-5-6-7</td><td>1-2-3-8-9-0</td></tr>
                <tr><td>6</td><td>6-7</td><td>1-2-3-4-5-8-9-0</td></tr>
                <tr><td>7</td><td colSpan="2">STANDS</td></tr>
                <tr><td>8-9</td><td colSpan="2">NATURAL-NEITHER HAND DRAWS</td></tr>
              </tbody>
            </table>
          </div>
          <ul className="pl-2 pr-2 list-style">
            <li>If the PLAYER takes no third card BANKER stands on 6. The hand closest to 9 wins.All Winning bets are paid even money.TIE bets pay 8 for 1</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Side Bets:</h6>
          <ul className="pl-2 pr-2 list-style">
            <li><b>Player Pair</b> - Bet on the chance that the first two cards dealt to the player, are a pair.</li>
            <li><b>Banker Pair</b> - Bet on the chance that the first two cards dealt to the banker, are a pair.</li>
            <li>Select the Player/Banker winning score and get paid according to the payout shown. in the event of tie, bets on "Winning Total" are lost</li>
          </ul>
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td>1-4(7:5:1)</td>
                  <td>5-6(4:1)</td>
                  <td>7(4:5:1)</td>
                  <td>8(3:1)</td>
                  <td>9(2:5:1)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="pl-2 pr-2 list-style">
            <li>For example, if you believe the Player/Banker winning score will be '5-6'(meaning 5 or 6) then if this side bet wins you can win 4 times your side bet amount</li>
          </ul>
        </div>
      </div>
    </>
  );
}
