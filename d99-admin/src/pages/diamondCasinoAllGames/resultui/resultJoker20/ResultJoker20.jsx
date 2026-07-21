import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";
import cardPattiBack from '../../../../assets/img/card/patti_back.jpg';

// Helper function to map card string to image path
const getCardImage = (cardString) => {
  if (!cardString || cardString === "1" || cardString === "0") return cardPattiBack;
  return `/assets/img/tablecard/${cardString}.jpg`;
};

// Helper function to parse card string for Joker game
// Format: "QHH,10DD,6SS,9CC,JHH,9SS,3SS" - first is Joker, then Player A (3), then Player B (3)
const parseJokerCards = (cardString) => {
  if (!cardString) return { joker: null, playerA: [], playerB: [] };

  const cards = cardString.split(",").map(t => t.trim());
  
  // First card is Joker
  const jokerCard = cards[0] && cards[0] !== "1" && cards[0] !== "0" 
    ? getCardImage(cards[0])
    : null;
  
  // Player A: indices 1, 2, 3
  const playerACards = [1, 2, 3].map(i => {
    const card = cards[i];
    return getCardImage(card);
  });
  
  // Player B: indices 4, 5, 6
  const playerBCards = [4, 5, 6].map(i => {
    const card = cards[i];
    return getCardImage(card);
  });
  
  return {
    joker: jokerCard,
    playerA: playerACards,
    playerB: playerBCards
  };
};

// Helper function to parse rdesc for joker
// Format: "Player A#Even#Red#Heart"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};

  const parts = rdesc.split('#');
  const winner = parts[0] || "";
  const oddEven = parts[1] || "";
  const color = parts[2] || "";
  const suit = parts[3] || "";

  return { winner, oddEven, color, suit };
};

const ResultJoker20 = ({
  data = [],
  gameData = {},
  playerA = {},
  playerB = {},
  jokerCard = null,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch last results on mount - updated for joker20
  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('joker20');
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
        const response = await getLastResults('joker20');
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
      mid = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid;
    }

    // Fetch detail results if we have a mid - updated for joker20
    if (mid) {
      try {
        const response = await getDetailResults('joker20', mid.toString());
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
    const cards = detailResult?.card ? parseJokerCards(detailResult.card) : {
      joker: jokerCard,
      playerA: playerA?.cards || [],
      playerB: playerB?.cards || []
    };

    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    const winner = detailResult?.winnat || (selectedResult === "A" ? "Player A" : selectedResult === "B" ? "Player B" : "");

    // Determine winner from API data
    const winValue = detailResult?.win;
    const isPlayerAWinner = winValue === "1" || winner === "Player A" || selectedResult === "A";
    const isPlayerBWinner = winValue === "2" || winner === "Player B" || selectedResult === "B";

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "174251219183834",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      joker: cards.joker,
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
        oddEven: rdescData.oddEven || "",
        color: rdescData.color || "",
        suit: rdescData.suit || "",
      },
    };
  };

  const modalData = getModalData();
  const {
    winner = "",
    oddEven = "",
    color = "",
    suit = "",
  } = modalData?.resultDetails || {};

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || []), ...(gameData?.data?.lrs || [])];

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
          title="Teenpatti Joker 20-20 Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Joker Card Section */}
          {modalData.joker && (
            <div className="row mt-2 justify-content-center">
              <div className="col-md-12 text-center">
                <h4 className="result-title">Joker</h4>
                <div className="casino-result-cards">
                  <img
                    src={modalData.joker}
                    alt="Joker Card"
                    onError={(e) => {
                      const cardName = modalData.joker.split('/').pop();
                      const fallbackPath = `/assets/img/card-results/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

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
                {oddEven && (
                  <div className="casino-result-desc-item">
                    <div>Odd/Even:</div>
                    <div>{oddEven}</div>
                  </div>
                )}
                {color && (
                  <div className="casino-result-desc-item">
                    <div>Color:</div>
                    <div>{color}</div>
                  </div>
                )}
                {suit && (
                  <div className="casino-result-desc-item">
                    <div>Suit:</div>
                    <div>{suit}</div>
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

export default ResultJoker20;
