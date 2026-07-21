import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";

const getCardImage = (cardString) => cardString ? `/assets/img/tablecard/${cardString}.jpg` : null;

// Parse 17 cards: Board (5 cards), then 6 players (2 cards each = 12 cards)
const parseCards = (cardString) => {
  if (!cardString) return { board: [], players: Array(6).fill([]) };
  const cards = cardString.split(',').map(c => c.trim());
  
  const board = cards.slice(0, 5).map(c => getCardImage(c));
  const players = [];
  
  // Players 1-6, each with 2 cards (starting from index 5)
  for (let i = 0; i < 6; i++) {
    players.push(cards.slice(5 + (i * 2), 5 + (i * 2) + 2).map(c => getCardImage(c)));
  }
  
  return { board, players };
};

// Parse rdesc: "Player 4#Three of a Kind"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  
  const winner = parts[0] || ""; // "Player 4"
  const pattern = parts[1] || ""; // "Three of a Kind"
  
  return { winner, pattern };
};

// Map win value to player number for circles
// win: "14" -> "4", "11" -> "1", "13" -> "3", etc.
const mapWinToPlayerNumber = (win) => {
  if (!win) return "";
  // Extract last digit (e.g., "14" -> "4", "11" -> "1")
  const lastDigit = win.toString().slice(-1);
  return lastDigit;
};

const ResultPoker6 = ({ data = [], gameData = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('poker6');
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: mapWinToPlayerNumber(item.win),
            originalWin: item.win, // Store original for reference
          }));
          setLastResults(mapped);
        }
      } catch (e) {
        console.error('Error fetching last results:', e);
      }
    };
    fetchLastResults();
  }, []);

  const handleResultClick = async (res, index) => {
    setSelectedResult(res);
    setLoading(true);

    if (lastResults.length === 0) {
      try {
        const response = await getLastResults('poker6');
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: mapWinToPlayerNumber(item.win),
          }));
          setLastResults(mapped);
        }
      } catch (e) {
        console.error('Error fetching last results:', e);
      }
    }

    let mid = null;
    if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      mid = gameData?.mid || gameData?.data?.mid;
    }

    if (mid) {
      try {
        const response = await getDetailResults('poker6', mid.toString());
        if (response?.data?.data?.t1) {
          setDetailResult(response.data.data.t1);
        }
      } catch (e) {
        console.error('Error fetching detail results:', e);
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

  const getModalData = () => {
    if (!selectedResult) return null;

    const cards = detailResult?.card ? parseCards(detailResult.card) : { board: [], players: Array(6).fill([]) };
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    
    const winner = detailResult?.winnat || rdescData.winner || "";
    const winValue = detailResult?.win;
    const winnerPlayerNum = mapWinToPlayerNumber(winValue);
    
    // Determine which players are winners
    const isWinner = Array(6).fill(false);
    if (winnerPlayerNum) {
      const playerIndex = parseInt(winnerPlayerNum) - 1;
      if (playerIndex >= 0 && playerIndex < 6) {
        isWinner[playerIndex] = true;
      }
    }

    return {
      roundId: detailResult?.rid || gameData?.mid || gameData?.data?.mid || "",
      matchTime: detailResult?.mtime || gameData?.mt || new Date().toLocaleString(),
      board: cards.board,
      players: cards.players.map((playerCards, idx) => ({
        cards: playerCards,
        isWinner: isWinner[idx],
        playerNumber: idx + 1,
      })),
      resultDetails: {
        winner: winner,
        pattern: rdescData.pattern || "",
      },
    };
  };

  const modalData = getModalData();
  const { winner = "", pattern = "" } = modalData?.resultDetails || {};

  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || [])].map(mapWinToPlayerNumber);

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className={`result-circle ${res ? "yes" : "no"}`}
            onClick={() => handleResultClick(res, index)}
            style={{ cursor: 'pointer' }}
          >
            {res}
          </div>
        ))}
      </div>

      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Poker 6 Players Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Board Cards Section */}
          <div className="row mt-4">
            <div className="col-md-12 text-center" style={{ marginBottom: '10px' }}>
              <h4 className="result-title" style={{ marginBottom: '15px' }}>Board</h4>
              <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {modalData.board?.map((card, idx) => (
                  card && (
                    <img
                      key={idx}
                      src={card}
                      alt={`Board Card ${idx + 1}`}
                      style={{ margin: '0 5px' }}
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
          </div>

          {/* Player Cards Section - Radial layout: Top (1,6), Middle (2,5), Bottom (3,4) */}
          <div className="row" style={{ marginTop: '20px', marginBottom: '25px' }}>
            <div className="col-md-12 text-center">
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                {/* Player 1 */}
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h5 className="result-title" style={{ marginBottom: '10px' }}>Player 1</h5>
                  <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {modalData.players[0]?.cards?.map((card, cardIdx) => (
                      card && (
                        <img
                          key={cardIdx}
                          src={card}
                          alt={`Player 1 Card ${cardIdx + 1}`}
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
                    {modalData.players[0]?.isWinner && (
                      <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                        <FaTrophy color="#4caf50" size={24} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Player 6 */}
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h5 className="result-title" style={{ marginBottom: '10px' }}>Player 6</h5>
                  <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {modalData.players[5]?.cards?.map((card, cardIdx) => (
                      card && (
                        <img
                          key={cardIdx}
                          src={card}
                          alt={`Player 6 Card ${cardIdx + 1}`}
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
                    {modalData.players[5]?.isWinner && (
                      <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                        <FaTrophy color="#4caf50" size={24} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Players 2 and 5 */}
          <div className="row" style={{ marginBottom: '15px' }}>
            <div className="col-md-12 text-center">
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                {/* Player 2 */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h5 className="result-title" style={{ marginBottom: '10px' }}>Player 2</h5>
                  <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {modalData.players[1]?.cards?.map((card, cardIdx) => (
                      card && (
                        <img
                          key={cardIdx}
                          src={card}
                          alt={`Player 2 Card ${cardIdx + 1}`}
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
                    {modalData.players[1]?.isWinner && (
                      <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                        <FaTrophy color="#4caf50" size={24} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Player 5 */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h5 className="result-title" style={{ marginBottom: '10px' }}>Player 5</h5>
                  <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {modalData.players[4]?.cards?.map((card, cardIdx) => (
                      card && (
                        <img
                          key={cardIdx}
                          src={card}
                          alt={`Player 5 Card ${cardIdx + 1}`}
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
                    {modalData.players[4]?.isWinner && (
                      <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                        <FaTrophy color="#4caf50" size={24} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Players 3 and 4 */}
          <div className="row" style={{ marginBottom: '30px' }}>
            <div className="col-md-12 text-center">
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                {/* Player 3 */}
                <div style={{ textAlign: 'center' }}>
                  <h5 className="result-title" style={{ marginBottom: '10px' }}>Player 3</h5>
                  <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {modalData.players[2]?.cards?.map((card, cardIdx) => (
                      card && (
                        <img
                          key={cardIdx}
                          src={card}
                          alt={`Player 3 Card ${cardIdx + 1}`}
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
                    {modalData.players[2]?.isWinner && (
                      <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                        <FaTrophy color="#4caf50" size={24} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Player 4 */}
                <div style={{ textAlign: 'center' }}>
                  <h5 className="result-title" style={{ marginBottom: '10px' }}>Player 4</h5>
                  <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {modalData.players[3]?.cards?.map((card, cardIdx) => (
                      card && (
                        <img
                          key={cardIdx}
                          src={card}
                          alt={`Player 4 Card ${cardIdx + 1}`}
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
                    {modalData.players[3]?.isWinner && (
                      <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                        <FaTrophy color="#4caf50" size={24} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Details */}
          <div className="row mt-4 justify-content-center">
            <div className="col-md-8">
              <div className="casino-result-desc" style={{ padding: '15px 20px', marginTop: '20px' }}>
                {winner && (
                  <div className="casino-result-desc-item" style={{ marginBottom: '10px' }}>
                    <div>Winner</div>
                    <div>{winner}</div>
                  </div>
                )}
                {pattern && (
                  <div className="casino-result-desc-item">
                    <div>Pattern</div>
                    <div>{pattern}</div>
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

export default ResultPoker6;
