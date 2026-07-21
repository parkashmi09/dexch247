export default function AB4Rules() {
  return (
    <div className="rules-section">
      <ul className="pl-4 pr-4 list-style">
        <li>*Andar Bahar is an Indian origin game.</li>
        <li>*The game is played with 3 decks, totaling 156 cards (52 * 3 = 156)</li>
        <li>*This game is played between two sides: Andar and Bahar.</li>
        <li>*At the start of the game, the first card will be drawn on the Bahar side, but odds will be available for the Andar side.</li>
        <li>*When the card is drawn on the Andar side, odds will be available for the Bahar side, and so on.</li>
        <li>*The odds will be available on every card to place your bets up to the 144th card. After opening the 149th card, all remaining bets for the Andar side will be canceled(pushed) automatically.</li>
        <li>*The game will be considered over after the 150th card is drawn. The pending Bahar side bets will be canceled (pushed).</li>
        <li>*When you place a bet on the Andar side and the next card opens on the Bahar side with the same value, a 20% refund on the bet amount will be given to the client (valid for both Andar and Bahar sides).</li>
        <li>Example: If you place a bet of 100 points on the number 8 on the Andar side and the next card with the number 8 opens on the Bahar side, your bet loss will be only 80 points.</li>
        <li>*If the first card is not opened after the betted card, a winning payout of 100% of the bet amount will be given.</li>
      </ul>
    </div>
  );
}
