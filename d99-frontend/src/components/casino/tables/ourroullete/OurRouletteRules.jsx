export default function OurRouletteRules() {
  return (
    <>
      <div className="rules-section">
        <p>Unique Roulette is a unique game compared to other traditional Roulette. This game is played with numbered cards from 0 to 36. Dealer will draw a card one by one until only one card is left in the deck. Only available numbers in the deck are open for bet in every round and odds are dynamics based on numbers left in the deck.</p>
        <p>Bets made on the numbered spaces on the betting area, or on the lines between them, are called Inside Bets, while bets made on the special boxes below and to the side of the main grid of numbers are called Outside Bets.</p>
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">INSIDE BETS:</h6>
        <ul className="pl-2 pr-2 list-style">
          <li><b>Straight Up</b> — place your chip directly on any single number (including zero).</li>
          <li><b>Split Bet</b> — place your chip on the line between any two numbers, either on the vertical or horizontal.</li>
          <li><b>Street Bet</b> — place your chip at the end of any row of numbers. A Street Bet covers remaining numbers on that Street.</li>
          <li><b>Corner Bet</b> — place your chip at the corner (central intersection) where four meet. All remaining numbers on that corner are covered.</li>
          <li><b>Line Bet</b> — place your chip at the end of two rows on the intersection between the two rows. A line bet covers all the remaining numbers in both rows.</li>
        </ul>
        <br /><br />
      </div>
      <div className="rules-section">
        <h6 className="rules-highlight">OUTSIDE BETS:</h6>
        <ul className="pl-2 pr-2 list-style">
          <li><b>Column Bet</b> — place your chip in one of the boxes marked "2 to 1" at the end of the column that covers all remaining numbers in that column. The zero is not covered by any column bet.</li>
          <li><b>Dozen Bet</b> — place your chip in one of the three boxes marked "1st 12," "2nd 12" or "3rd 12" to cover the remaining numbers alongside the box.</li>
          <li><b>Red/Black</b> — place your chip in the Red or Black box to cover the all remaining red or all remaining black numbers. The zero is not covered by these bets.</li>
          <li><b>Even/Odd</b> — place your chip in one of these boxes to cover the remaining even or remaining odd numbers. The zero is not covered by these bets.</li>
          <li><b>1-18/19-36</b> — place your chip in either of these boxes to cover the first or second set of remaining numbers. The zero is not covered by these bets.</li>
        </ul>
        <br />
      </div>
      <div className="rules-section">
        <p>Each bet covers a different set of numbers and offers different payout odds. Bet spots will be highlighted.</p>
        <p>Good Luck!!!</p>
      </div>
    </>
  );
}
