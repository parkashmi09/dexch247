export default function CmeterRules() {
  return (
    <div>
      <style>{`
        .rules-section .row.row5 { margin-left: -5px; margin-right: -5px; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
        .rules-section .pl-4 { padding-left: 1.5rem !important; }
        .rules-section .pr-4 { padding-right: 1.5rem !important; }
        .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] { padding-left: 5px; padding-right: 5px; }
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section::-webkit-scrollbar { width: 8px; }
        .rules-section::-webkit-scrollbar-track { background: #666666; }
        .rules-section::-webkit-scrollbar-thumb { background-color: #333333; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
      `}</style>
      <div className="rules-section">
        <div>
          <img src="/assets/img/casino-rules/cmeter.jpg" className="img-fluid" alt="Casino Meter Rules" />
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Low Zone:</h6>
          <ul className="pl-4 pr-4 list-style">
            <li>The Player who bet on Low Zone will have all cards from Ace to 8 of all suits 3 cards of 9, Heart , Club &amp; Diamond.</li>
          </ul>
          <h6 className="rules-highlight">High Zone:</h6>
          <ul className="pl-4 pr-4 list-style">
            <li>The Player who bet on high Zone will have all the cards of JQK of all suits plus 3 cards of 10, Heart, Club &amp; Diamond.</li>
          </ul>
          <h6 className="rules-highlight">Spade 9 &amp; Spade 10:</h6>
          <ul className="pl-4 pr-4 list-style">
            <li>If you Bet on Low Card, Spade of 9 &amp; 10 will calculated along with High Cards.</li>
            <li>If you Bet on High Card, Spade of 9 &amp; 10 will calculated along with Low Cards.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
