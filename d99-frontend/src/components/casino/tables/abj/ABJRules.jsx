export default function ABJRules() {
  return (
    <>
      <div className="rules-section">
        <h6 className="rules-highlight">Rules</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>
            Andar Bahar is a very simple game that involves the use of a single pack of cards.Game is played between the House and the Player. The dealer deals a single card face up on the Joker place and then proceeds to deal cards face up on A (ANDAR) and B (BAHAR)
            spots. When a card appears that matches the value of the Joker card then the game ends. Before the start of the game, players bet on which side they think the game will end.
          </li>
          <li>
            Before dealer starts dealing/opening cards from the deck, he/she also offers a side bet to the players who have estimated time to bet if the card/joker will be dealt as the 1st card.
          </li>
          <li>
            If the 1st placed card doesn't match the value of the Joker's card, the game continues and the dealer then offers the option to players to put their 2nd bet on the same joker card to be dealt either on ANDAR or on BAHAR. The players again have estimated
            time to decide if they want to place a 2nd bet. Dealer deals the cards one at a time alternating between two spots.
          </li>
          <li>If the 1st dealt card in 1st bet matches the joker's card, Bahar side wins with payout 1:0,5</li>
          <li>If the 1st dealt card in 1st bet matches the joker's card, Andar side wins with payout 1:0,5</li>
          <li>If the 2nd dealt card in 1st bet matches the joker's card, Bahar side wins with payout 1:0,5</li>
          <li>If the 2nd dealt card in 1st bet matches the joker's card, Andar side wins with payou 1:0,5</li>
        </ul>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">Payout</h6>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Bet</th>
                <th>Description</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1st Bet Bahar</td><td>Payout if Bahar Wins on the 1st bet</td><td>1 to 1</td></tr>
              <tr><td>1st Bet Andar</td><td>Payout if Andar wins on the 1st bet</td><td>1 to 1</td></tr>
              <tr><td>2nd Bet Bahar</td><td>Payout if Bahar wins on the 2nd bet</td><td>1 to 1</td></tr>
              <tr><td>2nd Bet Andar</td><td>Payout if Andar wins on the 1st bet</td><td>1 to 1</td></tr>
              <tr><td>Side Bets Bahar</td><td>Payout for winning side bet.</td><td>1 to 14</td></tr>
              <tr><td>Side Bets Andar</td><td>Payout for winning side bet.</td><td>1 to 14</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
