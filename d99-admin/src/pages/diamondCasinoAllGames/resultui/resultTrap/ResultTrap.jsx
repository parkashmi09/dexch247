import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import '../resultTeen20c/Result.css';

// Helper function to map card string to image path
const getCardImage = (cardString) => {
  if (!cardString) return null;
  // Skip if it's just "1" (placeholder)
  if (cardString.trim() === "1") return null;
  return `/assets/img/tablecard/${cardString}.jpg`;
};

// Helper function to parse card string for trap (format: "QHH,8DD,AHH,1,1,1,1,1,1,1,1,1,1,1")
// First 3 cards are Player A, then Player B cards (but format may vary)
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [] };
  
  const cards = cardString.split(',');
  // Filter out placeholder "1" values
  const validCards = cards.filter(card => card.trim() !== "1" && card.trim() !== "");
  
  // First 3 valid cards are Player A, rest are Player B
  const playerACards = validCards.slice(0, 3).map(card => getCardImage(card.trim())).filter(Boolean);
  const playerBCards = validCards.slice(3, 5).map(card => getCardImage(card.trim())).filter(Boolean);
  
  return { playerA: playerACards, playerB: playerBCards };
};

// Helper function to parse rdesc (format: "Player B  (A:13, B:8)#High,High,Low#Yes,No,No")
const parseRdesc = (rdesc) => {
  if (!rdesc) return { winner: "", main: "", seven: "", pictureCard: "" };
  
  const parts = rdesc.split('#');
  const winnerPart = parts[0] || "";
  
  // Extract winner and scores from "Player B  (A:13, B:8)"
  const winnerMatch = winnerPart.match(/Player\s+([AB])/i);
  const winner = winnerMatch ? `Player ${winnerMatch[1]}` : winnerPart.split('(')[0].trim();
  
  // Extract scores from "(A:13, B:8)"
  const scoresMatch = winnerPart.match(/\(A:(\d+),\s*B:(\d+)\)/);
  const main = scoresMatch ? `A:${scoresMatch[1]}, B:${scoresMatch[2]}` : "";
  
  const seven = parts[1] || "";
  const pictureCard = parts[2] || "";
  
  return { winner, main, seven, pictureCard };
};

const ResultTrap = ({ 
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
        const response = await getLastResults('trap');
        if (response?.data?.data?.res) {
          // Map win values: "1" = "A" (Player A), "2" = "B" (Player B)
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
        const response = await getLastResults('trap');
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
        const response = await getDetailResults('trap', mid.toString());
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
      playerA: playerA?.cards?.slice(0, 3) || [], 
      playerB: playerB?.cards?.slice(0, 2) || [] 
    };
    
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : { winner: "", main: "", seven: "", pictureCard: "" };
    const winner = detailResult?.winnat || (selectedResult === "A" ? "Player A" : selectedResult === "B" ? "Player B" : "");
    
    // Determine winner from API data
    const winValue = detailResult?.win;
    const isPlayerAWinner = winValue === "1" || winner === "Player A" || selectedResult === "A";
    const isPlayerBWinner = winValue === "2" || winner === "Player B" || selectedResult === "B";

    // Extract scores from main
    const scoresMatch = rdescData.main ? rdescData.main.match(/A:(\d+),\s*B:(\d+)/) : null;
    const playerAScore = scoresMatch ? scoresMatch[1] : "";
    const playerBScore = scoresMatch ? scoresMatch[2] : "";

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "157250124095658",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      playerA: {
        cards: cards.playerA,
        isWinner: isPlayerAWinner,
        score: playerAScore,
      },
      playerB: {
        cards: cards.playerB,
        isWinner: isPlayerBWinner,
        score: playerBScore,
      },
      resultDetails: {
        winner: winner,
        main: rdescData.main ? `Player ${isPlayerAWinner ? 'A' : 'B'} (${rdescData.main})` : "",
        seven: rdescData.seven || "",
        pictureCard: rdescData.pictureCard || "",
      },
    };
  };

  const modalData = getModalData();
  const { main = "", seven = "", pictureCard = "" } = modalData?.resultDetails || {};

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
          title="The Trap Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Player A vs Player B Cards Section */}
          <div className="row mt-2">
            {/* Player A */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player A {modalData.playerA?.score && `(${modalData.playerA.score})`}</h4>
              <div className="casino-result-cards" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                {modalData.playerA?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
                {modalData.playerA?.cards?.map((card, idx) => (
                  <img
                    key={idx}
                    src={card}
                    alt={`Player A Card ${idx + 1}`}
                    onError={(e) => {
                      const cardName = card.split('/').pop();
                      const fallbackPath = `/assets/img/card-results/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                    style={{ border: '2px solid #ffd700', borderRadius: '4px', maxWidth: '80px' }}
                  />
                ))}
              </div>
            </div>

            {/* Player B */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player B {modalData.playerB?.score && `(${modalData.playerB.score})`}</h4>
              <div className="casino-result-cards" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                {modalData.playerB?.cards?.map((card, idx) => (
                  <img
                    key={idx}
                    src={card}
                    alt={`Player B Card ${idx + 1}`}
                    onError={(e) => {
                      const cardName = card.split('/').pop();
                      const fallbackPath = `/assets/img/card-results/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                    style={{ border: '2px solid #ffd700', borderRadius: '4px', maxWidth: '80px' }}
                  />
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
            <div className="col-md-8">
              <div className="casino-result-desc">
                {main && (
                  <div className="casino-result-desc-item">
                    <div>Main:</div>
                    <div>{main}</div>
                  </div>
                )}
                {seven && (
                  <div className="casino-result-desc-item">
                    <div>Seven:</div>
                    <div>{seven}</div>
                  </div>
                )}
                {pictureCard && (
                  <div className="casino-result-desc-item">
                    <div>Picture Card:</div>
                    <div>{pictureCard}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTrap;
