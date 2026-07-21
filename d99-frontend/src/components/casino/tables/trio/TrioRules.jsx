export default function TrioRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
      `}</style>

      <div className="rules-section">
        <h6 className="rules-highlight">Session :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a total of point value of all three cards .</li>
          <li>Point Value of Cards ( Suits doesn't matter )
            <div className="pl-2 pr-2">Ace  = 1</div><div className="pl-2 pr-2">2 = 2</div><div className="pl-2 pr-2">3 = 3</div><div className="pl-2 pr-2">4 = 4</div><div className="pl-2 pr-2">5 = 5</div><div className="pl-2 pr-2">6 = 6</div><div className="pl-2 pr-2">7 = 7</div><div className="pl-2 pr-2">8 = 8</div><div className="pl-2 pr-2">9 = 9</div><div className="pl-2 pr-2">10 = 10</div><div className="pl-2 pr-2">Jack = 11</div><div className="pl-2 pr-2">Queen = 12</div><div className="pl-2 pr-2">King = 13</div>
          </li>
          <li>1+10+13 = 24 , Here session is 24.</li>
          <li>It is a bet for having session 21 Yes or No .</li>
          <li>Both back and lay rate of session 21 is available.</li>
        </ul>
      </div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">3 card Judgement :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>In this bet you are offered set of three cards from which atleast one card must come in game .</li>
          <li>Both Back and Lay rate is available for 3 card judgement.</li>
          <li>Two sets of three cards are offered for " 3 card Judgement " .</li>
          <li>Set One : (1,2,4 )</li>
          <li>Set 2 : ( Jack , queen , King )</li>
          <li>Suits doesn't matter .</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Two Red Only :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having two red cards only in the game (not more not less )</li>
          <li>(Here Heart and Diamond are named Red card).</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Two Black only :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having two black cards only in the game (not more not less )</li>
          <li>(Here Spade and Club are named Black card ).</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Two Odd only :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having two odd cards only in the game (not more not less ).</li>
          <li>1,3,5,7,9,Jack and King are named odd cards.</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Two Even only :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having two even cards only in the game (not more not less ).</li>
          <li>2,4,6,8,10 and Queen are named even cards .</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Pair :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having Two cards of same rank .</li>
          <li>( Trio is also valid for Pair ).</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Flush :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is bet for having all three cards of same suits .</li>
          <li>(If straight Flush come Flush is valid.)</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Straight :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is bet for having all three cards in the sequence .
            <div className="pl-2 pr-2">Eg : 4,5,6</div>
            <div className="pl-2 pr-2">Jack, Queen, King</div>
          </li>
          <li>(If Straight Flush come Straight is valid.)</li>
          <li>Note : King , Ace , 2 is not valid for straight .</li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Trio :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having all three cards of same rank .
            <div className="pl-2 pr-2">Eg: 4 Heart , 4 Spade , 4 Diamond</div>
            <div className="pl-2 pr-2">J Heart , J Club , J Diamond</div>
          </li>
        </ul>
      </div></div>

      <div><div className="rules-section">
        <h6 className="rules-highlight">Straight Flush :</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is a bet for having all three cards in a sequence and also of same suits .
            <div className="pl-2 pr-2">Eg : Jack (Heart), Queen (Heart ), King (Heart)</div>
            <div className="pl-2 pr-2">4 (Club), 5(Club) ,6 (Club )</div>
          </li>
          <li>Note : King , Ace and 2 is not valid for Straight Flush .</li>
        </ul>
      </div></div>
    </div>
  );
}
