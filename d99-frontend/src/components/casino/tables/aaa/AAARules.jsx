export default function AAARules() {
  return (
    <>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>If the card is ACE,2,3,4,5, or 6 Amar Wins.</li>
          <li>If the card is 7,8,9 or 10 Akbar wins.</li>
          <li>If the card is J,Q or K Anthony wins.</li>
        </ul>
      </div>
      <div className="rules-section">
        <p>
          <b className="rules-sub-highlight">EVEN</b>
          <span className="ml-2">(PAYOUT 2.12)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>If the card is 2 , 4 , 6 , 8 , 10 , Q</li>
        </ul>
        <p>
          <b className="rules-sub-highlight">ODD</b>
          <span className="ml-2">(PAYOUT 1.83)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>If the card is A , 3 , 5 , 7 , 9 , J , K</li>
        </ul>
        <p>
          <b className="rules-sub-highlight">RED</b>
          <span className="ml-2">(PAYOUT 1.97)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>If the card color is DIAMOND or HEART</li>
        </ul>
        <p>
          <b className="rules-sub-highlight">BLACK</b>
          <span className="ml-2">(PAYOUT 1.97)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>If the card color is CLUB or SPADE</li>
        </ul>
        <p>
          <b className="rules-sub-highlight">UNDER 7</b>
          <span className="ml-2">(PAYOUT 2.0)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>If the card is A , 2 , 3 , 4 , 5 , 6</li>
        </ul>
        <p>
          <b className="rules-sub-highlight">OVER 7</b>
          <span className="ml-2">(PAYOUT 2.0)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>If the card is 8 , 9 , 10 , J , Q , K</li>
        </ul>
        <p>
          <b>Note: </b>
          <span>If the card is 7, Bets on under 7 and over 7 will lose 50% of the bet amount.</span>
        </p>
        <p>
          <b className="rules-sub-highlight">CARDS</b>
          <span className="ml-2">(PAYOUT 12.0)</span>
        </p>
        <ul className="pl-4 pr-4 list-style">
          <li>A , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 , J , Q , K</li>
        </ul>
      </div>
    </>
  );
}
