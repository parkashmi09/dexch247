export default function NotenumRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
      `}</style>

      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>This game is played with 80 cards containing two decks of fourty cards each.</li>
          <li>Each deck contains cards from Ace to 10 of all four suits (It means There is no Jack, No Queen and No King in this game ).</li>
          <li>This game is for Fancy bet lovers.</li>
        </ul>
      </div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Odd and Even Cards :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>To bet on odd card or even card , Betting odds are available on every cards.</li>
          <li>Both back and Lay price is available for both, odd and even.</li>
          <li>(Here 2,4,6,8 and 10 are named Even Card.)</li>
          <li>(Here 1,3,5,7, and 9 are named Odd Card.)</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Red and Black Cards :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>To bet on Red card or Black Card bettings odds are available on every cards .</li>
          <li>(Here Heart and Diamond are named Red Card )</li>
          <li>(Spade and Club are named Black Card )</li>
          <li>Both Back and Lay price is available for both, Red card and Black Card.</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Low and High cards :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>To bet on Low or High card bettings odds are available on every cards .</li>
          <li>(Here Ace ,2,3,4, and 5 are named low Card )</li>
          <li>( Here 6,7,8,9 and 10 are named High card )</li>
          <li>Both back and lay price is available for both, Low card and High Card .</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Baccarat :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>In this game six cards will open.</li>
          <li>For this bet this six cards are divided in two groups i.e. Baccarat 1 and Baccarat 2.</li>
          <li>Baccarat 1 is 1st, 2nd and 3rd cards to be open.</li>
          <li>Baccarat 2 is 4th ,5th and 6th cards to be open.</li>
          <li>This is a bet for comparison of Baccarat value of both the group i.e. Baccarat 1 and Baccarat 2.</li>
          <li>The group having higher baccarat value will win.</li>
          <li>To calculate baccarat value we will add point value of all three cards of that group and We will take last digit of that total as Baccarat value .</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Point Value of cards :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>Ace = 1</li>
          <li>2 = 2</li>
          <li>3 = 3</li>
          <li>4 = 4</li>
          <li>5 = 5</li>
          <li>6 = 6</li>
          <li>7 = 7</li>
          <li>8 = 8</li>
          <li>9 = 9</li>
          <li>10 = 0</li>
        </ul>
        <p><b>Example:</b></p>
        <ul className="pl-4 pr-4 list-style">
          <li>Suppose three cards are 2,5,8</li>
          <li>2+5+8 = 15 , Here last digit is 5 so baccarat value is 5 .</li>
          <li>1,2,4</li>
          <li>1+2+4 = 7 , In this case total is in single digit so we will take that single digit as baccarat value i.e. 7</li>
          <li>Note : In case If baccarat value of both the group is equal , In that case half of the betting amount will be returned.</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">FIX Point Card :</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>It is a bet for selecting any fix point card ( Suits are irrelevant ).</li>
        </ul>
      </div></div>
    </div>
  );
}
