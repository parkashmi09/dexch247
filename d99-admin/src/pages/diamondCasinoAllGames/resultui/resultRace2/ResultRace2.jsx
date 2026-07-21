import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "./Result.css";

// Helper function to map card string to image path
const getCardImage = (cardCode) => {
  if (!cardCode) return null;

  try {
    if (cardCode.length < 3) {
      return null;
    }

    // Use card-results folder with full card code (e.g., "JDD.jpg", "KCC.jpg")
    // Format: rank + suit (DD, SS, CC, HH)
    return `/assets/img/card-results/${cardCode}.jpg`;
  } catch (e) {
    return null;
  }
};

// Helper function to parse card string and split into Player A, B, C, D cards
const parseCards = (cardString) => {
  if (!cardString) return { playerA: null, playerB: null, playerC: null, playerD: null };

  const cards = cardString.split(',').map(card => card.trim());

  return {
    playerA: cards[0] ? getCardImage(cards[0]) : null,
    playerB: cards[1] ? getCardImage(cards[1]) : null,
    playerC: cards[2] ? getCardImage(cards[2]) : null,
    playerD: cards[3] ? getCardImage(cards[3]) : null,
  };
};

// Helper function to map win value to player
const mapWinToPlayer = (winValue, winnat) => {
  // First check winnat if available
  if (winnat) {
    const winnatLower = winnat.toLowerCase();
    if (winnatLower.includes('player a') || winnatLower.includes('a')) return 'A';
    if (winnatLower.includes('player b') || winnatLower.includes('b')) return 'B';
    if (winnatLower.includes('player c') || winnatLower.includes('c')) return 'C';
    if (winnatLower.includes('player d') || winnatLower.includes('d')) return 'D';
  }

  // Fallback to win value
  const win = winValue?.toString() || "0";
  switch (win) {
    case "1":
      return "A";
    case "2":
      return "B";
    case "3":
      return "C";
    case "4":
      return "D";
    default:
      return "";
  }
};

// Helper function to get player label from win value for last results
const getPlayerLabel = (winValue) => {
  const win = winValue?.toString() || "0";
  switch (win) {
    case "1":
      return "A";
    case "2":
      return "B";
    case "3":
      return "C";
    case "4":
      return "D";
    default:
      return "?";
  }
};

const ResultRace2 = ({
  data = [],
  gameData = {},
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
        const response = await getLastResults('race2');
        if (response?.success && response?.data?.data?.res) {
          setLastResults(response.data.data.res);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };

    fetchLastResults();
    const interval = setInterval(fetchLastResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResultClick = async (resultItem, index) => {
    setSelectedResult(resultItem);
    setLoading(true);

    const mid = resultItem?.mid;

    if (mid) {
      try {
        const response = await getDetailResults('race2', mid.toString());
        if (response?.success && response?.data?.data?.t1) {
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
    if (!selectedResult || !detailResult) return null;

    const cards = parseCards(detailResult.card);
    const winner = mapWinToPlayer(detailResult.win, detailResult.winnat);
    const winnerLabel = detailResult.winnat || `Player ${winner}`;

    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      players: {
        A: {
          label: "Player A",
          card: cards.playerA,
          isWinner: winner === "A",
        },
        B: {
          label: "Player B",
          card: cards.playerB,
          isWinner: winner === "B",
        },
        C: {
          label: "Player C",
          card: cards.playerC,
          isWinner: winner === "C",
        },
        D: {
          label: "Player D",
          card: cards.playerD,
          isWinner: winner === "D",
        },
      },
      winner: winnerLabel,
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults
    : data.map((res, idx) => ({ win: res === "A" ? "1" : res === "B" ? "2" : res === "C" ? "3" : res === "D" ? "4" : "0", mid: null }));

  return (
    <>
      <div className="result-row  ">
        {allResults.map((resultItem, index) => {
          const playerLabel = getPlayerLabel(resultItem.win);

          return (
            <div
              key={index}
              className={`result-circle result-player-${playerLabel.toLowerCase()}`}
              onClick={() => resultItem.mid && handleResultClick(resultItem, index)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {playerLabel}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Race to 2nd Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Players Cards Section */}
          <div className="row mt-2">
            {['A', 'B', 'C', 'D'].map((playerKey) => {
              const player = modalData.players[playerKey];
              return (
                <div key={playerKey} className="col-md-3 col-6 text-center mb-3">
                  <h4 className="result-title">{player.label}</h4>
                  <div className="casino-result-cards" style={{ position: 'relative'}}>
                    {player.isWinner && (
                      <div className="casino-winner-icon" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}>
                        <FaTrophy color="#4caf50" size={32} />
                      </div>
                    )}
                    {player.card && (
                      <div
                        className="card-wrapper"
                        style={{
                          perspective: '1000px',
                          transformStyle: 'preserve-3d',
                          animation: `cardRotate 0.6s ease forwards`
                        }}
                      >
                        <img
                          src={player.card}
                          alt={`${player.label} Card`}
                          className="card-image"
                          style={{ transform: 'none' }}
                          onError={(e) => {
                            // Fallback to tablecard folder if card-results doesn't exist
                            const cardName = player.card.split('/').pop();
                            const fallbackPath = `/assets/img/tablecard/${cardName}`;
                            if (e.target.src !== fallbackPath) {
                              e.target.src = fallbackPath;
                            } else {
                              e.target.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winner Declaration */}
          <div className="row mt-3 justify-content-center">
            <div className="col-md-8">
              <div className="casino-result-desc">
                {modalData.winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner</div>
                    <div>{modalData.winner}</div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </ResultModalLayout>
      )}

      <style>{`
        @keyframes cardRotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        .card-wrapper {
          display: inline-block;
        }
        .card-image {
          width: auto;
          height: 120px;
          object-fit: contain;
          border-radius: 4px;
          border: 2px solid #ffd700;
          transform: none !important;
        }
        
        /* Override any l-rotate class if applied */
        .card-image.l-rotate,
        .l-rotate .card-image {
          transform: none !important;
        }

        /* Race2 specific result colors */
        .race2 .casino-last-results .result-circle.result-player-a {
          background-color: #086cb8;
          color: #fff;
        }

        .race2 .casino-last-results .result-circle.result-player-b {
          background-color: #ae2130;
          color: #fff;
        }

        .race2 .casino-last-results .result-circle.result-player-c {
          background-color: #4caf50;
          color: #fff;
        }

        .race2 .casino-last-results .result-circle.result-player-d {
          background-color: #ff9800;
          color: #fff;
        }
      `}</style>
    </>
  );
};

export default ResultRace2;
