export default function DTL20Rules() {
  return (
    <div className="rules-section">
      <ul className="pl-4 pr-4 list-style">
        <li>20-20 DTL(Dragon Tiger Lion) is a 52 playing cards game, In DTL game 3 hands are dealt: for each 3 player. The player will bets which will win. </li>
        <li>The ranking of cards is, from lowest to highest: Ace, 2, 3, 4, 5, 6, 7,8, 9, 10, Jack, Queen and King when Ace is "1" and King is "13".</li>
        <li>On same card with different suit, Winner will be declare based on below winning suit sequence.
          <p>
            <div className="cards-box">
              <span className="card-character black-card ml-1">{"1}"}</span>
              <span>1st</span>
            </div>
          </p>
          <p>
            <div className="cards-box">
              <span className="card-character red-card ml-1">{"1{"}</span>
              <span>2nd</span>
            </div>
          </p>
          <p>
            <div className="cards-box">
              <span className="card-character black-card ml-1">{"1]"}</span>
              <span>3rd</span>
            </div>
          </p>
          <p>
            <div className="cards-box">
              <span className="card-character red-card ml-1">{"1["}</span>
              <span>4th</span>
            </div>
          </p>
        </li>
      </ul>
    </div>
  );
}
