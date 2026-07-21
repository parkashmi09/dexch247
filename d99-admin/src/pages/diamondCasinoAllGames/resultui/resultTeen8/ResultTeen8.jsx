import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";

const getCardImage = (cardString) => cardString ? `/assets/img/tablecard/${cardString}.jpg` : null;

// Parse 27 cards: 8 players (3 cards each) + dealer (3 cards) = 27 total
// Order: Player 1-8 (24 cards) then Dealer (3 cards)
const parseCards = (cardString) => {
  if (!cardString) return { players: Array(8).fill([]), dealer: [] };
  const cards = cardString.split(',').map(c => c.trim());
  
  const players = [];
  for (let i = 0; i < 8; i++) {
    players.push(cards.slice(i * 3, (i + 1) * 3).map(c => getCardImage(c)));
  }
  
  const dealer = cards.slice(24, 27).map(c => getCardImage(c));
  
  return { players, dealer };
};

// Parse rdesc: "1  2  3  4  5  6  7  8 #8 : Flush#1 : 20 | 2 : 26 | 3 : 18 | 4 : 13~5 : 20 | 6 : 23 | 7 : 29 | 8 : 21~Dealer : 11#Any Colour : Yes"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  
  const winners = parts[0]?.trim() || ""; // "1  2  3  4  5  6  7  8"
  const pairPlus = parts[1] || ""; // "8 : Flush"
  const total = parts[2] || ""; // "1 : 20 | 2 : 26 | 3 : 18 | 4 : 13~5 : 20 | 6 : 23 | 7 : 29 | 8 : 21~Dealer : 11"
  const anyColour = parts[3] || ""; // "Any Colour : Yes"
  
  // Parse total into lines (split by ~)
  const totalLines = total.split('~').filter(Boolean);
  
  // Parse dealer from total
  let dealerScore = "";
  const dealerMatch = total.match(/Dealer\s*:\s*(\d+)/);
  if (dealerMatch) {
    dealerScore = dealerMatch[1];
  }
  
  return { winners, pairPlus, totalLines, dealerScore, anyColour };
};

// Map win string to display letter (comma-separated winners -> "R" for all)
const mapWinCircle = (win) => {
  if (!win) return "R";
  return "R"; // Always show "R" as per image
};

const ResultTeen8 = ({ data = [], gameData = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('teen8');
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: mapWinCircle(item.win),
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
        const response = await getLastResults('teen8');
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: mapWinCircle(item.win),
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
      mid = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid;
    }

    if (mid) {
      try {
        const response = await getDetailResults('teen8', mid.toString());
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

    const cards = detailResult?.card ? parseCards(detailResult.card) : { players: Array(8).fill([]), dealer: [] };
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    
    // Parse winners from rdesc or winnat (comma-separated or space-separated)
    const winnersStr = detailResult?.winnat || rdescData.winners || "";
    const winnerNumbers = winnersStr.split(/[,\s]+/).map(w => w.trim()).filter(Boolean);
    
    // Determine which players are winners
    const isWinner = Array(8).fill(false);
    winnerNumbers.forEach(num => {
      const playerIndex = parseInt(num) - 1;
      if (playerIndex >= 0 && playerIndex < 8) {
        isWinner[playerIndex] = true;
      }
    });

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      players: cards.players.map((playerCards, idx) => ({
        cards: playerCards,
        isWinner: isWinner[idx],
        playerNumber: idx + 1,
      })),
      dealer: { cards: cards.dealer },
      resultDetails: {
        winners: rdescData.winners || winnersStr.replace(/,/g, ' '),
        pairPlus: rdescData.pairPlus || "",
        totalLines: rdescData.totalLines || [],
        dealerScore: rdescData.dealerScore || "",
        anyColour: rdescData.anyColour || "",
      },
    };
  };

  const modalData = getModalData();
  const { winners = "", pairPlus = "", totalLines = [], dealerScore = "", anyColour = "" } = modalData?.resultDetails || {};

  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || []), ...(gameData?.data?.lrs || [])].map(mapWinCircle);

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className={`result-circle ${res === "R" ? "yes" : "no"}`}
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
          title="Teenpatti Open Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Players Layout: Left column (1,2,3), Middle (Dealer + 4,5), Right column (8,7,6) */}
          <div className="row mt-2">
            {/* Left Column: Players 1, 2, 3 */}
            <div className="col-md-3 text-center">
              {[0, 1, 2].map(playerIdx => {
                const player = modalData.players[playerIdx];
                return (
                  <div key={playerIdx} style={{ marginBottom: '20px' }}>
                    <h5 className="result-title">Player {player.playerNumber}</h5>
                    <div className="casino-result-cards">
                      {player.isWinner && (
                        <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaTrophy color="#4caf50" size={24} />
                        </div>
                      )}
                      {player.cards?.map((card, idx) => (
                        card && (
                          <img
                            key={idx}
                            src={card}
                            alt={`Player ${player.playerNumber} Card ${idx + 1}`}
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
                );
              })}
            </div>

            {/* Middle Column: Dealer + Players 4, 5 */}
            <div className="col-md-6 text-center">
              {/* Dealer */}
              <div style={{ marginBottom: '20px' }}>
                <h5 className="result-title">Dealer</h5>
                <div className="casino-result-cards">
                  {modalData.dealer?.cards?.map((card, idx) => (
                    card && (
                      <img
                        key={idx}
                        src={card}
                        alt={`Dealer Card ${idx + 1}`}
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

              {/* Players 4, 5 */}
              {[3, 4].map(playerIdx => {
                const player = modalData.players[playerIdx];
                return (
                  <div key={playerIdx} style={{ marginBottom: '20px' }}>
                    <h5 className="result-title">Player {player.playerNumber}</h5>
                    <div className="casino-result-cards">
                      {player.isWinner && (
                        <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaTrophy color="#4caf50" size={24} />
                        </div>
                      )}
                      {player.cards?.map((card, idx) => (
                        card && (
                          <img
                            key={idx}
                            src={card}
                            alt={`Player ${player.playerNumber} Card ${idx + 1}`}
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
                );
              })}
            </div>

            {/* Right Column: Players 8, 7, 6 */}
            <div className="col-md-3 text-center">
              {[7, 6, 5].map(playerIdx => {
                const player = modalData.players[playerIdx];
                return (
                  <div key={playerIdx} style={{ marginBottom: '20px' }}>
                    <h5 className="result-title">Player {player.playerNumber}</h5>
                    <div className="casino-result-cards">
                      {player.isWinner && (
                        <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                          <FaTrophy color="#4caf50" size={24} />
                        </div>
                      )}
                      {player.cards?.map((card, idx) => (
                        card && (
                          <img
                            key={idx}
                            src={card}
                            alt={`Player ${player.playerNumber} Card ${idx + 1}`}
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
                );
              })}
            </div>
          </div>

          {/* Result Details */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-10">
              <div className="casino-result-desc">
                {winners && (
                  <div className="casino-result-desc-item">
                    <div>Winner:</div>
                    <div>{winners}</div>
                  </div>
                )}
                {pairPlus && (
                  <div className="casino-result-desc-item">
                    <div>Pair Plus:</div>
                    <div>{pairPlus}</div>
                  </div>
                )}
                {totalLines.length > 0 && (
                  <div className="casino-result-desc-item">
                    <div>Total:</div>
                    <div>
                      {totalLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}
                {dealerScore && (
                  <div className="casino-result-desc-item">
                    <div>Dealer:</div>
                    <div>{dealerScore}</div>
                  </div>
                )}
                {anyColour && (
                  <div className="casino-result-desc-item">
                    <div>Any Colour:</div>
                    <div>{anyColour}</div>
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

export default ResultTeen8;
