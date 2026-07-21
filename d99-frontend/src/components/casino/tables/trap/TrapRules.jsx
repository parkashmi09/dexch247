export default function TrapRules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
      `}</style>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>Trap is a 52 card deck game.</li>
          <li>Keeping Ace= 1 point, 2= 2 points, 3= 3 points, 4= 4 points, 5= 5 points, 6= 6 points, 7=7 points, 8= 8 Points, 9= 9 points, 10= 10 points, Jack= 11 points, Queen= 12 points and King= 13 points.</li>
          <li>Here there are two sides in TRAP. A and B respectively.</li>
          <li>First card that will open in the game would be from side 'A', next card will open in the game from Side 'B'. Likewise till the end of the game.</li>
          <li>Any side that crosses a total score of 15 would be the winner of the game. For Example: the total score should be 16 or above.</li>
          <li>But if at any stage your score is at 13, 14, 15 then you will get into the trap which ideally means you lose.</li>
          <li>Hence there are only two conditions from which you can decide the winner here either your opponent has to be trapped in the score of 13, 14, 15 or your total score should be above 15.</li>
        </ul>
      </div>
    </div>
  );
}
