export default function Teen3Rules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
      `}</style>

      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>Instant Teenpatti is a shorter version of Indian origin game teenpatti.</li>
          <li>This game is played with a regular 52 cards deck between Player A and Player B .</li>
          <li>In Instant Teenpatti all the three cards of Player A and the first two cards of Player B will be pre-defined for all the games .These five cards will be permanentley placed on the table .</li>
        </ul>
      </div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">3 Pre-defined cards of Player A :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>King of Spades</li>
          <li>Queen of Hearts</li>
          <li>10 of Diamonds</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">2 Pre-defined cards of Player B :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>9 of Clubs</li>
          <li>8 of Spades</li>
          <li>So now the game will begin with the remaining 47 cards</li>
          <li>(52-5 pre-defined cards = 47 )</li>
          <li>Instant Teenpatti is a one card game. one card will be dealt to Player B that will be the third and the last card of player B which will decide the result of the game. Hence that particular game will be over.</li>
          <li>Now always the last drawn card of player B will be removed and kept aside. Thereafter a new game will commence from the remaining 46 cards then the same process will continue till both the players have winning chances or otherwise upto 35 cards or so.</li>
          <li>The objective of the game is to make the best three card hands as per the hand rankings and therefor win.</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Rankings of card hands from Highest to Lowest :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>1. Straight Flush (Pure Sequence)</li>
          <li>2. Trail (Three of a Kind)</li>
          <li>3. Straight (Sequence)</li>
          <li>4. Flush (Color)</li>
          <li>5. Pair (Two of a Kind)</li>
          <li>6. High Card</li>
        </ul>
        <div>You have betting options of Back and Lay.</div>
      </div></div>
    </div>
  );
}
