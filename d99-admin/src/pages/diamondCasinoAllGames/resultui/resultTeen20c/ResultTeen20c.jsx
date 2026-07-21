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
  const playerACards = cards.slice(0, 3).map(card => getCardImage(card.trim()));
  const playerBCards = cards.slice(3, 6).map(card => getCardImage(card.trim()));
  
  return { playerA: playerACards, playerB: playerBCards };
};

// Helper function to parse rdesc
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  
  const parts = rdesc.split('#');
  const winner = parts[0] || "";
  
  // Part 1: 3 Baccarat (may contain ~ with score)
  const baccarat3Full = parts[1] || "";
  let baccarat3 = "";
  let baccaratScore = "";
  if (baccarat3Full.includes('~')) {
    const baccaratParts = baccarat3Full.split('~');
    baccarat3 = baccaratParts[0] || "";
    baccaratScore = baccaratParts[1] || "";
  } else {
    baccarat3 = baccarat3Full;
  }
  
  // Part 2: Total
  const total = parts[2] || "";
  
  // Part 3: Pair Plus - skip (always empty, no data from backend)
  // Part 4: Red Black (or Part 3 if Pair Plus is empty)
  const redBlack = parts[4] || parts[3] || "";
  
  return { winner, baccarat3, baccaratScore, total, redBlack };
};

const ResultTeen20c = ({ 
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
        const response = await getLastResults('teen20c');
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
  }, []);

  const handleResultClick = async (result, index) => {
    setSelectedResult(result);
    setLoading(true);
    
    // First, ensure we have last results
    if (lastResults.length === 0) {
      try {
        const response = await getLastResults('teen20c');
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
        const response = await getDetailResults('teen20c', mid.toString());
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
    
    console.log('Winner detection:', { winValue, winner, selectedResult, isPlayerAWinner, isPlayerBWinner });

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "157250124095658",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      playerA: {
        cards: cards.playerA,
        isWinner: isPlayerAWinner,
      },
      playerB: {
        cards: cards.playerB,
        isWinner: isPlayerBWinner,
      },
      resultDetails: {
        winner: winner,
        baccarat3: rdescData.baccarat3 || "",
        baccaratScore: rdescData.baccaratScore || "",
        total: rdescData.total || "",
        pairPlus: "", // Always empty - no data from backend
        redBlack: rdescData.redBlack || "",
      },
    };
  };

  const modalData = getModalData();
  const {
    winner = "",
    baccarat3 = "",
    baccaratScore = "",
    total = "",
    pairPlus = "",
    redBlack = "",
  } = modalData?.resultDetails || {};

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || [])];

    console.log(modalData,"djdjjd");

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
          title="20-20 TEENPATTI C Result"
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

          {/* Result Details */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-6">
              <div className="casino-result-desc">
                {winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner:</div>
                    <div>{winner}</div>
                  </div>
                )}
                {baccarat3 && (
                  <>
                    <div className="casino-result-desc-item">
                      <div>3 Baccarat:</div>
                      <div>{baccarat3}</div>
                    </div>
                    {baccaratScore && (
                      <div className="casino-result-desc-item">
                        <div>&nbsp;</div>
                        <div>{baccaratScore}</div>
                      </div>
                    )}
                  </>
                )}
                {total && (
                  <div className="casino-result-desc-item">
                    <div>Total:</div>
                    <div>{total}</div>
                  </div>
                )}
                <div className="casino-result-desc-item">
                  <div>Pair Plus:</div>
                  <div>{pairPlus || ""}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Red Black:</div>
                  <div>{redBlack || ""}</div>
                </div>
              </div>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTeen20c;
