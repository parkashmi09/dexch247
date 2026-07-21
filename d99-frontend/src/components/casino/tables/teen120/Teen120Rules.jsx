export default function Teen120Rules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
      `}</style>

      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>1 CARD 20-20 is a very easy and fast paced game.</li>
          <li>This game is played with 8 decks of regular 52 cards between the player and dealer.</li>
          <li>Both, the player and dealer will be dealt one card each.</li>
          <li>The objective of the game is to guess whether the player or dealer will draw a card of the higher value and will therefore win.</li>
          <li>You can place your bets on the player as well as dealer.</li>
          <li><b>Ranking of cards :</b> from lowest to highest</li>
          <li>2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 , J , Q , K , A</li>
          <li>If the player and dealer both have the same hands with the same ranking cards but of different suits then the winner will be decided according to the order of the suits</li>
          <li><b>Order of suits :</b> from highest to lowest</li>
          <li>Spades , Hearts , Clubs , Diamonds</li>
          <li>eg      Clubs  ACE               Diamonds    ACE</li>
          <li>Here ACE of Clubs wins.</li>
          <li>If both,the player and dealer hands have the same ranking cards which are of the same suit, then it will be a TIE.</li>
          <li>eg      Spades ACE             Spades ACE</li>
          <li>In case of a TIE ,bets placed on both the player and dealer will lose the bet amount.</li>
        </ul>
      </div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Side Bets</h6>
        <ul className="pl-4 pr-4 list-style">
          <li><b>Pair :</b> Here you can bet that both, the player and dealer will have the same ranking cards irrespective of suits</li>
          <li><b>Tie :</b> Here you can bet that the game will be a Tie.</li>
          <li><b>Note :</b> In case of a Tie between the player and dealer, bets placed on Side bets will be considered valid.</li>
        </ul>
      </div></div>
    </div>
  );
}
