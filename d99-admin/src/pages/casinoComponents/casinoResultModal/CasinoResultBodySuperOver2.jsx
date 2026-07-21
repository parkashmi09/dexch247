import React from 'react';
import '../../diamondCasinoAllGames/resultui/resultSuperOver3/ResultSuperOver3.css';

// Shared with ResultSuperOver2 modal – same parsing and UI for Super Over 2/3 result detail.

const parseScoreData = (scoreArray) => {
  if (!Array.isArray(scoreArray) || scoreArray.length === 0) {
    return { inning1: [], inning2: [] };
  }

  const inning1 = [];
  const inning2 = [];
  const overMap1 = {};
  const overMap2 = {};

  const inning1Balls = scoreArray.filter((b) => (b.ing || 1) === 1).sort((a, b) => (a.oc || 1) - (b.oc || 1));
  const inning2Balls = scoreArray.filter((b) => (b.ing || 1) === 2).sort((a, b) => (a.oc || 1) - (b.oc || 1));

  let cumulativeRuns1 = 0;
  let cumulativeWickets1 = 0;
  let cumulativeRuns2 = 0;
  let cumulativeWickets2 = 0;

  inning1Balls.forEach((ball) => {
    const overNum = ball.oc || 1;
    const team = ball.nat || '';
    const runs = ball.run || 0;
    const isWicket = ball.wkt || false;

    if (!overMap1[overNum]) {
      overMap1[overNum] = {
        over: overNum,
        team,
        balls: [],
        runs: 0,
        wickets: 0,
        cumulativeRuns: cumulativeRuns1,
        cumulativeWickets: cumulativeWickets1,
      };
    }

    const ballDisplay = isWicket ? 'ww' : runs > 0 ? runs.toString() : '';
    overMap1[overNum].balls.push(ballDisplay);
    overMap1[overNum].runs += runs;
    if (isWicket) overMap1[overNum].wickets += 1;
    cumulativeRuns1 += runs;
    if (isWicket) cumulativeWickets1 += 1;
    overMap1[overNum].cumulativeRuns = cumulativeRuns1;
    overMap1[overNum].cumulativeWickets = cumulativeWickets1;
  });

  inning2Balls.forEach((ball) => {
    const overNum = ball.oc || 1;
    const team = ball.nat || '';
    const runs = ball.run || 0;
    const isWicket = ball.wkt || false;

    if (!overMap2[overNum]) {
      overMap2[overNum] = {
        over: overNum,
        team,
        balls: [],
        runs: 0,
        wickets: 0,
        cumulativeRuns: cumulativeRuns2,
        cumulativeWickets: cumulativeWickets2,
      };
    }

    const ballDisplay = isWicket ? 'ww' : runs > 0 ? runs.toString() : '';
    overMap2[overNum].balls.push(ballDisplay);
    overMap2[overNum].runs += runs;
    if (isWicket) overMap2[overNum].wickets += 1;
    cumulativeRuns2 += runs;
    if (isWicket) cumulativeWickets2 += 1;
    overMap2[overNum].cumulativeRuns = cumulativeRuns2;
    overMap2[overNum].cumulativeWickets = cumulativeWickets2;
  });

  inning1.push(...Object.values(overMap1).sort((a, b) => a.over - b.over));
  inning2.push(...Object.values(overMap2).sort((a, b) => a.over - b.over));
  return { inning1, inning2 };
};

const parseRdesc = (rdesc) => {
  if (!rdesc) return { team1Score: 0, team2Score: 0, team1Name: '', team2Name: '' };
  const parts = rdesc.split('|');
  let team1Score = 0;
  let team2Score = 0;
  let team1Name = '';
  let team2Name = '';
  if (parts.length >= 2) {
    const match1 = parts[0].trim().match(/(\w+)\s*:\s*(\d+)/);
    const match2 = parts[1].trim().match(/(\w+)\s*:\s*(\d+)/);
    if (match1) {
      team1Name = match1[1];
      team1Score = parseInt(match1[2], 10) || 0;
    }
    if (match2) {
      team2Name = match2[1];
      team2Score = parseInt(match2[2], 10) || 0;
    }
  }
  return { team1Name, team2Name, team1Score, team2Score };
};

/**
 * Modal body for Super Over 2 / Super Over 3 result.
 * Used in: game page (ResultSuperOver2 modal) and Casino Result Report (/admin/reports/casinoresult/superover2).
 * detailResult = API t1: { rid, mtime, rdesc, score, winnat, win }.
 */
const CasinoResultBodySuperOver2 = ({ detailResult }) => {
  if (!detailResult) {
    return <div className="five-cricket-result">No result data.</div>;
  }

  const scoreData = detailResult.score ? parseScoreData(detailResult.score) : { inning1: [], inning2: [] };
  const rdescData = detailResult.rdesc ? parseRdesc(detailResult.rdesc) : {};
  const winner = detailResult.winnat || '';
  const winValue = detailResult.win || '';
  const team1Name = scoreData.inning1[0]?.team || rdescData.team1Name || 'Team 1';
  const team2Name = scoreData.inning2[0]?.team || rdescData.team2Name || 'Team 2';
  const winnerDisplay = winner || (winValue === '1' ? team1Name : winValue === '2' ? team2Name : '');
  const scoreDisplay =
    detailResult.rdesc || `${team1Name} : ${rdescData.team1Score || 0} | ${team2Name} : ${rdescData.team2Score || 0}`;

  const { inning1, inning2 } = scoreData;
  const ballColumns = 6; // 1..6 balls per over to match reference UI

  return (
    <div className="five-cricket-result">
      <div className="mt-2">
        <div className="text-end">
          Winner: <span className="text-fancy">{winnerDisplay}</span> | {scoreDisplay}
        </div>
      </div>

      {inning1.length > 0 && (
        <div className="mt-2">
          <h4>First Inning</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{team1Name}</th>
                  {Array.from({ length: ballColumns }, (_, i) => (
                    <th key={i} className="text-center">
                      {i + 1}
                    </th>
                  ))}
                  <th className="text-center">Run/Over</th>
                  <th className="text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {inning1.map((over, overIndex) => (
                  <tr key={overIndex}>
                    <td>Over {over.over}</td>
                    {Array.from({ length: ballColumns }, (_, ballIndex) => (
                      <td key={ballIndex} className="text-center">
                        {over.balls[ballIndex] && (
                          <span className={over.balls[ballIndex] === 'ww' ? 'text-danger' : ''}>
                            {over.balls[ballIndex]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="text-center">{over.runs}</td>
                    <td className="text-center">
                      {over.cumulativeRuns}/{over.cumulativeWickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inning2.length > 0 && (
        <div className="mt-2">
          <h4>Second Inning</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{team2Name}</th>
                  {Array.from({ length: ballColumns }, (_, i) => (
                    <th key={i} className="text-center">
                      {i + 1}
                    </th>
                  ))}
                  <th className="text-center">Run/Over</th>
                  <th className="text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {inning2.map((over, overIndex) => (
                  <tr key={overIndex}>
                    <td>Over {over.over}</td>
                    {Array.from({ length: ballColumns }, (_, ballIndex) => (
                      <td key={ballIndex} className="text-center">
                        {over.balls[ballIndex] && (
                          <span className={over.balls[ballIndex] === 'ww' ? 'text-danger' : ''}>
                            {over.balls[ballIndex]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="text-center">{over.runs}</td>
                    <td className="text-center">
                      {over.cumulativeRuns}/{over.cumulativeWickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoResultBodySuperOver2;
