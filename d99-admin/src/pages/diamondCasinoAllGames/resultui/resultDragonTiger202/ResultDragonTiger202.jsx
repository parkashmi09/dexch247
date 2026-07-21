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
    
    // Use card-results folder with full card code (e.g., "3DD.jpg", "6SS.jpg")
    // Format: rank + suit (DD, SS, CC, HH)
    return `/assets/img/card-results/${cardCode}.jpg`;
  } catch (e) {
    return null;
  }
};

// Helper function to parse card string and split into Dragon and Tiger cards
const parseCards = (cardString) => {
  if (!cardString) return { dragon: null, tiger: null };
  
  const cards = cardString.split(',');
  const dragonCard = cards[0] ? getCardImage(cards[0].trim()) : null;
  const tigerCard = cards[1] ? getCardImage(cards[1].trim()) : null;
  
  return { dragon: dragonCard, tiger: tigerCard };
};

// Helper function to parse rdesc: "Tiger#No#D : Odd  |  T : Even#D : Red  |  T : Black#D : 3  |  T : 6"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  
  const parts = rdesc.split('#');
  const winner = parts[0] || "";
  const pair = parts[1] || "No";
  
  // Part 2: Odd/Even - "D : Odd  |  T : Even"
  const oddEvenPart = parts[2] || "";
  const oddEvenMatch = oddEvenPart.match(/D\s*:\s*(\w+)\s*\|\s*T\s*:\s*(\w+)/);
  const dragonOddEven = oddEvenMatch ? oddEvenMatch[1].trim() : "";
  const tigerOddEven = oddEvenMatch ? oddEvenMatch[2].trim() : "";
  
  // Part 3: Color - "D : Red  |  T : Black"
  const colorPart = parts[3] || "";
  const colorMatch = colorPart.match(/D\s*:\s*(\w+)\s*\|\s*T\s*:\s*(\w+)/);
  const dragonColor = colorMatch ? colorMatch[1].trim() : "";
  const tigerColor = colorMatch ? colorMatch[2].trim() : "";
  
  // Part 4: Card - "D : 3  |  T : 6"
  const cardPart = parts[4] || "";
  const cardMatch = cardPart.match(/D\s*:\s*(\w+)\s*\|\s*T\s*:\s*(\w+)/);
  const dragonCard = cardMatch ? cardMatch[1].trim() : "";
  const tigerCard = cardMatch ? cardMatch[2].trim() : "";
  
  return {
    winner,
    pair,
    dragonOddEven,
    tigerOddEven,
    dragonColor,
    tigerColor,
    dragonCard,
    tigerCard,
  };
};

const ResultDragonTiger202 = ({ 
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
        const response = await getLastResults('dt202');
        if (response?.success && response?.data?.data?.res) {
          // Map win values: "1" = "D" (Dragon), "2" = "T" (Tiger)
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "D" : item.win === "2" ? "T" : item.win
          }));
          setLastResults(mappedResults);
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
        const response = await getDetailResults('dt202', mid.toString());
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
    const winner = detailResult.winnat || rdescData.winner || "";
    const winValue = detailResult.win;
    
    // Determine which side is the winner
    const isDragonWinner = winValue === "1" || winner.toLowerCase() === "dragon";
    const isTigerWinner = winValue === "2" || winner.toLowerCase() === "tiger";

    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      dragon: {
        card: cards.dragon,
        isWinner: isDragonWinner,
      },
      tiger: {
        card: cards.tiger,
        isWinner: isTigerWinner,
      },
      resultDetails: {
        winner: winner,
        pair: rdescData.pair || "No",
        oddEven: `D : ${rdescData.dragonOddEven}  |  T : ${rdescData.tigerOddEven}`,
        color: `D : ${rdescData.dragonColor}  |  T : ${rdescData.tigerColor}`,
        card: `D : ${rdescData.dragonCard}  |  T : ${rdescData.tigerCard}`,
      },
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults
    : data.map((res, idx) => ({ win: res === "D" ? "D" : res === "T" ? "T" : res, mid: null }));

  return (
    <>
      <div className="result-row dragon-tiger casino-last-results">
        {allResults.map((resultItem, index) => {
          const win = resultItem.win;
          const isDragon = win === "D" || win === "1";
          return (
            <div
              key={index}
              className={`result-circle ${isDragon ? "result-dragon" : "result-tiger"}`}
              onClick={() => resultItem.mid && handleResultClick(resultItem, index)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {isDragon ? "D" : "T"}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="20-20 Dragon Tiger 2 Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Dragon and Tiger Cards Section */}
          <div className="row mt-2">
            {/* Dragon */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Dragon</h4>
              <div className="casino-result-cards">
                {modalData.dragon?.isWinner && (
                  <div className="casino-winner-icon casino-winner-icon-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
                {modalData.dragon?.card && (
                  <img
                    src={modalData.dragon.card}
                    alt="Dragon Card"
                    onError={(e) => {
                      // Fallback to tablecard folder if card-results doesn't exist
                      const cardName = modalData.dragon.card.split('/').pop();
                      const fallbackPath = `/assets/img/tablecard/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Tiger */}
            <div className="col-md-6 text-center">
              <h4 className="result-title">Tiger</h4>
              <div className="casino-result-cards">
                {modalData.tiger?.card && (
                  <img
                    src={modalData.tiger.card}
                    alt="Tiger Card"
                    onError={(e) => {
                      // Fallback to tablecard folder if card-results doesn't exist
                      const cardName = modalData.tiger.card.split('/').pop();
                      const fallbackPath = `/assets/img/tablecard/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
                {modalData.tiger?.isWinner && (
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
                {modalData.resultDetails.winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner:</div>
                    <div>{modalData.resultDetails.winner}</div>
                  </div>
                )}
                <div className="casino-result-desc-item">
                  <div>Pair:</div>
                  <div>{modalData.resultDetails.pair || 'No'}</div>
                </div>
                {modalData.resultDetails.oddEven && (
                  <div className="casino-result-desc-item">
                    <div>Odd/Even:</div>
                    <div>{modalData.resultDetails.oddEven}</div>
                  </div>
                )}
                {modalData.resultDetails.color && (
                  <div className="casino-result-desc-item">
                    <div>Color:</div>
                    <div>{modalData.resultDetails.color}</div>
                  </div>
                )}
                {modalData.resultDetails.card && (
                  <div className="casino-result-desc-item">
                    <div>Card:</div>
                    <div>{modalData.resultDetails.card}</div>
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

export default ResultDragonTiger202;
