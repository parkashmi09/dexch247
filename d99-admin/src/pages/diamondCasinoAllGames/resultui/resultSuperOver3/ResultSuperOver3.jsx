import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "./ResultSuperOver3.css";

// Helper function to parse score data and group by inning and over
const parseScoreData = (scoreArray) => {
  if (!Array.isArray(scoreArray) || scoreArray.length === 0) {
    return { inning1: [], inning2: [] };
  }

  const inning1 = [];
  const inning2 = [];
  const overMap1 = {}; // { overNumber: { balls: [], runs: 0, wickets: 0, team: '' } }
  const overMap2 = {};

  // Separate by inning and process in order
  const inning1Balls = scoreArray.filter(b => (b.ing || 1) === 1).sort((a, b) => {
    const overDiff = (a.oc || 1) - (b.oc || 1);
    return overDiff;
  });
  const inning2Balls = scoreArray.filter(b => (b.ing || 1) === 2).sort((a, b) => {
    const overDiff = (a.oc || 1) - (b.oc || 1);
    return overDiff;
  });

  let cumulativeRuns1 = 0;
  let cumulativeWickets1 = 0;
  let cumulativeRuns2 = 0;
  let cumulativeWickets2 = 0;

  // Process inning 1
  inning1Balls.forEach((ball) => {
    const overNum = ball.oc || 1;
    const team = ball.nat || '';
    const runs = ball.run || 0;
    const isWicket = ball.wkt || false;

    if (!overMap1[overNum]) {
      overMap1[overNum] = {
        over: overNum,
        team: team,
        balls: [],
        runs: 0,
        wickets: 0,
        cumulativeRuns: cumulativeRuns1,
        cumulativeWickets: cumulativeWickets1,
      };
    }

    // Add ball data
    let ballDisplay = '';
    if (isWicket) {
      ballDisplay = 'ww'; // wicket
    } else if (runs > 0) {
      ballDisplay = runs.toString();
    } else {
      ballDisplay = '';
    }

    overMap1[overNum].balls.push(ballDisplay);
    overMap1[overNum].runs += runs;
    if (isWicket) {
      overMap1[overNum].wickets += 1;
    }

    // Update cumulative
    cumulativeRuns1 += runs;
    if (isWicket) {
      cumulativeWickets1 += 1;
    }

    // Update cumulative in over object
    overMap1[overNum].cumulativeRuns = cumulativeRuns1;
    overMap1[overNum].cumulativeWickets = cumulativeWickets1;
  });

  // Process inning 2
  inning2Balls.forEach((ball) => {
    const overNum = ball.oc || 1;
    const team = ball.nat || '';
    const runs = ball.run || 0;
    const isWicket = ball.wkt || false;

    if (!overMap2[overNum]) {
      overMap2[overNum] = {
        over: overNum,
        team: team,
        balls: [],
        runs: 0,
        wickets: 0,
        cumulativeRuns: cumulativeRuns2,
        cumulativeWickets: cumulativeWickets2,
      };
    }

    // Add ball data
    let ballDisplay = '';
    if (isWicket) {
      ballDisplay = 'ww'; // wicket
    } else if (runs > 0) {
      ballDisplay = runs.toString();
    } else {
      ballDisplay = '';
    }

    overMap2[overNum].balls.push(ballDisplay);
    overMap2[overNum].runs += runs;
    if (isWicket) {
      overMap2[overNum].wickets += 1;
    }

    // Update cumulative
    cumulativeRuns2 += runs;
    if (isWicket) {
      cumulativeWickets2 += 1;
    }

    // Update cumulative in over object
    overMap2[overNum].cumulativeRuns = cumulativeRuns2;
    overMap2[overNum].cumulativeWickets = cumulativeWickets2;
  });

  // Convert maps to arrays and sort by over number
  inning1.push(...Object.values(overMap1).sort((a, b) => a.over - b.over));
  inning2.push(...Object.values(overMap2).sort((a, b) => a.over - b.over));

  return { inning1, inning2 };
};

// Helper function to parse rdesc to extract team scores
const parseRdesc = (rdesc) => {
  if (!rdesc) return { team1Score: 0, team2Score: 0 };
  
  // Format: "IND : 5 | AUS : 10"
  const parts = rdesc.split('|');
  let team1Score = 0;
  let team2Score = 0;
  let team1Name = '';
  let team2Name = '';

  if (parts.length >= 2) {
    const part1 = parts[0].trim(); // "IND : 5"
    const part2 = parts[1].trim(); // "AUS : 10"
    
    const match1 = part1.match(/(\w+)\s*:\s*(\d+)/);
    const match2 = part2.match(/(\w+)\s*:\s*(\d+)/);
    
    if (match1) {
      team1Name = match1[1];
      team1Score = parseInt(match1[2]) || 0;
    }
    if (match2) {
      team2Name = match2[1];
      team2Score = parseInt(match2[2]) || 0;
    }
  }

  return { team1Name, team2Name, team1Score, team2Score };
};

const ResultSuperOver3 = ({ 
  data = [], 
  gameData = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Store original results with mid for later use
  const [originalResults, setOriginalResults] = useState([]);

  // Fetch last results on mount
  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('superover3');
        if (response?.data?.data?.res) {
          // Store original results
          setOriginalResults(response.data.data.res);
          // Map win values: "0" = "D" (draw), "1" = "1", "2" = "2"
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "0" ? "D" : item.win === "1" ? "1" : item.win === "2" ? "2" : item.win
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };
    
    fetchLastResults();
  }, []);

  const handleResultClick = async (result, index) => {
    setSelectedResult(result);
    setLoading(true);
    
    // First, ensure we have last results
    if (lastResults.length === 0 || originalResults.length === 0) {
      try {
        const response = await getLastResults('superover3');
        if (response?.data?.data?.res) {
          setOriginalResults(response.data.data.res);
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "0" ? "D" : item.win === "1" ? "1" : item.win === "2" ? "2" : item.win
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }
    
    // Find the mid for this result
    let mid = null;
    if (index < originalResults.length) {
      mid = originalResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      mid = gameData?.data?.data?.mid || gameData?.mid;
    }
    
    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('superover3', mid.toString());
        if (response?.data?.data?.t1) {
          setDetailResult(response.data.data.t1);
        }
      } catch (error) {
        console.error('Error fetching detail results:', error);
      }
    }
    
    setLoading(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setDetailResult(null);
  };

  // Format modal data based on selected result
  const getModalData = () => {
    if (!selectedResult && !detailResult) return null;

    const scoreData = detailResult?.score ? parseScoreData(detailResult.score) : { inning1: [], inning2: [] };
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    const winner = detailResult?.winnat || "";
    const winValue = detailResult?.win || "";

    // Get team names from score data or rdesc
    const team1Name = scoreData.inning1[0]?.team || rdescData.team1Name || "Team 1";
    const team2Name = scoreData.inning2[0]?.team || rdescData.team2Name || "Team 2";

    // Format winner display
    const winnerDisplay = winner || (winValue === "1" ? team1Name : winValue === "2" ? team2Name : "Draw");
    const scoreDisplay = detailResult?.rdesc || `${team1Name} : ${rdescData.team1Score || 0} | ${team2Name} : ${rdescData.team2Score || 0}`;

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      winner: winnerDisplay,
      scoreDisplay: scoreDisplay,
      team1Name: team1Name,
      team2Name: team2Name,
      inning1: scoreData.inning1,
      inning2: scoreData.inning2,
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || [])];

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className={`result-circle ${res === "1" || res === "A" ? "yes" : res === "2" || res === "B" ? "no" : ""}`}
            onClick={() => handleResultClick(res, index)}
            style={{ cursor: 'pointer' }}
          >
            {res}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Mini SuperOver Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          <div className="five-cricket-result">
            {/* Winner and Score Summary */}
            <div className="mt-2">
              <div className="text-end score-head">
                Winner: <span className="text-fancy">{modalData.winner}</span> | {modalData.scoreDisplay}
              </div>
            </div>

            {/* First Inning */}
            {modalData.inning1.length > 0 && (
              <div className="mt-2">
                <h4>First Inning</h4>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{modalData.team1Name}</th>
                        <th className="text-center">1</th>
                        <th className="text-center">2</th>
                        <th className="text-center">3</th>
                        <th className="text-center">4</th>
                        <th className="text-center">Run/Over</th>
                        <th className="text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.inning1.map((over, overIndex) => (
                        <tr key={overIndex}>
                          <td>Over {over.over}</td>
                          {[0, 1, 2, 3].map((ballIndex) => (
                            <td key={ballIndex} className="text-center">
                              {over.balls[ballIndex] && (
                                <span className={over.balls[ballIndex] === 'ww' ? 'text-danger' : ''}>
                                  {over.balls[ballIndex]}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="text-center">{over.runs}</td>
                          <td className="text-center">{over.cumulativeRuns}/{over.cumulativeWickets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Second Inning */}
            {modalData.inning2.length > 0 && (
              <div className="mt-2">
                <h4>Second Inning</h4>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{modalData.team2Name}</th>
                        <th className="text-center">1</th>
                        <th className="text-center">2</th>
                        <th className="text-center">3</th>
                        <th className="text-center">4</th>
                        <th className="text-center">Run/Over</th>
                        <th className="text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.inning2.map((over, overIndex) => (
                        <tr key={overIndex}>
                          <td>Over {over.over}</td>
                          {[0, 1, 2, 3].map((ballIndex) => (
                            <td key={ballIndex} className="text-center">
                              {over.balls[ballIndex] && (
                                <span className={over.balls[ballIndex] === 'ww' ? 'text-danger' : ''}>
                                  {over.balls[ballIndex]}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="text-center">{over.runs}</td>
                          <td className="text-center">{over.cumulativeRuns}/{over.cumulativeWickets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultSuperOver3;
