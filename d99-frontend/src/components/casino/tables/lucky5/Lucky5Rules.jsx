export default function Lucky5Rules() {
  return (
    <div className="rules-section">
      <p>* Lucky 6 is a 8 deck playing cards game, total 8 * 44 = 352 cards.<br />
        (Deck count A,1,2,3,4,5,6,7,8,9,10,j cards only)</p>
      <p>* If the card is from ACE to 5, LOW Wins.</p>
      <p>* If the card is from 7 to Jack, HIGH Wins.</p>
      <p>* If the card is 6, bets on high and low will lose 50% of the bet amount.</p>
      <br />
      <p>LOW: 1,2,3,4,5 &nbsp;|&nbsp; HIGH:7,8,9,10,J<br />Payout : 2.0</p>
      <br />
      <p>EVEN : 2,4,6,8,10<br />Payout : 2.1</p>
      <br />
      <p>ODD : 1,3,5,7,9,J<br />Payout : 1.79</p>
      <br />
      <p>RED : <span className="d-inline-block cards-box"> <span className="card-character red-card ml-1">{"{"}</span> Heart, <span className="card-character red-card ml-1">{"["}</span> Diamond</span><br />Payout :1.95</p>
      <br />
      <p>BLACK : <span className="d-inline-block cards-box"><span className="card-character black-card ml-1">{"}"}</span>Spade, <span className="card-character black-card ml-1">{"]"}</span> Club</span><br />Payout :1.95</p>
      <br />
      <p>CARDS :1,2,3,4,5,6,7,8,9,10,J<br />
        Payout&nbsp;:&nbsp;10.0</p>
    </div>
  );
}
