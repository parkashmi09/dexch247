import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";

const getCardImage = (cardString) => cardString ? `/assets/img/tablecard/${cardString}.jpg` : null;

// Split 9 cards into Tiger (0-2), Lion (3-5), Dragon (6-8)
const parseCards = (cardString) => {
  if (!cardString) return { tiger: [], lion: [], dragon: [] };
  const cards = cardString.split(',').map(c => c.trim());
  return {
    tiger: cards.slice(0, 3).map(c => getCardImage(c)),
    lion: cards.slice(3, 6).map(c => getCardImage(c)),
    dragon: cards.slice(6, 9).map(c => getCardImage(c)),
  };
};

// rdesc like "Lion#L : Pair"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  const winner = parts[0] || "";
  const others = parts[1] || "";
  return { winner, others };
};

// Map win code to letter for circles
const mapWinCircle = (win) => {
  if (win === "1") return "T";
  if (win === "2") return "L";
  if (win === "3") return "D";
  return win || "";
};

const ResultTeen9 = ({ data = [], gameData = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('teen9');
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
        const response = await getLastResults('teen9');
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
        const response = await getDetailResults('teen9', mid.toString());
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

    const cards = detailResult?.card ? parseCards(detailResult.card) : { tiger: [], lion: [], dragon: [] };
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    const winnerName = detailResult?.winnat || rdescData.winner || "";
    const winCode = detailResult?.win;

    const isTiger = winCode === "1" || winnerName.toLowerCase().includes("tiger") || selectedResult === "T";
    const isLion = winCode === "2" || winnerName.toLowerCase().includes("lion") || selectedResult === "L";
    const isDragon = winCode === "3" || winnerName.toLowerCase().includes("dragon") || selectedResult === "D";

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid || "",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      tiger: { cards: cards.tiger, isWinner: isTiger },
      lion: { cards: cards.lion, isWinner: isLion },
      dragon: { cards: cards.dragon, isWinner: isDragon },
      resultDetails: {
        winner: winnerName,
        others: rdescData.others || "",
      },
    };
  };

  const modalData = getModalData();
  const { winner = "", others = "" } = modalData?.resultDetails || {};

  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || []), ...(gameData?.data?.lrs || [])].map(mapWinCircle);

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className={`result-circle ${res === "T" ? "yes" : "no"}`} // use yes/no colors; T treated as A
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
          title="Teenpatti Test Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          <div className="row mt-2 text-center">
            <div className="col-md-4">
              <h4 className="result-title">Tiger</h4>
              <div className="casino-result-cards">
                {modalData.tiger?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrophy color="#4caf50" size={28} />
                  </div>
                )}
                {modalData.tiger?.cards?.map((card, idx) => (
                  card && (
                    <img
                      key={idx}
                      src={card}
                      alt={`Tiger Card ${idx + 1}`}
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

            <div className="col-md-4">
              <h4 className="result-title">Lion</h4>
              <div className="casino-result-cards">
                {modalData.lion?.cards?.map((card, idx) => (
                  card && (
                    <img
                      key={idx}
                      src={card}
                      alt={`Lion Card ${idx + 1}`}
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
                {modalData.lion?.isWinner && (
                  <div className="casino-winner-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                    <FaTrophy color="#4caf50" size={28} />
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <h4 className="result-title">Dragon</h4>
              <div className="casino-result-cards">
                {modalData.dragon?.cards?.map((card, idx) => (
                  card && (
                    <img
                      key={idx}
                      src={card}
                      alt={`Dragon Card ${idx + 1}`}
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
                {modalData.dragon?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                    <FaTrophy color="#4caf50" size={28} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row mt-2 justify-content-center">
            <div className="col-md-8">
              <div className="casino-result-desc">
                {winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner:</div>
                    <div>{winner}</div>
                  </div>
                )}
              </div>
              {others && (
                <div className="casino-result-desc" style={{ marginTop: '10px' }}>
                  <div className="casino-result-desc-item">
                    <div>Others:</div>
                    <div>{others}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTeen9;
