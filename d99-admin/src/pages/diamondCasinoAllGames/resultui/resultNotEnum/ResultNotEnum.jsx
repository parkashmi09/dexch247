import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "./Result.css";

// Helper function to map card string to image path
const getCardImage = (cardString) => {
  if (!cardString) return null;
  // Use local asset paths - try tablecard directory
  return `/assets/img/tablecard/${cardString}.jpg`;
};

// Helper function to parse card string (e.g., "10SS,AHH,9HH,5CC,4HH,3CC")
const parseCards = (cardString) => {
  if (!cardString) return [];
  
  const cards = cardString.split(',');
  return cards.map(card => {
    const cardTrimmed = card.trim();
    // Extract card value and suit (e.g., "10SS" -> "10" and "SS")
    const match = cardTrimmed.match(/(\d+|A|J|Q|K)([SHCD]{2})/);
    if (match) {
      return {
        value: match[1],
        suit: match[2],
        full: cardTrimmed,
        image: getCardImage(cardTrimmed)
      };
    }
    return { 
      value: cardTrimmed, 
      suit: '', 
      full: cardTrimmed,
      image: getCardImage(cardTrimmed)
    };
  });
};

// Helper function to parse rdesc for notEnum
// Format: "Even  Odd  Odd  Odd  Even  Odd#Black  Red  Red  Black  Red  Black#High  Low  High  Low  Low  Low#10  1  9  5  4  3#Baccarat 2 (B1 : 0  |  B2 : 2)"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  
  const parts = rdesc.split('#').map(p => p.trim());
  
  return {
    oddEven: parts[0] || "",      // "Even  Odd  Odd  Odd  Even  Odd"
    redBlack: parts[1] || "",     // "Black  Red  Red  Black  Red  Black"
    lowHigh: parts[2] || "",      // "High  Low  High  Low  Low  Low"
    cardValues: parts[3] || "",   // "10  1  9  5  4  3"
    baccarat: parts[4] || "",     // "Baccarat 2 (B1 : 0  |  B2 : 2)"
  };
};

const ResultNotEnum = ({ 
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
        const response = await getLastResults('notenum');
        if (response?.data?.data?.res) {
          // Map win values: "0" = "R" (Red/Result), "1" = "B" (Black), etc.
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "0" ? "R" : item.win
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
    setShowModal(true);
    
    // Find the mid for this result
    let mid = null;
    if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    }
    
    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('notenum', mid.toString());
        if (response?.data?.data?.t1) {
          setDetailResult(response.data.data.t1);
        }
      } catch (error) {
        console.error('Error fetching detail results:', error);
      }
    }
    
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setDetailResult(null);
  };

  // Format modal data based on selected result
  const getModalData = () => {
    if (!selectedResult && !detailResult) return null;

    const cards = detailResult?.card ? parseCards(detailResult.card) : [];
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};
    
    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || "N/A",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || "N/A",
      cards: cards,
      resultDetails: {
        oddEven: rdescData.oddEven || "",
        redBlack: rdescData.redBlack || "",
        lowHigh: rdescData.lowHigh || "",
        cardValues: rdescData.cardValues || "",
        baccarat: rdescData.baccarat || "",
      },
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults.map(r => r.win)
    : data;

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

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Note Number Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Cards Display */}
          {modalData.cards && modalData.cards.length > 0 && (
            <div className="row mt-2">
              <div className="col-12">
                <div className="casino-result-cards d-flex justify-content-center gap-2 flex-wrap">
                  {modalData.cards.map((card, idx) => (
                    card.image ? (
                      <img
                        key={idx}
                        src={card.image}
                        alt={`${card.value} ${card.suit}`}
                        onError={(e) => {
                          // Fallback to card-results folder if tablecard doesn't exist
                          const cardName = card.image.split('/').pop();
                          const fallbackPath = `/assets/img/card-results/${cardName}`;
                          if (e.target.src !== fallbackPath) {
                            e.target.src = fallbackPath;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                        style={{ border: '2px solid #ffd700', borderRadius: '4px' }}
                      />
                    ) : null
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result Details */}
          {modalData.resultDetails && (
            <div className="row mt-2 justify-content-center">
              <div className="col-md-6">
                <div className="casino-result-desc">
                  {modalData.resultDetails.oddEven && (
                    <div className="casino-result-desc-item">
                      <div>Odd/Even:</div>
                      <div>{modalData.resultDetails.oddEven}</div>
                    </div>
                  )}
                  {modalData.resultDetails.redBlack && (
                    <div className="casino-result-desc-item">
                      <div>Red/Black:</div>
                      <div>{modalData.resultDetails.redBlack}</div>
                    </div>
                  )}
                  {modalData.resultDetails.lowHigh && (
                    <div className="casino-result-desc-item">
                      <div>Low/High:</div>
                      <div>{modalData.resultDetails.lowHigh}</div>
                    </div>
                  )}
                  {modalData.resultDetails.cardValues && (
                    <div className="casino-result-desc-item">
                      <div>Cards:</div>
                      <div>{modalData.resultDetails.cardValues}</div>
                    </div>
                  )}
                  {modalData.resultDetails.baccarat && (
                    <div className="casino-result-desc-item">
                      <div>Baccarat:</div>
                      <div>{modalData.resultDetails.baccarat}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultNotEnum;
