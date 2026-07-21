import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";

// Import dice images
import dice1 from '../../../../assets/img/dolidana/dice1.png';
import dice2 from '../../../../assets/img/dolidana/dice2.png';
import dice3 from '../../../../assets/img/dolidana/dice3.png';
import dice4 from '../../../../assets/img/dolidana/dice4.png';
import dice5 from '../../../../assets/img/dolidana/dice5.png';
import dice6 from '../../../../assets/img/dolidana/dice6.png';

const diceImages = {
    1: dice1,
    2: dice2,
    3: dice3,
    4: dice4,
    5: dice5,
    6: dice6,
};

// Helper function to parse dice string (e.g., "3,6" -> [3, 6])
const parseDice = (cardString) => {
  if (!cardString) return { die1: null, die2: null, sum: 0 };
  
  const dice = cardString.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n) && n > 0);
  const die1 = dice[0] || null;
  const die2 = dice[1] || null;
  const sum = (die1 || 0) + (die2 || 0);
  
  return { die1, die2, sum };
};

// Helper function to parse rdesc: "Player A#No#-#9#Odd#Greater than 7"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  
  const parts = rdesc.split('#');
  return {
    turn: parts[0] || "", // "Player A" or "Player B"
    anyPair: parts[1] || "No", // "No" or "Yes"
    particularPair: parts[2] || "-", // "-" or specific pair
    sumTotal: parts[3] || "", // Sum total number
    oddEven: parts[4] || "", // "Odd" or "Even"
    lucky7: parts[5] || "", // "Less than 7", "Greater than 7", or "Lucky 7"
  };
};

const ResultDoliDana = ({ 
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
        const response = await getLastResults('dolidana');
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
        const response = await getDetailResults('dolidana', mid.toString());
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

    const dice = parseDice(detailResult.card);
    const rdescData = parseRdesc(detailResult.rdesc);
    
    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      dice: {
        die1: dice.die1,
        die2: dice.die2,
        sum: dice.sum,
      },
      resultDetails: {
        turn: rdescData.turn || "",
        anyPair: rdescData.anyPair || "No",
        particularPair: rdescData.particularPair || "-",
        sumTotal: rdescData.sumTotal || dice.sum.toString(),
        oddEven: rdescData.oddEven || "",
        lucky7: rdescData.lucky7 || "",
      },
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults
    : data.map((res, idx) => ({ win: res, mid: null }));

  return (
    <>
      <div className="result-row">
        {allResults.map((resultItem, index) => {
          const win = resultItem.win || resultItem;
          return (
            <div
              key={index}
              className={`result-circle ${win === "A" || win === "1" ? "yes" : win === "B" || win === "2" ? "no" : ""}`}
              onClick={() => resultItem.mid && handleResultClick(resultItem, index)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default', color: '#ffff33' }}
            >
         R
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Doli dana Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Dice and Result Details in Flex Row */}
          <div className="row mt-2">
            {/* Dice Visualization Section - Left Side */}
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <div className="casino-result-cards">
                {modalData.dice.die1 && diceImages[modalData.dice.die1] && (
                  <img
                    src={diceImages[modalData.dice.die1]}
                    alt={`Dice ${modalData.dice.die1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    style={{ width: '60px', height: '60px', margin: '0 5px' }}
                  />
                )}
                {modalData.dice.die2 && diceImages[modalData.dice.die2] && (
                  <img
                    src={diceImages[modalData.dice.die2]}
                    alt={`Dice ${modalData.dice.die2}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    style={{ width: '60px', height: '60px', margin: '0 5px' }}
                  />
                )}
              </div>
            </div>

            {/* Result Details - Right Side */}
            <div className="col-md-6">
              <div className="casino-result-desc">
                {modalData.resultDetails.turn && (
                  <div className="casino-result-desc-item">
                    <div>Turn:</div>
                    <div>{modalData.resultDetails.turn}</div>
                  </div>
                )}
                <div className="casino-result-desc-item">
                  <div>Any Pair:</div>
                  <div>{modalData.resultDetails.anyPair}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Particular Pair:</div>
                  <div>{modalData.resultDetails.particularPair}</div>
                </div>
                {modalData.resultDetails.sumTotal && (
                  <div className="casino-result-desc-item">
                    <div>Sum Total:</div>
                    <div>{modalData.resultDetails.sumTotal}</div>
                  </div>
                )}
                {modalData.resultDetails.oddEven && (
                  <div className="casino-result-desc-item">
                    <div>Odd/Even:</div>
                    <div>{modalData.resultDetails.oddEven}</div>
                  </div>
                )}
                {modalData.resultDetails.lucky7 && (
                  <div className="casino-result-desc-item">
                    <div>Lucky 7:</div>
                    <div>{modalData.resultDetails.lucky7}</div>
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

export default ResultDoliDana;
