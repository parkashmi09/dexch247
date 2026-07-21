export default function TeenmufRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
        .rules-section .card-character { font-family: Card Characters; }
        .rules-section .red-card { color: red; }
        .rules-section .black-card { color: black; }
        .rules-section .cards-box { background: #fff; padding: 6px; display: inline-block; color: #000; min-width: 150px; }
        .rules-section .ml-1 { margin-left: .25rem !important; }
        .rules-section img { height: 30px; margin-right: 5px; }
      `}</style>

      <div className="rules-section">
        <h6 className="rules-highlight">Main Bet:</h6>
        <ul className="pl-2 pr-2 list-style">
          <li><b>It is played with regular 52 card deck</b> between two teams .A &amp; B.</li>
          <li><b>Lowest of the 2 games will win.</b></li>
          <li>In regular teenpatti
            <div className="cards-box">
              <span className="card-character black-card ml-1">2]</span>
              <span className="card-character black-card ml-1">3&#125;</span>
              <span className="card-character red-card ml-1">5&#123;</span>
            </div>
            of different color(suits) is the lowest game, But in this game it is the best game.
          </li>
          <li>In regular teenpatti
            <div className="cards-box">
              <span className="card-character black-card ml-1">Q&#125;</span>
              <span className="card-character black-card ml-1">K&#125;</span>
              <span className="card-character black-card ml-1">A&#125;</span>
            </div>
            of same color(suits) is the highest game, But it is the worst game.
          </li>
        </ul>
      </div>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Fancy:</h6>
          <h6 className="rules-sub-highlight">TOP9</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>Here, 2 conditions apply:</li>
            <li>Condition 1<div>Game must not have,</div></li>
          </ul>
          <ul className="pl-4 pr-4 list-style">
            <li>Pair</li>
            <li>Color</li>
            <li>Sequence</li>
            <li>Trio</li>
            <li>Pure sequence</li>
          </ul>
          <ul className="pl-2 pr-2 list-style">
            <li>Condition 2</li>
          </ul>
          <ul className="pl-4 pr-4 list-style">
            <li>If your game has the highest card of <b>9</b>, you will receive triple(x3) amount of your betting value.</li>
            <li>If your game has the highest card of <b>8</b>, you will receive quadruple(x4) amount of your betting value.</li>
            <li>If your game has the highest card of <b>7</b>, you will will receive (x5) amount of your betting value.</li>
            <li>If your game has the highest card of <b>6</b>, you will receive (x8) amount of your betting value.</li>
            <li>If your game has the highest card of <b>5</b>, you will receive (x30) amount of your betting value.</li>
          </ul>
        </div>
      </div>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">M(muflis) bacarrat.:</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>Baccarat is where you take the last digit of the total of the 3 cards of the game.</li>
            <li>Value of cards are:</li>
          </ul>
          <ul className="pl-4 pr-4 list-style">
            <li>Ace = 1 point</li>
            <li>2 = 2 point</li>
            <li>3 = 3 point</li>
            <li>4 = 4 point</li>
            <li>5 = 5 point</li>
            <li>6 = 6 point</li>
            <li>7 = 7 point</li>
            <li>8 = 8 point</li>
            <li>9 = 9 point</li>
            <li>10 , jack , queen, king , all have zero points value( suit or color of the card doesn't matter in point value)</li>
          </ul>
          <h6 className="rules-sub-highlight">Example 1:</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>if game is
              <div className="pl-2 pr-2">2 ,5 ,8</div>
              <div className="pl-2 pr-2">2 + 5 + 8 = 15</div>
            </li>
            <li>Here last digit is 5</li>
            <li>So bacarrat value is 5</li>
          </ul>
          <h6 className="rules-sub-highlight">Example 2:</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>Game is
              <div className="pl-2 pr-2">1, 4, K</div>
              <div className="pl-2 pr-2">1 + 4 + 0 = 5</div>
            </li>
            <li>If answer is in one digit , then that one digit is considered as baccarat value.</li>
            <li>M baccarat is comparision of baccarat value of both the game.</li>
            <li>But here lower value baccarat will win.</li>
            <li>If baccarat value is tie of both the game then,</li>
            <li>game having lowest card will win.</li>
            <li>ace is highest card.</li>
            <li>&amp; 2 is lowest card.</li>
            <li>If lowest card of both game is equal then color will be compared.</li>
            <li>Diamond color is lowest.</li>
            <li>Then club then heart then spade.</li>
          </ul>
          <h6 className="rules-sub-highlight">Example:</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>
              <div>if bacarrat value is tie &amp; lowest card of game A is</div>
              <div className="cards-box pl-2 pr-2">
                <span className="card-character red-card ml-1">2&#123;</span>
              </div>
            </li>
            <li>
              <div>&amp; lowest card of game B is</div>
              <div className="cards-box pl-2 pr-2">
                <span className="card-character red-card ml-1">2[</span>
              </div>
            </li>
            <li>then game B will win.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
