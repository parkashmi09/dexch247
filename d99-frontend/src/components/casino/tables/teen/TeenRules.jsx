export default function TeenRules() {
  return (
    <>
      <div>
        <div className="rules-section">
          <ul className="pl-4 pr-4 list-style">
            <li>Teenpatti is an indian origin three cards game.</li>
            <li>This game is played with a regular 52 cards deck between Player A and Player B.</li>
            <li>The objective of the game is to make the best three cards hand as per the hand rankings and win.</li>
            <li>You have a betting option of Back and Lay for the main bet.</li>
            <li>Rankings of the card hands from highest to lowest:</li>
            <li>1. Straight Flush (pure Sequence)</li>
            <li>2. Trail (Three of a Kind)</li>
            <li>3. Straight (Sequence)</li>
            <li>4. Flush (Color)</li>
            <li>5. Pair (Two of a kind)</li>
            <li>6. High Card</li>
          </ul>
          <div>
            <img src="https://sitethemedata.com/v3/static/front/img/casino-rules/teen6.jpg" className="img-fluid" alt="Teen Patti Rules" />
          </div>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <div>
            <h6 className="rules-highlight">Side bets:</h6>
          </div>
          <ul className="pl-4 pr-4 list-style">
            <li><b>CONSECUTIVE CARDS:</b> It is a bet of having two or more consecutive cards in the game.</li>
            <li>eg: 2,3,5 &nbsp; 10,3,9 &nbsp; Q,5,K &nbsp; 6,7,8 &nbsp; A,K,7</li>
            <li>For both the players Back and Lay odds are available, you can bet on either or both the players.</li>
            <li><b>Odd - Even:</b> Here you can bet on every card whether it will be an odd card or an even card.</li>
            <li><b>ODD CARDS:</b> A,3,5,7,9,J,K</li>
            <li><b>EVEN CARDS:</b> 2,4,6,8,10,Q</li>
            <li><b>NOTE:</b> In case of a Tie between the player A and player B bets placed on player A and player B (Main bets) will be returned. (Pushed)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
