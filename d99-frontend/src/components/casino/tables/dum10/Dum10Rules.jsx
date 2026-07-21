export default function Dum10Rules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
      `}</style>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>Dus Ka Dum is an unique and instant result game.</li>
          <li>It is played with a regular single deck of 52 cards.</li>
          <li>In this game each card has point value</li>
        </ul>
        <h6 className="rules-highlight">Point value of cards:</h6>
        <div className="table-responsive">
          <table className="table">
            <tbody>
              <tr><td>Ace = 1</td><td>8 = 8</td></tr>
              <tr><td>2 = 2</td><td>9 = 9</td></tr>
              <tr><td>3 = 3</td><td>10 = 10</td></tr>
              <tr><td>4 = 4</td><td>J = 11</td></tr>
              <tr><td>5 = 5</td><td>Q = 12</td></tr>
              <tr><td>6 = 6</td><td>K = 13</td></tr>
              <tr><td>7 = 7</td></tr>
            </tbody>
          </table>
        </div>
        <p>(Suit of card is irrelevant in point value)</p>
        <ul className="pl-4 pr-4 list-style">
          <li>Dus ka Dum is a one card game. The dealer will draw a single card every time which will decide the result of the game. Hence that particular game will be over.</li>
          <li>Now always the last drawn card will be removed and kept aside. Thereafter a new game will commence from the remaining cards. Then the same process will continue till there is a winning chance or otherwise up to 35 cards or so.</li>
          <li>All the drawn cards will be added to current total.</li>
        </ul>
        <p>Example1:</p>
        <p>If first four drawn cards are: 7, 9, J, 4</p>
        <p>So current total is 31, now on opening of 5th card bet will be for next total 40 or more.</p>
        <p>Example2: If the current total of first 11 drawn cards is 84 the bet will open for next total 90 or more.</p>
        <p>Example3: The current total of first 12 drawn cards is 79 the bet will open for next total 90 or more (because on opening of any cards 80 is certainty).</p>
        <ul className="pl-4 pr-4 list-style">
          <li>The objective of the game is to achieve next (decade) total or more and therefor win.</li>
          <li>Both back and lay options will be available.</li>
        </ul>
      </div>
      <div><div className="rules-section">
        <h6 className="rules-highlight">Side bets:</h6>
        <p><span className="rules-sub-highlight">Odd even:</span> Here you can bet on every card whether it will be an odd card or an even card.</p>
        <p>Odd cards: A, 3, 5, 7, 9, J, K</p>
        <p>Even cards: 2, 4, 6, 8, 10, Q</p>
        <p><span className="rules-sub-highlight">Red Black:</span> Here you can bet on every card whether it will be a red card or a black card.</p>
        <p>Red cards: Hearts, Diamonds</p>
        <p>Black cards: Spades, Clubs</p>
      </div></div>
    </div>
  );
}
