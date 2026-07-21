import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import ballBlankImage from '../../../../assets/img/ball-blank.png';
import "../resultTeen20c/Result.css";

// Helper function to format result text
const formatResultText = (rdesc, win) => {
  if (rdesc) return rdesc;
  // If no rdesc, format win value
  if (win === "7" || win === "W") return "Wicket";
  if (win && !isNaN(win)) return `${win} Run${win !== "1" ? "s" : ""}`;
  return win || "";
};

// Helper function to map win value to display text
const getDisplayText = (win) => {
  if (!win) return "";
  // win="7" represents wicket, show as "W"
  if (win === "7" || win === "W") return "W";
  // Other values are runs
  return win;
};

// Helper function to check if win value is a wicket
const isWicket = (win) => {
  if (!win) return false;
  const winStr = win.toString().toLowerCase();
  return winStr === "w" || winStr === "7" || winStr === "wicket" || winStr.includes("wicket");
};

const ResultBallByBall = ({
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
        const response = await getLastResults('ballbyball');

        // Handle res array structure
        if (response?.data?.data?.res && Array.isArray(response.data.data.res)) {
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win || "",
            displayText: getDisplayText(item.win)
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
        const response = await getLastResults('ballbyball');
        if (response?.data?.data?.res && Array.isArray(response.data.data.res)) {
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win || "",
            displayText: getDisplayText(item.win)
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }

    // Find the mid for this result
    let mid = null;
    if (typeof result === 'object' && result.mid) {
      mid = result.mid;
    } else if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      // For older results, try to get from gameData or use a default
      mid = gameData?.data?.data?.mid || gameData?.mid;
    }

    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('ballbyball', mid.toString());
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

    // Use detailResult if available, otherwise use selectedResult data
    const resultData = detailResult || (typeof selectedResult === 'object' ? selectedResult.fullData : null);

    if (!resultData) {
      // Fallback to basic data
      const winValue = typeof selectedResult === 'object' ? selectedResult.win : selectedResult;
      return {
        roundId: gameData?.data?.data?.mid || gameData?.mid || "N/A",
        matchTime: gameData?.data?.data?.mt || new Date().toLocaleString(),
        resultText: formatResultText("", winValue),
        win: winValue || "",
      };
    }

    const resultText = formatResultText(resultData.rdesc, resultData.win);

    return {
      roundId: resultData.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: resultData.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      resultText: resultText,
      win: resultData.win || "",
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win || r.displayText || "")
    : [...data, ...(gameData?.lrs || [])];

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => {
          const winValue = typeof res === 'object' ? (res.win || res.displayText || "") : res;
          const displayText = getDisplayText(winValue);
          const resultObj = typeof res === 'object' ? res : (lastResults[index] || { win: res });
          const isWicketResult = isWicket(winValue);

          return (
            <div
              key={index}
              className="result-circle yes"
              onClick={() => handleResultClick(resultObj, index)}
              style={{ cursor: 'pointer' }}
              title={isWicketResult ? "Wicket" : (displayText ? `${displayText} Run${displayText !== "1" ? "s" : ""}` : displayText)}
            >
              {displayText}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Ball By Ball Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Result Details with Cricket Ball */}
          <div className="text-center">
            <div className="cricket20ballpopup cricket20ballresult">
              <img src={ballBlankImage} alt="Cricket Ball" />
              <span>{modalData.resultText || formatResultText("", modalData.win)}</span>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultBallByBall;
