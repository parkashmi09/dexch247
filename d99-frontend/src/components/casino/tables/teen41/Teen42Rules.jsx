export default function Teen42Rules() {
  return (
    <>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>Jack top teenpatti is a unique version of Indian origin game teenpatti (Flush).</li>
          <li>This game is played with a regular 52 cards deck between player A and player B.</li>
          <li>In Jack top open teenpatti all three cards of player A will be pre-defined for all the games. These three cards will be permanently placed on the table.
            <h6>3 pre-defined cards of player A</h6>
            <ul className="pl-4 pr-4 list-style">
              <li>Jack of clubs</li>
              <li>10 of Spades</li>
              <li>8 of Spades</li>
            </ul>
          </li>
          <li>So now the game will begin with the remaining 49 cards (52-3 pre-defined cards = 49).</li>
          <li>Jack top open teenpatti is a three-card game. Three cards will be dealt to player B simultaneously (at the same time) which will decide the result of the game Hence that particular game will be over.</li>
          <li>Now always the last three drawn cards of player B will be removed and kept aside thereafter a new game will commence from the remaining 46 cards then the same process will continue till both players have winning chances or otherwise up to 36 cards or so.</li>
          <li>The objective of the game is to make the best three card hands as per the hand rankings and therefor win.
            <h6>Ranking of card hands from Highest to Lowest</h6>
            <ul className="pl-4 pr-4 list-style">
              <li>Straight Flush (Pure Sequence)</li>
              <li>Trail (Three of a kind)</li>
              <li>Straight (Sequence)</li>
              <li>Flush (Color)</li>
              <li>Pair (Two of a kind)</li>
              <li>High card</li>
              <li>You have betting options of Back and Lay.</li>
              <li>Side bet market will be considered valid though the game ends in Tie (No Result).</li>
            </ul>
          </li>
        </ul>
      </div>
      <div className="rules-section">
        <div><h6 className="rules-highlight">Side bet:</h6></div>
        <p><b>Under 21- Over 21:</b> It is a total point value of all three cards of Player B.</p>
        <ul className="pl-4 pr-4 list-style">
          <li>Here you can bet whether the total point value of all the 3 cards of player B will be under 21 or over 21.</li>
          <li><b>Point Values:</b></li>
        </ul>
        <div>
          <table className="table">
            <tbody>
              <tr><td>A = 1</td><td>2 = 2</td><td>3 = 3</td><td>4 = 4</td><td>5 = 5</td></tr>
              <tr><td>6 = 6</td><td>7 = 7</td><td>8 = 8</td><td>9 = 9</td><td>10 = 10</td></tr>
              <tr><td colSpan="2">J = 11</td><td colSpan="2">Q = 12</td><td>K = 13</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
