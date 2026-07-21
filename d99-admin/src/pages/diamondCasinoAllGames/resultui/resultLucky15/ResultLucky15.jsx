import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import ballBlankImage from '../../../../assets/img/ball-blank.png';
import "../resultTeen20c/Result.css";

// Helper function to format run text
const formatRunText = (rdesc) => {
  if (!rdesc) return "";
  // rdesc format: "2 Run" or "1 Run" etc.
  return rdesc;
};

// Helper function to map win value to display text
const getDisplayText = (win) => {
  if (!win) return "";
  // win values: "1", "2", "3", "4", "5", "6" represent runs
  return win;
};

// Helper function to check if win value is a wicket
const isWicket = (win) => {
  if (!win) return false;
  // Wicket can be represented as "W", "7", "wicket", or other values
  const winStr = win.toString().toLowerCase();
  return winStr === "w" || winStr === "7" || winStr === "wicket" || winStr.includes("wicket");
};

const ResultLucky15 = ({
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
        const response = await getLastResults('lucky15');

        // Handle res array structure (Lucky15 API format)
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
        const response = await getLastResults('lucky15');
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
        const response = await getDetailResults('lucky15', mid.toString());
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
        runText: winValue ? `${winValue} Run${winValue !== "1" ? "s" : ""}` : "",
        win: winValue || "",
      };
    }

    const rdescText = formatRunText(resultData.rdesc);

    return {
      roundId: resultData.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: resultData.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      runText: rdescText || (resultData.win ? `${resultData.win} Run${resultData.win !== "1" ? "s" : ""}` : ""),
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
          title="LUCKY 15 Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Result Details with Cricket Ball */}
          <div className="text-center">
            <div className="cricket20ballpopup cricket20ballresult">
              <img src={ballBlankImage} alt="Cricket Ball" />
              <span>{modalData.runText || `${modalData.win} Run${modalData.win !== "1" ? "s" : ""}`}</span>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultLucky15;
