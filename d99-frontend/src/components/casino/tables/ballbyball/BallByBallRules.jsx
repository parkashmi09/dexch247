export default function BallByBallRules() {
  return (
    <>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Run Section : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>In 1, 2, 3, 4, 6, and boundary (4 or 6) events, only bat runs will be considered.</li>
            <li>In 0 runs, only dot balls will be considered.</li>
            <li><b>Note:</b> Wickets or extras with runs will not be considered in the above-mentioned events.</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Wicket Section : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>Particular Wickets (Caught, Bowled, Run Out, LBW, Stumped, and Others) or Wickets (Any Wickets) only wicket will be considered.</li>
            <li><b>Note:</b> Any runs with Wickets will not be considered in these events.</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Extra Section : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>Extra balls (no ball, wide, bye, and Leg Bye) &amp; Extras (any extras) Only extras will be considered.</li>
            <li><b>Note:</b> Any runs or wicket on extra balls will not be considered in these events.</li>
            <li>In the case of No Ball with runout, the result will be No Ball.</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Disclaimer:</h6>
          <ul className="pl-4 pr-4 list-style">
            <li>The videos are from different broadcasters, so in such cases, the scoreboard will update late. We will give results only on the basis of our rules and as per the videos displayed.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
