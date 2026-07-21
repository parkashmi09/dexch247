export default function Poison20Rules() {
  return (
    <div>
      <style>{`
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section img { max-width: 100%; }
      `}</style>
      <div className="rules-section">
      <p>Welcome to <b>Teenpatti Poison 20-20</b>, a new variation of Teenpatti.</p>
      <p>As Teenpatti games are becoming more and more famous and popular on our platforms, we are excited to introduce you to <b>Teenpatti Poison 20-20</b>. The game follows the same standard rules of Teenpatti but at the beginning of the round the dealer draws a <b>Poison</b> card before dealing to the players. <b>The Poison</b> card is toxic and makes the player lose as soon as any player gets it. If no <b>Poison</b> card is dealt then the game continues as per Teenpatti standard rules.</p>
      <p>For Example:</p>
      <img src="/assets/img/casino-rules/joker3.jpg" className="img-fluid" alt="" />
      <p>Player A wins because Player B is dealt with <b>THE POISON</b> card.</p>
      <h4>Standard Rules.</h4>
      <div>
        <img src="/assets/img/casino-rules/teen6.jpg" className="img-fluid" alt="" />
      </div>
      </div>
    </div>
  );
}
