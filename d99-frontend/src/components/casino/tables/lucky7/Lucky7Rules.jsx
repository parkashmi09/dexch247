export default function Lucky7Rules() {
  return (
    <div className="rules-section">
      <ul className="pl-4 pr-4 list-style">
        <li>Lucky 7 is a 8 deck playing cards game, total 8 * 52 = 416 cards.</li>
        <li>If the card is from ACE to 6, LOW Wins.</li>
        <li>If the card is from 8 to KING, HIGH Wins.</li>
        <li>If the card is 7, bets on high and low will lose 50% of the bet amount.</li>
      </ul>
      <div>
        <b className="rules-sub-highlight">LOW:</b>1,2,3,4,5,6 | <b className="rules-sub-highlight">HIGH:</b>8,9,10,J,Q,K
      </div>
      <div>Payout:2.0</div>
      <br />
      <div>
        <b className="rules-sub-highlight">EVEN:</b>2,4,6,8,10,Q
      </div>
      <div>Payout:2.10</div>
      <br />
      <div>
        <b className="rules-sub-highlight">ODD:</b>1,3,5,7,9,J,K
      </div>
      <div>Payout:1.79</div>
      <br />
      <div>
        <b className="rules-sub-highlight">RED:</b>
      </div>
      <div>Payout:1.95</div>
      <br />
      <div>
        <b className="rules-sub-highlight">BLACK:</b>
      </div>
      <div>Payout:1.95</div>
      <br />
      <b className="rules-sub-highlight">CARDS:</b>1,2,3,4,5,6,7,8,9,10,J,Q,K
      <div>PAYOUT: 12.0</div>
    </div>
  );
}
