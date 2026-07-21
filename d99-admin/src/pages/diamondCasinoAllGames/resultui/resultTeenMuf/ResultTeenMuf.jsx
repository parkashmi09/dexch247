import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "./Result.css";

// Helper function to map card string to image path
const getCardImage = (cardString) => {
  if (!cardString) return null;
  // Use local asset paths - try tablecard first, then card-results as fallback
  return `/assets/img/tablecard/${cardString}.jpg`;
};

// Helper function to parse card string and split into Player A and Player B cards
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [] };
  
  const cards = cardString.split(',');
  // First 3 cards for Player A, last 3 cards for Player B
  const playerACards = cards.slice(0, 3).map(card => getCardImage(card.trim()));
  const playerBCards = cards.slice(3, 6).map(card => getCardImage(card.trim()));
  
  return { playerA: playerACards, playerB: playerBCards };
};

// Helper function to parse rdesc for TeenMuf
// Format: "Player B#Player A#Player A (A : 0  |  B : 1)"
// Or: "Player A#-#Player B (A : 8  |  B : 5)"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  
  const parts = rdesc.split('#');
  // parts[0] = Main winner (Player A or Player B)
  // parts[1] = Top 9 winner (Player A or Player B, or "-" if not available)
  // parts[2] = M Baccarat section with scores "Player A (A : 8  |  B : 5)"
  
  const mainWinner = parts[0] || "";
  const top9Winner = parts[1] || "-";
  
  // Part 2: M Baccarat section with scores
  // Format: "Player A (A : 8  |  B : 5)" or "Player B (A : 8  |  B : 5)"
  const baccaratSection = parts[2] || "";
  let mBaccaratWinner = "";
  let playerAScore = "";
  let playerBScore = "";
  
  // Extract M Baccarat winner and scores
  const baccaratMatch = baccaratSection.match(/^(Player [AB])\s*\(A\s*:\s*(\d+)\s*\|\s*B\s*:\s*(\d+)\)/);
  if (baccaratMatch) {
    mBaccaratWinner = baccaratMatch[1] || "";
    playerAScore = baccaratMatch[2] || "";
    playerBScore = baccaratMatch[3] || "";
  } else {
    // Fallback: try to extract just the scores
    const scoreMatch = baccaratSection.match(/A\s*:\s*(\d+)\s*\|\s*B\s*:\s*(\d+)/);
    if (scoreMatch) {
      playerAScore = scoreMatch[1] || "";
      playerBScore = scoreMatch[2] || "";
    }
  }
  
  // Format M Baccarat display string
  let mBaccaratDisplay = "";
  if (mBaccaratWinner && playerAScore && playerBScore) {
    mBaccaratDisplay = `${mBaccaratWinner} (A : ${playerAScore} | B : ${playerBScore})`;
  } else if (playerAScore && playerBScore) {
    mBaccaratDisplay = `(A : ${playerAScore} | B : ${playerBScore})`;
  }
  
  return { 
    mainWinner, 
    top9Winner, 
    mBaccaratWinner,
    mBaccaratDisplay,
    playerAScore, 
    playerBScore 
  };
};

const ResultTeenMuf = ({ 
  data = [], 
  gameData = {},
  playerA = {},
  playerB = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch last results on mount
  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('teenmuf');
        if (response?.data?.data?.res) {
          // Map win values: "1" = "A", "2" = "B"
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };
    
    fetchLastResults();
    const interval = setInterval(fetchLastResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResultClick = async (result, index) => {
    setSelectedResult(result);
    setLoading(true);
    
    // First, ensure we have last results
    if (lastResults.length === 0) {
      try {
        const response = await getLastResults('teenmuf');
        if (response?.data?.data?.res) {
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }
    
    // Find the mid for this result
    let mid = null;
    if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      mid = gameData?.data?.data?.mid || gameData?.mid;
    }
    
    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('teenmuf', mid.toString());
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
    if (!selectedResult) return null;

    // Use detailResult if available, otherwise fallback to defaults
    const cards = detailResult?.card ? parseCards(detailResult.card) : { 
      playerA: playerA?.cards || [], 
      playerB: playerB?.cards || [] 
    };
    
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    const winner = detailResult?.winnat || (selectedResult === "A" ? "Player A" : selectedResult === "B" ? "Player B" : "");
    
    // Determine winner from API data - check win field first, then winnat, then selectedResult
    const winValue = detailResult?.win;
    const isPlayerAWinner = winValue === "1" || winner === "Player A" || selectedResult === "A";
    const isPlayerBWinner = winValue === "2" || winner === "Player B" || selectedResult === "B";

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "157250124095658",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      playerA: {
        cards: cards.playerA,
        isWinner: isPlayerAWinner,
        score: rdescData.playerAScore || ""
      },
      playerB: {
        cards: cards.playerB,
        isWinner: isPlayerBWinner,
        score: rdescData.playerBScore || ""
      },
      resultDetails: {
        winner: winner,
        top9: rdescData.top9Winner || "-",
        mBaccarat: rdescData.mBaccaratDisplay || "",
      },
    };
  };

  const modalData = getModalData();
  const {
    winner = "",
    top9 = "-",
    mBaccarat = "",
  } = modalData?.resultDetails || {};

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
            className={`result-circle ${res === "A" ? "yes" : "no"}`}
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
          title="Muflis Teenpatti Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Player Cards Section */}
          <div className="row mt-2">
            {/* Player A */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player A</h4>
              <div className="casino-result-cards">
                {modalData.playerA?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
                {modalData.playerA?.cards?.map((card, index) => (
                  card && (
                    <img
                      key={index}
                      src={card}
                      alt={`Player A Card ${index + 1}`}
                      onError={(e) => {
                        // Fallback to card-results folder if tablecard doesn't exist
                        const cardName = card.split('/').pop();
                        const fallbackPath = `/assets/img/card-results/${cardName}`;
                        if (e.target.src !== fallbackPath) {
                          e.target.src = fallbackPath;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  )
                ))}
              </div>
            </div>

            {/* Player B */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player B</h4>
              <div className="casino-result-cards">
                {modalData.playerB?.cards?.map((card, index) => (
                  card && (
                    <img
                      key={index}
                      src={card}
                      alt={`Player B Card ${index + 1}`}
                      onError={(e) => {
                        // Fallback to card-results folder if tablecard doesn't exist
                        const cardName = card.split('/').pop();
                        const fallbackPath = `/assets/img/card-results/${cardName}`;
                        if (e.target.src !== fallbackPath) {
                          e.target.src = fallbackPath;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  )
                ))}
                {modalData.playerB?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Details - Single consolidated box */}
          <div className="row mt-2">
            <div className="col-md-6">
              <div className="casino-result-desc">
                <div className="casino-result-desc-item">
                  <div>Winner:</div>
                  <div>{winner || "-"}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Top 9:</div>
                  <div>{top9}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>M Baccarat:</div>
                  <div>{mBaccarat || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTeenMuf;
