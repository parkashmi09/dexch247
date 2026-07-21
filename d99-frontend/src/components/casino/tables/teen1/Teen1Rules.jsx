export default function Teen1Rules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
      `}</style>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>1 CARD ONE-DAY is a very easy and fast paced game.</li>
          <li>This game is played with 8 decks of regular 52 cards between the player and dealer.</li>
          <li>Both, the player and dealer will be dealt one card each.</li>
          <li>The objective of the game is to guess whether the player or dealer will draw a card of the higher value and will therefore win.</li>
          <li>You can place your bets on the player as well as dealer.</li>
          <li>You have a betting option of Back and Lay for the main bet.</li>
          <li><b>Ranking of cards :</b> from lowest to highest</li>
          <li>2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 , J , Q , K , A</li>
          <li>If the player and dealer both have the same hand with the same ranking cards but of different suits then the winner will be decided according to the order of the suits.</li>
          <li><b>Order of suits :</b> from highest to lowest</li>
          <li>Spades , Hearts , Clubs , Diamonds</li>
          <li>eg      Clubs  ACE               Diamonds    ACE</li>
          <li>Here ACE of Clubs wins.</li>
          <li><b>TIE :</b> If both,the player and dealer hands have the same ranking cards which are of the same suit then it will be a TIE. In that case bets placed (Back and Lay) on both the player and dealer will be returned. (pushed)</li>
          <li>eg:  Ace of Spades                Ace of Spades</li>
          <li><b>7 DOWN   7 UP :</b> Here you can bet whether it will be a 7Down card or a 7UP card irrespective of suits.</li>
          <li><b>7DOWN cards:</b> A, 2, 3, 4, 5, 6</li>
          <li><b>7UP cards :</b> 8, 9, 10, J, Q, K</li>
          <li><b>CARD  7 :</b> If the card drawn is 7, bets placed on both, 7Down and 7Up will lose half of the bet amount.</li>
          <li>For 7Down- 7Up you can bet on either or both the player and dealer.</li>
          <li><b>Note :</b> In case of a <b>TIE</b> between the player and dealer, bets placed on 7Down and 7Up will be considered valid.</li>
        </ul>
      </div>
    </div>
  );
}
