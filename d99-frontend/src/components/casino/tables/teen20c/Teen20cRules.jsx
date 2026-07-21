export default function Teen20cRules() {
  return (
    <>
      <div>
        <div className="rules-section">
          <ul className="pl-2 pr-2 list-style">
            <li>The game is played with a regular 52 cards single deck, between 2 players A and B.</li>
            <li>Each player will receive 3 cards.</li>
            <li><b>Rules of regular teenpatti winner</b></li>
          </ul>
          <div>
            <img src="https://sitethemedata.com/casino-new-rules-images/teen20b.jpg" alt="" />
          </div>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Rules of 3 baccarat</h6>
          <p>There are 3 criteria for winning the 3 Baccarat .</p>
          <span className="rules-sub-highlight">First criteria:</span>
          <ul className="pl-2 pr-2 list-style">
            <li>Game having trio will win,</li>
            <li>If both game has trio then higher trio will win.</li>
            <li>Ranking of trio from high to low.
              <div className="pl-2 pr-2">1,1,1</div>
              <div className="pl-2 pr-2">K,K,K</div>
              <div className="pl-2 pr-2">Q,Q,Q</div>
              <div className="pl-2 pr-2">J,J,J</div>
              <div className="pl-2 pr-2">10,10,10</div>
              <div className="pl-2 pr-2">9,9,9</div>
              <div className="pl-2 pr-2">8,8,8</div>
              <div className="pl-2 pr-2">7,7,7</div>
              <div className="pl-2 pr-2">6,6,6</div>
              <div className="pl-2 pr-2">5,5,5</div>
              <div className="pl-2 pr-2">4,4,4</div>
              <div className="pl-2 pr-2">3,3,3</div>
              <div className="pl-2 pr-2">2,2,2</div>
            </li>
            <li>If none of the game have got trio then second criteria will apply.</li>
          </ul>
          <span className="rules-sub-highlight">Second criteria:</span>
          <ul className="pl-2 pr-2 list-style">
            <li>Game having all the three face card will win.</li>
            <li>Here JACK, QUEEN AND KING are named face card.</li>
            <li>if both the game have all three face cards then game having highest face card will win.</li>
            <li>Ranking of face card from High to low :
              <div className="pl-2 pr-2">Spade King</div>
              <div className="pl-2 pr-2">Heart King</div>
              <div className="pl-2 pr-2">Club King</div>
              <div className="pl-2 pr-2">Diamond King</div>
            </li>
            <li>Same order will apply for Queen (Q) and Jack (J) also .</li>
            <li>If second criteria is also not applicable, then 3rd criteria will apply .</li>
          </ul>
          <span className="rules-sub-highlight">3rd criteria:</span>
          <ul className="pl-2 pr-2 list-style">
            <li>Game having higher baccarat value will win .</li>
            <li>For deciding baccarat value we will add point value of all the three cards</li>
            <li>Point value of all the cards :
              <div className="pl-2 pr-2">1 = 1</div>
              <div className="pl-2 pr-2">2 = 2</div>
              <div className="pl-2 pr-2">To</div>
              <div className="pl-2 pr-2">9 = 9</div>
              <div className="pl-2 pr-2">10, J ,Q, K has zero (0) point value .</div>
            </li>
          </ul>
          <p><b>Example 1st:</b></p>
          <ul className="pl-2 pr-2 list-style">
            <li>Last digit of total will be considered as baccarat value
              <div className="pl-2 pr-2">2,5,8 =</div>
              <div className="pl-2 pr-2">2+5+8 =15 here last digit of total is 5 , So baccarat value is 5.</div>
            </li>
          </ul>
          <p><b>Example 2nd :</b></p>
          <ul className="pl-2 pr-2 list-style">
            <li>1,3,K</li>
            <li>1+3+0 = 4 here total is in single digit so we will take this single digit 4 as baccarat value</li>
          </ul>
          <p><b>If baccarat value of both the game is equal then Following condition will apply :</b></p>
          <p><b>Condition 1 :</b></p>
          <ul className="pl-2 pr-2 list-style">
            <li>Game having more face card will win.</li>
            <li>Example : Game A has 3,4,k and B has 7,J,Q then game B will win as it has more face card then game A .</li>
          </ul>
          <p><b>Condition 2 :</b></p>
          <ul className="pl-2 pr-2 list-style">
            <li>If Number of face card of both the game are equal then higher value face card game will win.</li>
            <li>Example : Game A has 4,5,K (K Spade ) and Game B has 9,10,K ( K Heart ) here baccarat value of both the game is equal (9 ) and both the game have same number of face card so game A will win because It has got higher value face card then Game B .</li>
          </ul>
          <p><b>Condition 3 :</b></p>
          <ul className="pl-2 pr-2 list-style">
            <li>If baccarat value of both the game is equal and none of game has got face card then in this case Game having highest value point card will win .</li>
            <li>Value of Point Cards :
              <div className="pl-2 pr-2">Ace = 1</div>
              <div className="pl-2 pr-2">2 = 2</div>
              <div className="pl-2 pr-2">3 = 3</div>
              <div className="pl-2 pr-2">4 = 4</div>
              <div className="pl-2 pr-2">5 = 5</div>
              <div className="pl-2 pr-2">6 = 6</div>
              <div className="pl-2 pr-2">7 = 7</div>
              <div className="pl-2 pr-2">8 = 8</div>
              <div className="pl-2 pr-2">9 = 9</div>
              <div className="pl-2 pr-2">10 = 0 (Zero )</div>
            </li>
            <li>Example : GameA: 1,6,10 And GameB: 7,10,10</li>
            <li>here both the game have same baccarat value . But game B will win as it has higher value point card i.e. 7 .</li>
          </ul>
          <p><b>Condition 4 :</b></p>
          <ul className="pl-2 pr-2 list-style">
            <li>If baccarat value of both game is equal and none of game has got face card and high point card of both the game is of equal point value , then suits of both high card will be compared</li>
            <li>Example :
              <div className="pl-2 pr-2">Game A : 1(Heart) ,2(Heart) ,5(Heart)</div>
              <div className="pl-2 pr-2">Game B : 10 (Heart) , 3 (Diamond ) , 5 (Spade )</div>
            </li>
            <li>Here Baccarat value of both the game (8) is equal . and none of game has got face card and point value of both game's high card is equal so by comparing suits of both the high card ( A 5 of Heart , B 5 of spade ) game B is declared 3 Baccarat winner .</li>
            <li>Ranking of suits from High to low :
              <div className="pl-2 pr-2">Spade</div>
              <div className="pl-2 pr-2">Heart</div>
              <div className="pl-2 pr-2">Club</div>
              <div className="pl-2 pr-2">Diamond</div>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Rules of Total :</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>It is a comparison of total of all three cards of both the games.</li>
            <li>Point value of all the cards for the bet of total
              <div className="pl-2 pr-2">Ace = 1</div>
              <div className="pl-2 pr-2">2 = 2</div>
              <div className="pl-2 pr-2">3 = 3</div>
              <div className="pl-2 pr-2">4 = 4</div>
              <div className="pl-2 pr-2">5 = 5</div>
              <div className="pl-2 pr-2">6 = 6</div>
              <div className="pl-2 pr-2">7 = 7</div>
              <div className="pl-2 pr-2">8 = 8</div>
              <div className="pl-2 pr-2">9 = 9</div>
              <div className="pl-2 pr-2">10 = 10</div>
              <div className="pl-2 pr-2">Jack = 11</div>
              <div className="pl-2 pr-2">Queen = 12</div>
              <div className="pl-2 pr-2">King = 13</div>
            </li>
            <li>suits doesn't matter</li>
            <li>If total of both the game is equal , it is a Tie .</li>
            <li>If total of both the game is equal then half of your bet amount will returned.</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Rules of Pair Plus :</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>This bet provides multiple option to win a price .</li>
            <li>Option 1 : Pair</li>
            <li>If you got pair you will get equal value return of your betting amount .</li>
            <li>Option 2 : Flush</li>
            <li>If you have all three cards of same suits you will get 4 times return of your betting amount .</li>
            <li>Option 3 : Straight</li>
            <li>If you have straight ( three cards in sequence eg : 4,5,6 eg: J,Q,K ) (but king ,Ace ,2 is not a straight ) you will get six times return of your betting amount .</li>
            <li>Option 4 : Trio</li>
            <li>If you have got all the cards of same rank ( eg: 4,4,4 J,J,J ) you will get 30 times return of your betting amount .</li>
            <li>Option 5 : Straight Flush</li>
            <li>If you have straight of all three cards of same suits ( Three cards in sequence eg: 4,5,6 ) ( but King ,Ace ,2 is not straight ) you will get 40 times return of your betting amount .</li>
            <li>Note : If you have trio then you will receive price of trio only , In this case you will not receive price of pair .</li>
            <li>If you have straight flush you will receive price of straight flush only , In this case you will not receive price of straigh and flush .</li>
            <li>It means you will receive only one price whichever is higher .</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Rules of Color :</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>This is a bet for having more cards of red or Black (Heart and Diamond are named RED , Spade and Club are named BLACK ).</li>
            <li><b>NOTE :</b> For side bets you can place bets on either or both the players .</li>
            <li><b>NOTE :</b> In case of a tie between the player A and Player B bets placed on player A and Player B (Main Bets ) will be returned ( Pushed ).</li>
          </ul>
        </div>
      </div>
    </>
  );
}
