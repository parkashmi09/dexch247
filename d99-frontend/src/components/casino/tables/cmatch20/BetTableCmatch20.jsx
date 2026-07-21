const BALL_BASE = "/assets/img/balls/cricket20";

function ScoreBox({ item, ballNum, teamAScore, teamBScore, teamAOvers, teamBOvers, onBetClick }) {
  const suspended = !item || item.gstatus !== "OPEN";
  const backOdds = suspended ? 0 : (item?.b || 0);
  const layOdds = suspended ? 0 : (item?.l || 0);

  return (
    <div className="score-box">
      <div className="team-score">
        <div>
          <div className="text-center"><b>Team A</b></div>
          <div className="text-center">
            <span className="ml-1">{teamAScore} </span>
            <span className="ml-2">{teamAOvers}</span>
          </div>
        </div>
        <div>
          <div className="text-center"><b>Team B</b></div>
          <div className="text-center">
            <span className="ml-1">{teamBScore} </span>
            <span className="ml-1">{teamBOvers}</span>
          </div>
        </div>
      </div>
      <div className="ball-icon">
        <img src={`${BALL_BASE}/ball${ballNum}.png`} alt={`Ball ${ballNum}`} />
      </div>
      <div className="blbox">
        <div
          className={`casino-odds-box back${suspended ? " suspended-box" : ""}`}
          onClick={() => !suspended && backOdds > 0 && onBetClick?.(backOdds, item?.nat, item, "back")}
        >
          <span className="casino-odds">{backOdds}</span>
        </div>
        <div
          className={`casino-odds-box lay${suspended ? " suspended-box" : ""}`}
          onClick={() => !suspended && layOdds > 0 && onBetClick?.(layOdds, item?.nat, item, "lay")}
        >
          <span className="casino-odds">{layOdds}</span>
        </div>
      </div>
    </div>
  );
}

export default function BetTableCmatch20({
  tableData = [],
  teamAScore = "",
  teamBScore = "",
  teamAOvers = "",
  teamBOvers = "",
  remark = "",
  onBetClick,
}) {
  const findByBall = (n) => tableData.find((d) => d.nat === `Run ${n}`);

  const leftBalls = [2, 3, 4, 5, 6];
  const rightBalls = [7, 8, 9, 10];

  return (
    <>
      <div className="casino-table">
        <div className="cricket20-container">
          <div className="cricket20-left">
            {leftBalls.map((n) => (
              <ScoreBox
                key={n}
                item={findByBall(n)}
                ballNum={n}
                teamAScore={teamAScore}
                teamBScore={teamBScore}
                teamAOvers={teamAOvers}
                teamBOvers={teamBOvers}
                onBetClick={onBetClick}
              />
            ))}
          </div>
          <div className="cricket20-right">
            {rightBalls.map((n) => (
              <ScoreBox
                key={n}
                item={findByBall(n)}
                ballNum={n}
                teamAScore={teamAScore}
                teamBScore={teamBScore}
                teamAOvers={teamAOvers}
                teamBOvers={teamBOvers}
                onBetClick={onBetClick}
              />
            ))}
          </div>
        </div>
        {remark && (
          <div className="casino-remark mt-1">
            <marquee scrollamount="3">{remark}</marquee>
          </div>
        )}
      </div>
    </>
  );
}
