export default function Race17Rules() {
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
      `}</style>
      <div className="rules-section">
        <h6 className="rules-highlight">Main:</h6>
        <ul className="pl-2 pr-2 list-style">
          <li>It is played with regular 52 card deck.</li>
          <li>Value of</li>
        </ul>
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
          <li>Jack = 0</li>
          <li>Queen = 0</li>
          <li>King = 0</li>
        </ul>
        <ul className="pl-2 pr-2 list-style">
          <li>Five(5) card will be pulled from the deck.</li>
          <li>It is a race to reach 17 or plus.</li>
          <li>If you bet on 17(Back) , &amp; then,</li>
          <li>Total of given (5) cards, comes under seventeen(17) you loose.</li>
          <li>Total of (5) cards comes over sixteen(16) you win.</li>
        </ul>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Fancy :</h6>
          <h6 className="rules-sub-highlight">Big card(7,8,9)</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>here 7,8,9 are named big card.</li>
            <li>Back/ lay of big card rate is available to bet on every card.</li>
          </ul>
          <h6 className="rules-sub-highlight">Zero card(10, jack , queen, king).</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>here 10, jack, queen, king is named zero card.</li>
            <li>Back &amp; lay rate to bet on zero card is available on every card.</li>
          </ul>
          <h6 className="rules-sub-highlight">Any zero card.</h6>
          <ul className="pl-2 pr-2 list-style">
            <li>Here 10, jack, queen, king, is named zero card, it is bet for having at least one zero card in game( not necessary game will go up to 5 cards). You can bet on this before start of game only.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
