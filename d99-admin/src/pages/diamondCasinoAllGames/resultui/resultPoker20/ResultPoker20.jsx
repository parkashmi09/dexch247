import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";

const getCardImage = (cardString) => cardString ? `/assets/img/tablecard/${cardString}.jpg` : null;

// Parse 9 cards: Player A (2 cards), Player B (2 cards), Board (5 cards)
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [], board: [] };
  const cards = cardString.split(',').map(c => c.trim());
  
  return {
    playerA: cards.slice(0, 2).map(c => getCardImage(c)),
    playerB: cards.slice(2, 4).map(c => getCardImage(c)),
    board: cards.slice(4, 9).map(c => getCardImage(c)),
  };
};

// Parse rdesc: "Player B#A : Two Pair  |  B : Two Pair"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  
  const winner = parts[0] || ""; // "Player B"
  const other = parts[1] || ""; // "A : Two Pair  |  B : Two Pair"
  
  return { winner, other };
};

const ResultPoker20 = ({ data = [], gameData = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('poker20');
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
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
        const response = await getLastResults('poker20');
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
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
        const response = await getDetailResults('poker20', mid.toString());
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

    const cards = detailResult?.card ? parseCards(detailResult.card) : { playerA: [], playerB: [], board: [] };
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    
    const winner = detailResult?.winnat || rdescData.winner || "";
    const winValue = detailResult?.win;
    const isPlayerAWinner = winValue === "1" || winner === "Player A" || selectedResult === "A";
    const isPlayerBWinner = winValue === "2" || winner === "Player B" || selectedResult === "B";

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      playerA: {
        cards: cards.playerA,
        isWinner: isPlayerAWinner,
      },
      playerB: {
        cards: cards.playerB,
        isWinner: isPlayerBWinner,
      },
      board: cards.board,
      resultDetails: {
        winner: winner,
        other: rdescData.other || "",
      },
    };
  };

  const modalData = getModalData();
  const { winner = "", other = "" } = modalData?.resultDetails || {};

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

      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="20-20 Poker Result"
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
                {modalData.playerA?.cards?.map((card, idx) => (
                  card && (
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
                    />
                  )
                ))}
                {modalData.playerA?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                    <FaTrophy color="#4caf50" size={28} />
                  </div>
                )}
              </div>
            </div>

            {/* Player B */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player B</h4>
              <div className="casino-result-cards">
                {modalData.playerB?.cards?.map((card, idx) => (
                  card && (
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
                    />
                  )
                ))}
                {modalData.playerB?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                    <FaTrophy color="#4caf50" size={28} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Board Cards Section */}
          <div className="row mt-2">
            <div className="col-12 text-center">
              <h4 className="result-title">Board</h4>
              <div className="casino-result-cards">
                {modalData.board?.map((card, idx) => (
                  card && (
                    <img
                      key={idx}
                      src={card}
                      alt={`Board Card ${idx + 1}`}
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

          {/* Result Details */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-8">
              <div className="casino-result-desc">
                {winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner</div>
                    <div>{winner}</div>
                  </div>
                )}
                {other && (
                  <div className="casino-result-desc-item">
                    <div>Other</div>
                    <div>{other}</div>
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

export default ResultPoker20;
