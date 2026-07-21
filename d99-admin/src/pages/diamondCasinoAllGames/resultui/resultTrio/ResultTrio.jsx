import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";

// Helper function to map card string to image path
const getCardImage = (cardString) => {
  if (!cardString) return null;
  // Use local asset paths - try tablecard first, then card-results as fallback
  return `/assets/img/tablecard/${cardString}.jpg`;
};

// Helper function to parse card string for trio (format: "ACC,6CC,8SS" = 3 cards)
const parseCards = (cardString) => {
  if (!cardString) return [];
  
  const cards = cardString.split(',');
  return cards.map(card => getCardImage(card.trim())).filter(Boolean);
};

// Helper function to parse rdesc (format: "No (15)#1 2 4##Even#")
const parseRdesc = (rdesc) => {
  if (!rdesc) return {
    session: "",
    threeCard: "",
    redBlack: "",
    oddEven: "",
    pattern: ""
  };
  
  const parts = rdesc.split('#').map(p => p.trim());
  
  // Part 0: Session - e.g. "No (15)" or "Yes (23)"
  // Display format: "Session (15) No" or "Session (23) Yes"
  const sessionPart = parts[0] || "";
  let session = sessionPart;
  if (sessionPart) {
    // If it contains parentheses, format it properly
    const sessionMatch = sessionPart.match(/(\w+)\s*\((\d+)\)/);
    if (sessionMatch) {
      session = `Session (${sessionMatch[2]}) ${sessionMatch[1]}`;
    } else {
      session = sessionPart;
    }
  }
  
  // Part 1: 124/JQK - e.g. "1 2 4" or "J Q K"
  // Format: "124/JQK 124" or "124/JQK J Q K"
  const threeCardPart = parts[1] || "";
  let threeCard = threeCardPart;
  if (threeCardPart) {
    // Determine if it's 124 or JQK
    if (threeCardPart.includes('1') || threeCardPart.includes('2') || threeCardPart.includes('4')) {
      threeCard = `124/JQK ${threeCardPart.replace(/\s+/g, '')}`;
    } else if (threeCardPart.includes('J') || threeCardPart.includes('Q') || threeCardPart.includes('K')) {
      threeCard = `124/JQK ${threeCardPart}`;
    }
  }
  
  // Part 2: Red/Black
  const redBlackPart = parts[2] || "";
  let redBlack = redBlackPart;
  if (redBlackPart) {
    redBlack = `Red/Black ${redBlackPart}`;
  }
  
  // Part 3: Odd/Even
  const oddEvenPart = parts[3] || "";
  let oddEven = oddEvenPart;
  if (oddEvenPart) {
    oddEven = `Odd/Even ${oddEvenPart}`;
  }
  
  // Part 4: Pattern (Pair, Flush, Straight, Trio, Straight Flush)
  const patternPart = parts[4] || "";
  let pattern = patternPart;
  if (patternPart) {
    pattern = `Pattern ${patternPart}`;
  }
  
  return { session, threeCard, redBlack, oddEven, pattern };
};

const ResultTrio = ({ 
  data = [], 
  gameData = {},
  playerA = {},
  playerB = {},
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
        const response = await getLastResults('trio');
        if (response?.data?.data?.res) {
          // For trio, win is "0", so we'll show "R" for all results
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: "R" // Show "R" for result
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
    
    // First, ensure we have last results
    if (lastResults.length === 0) {
      try {
        const response = await getLastResults('trio');
        if (response?.data?.data?.res) {
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: "R"
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }
    
    // Find the mid for this result
    let mid = null;
    if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      mid = gameData?.data?.data?.mid || gameData?.mid;
    }
    
    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('trio', mid.toString());
        if (response?.data?.data?.t1) {
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
    if (!selectedResult) return null;

    // Use detailResult if available, otherwise fallback to defaults
    const cards = detailResult?.card ? parseCards(detailResult.card) : playerA?.cards || [];
    const rdescData = detailResult?.rdesc ? parseRdesc(detailResult.rdesc) : {};

    return {
      roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "157250124095658",
      matchTime: detailResult?.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      cards: cards,
      resultDetails: {
        session: rdescData.session || "",
        threeCard: rdescData.threeCard || "",
        redBlack: rdescData.redBlack || "",
        oddEven: rdescData.oddEven || "",
        pattern: rdescData.pattern || "",
      },
    };
  };

  const modalData = getModalData();
  const {
    session = "",
    threeCard = "",
    redBlack = "",
    oddEven = "",
    pattern = ""
  } = modalData?.resultDetails || {};

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || [])];

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className="result-circle yes"
            onClick={() => handleResultClick(res, index)}
            style={{ cursor: 'pointer' }}
          >
            {res || "R"}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Trio Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Three Cards Display */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-12 text-center">
              <div className="casino-result-cards" style={{ justifyContent: 'center', gap: '15px' }}>
                {modalData.cards?.map((card, index) => (
                  card && (
                    <img
                      key={index}
                      src={card}
                      alt={`Card ${index + 1}`}
                      onError={(e) => {
                        // Fallback to card-results folder if tablecard doesn't exist
                        const cardName = card.split('/').pop();
                        const fallbackPath = `/assets/img/card-results/${cardName}`;
                        if (e.target.src !== fallbackPath) {
                          e.target.src = fallbackPath;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                      style={{ border: '2px solid #ffd700', borderRadius: '4px', maxWidth: '120px', maxHeight: '170px' }}
                    />
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Result Details */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-6">
              <div className="casino-result-desc">
                {session && (
                  <div className="casino-result-desc-item">
                    <div>Session:</div>
                    <div>{session}</div>
                  </div>
                )}
                {threeCard && (
                  <div className="casino-result-desc-item">
                    <div>124/JQK:</div>
                    <div>{threeCard}</div>
                  </div>
                )}
                {redBlack && (
                  <div className="casino-result-desc-item">
                    <div>Red/Black:</div>
                    <div>{redBlack}</div>
                  </div>
                )}
                {oddEven && (
                  <div className="casino-result-desc-item">
                    <div>Odd/Even:</div>
                    <div>{oddEven}</div>
                  </div>
                )}
                {pattern && (
                  <div className="casino-result-desc-item">
                    <div>Pattern:</div>
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

export default ResultTrio;
