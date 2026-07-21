export default function Joker120Rules() {
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
        <p>Welcome to Unlimited Joker Teenpatti 20-20, a new version of Joker Teenpatti 20-20.</p>
        <p>
          Teenpatti games are the most popular on our platforms and we are very excited to announce
          this new version of Teenpatti called Unlimited Joker Teenpatti. To keep the game as simple
          as it is and make it more exciting, we have introduced a Joker to the game. The game
          follows the same standard rules of Teenpatti but at the beginning of the round players can
          select their own Joker that can act as any missing or highest card to make a high hand to
          defeat the opponent player OR play regular Teenpatti without selecting any Joker.
        </p>
        <p>For Example:</p>
        <img src="/assets/img/casino-rules/joker1-example.jpg" className="img-fluid" alt="Joker example 1" />
        <p>Player A wins because THE JOKER can act as the highest card.</p>
        <img src="/assets/img/casino-rules/joker2-example.jpg" className="img-fluid" alt="Joker example 2" />
        <p>Player A wins because THE JOKER can act as the highest color card.</p>
        <h4>Standard Rules.</h4>
        <div>
          <img src="/assets/img/casino-rules/teen6.jpg" className="img-fluid" alt="Standard Teenpatti Rules" />
        </div>
      </div>
    </div>
  );
}
