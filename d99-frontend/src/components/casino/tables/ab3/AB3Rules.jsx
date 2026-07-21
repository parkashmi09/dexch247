export default function AB3Rules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li { margin-bottom: 5px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
      `}</style>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>1. Andar Bahar is a fast paced Indian origin game.</li>
          <li>2. It is played with a regular deck of 52 cards.</li>
          <li>3. This game is played between two sides Andar and Bahar.</li>
          <li>4. The objective of the game is to place bet on cards of your choice whether they will be on the Andar side or the Bahar side and therefor win.</li>
          <li>5. The odds will be available on every card to place your bets upto 46th card.</li>
          <li>6. At the start of the game first card will be drawn on the Bahar side and the next card will be drawn on the Andar side and so on upto the 50th card.</li>
          <li>7. When the card is to be open on the Bahar side odds will be available for both the Andar side and the Bahar side.
            <ul className="pl-4 pr-4 list-style">
              <li>* If you place bets on the Bahar side and you win on that particular first card the payout will be 25% of your bet amount from 1st card to 31st card and from the 33rd card to 45th card the payout will be 20% of your bet amount.</li>
              <li>* Winning on all cards other than that particular first card payout will be 100%.</li>
            </ul>
          </li>
          <li>8. When the card is to be open on the Andar side the odds will be available only for the Bahar side. The payout will be 100% of your bet amount on all the cards.</li>
          <li>9. The game will be considered over after the 50th card is drawn. The pending bets on remaining 2 cards will be cancelled (Pushed).</li>
        </ul>
      </div>
    </div>
  );
}
