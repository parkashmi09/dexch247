export default function GoalRules() {
  return (
    <>
      <div className="rules-section">
        <h6 className="rules-highlight">1. Objective</h6>
        <p>The goal of this game is to predict which player or method will result in the next goal, providing players with exciting opportunities to win big.</p>
      </div>
      <br />
      <div className="rules-section">
        <h6 className="rules-highlight">2. Betting Options</h6>
        <ul className="pl-2 pr-2">
          <li>
            <span className="rules-sub-highlight">1.Who Will Goal Next?</span>
            <ul className="pl-4 pr-4 list-style">
              <li><b>Description:</b> Predict which player (from the available player selection) will score the next goal.</li>
              <li><b>Winning Criteria:</b> If the selected player scores the next goal, the bet is won.</li>
              <li><b>No Goal Condition:</b> If no goal is scored by any player (i.e., the shot is missed or saved), the bet is considered a No Goal.</li>
            </ul>
          </li>
          <li>
            <span className="rules-sub-highlight">2. Method of the Next Goal</span>
            <ul className="pl-4 pr-4 list-style">
              <li><b>Description:</b> Predict the method by which the next goal will be scored. The following options are available:
                <ul className="pl-4 pr-4 list-style">
                  <li><b>Header Goal:</b> The goal scorer must use their head to score. The last touch on the ball before entering the net must be from the head.</li>
                  <li><b>Free-kick Goal:</b> The goal must be scored directly from a free-kick, meaning no additional touches are allowed before the ball crosses the goal line.</li>
                  <li><b>Penalty Goal:</b> The goal must be scored from a penalty, and the penalty taker must be the one who scores.</li>
                  <li><b>Shot Goal:</b> This includes all other types of goals that are not covered by the above categories, including shots from open play, volleys, or any other direct goals.</li>
                </ul>
              </li>
              <li><b>Winning Criteria:</b> If the goal is scored by the method selected, the bet is won.</li>
              <li><b>No Goal Condition:</b> If the goal attempt fails or is blocked, the bet is considered a No Goal.</li>
            </ul>
          </li>
        </ul>
      </div>
      <br />
      <div className="rules-section">
        <h6 className="rules-highlight">3. General Rules</h6>
        <p><b>No Goal Condition:</b> In all instances, if no goal is scored (due to a miss, save, or other reasons), the bet will be marked as a No Goal.</p>
        <p><b>Goal Misses or Saved Shots:</b> If a player misses or the shot is saved, bets placed on that player or method will be settled as No Goal.</p>
        <p><b>Broadcast Delays:</b> Please note that the video feeds used to confirm goal outcomes may come from different broadcasters, which can result in a delay in updating the scoreboard. However, the final result will be determined by our official rules and the video evidence available at the time.</p>
      </div>
      <br />
      <div className="rules-section">
        <h6 className="rules-highlight">4. Disclaimers</h6>
        <p><b>Official Decision:</b> In case of any disputes regarding the goal, the casino's decision based on video reviews will be final.</p>
        <p><b>Video Evidence:</b> The casino reserves the right to use available video footage to confirm whether a goal was scored by the chosen player or method. If the footage is inconclusive, the bet may be voided and refunded.</p>
      </div>
      <br />
      <div className="rules-section">
        <h6 className="rules-highlight">5. Terms of Participation</h6>
        <p>All players must be aware of the potential delay in goal announcements due to broadcast lag.</p>
        <p>Players accept that the casino's decision is final in the event of any discrepancies.</p>
        <br />
        <p className="text-center"><b>"Best of luck! Enjoy the excitement of the casino and win BIG!"</b></p>
      </div>
    </>
  );
}
