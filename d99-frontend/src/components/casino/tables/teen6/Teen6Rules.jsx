export default function Teen6Rules() {
  return (
    <div>
      <style>{`
        .rules-section .row.row5 { margin-left: -5px; margin-right: -5px; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
        .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] { padding-left: 5px; padding-right: 5px; }
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section::-webkit-scrollbar { width: 8px; }
        .rules-section::-webkit-scrollbar-track { background: #666666; }
        .rules-section::-webkit-scrollbar-thumb { background-color: #333333; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section img { max-width: 100%; }
      `}</style>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>Teenpatti is an indian origin three cards game</li>
          <li>This game is played with a regular 52 cards deck between Player A and Player B .</li>
          <li>The objective of the game is to make the best three cards hand as per the hand rankings and win.</li>
          <li>You have a betting option of Back and Lay for the main bet.</li>
          <li>Rankings of the card hands from highest to lowest :</li>
          <li>1. Straight Flush (pure Sequence )</li>
          <li>2. Trail  (Three of a Kind )</li>
          <li>3. Straight (Sequence)</li>
          <li>4. Flush (Color )</li>
          <li>5. Pair (Two of a kind )</li>
          <li>6. High Card </li>
        </ul>
        <div>
          <img src="/assets/img/casino-rules/teen6.jpg" className="img-fluid" alt="Teenpatti 2.0 Rules" />
        </div>
      </div>
      <div>
        <div className="rules-section">
          <div>
            <h6 className="rules-highlight">Side bets  :</h6>
          </div>
          <ul className="pl-4 pr-4 list-style">
            <li><b>Under 21 - Over 22 :</b> It is a total point value of all the three cards.</li>
            <li>here you can bet whether the total point value of all the 3 cards will be    Under 21 or Over 22.</li>
            <li><b>Point Values :</b>
              <div>A= 1</div>
              <div>2= 2</div>
              <div>3= 3</div>
              <div>4= 4</div>
              <div>5= 5</div>
              <div>6= 6</div>
              <div>7= 7</div>
              <div>8= 8</div>
              <div>9= 9</div>
              <div>10= 10</div>
              <div>J= 11</div>
              <div>Q= 12</div>
              <div>K= 13</div>
            </li>
            <li>you can bet on either or both the players .</li>
            <li><b>Suits:</b>
              <div>Here you can bet on every card whether it will be a Spade ,Heart,Club or a Diamond card .</div>
            </li>
            <li><b>Odd - Even :</b>
              <div>Here you can bet on every card whether it will be an Odd card or an Even card.</div>
            </li>
            <li><b>Odd Cards :</b> A,3,5,7,9,J,K</li>
            <li><b>Even Cards :</b> 2,4,6,8,10,Q</li>
            <li><b>Fix Cards :</b>
              <div>Here you can place bets on fix cards of your choice from Ace (A) to King (K). </div>
              <div>This bet is availabe for every card.  </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
