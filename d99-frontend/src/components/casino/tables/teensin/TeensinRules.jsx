export default function TeensinRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
      `}</style>
      <div className="rules-section">
        <p>Here We use total of 29 cards :</p>
        <ul className="pl-2 pr-2 mt-2 list-style">
          <li>2*4 ( All four color of 2 )</li>
          <li>3*4 ( All four color of 3)</li>
          <li>4*4 ( All four color of 4 )</li>
          <li>5*4</li>
          <li>6*4</li>
          <li>7*4</li>
          <li>8*4</li>
          <li>9 of spade .</li>
          <li>It is played between two players A and B each player will get 3 cards .</li>
        </ul>
        <p><b>To win regular bet there is two criteria :</b></p>
        <ul className="pl-2 pr-2 mt-2 list-style">
          <li>1st : If any player has trio he will win if both have trio the one who has got higher trio will win .</li>
          <li>2nd : If nobody has trio baccarat value will be compared . Higher baccarat value game will win .</li>
          <li>To get the baccarat value , from the total of three cards last digit will be taken as baccarat value .</li>
          <li>Point Value of cards :</li>
          <li>2=2</li>
          <li>3=3</li>
          <li>4=4</li>
          <li>5=5</li>
          <li>6=6</li>
          <li>7=7</li>
          <li>8=8</li>
          <li>9=9</li>
        </ul>
        <p><b>Note : Suits doesnt matter in point value of cards</b></p>
        <p>Example : 2,5,8</p>
        <p>2+5+8 = 15 , here last digit is 5 so baccarat value is 5</p>
        <p>If the total is in single digit 2,2,3</p>
        <p>2+2+3 =7 , in this case the single digit is 7 is considered as baccarat value</p>
        <p><b>If both players have same baccarat value then highest card of both the game will be compared whose card is higher will win .</b></p>
        <ul className="pl-2 pr-2 mt-2 list-style">
          <li>If 1st highest card is equal , then 2nd high card will be compared</li>
          <li>If 2nd highest card is equal , then 3rd high card will be compared</li>
          <li>If 3rd highest card is equal , then game will be tied and Money will be returned.</li>
        </ul>
      </div>
      <div>
        <div className="rules-section">
          <p><b>Fancy:</b></p>
          <p><b>HIGH CARD :</b></p>
          <p>It is comparison of the high value card of both the game , the game having higher high value card then other game will win . if high value card is same the 2nd high card will be compared if 2nd high card is same then 3rd high card will be compared . If 3rd high card is same then game is tie .</p>
          <p><b>Money return :</b></p>
          <p><b>PAIR :</b></p>
          <p>You can bet for pair on any of your selected game</p>
          <p>Only condition is If you bet for pair you must have pair in that game .</p>
          <p><b>Example :</b></p>
          <p>6,6,4</p>
          <p>5,5,2</p>
          <p>4,4,4 ( trio will be also considerd as a Pair )</p>
          <p><b>LUCKY 9 :</b></p>
          <p>It is bet for having card 9 among any of total six card of both games .</p>
          <p><b>COLOR PLUS :</b></p>
          <p>You can bet for color plus on any game A or B .</p>
          <p>If you bet on color plus you get 4 option to win price</p>
          <p>if you have</p>
          <ul className="pl-2 pr-2 mt-2 list-style">
            <li>1. sequence 3.4,5 of different suit , You will get 2 times of betting amount .</li>
            <li>2. if you get color 3,5,7 of same suit , you will get 5 times of betting amount</li>
            <li>3. If you get trio 4,4,4 , You will get 20 times of betting amount .</li>
            <li>4. If you get pure sequence 4,5,6 of same suit , You will get 30 times of betting amount .</li>
          </ul>
          <p>If you get pure sequence you will not get price of color and simple sequence</p>
          <p>Means you will get only one price in any case</p>
        </div>
      </div>
    </div>
  );
}
