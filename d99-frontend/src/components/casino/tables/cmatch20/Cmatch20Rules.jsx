export default function Cmatch20Rules() {
  return (
    <div>
      <style>{`
        .rules-section .row.row5 { margin-left: -5px; margin-right: -5px; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
        .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] { padding-left: 5px; padding-right: 5px; }
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; border-right: 1px solid #444; vertical-align: middle; text-align: center; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
        .rules-section::-webkit-scrollbar { width: 8px; }
        .rules-section::-webkit-scrollbar-track { background: #666666; }
        .rules-section::-webkit-scrollbar-thumb { background-color: #333333; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .casino-tabs { background-color: #222 !important; border-radius: 0; }
        .rules-section .casino-tabs .nav-tabs .nav-link { color: #fff !important; }
        .rules-section .casino-tabs .nav-tabs .nav-link.active { color: #FDCF13 !important; border-bottom: 3px solid #FDCF13 !important; }
      `}</style>
      <div className="rules-section">
        <ul className="pl-2 pr-2 list-style">
          <li>This is a game of twenty-20 cricket. We will alreadty have score of first batting team, &amp; score of second batting team up to 19.4 overs. At this stage second batting team will be always 12 run short of first batting team(IF THE SCORE IS TIED, SECOND BAT WILL WIN). This 12 run has to be scored by 2 scoring shots or (two steps).</li>
          <li>1st step is to be select a scoring shot from 2 , 3 , 4 , 5 , 6 ,7 , 8 , 9 , 10. The one who bet will get rate according to the scoring shot he select from 2 to 10, &amp; that will be considered as ball number 19.5.</li>
          <li>2nd step is to open a card from 40 card deck of 1 to 10 of all suites. This will be considered last ball of the match. This twenty-20 game consist of scoring shots of 1 run to 10 runs.</li>
          <li className="text-danger"><b>IF THE SCORE IS TIED SECOND BAT WILL WIN</b></li>
        </ul>
      </div>
    </div>
  );
}
