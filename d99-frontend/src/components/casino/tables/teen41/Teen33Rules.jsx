export default function Teen33Rules() {
  return (
    <>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>Instant Teenpatti-3.0 is a shorter version of Indian origin game teenpatti.</li>
          <li>This game is played with a regular 52 cards deck between player A and Player B.</li>
          <li>In Instant Teenpatti 3.0 all three cards of Player A and first two cards of Player B will be pre-defined for all the games. These five cards will be permanently placed on the table</li>
        </ul>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">3 Pre-defined cards of Player A :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>9 of Clubs</li>
          <li>8 of Hearts</li>
          <li>6 of Spades</li>
        </ul>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">2 Pre-defined cards of Player B:</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>9 of Diamonds</li>
          <li>5 of Clubs</li>
          <li>So now the game will begin with the remaining 47 cards</li>
          <li>(52-5 pre-defined cards = 47)</li>
          <li>Instant Teenpatti-3.0 is a one card game. One card will be dealt to Player B that will be the third and last card of player B which will decide the result of the game. Hence that particular game will be over.</li>
          <li>Now always the last drawn card of player B will be removed and kept aside. Thereafter a new game will commence for the remaining 46 cards then the same process will continue till both the player have winning chances or otherwise upto 35 cards or so.</li>
          <li>The objective of the game is to make the best three card hands as per the hand rankings and therefor win.</li>
        </ul>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Rankings of cards hands from Highest to lowest:</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>1. Straight Flush (Pure Sequence)</li>
          <li>2. Trail (Three of a kind)</li>
          <li>3. Straight (Sequence)</li>
          <li>4. Flush (Color)</li>
          <li>5. Pair (Two of kind)</li>
          <li>6. High Card</li>
        </ul>
        <div>You have betting options of Back and Lay.</div>
      </div>
    </>
  );
}
