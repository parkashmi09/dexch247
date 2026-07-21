import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';


// Helper function to map card string to image path
const getCardImage = (cardString) => {
  if (!cardString) return null;
  // Use local asset paths - try tablecard first, then card-results as fallback
  return `/assets/img/tablecard/${cardString}.jpg`;
};

// Helper function to parse card string for teen1 (format: "4CC,JSS" = Player card, Dealer card)
const parseCards = (cardString) => {
  if (!cardString) return { player: null, dealer: null };
  
  const cards = cardString.split(',');
  const playerCard = cards[0] ? getCardImage(cards[0].trim()) : null;
  const dealerCard = cards[1] ? getCardImage(cards[1].trim()) : null;
  
  return { player: playerCard, dealer: dealerCard };
};

// Helper function to parse rdesc (format: "Dealer#P : Down  |  D : Up")
const parseRdesc = (rdesc) => {
  if (!rdesc) return { winner: "", description: "" };
  
  const parts = rdesc.split('#');
  const winner = parts[0] || "";
  const description = parts[1] || "";
  
  return { winner, description };
};

const ResultTeen1 = ({ 
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
        const response = await getLastResults('teen1');
        if (response?.data?.data?.res) {
          // Map win values: "1" = "P" (Player), "2" = "D" (Dealer)
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "P" : item.win === "2" ? "D" : item.win
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
        const response = await getLastResults('teen1');
        if (response?.data?.data?.res) {
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "P" : item.win === "2" ? "D" : item.win
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
        const response = await getDetailResults('teen1', mid.toString());
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
      player: playerA?.cards?.[0] || null, 
      dealer: playerB?.cards?.[0] || null 
    };
    
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    const winner = detailResult?.winnat || (selectedResult === "P" ? "Player" : selectedResult === "D" ? "Dealer" : "");
    
    // Determine winner from API data - check win field first, then winnat, then selectedResult
    const winValue = detailResult?.win;
    const isPlayerWinner = winValue === "1" || winner === "Player" || selectedResult === "P";
    const isDealerWinner = winValue === "2" || winner === "Dealer" || selectedResult === "D";

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "157250124095658",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      player: {
        card: cards.player,
        isWinner: isPlayerWinner,
      },
      dealer: {
        card: cards.dealer,
        isWinner: isDealerWinner,
      },
      resultDetails: {
        winner: winner,
        description: rdescData.description || "",
      },
    };
  };

  const modalData = getModalData();
  const { winner = "", description = "" } = modalData?.resultDetails || {};

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
            className={`result-circle ${res === "P" ? "yes" : "no"}`}
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
          title="1 CARD ONE-DAY Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Player vs Dealer Cards Section */}
          <div className="row mt-2">
            {/* Player */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player</h4>
              <div className="casino-result-cards">
                {modalData.player?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
                {modalData.player?.card && (
                  <img
                    src={modalData.player.card}
                    alt="Player Card"
                    onError={(e) => {
                      // Fallback to card-results folder if tablecard doesn't exist
                      const cardName = modalData.player.card.split('/').pop();
                      const fallbackPath = `/assets/img/card-results/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                    style={{ border: '2px solid #ffd700', borderRadius: '4px' }}
                  />
                )}
              </div>
            </div>

            {/* Dealer */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Dealer</h4>
              <div className="casino-result-cards">
                {modalData.dealer?.card && (
                  <img
                    src={modalData.dealer.card}
                    alt="Dealer Card"
                    onError={(e) => {
                      // Fallback to card-results folder if tablecard doesn't exist
                      const cardName = modalData.dealer.card.split('/').pop();
                      const fallbackPath = `/assets/img/card-results/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                    style={{ border: '2px solid #ffd700', borderRadius: '4px' }}
                  />
                )}
                {modalData.dealer?.isWinner && (
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
                {description && (
                  <div className="casino-result-desc-item">
                    <div>7 Up - 7 Down:</div>
                    <div>{description}</div>
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

export default ResultTeen1;
