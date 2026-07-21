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

    // Use card-results folder with full card code (e.g., "9CC.jpg", "KHH.jpg")
    // Format: rank + suit (DD, SS, CC, HH)
    return `/assets/img/card-results/${cardCode}.jpg`;
  } catch (e) {
    return null;
  }
};

// Helper function to map win value to result letter
const getWinLetter = (win) => {
  const winMap = {
    "1": "L", // Low Card -> L
    "2": "H",  // High Card -> H
    "0": "T" // Tie -> T
  };
  return winMap[win] || "";
};

// Helper function to parse rdesc for Lucky7: "High Card#Odd#Black#9#8 9 10"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};

  const parts = rdesc.split('#');
  const winner = parts[0] || "";
  const oddEven = parts[1] || "";
  const color = parts[2] || "";
  const card = parts[3] || "";
  const line = parts[4] || "";

  return {
    winner,
    oddEven,
    color,
    card,
    line,
  };
};

const ResultLucky5= ({
  data = [],
  gameData = {},
  gameType = 'lucky5',
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
        const response = await getLastResults(gameType);
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
  }, [gameType]);

  const handleResultClick = async (resultItem, index) => {
    setSelectedResult(resultItem);
    setLoading(true);

    const mid = resultItem?.mid;

    if (mid) {
      try {
        const response = await getDetailResults(gameType, mid.toString());
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

    const cardImage = getCardImage(detailResult.card);
    const rdescData = parseRdesc(detailResult.rdesc);
    const winner = detailResult.winnat || rdescData.winner || "";
    const winValue = detailResult.win;

    // Determine winner type
    const isHighCard = winValue === "2" || winner.toLowerCase().includes("high");
    const isLowCard = winValue === "1" || winner.toLowerCase().includes("low");
    const isTie = winValue === "0" || winner.toLowerCase().includes("tie");

    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      card: {
        image: cardImage,
        code: detailResult.card,
      },
      resultDetails: {
        winner: winner,
        oddEven: rdescData.oddEven || "",
        color: rdescData.color || "",
        card: rdescData.card || "",
        line: rdescData.line || "",
      },
      isHighCard,
      isLowCard,
      isTie,
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults
    : data.map((res, idx) => ({ win: res, mid: null }));

  return (
    <>
      <div className="result-row lucky7 casino-last-results">
        {allResults.map((resultItem, index) => {
          const win = resultItem.win;
          const winLetter = getWinLetter(win);

          let resultClass = "";
          if (winLetter === "L") resultClass = "result-a"; // L (Low Card) -> Orange
          else if (winLetter === "H") resultClass = "result-b"; // H (High Card) -> Yellow

          return (
            <div
              key={index}
              className={`result-circle ${resultClass}`}
              onClick={() => resultItem.mid && handleResultClick(resultItem, index)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {winLetter}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Lucky 7 - A Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Card Display Section */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-6 text-center">
              <div className="casino-result-cards">
                {modalData.card?.image && (
                  <img
                    src={modalData.card.image}
                    alt="Winning Card"
                    className="card-image"
                    onError={(e) => {
                      // Fallback to tablecard folder if card-results doesn't exist
                      const cardName = modalData.card.image.split('/').pop();
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
          </div>

          {/* Result Details */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-8">
              <div className="casino-result-desc">
                {modalData.resultDetails.winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner</div>
                    <div>{modalData.resultDetails.winner}</div>
                  </div>
                )}
                {modalData.resultDetails.oddEven && (
                  <div className="casino-result-desc-item">
                    <div>Odd/Even</div>
                    <div>{modalData.resultDetails.oddEven}</div>
                  </div>
                )}
                {modalData.resultDetails.color && (
                  <div className="casino-result-desc-item">
                    <div>Color</div>
                    <div>{modalData.resultDetails.color}</div>
                  </div>
                )}
                {modalData.resultDetails.card && (
                  <div className="casino-result-desc-item">
                    <div>Card</div>
                    <div>{modalData.resultDetails.card}</div>
                  </div>
                )}
                {modalData.resultDetails.line && (
                  <div className="casino-result-desc-item">
                    <div>Line</div>
                    <div>{modalData.resultDetails.line}</div>
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

export default ResultLucky5;

