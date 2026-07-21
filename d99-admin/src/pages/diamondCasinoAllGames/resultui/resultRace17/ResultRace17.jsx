import React, { useState, useEffect } from 'react';
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

    // Use card-results folder with full card code (e.g., "8CC.jpg", "JDD.jpg")
    // Format: rank + suit (DD, SS, CC, HH)
    return `/assets/img/card-results/${cardCode}.jpg`;
  } catch (e) {
    return null;
  }
};

// Helper function to parse card string and get array of card images
const parseCards = (cardString) => {
  if (!cardString) return [];

  const cards = cardString.split(',').map(card => card.trim());
  return cards.map(card => getCardImage(card)).filter(card => card !== null);
};

// Helper function to parse rdesc string
// Format: "No (13)#Big  Small  Small  Small  Small#No  Yes  No  Yes  No#Yes"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {
    raceTo17: "",
    bigCard: [],
    zeroCard: [],
    oneZeroCard: ""
  };

  const parts = rdesc.split('#').map(part => part.trim());
  
  return {
    raceTo17: parts[0] || "", // "No (13)"
    bigCard: parts[1] ? parts[1].split(/\s+/).filter(s => s.length > 0) : [], // ["Big", "Small", "Small", "Small", "Small"]
    zeroCard: parts[2] ? parts[2].split(/\s+/).filter(s => s.length > 0) : [], // ["No", "Yes", "No", "Yes", "No"]
    oneZeroCard: parts[3] || "" // "Yes"
  };
};

// Helper function to determine if result is Yes or No for last results display
const getYesNoFromWin = (winValue, winnat) => {
  if (winnat) {
    const winnatLower = winnat.toLowerCase();
    if (winnatLower.includes('yes')) return 'Y';
    if (winnatLower.includes('no')) return 'N';
  }
  
  // win "1" = Yes, "0" = No
  const win = winValue?.toString() || "0";
  return win === "1" ? "Y" : "N";
};

const ResultRace17 = ({
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
        const response = await getLastResults('race17');
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
        const response = await getDetailResults('race17', mid.toString());
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
    const rdescData = parseRdesc(detailResult.rdesc);

    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      cards: cards,
      rdescData: rdescData,
      winnat: detailResult.winnat || "",
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults
    : data.map((res, idx) => ({ win: res === "Y" ? "1" : "0", mid: null, winnat: res === "Y" ? "Yes" : "No" }));

  return (
    <>
      <div className="result-row">
        {allResults.map((resultItem, index) => {
          const yesNo = getYesNoFromWin(resultItem.win, resultItem.winnat);
          const isYes = yesNo === "Y";

          return (
            <div
              key={index}
              className={`result-circle ${isYes ? 'result-yes' : 'result-no'}`}
              onClick={() => resultItem.mid && handleResultClick(resultItem, index)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {yesNo}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Race to 17 Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Cards Section */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-12">
              <div className="casino-result-cards" style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {modalData.cards.map((card, index) => (
                  card && (
                    <div
                      key={index}
                      className="card-wrapper"
                      style={{
                        perspective: '1000px',
                        transformStyle: 'preserve-3d',
                        animation: `cardRotate 0.6s ease ${index * 0.1}s forwards`
                      }}
                    >
                      <img
                        src={card}
                        alt={`Card ${index + 1}`}
                        className="card-image"
                        style={{ transform: 'none' }}
                        onError={(e) => {
                          // Fallback to tablecard folder if card-results doesn't exist
                          const cardName = card.split('/').pop();
                          const fallbackPath = `/assets/img/tablecard/${cardName}`;
                          if (e.target.src !== fallbackPath) {
                            e.target.src = fallbackPath;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Result Breakdown Section */}
          <div className="row mt-3 justify-content-center">
            <div className="col-md-10">
              <div className="casino-result-desc">
                {/* Race to 17 */}
                {modalData.rdescData.raceTo17 && (
                  <div className="casino-result-desc-item">
                    <div>Race to 17</div>
                    <div>{modalData.rdescData.raceTo17}</div>
                  </div>
                )}

                {/* Big Card */}
                {modalData.rdescData.bigCard.length > 0 && (
                  <div className="casino-result-desc-item">
                    <div>Big Card</div>
                    <div>{modalData.rdescData.bigCard.join(' ')}</div>
                  </div>
                )}

                {/* Zero Card */}
                {modalData.rdescData.zeroCard.length > 0 && (
                  <div className="casino-result-desc-item">
                    <div>Zero Card</div>
                    <div>{modalData.rdescData.zeroCard.join(' ')}</div>
                  </div>
                )}

                {/* One Zero Card */}
                {modalData.rdescData.oneZeroCard && (
                  <div className="casino-result-desc-item">
                    <div>One Zero Card</div>
                    <div>{modalData.rdescData.oneZeroCard}</div>
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

        /* Race17 specific result colors */
        .race17 .casino-last-results .result-circle.result-yes {
          background-color: #355E3B;
          color: #ffeb3b;
        }

        .race17 .casino-last-results .result-circle.result-no {
          background-color: #355E3B;
          color: #ff9800;
        }
      `}</style>
    </>
  );
};

export default ResultRace17;
