export default function Cmeter1Rules() {
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
          <li>1 Card meter will be played with 8 deck of cards.</li>
          <li>In this game the value of the cards will be as follow
            <p>ACE =1, 2=2, 3=3, ……, Jack =11, Queen=12, King=13.</p>
          </li>
          <li>In this game there will be two players which will be named as Fighter A &amp; Fighter B.</li>
          <li>1 card each will be dealt to both the fighters.</li>
          <li>In this game the winner will be the fighter who will have the higher value card and also his point difference will be calculated.</li>
        </ul>
        <p>For example,</p>
        <p>Fighter A has 7.</p>
        <p>Fighter B has King (K).</p>
        <p>So fighter B will be the winner with 6 points (13-7 = 6).</p>
        <p>here the winning amount will be calculated on the point differences.</p>
        <p>Like,</p>
        <p>1 point 1 time bet amount.</p>
        <p>2 points 2 times bet amount.</p>
        <p>3 points 3 times bet amount.</p>
        <p>4 points 4 times bet amount.</p>
        <p>5 points 5 times bet amount.</p>
        <p>6 points 6 times bet amount.</p>
        <p>7 points 7 times bet amount.</p>
        <p>8 points 8 times bet amount.</p>
        <p>9 points 9 times bet amount.</p>
        <p>10 points 10 times bet amount.</p>
        <p>11 points 11 times bet amount.</p>
        <p>12 points 12 times bet amount.</p>
        <p>(12 times bet amount will be the highest)</p>
        <p>So in this case the difference is 6 points thus the winning amount for Fighter B will be 6 times of the bet amount and similarly For Fighter A the losing amount will be 6 times of the bet amount.</p>
        <ul className="pl-4 pr-4 list-style">
          <li>In this game If punter place bet of 100 amount &amp; If he loses by 12 points then he will lose 1200 amount.
            <p>In short in this game punter can win or lose up to 12 times of his betting amount.</p>
          </li>
          <li>If both the fighters have same value cards but of different suits then the winner will be decided by the ranking of the suits
            <p>Ie. Spades hearts clubs diamonds</p>
            <p>And in this case the winning amount will be 1 time of the bet amount.</p>
            <p>If both the fighters have the same value cards and of the same suits then in this case it will be a tie and the bet amount will be pushed( Returned)</p>
          </li>
          <li>2% will be charged on winning amount only.</li>
        </ul>
      </div>
    </div>
  );
}
