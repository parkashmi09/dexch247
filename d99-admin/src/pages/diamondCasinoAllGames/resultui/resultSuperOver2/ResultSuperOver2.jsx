import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import CasinoResultBodySuperOver2 from '../../../casinoComponents/casinoResultModal/CasinoResultBodySuperOver2';
import "../resultSuperOver3/ResultSuperOver3.css";

const ResultSuperOver2 = ({ 
  data = [], 
  gameData = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Store original results with mid for later use
  const [originalResults, setOriginalResults] = useState([]);

  // Fetch last results on mount
  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('superover2');
        if (response?.data?.data?.res) {
          // Store original results
          setOriginalResults(response.data.data.res);
          // Store win as "1" or "2" for logic; display uses "I" / "E"
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "1" : item.win === "2" ? "2" : item.win
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
    if (lastResults.length === 0 || originalResults.length === 0) {
      try {
        const response = await getLastResults('superover2');
        if (response?.data?.data?.res) {
          setOriginalResults(response.data.data.res);
          const mappedResults = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "1" : item.win === "2" ? "2" : item.win
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }
    
    // Find the mid for this result
    let mid = null;
    if (index < originalResults.length) {
      mid = originalResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      mid = gameData?.data?.data?.mid || gameData?.mid;
    }
    
    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('superover2', mid.toString());
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

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [...(Array.isArray(data) ? data : []), ...(gameData?.lrs || [])];

  const winVal = (item) => (item && typeof item === "object" && item.win != null ? item.win : item);

  // Display "I" for team 1 (IND), "E" for team 2 (ENG) instead of "1" and "2"
  const resultLabel = (item) => {
    const w = winVal(item);
    if (w === "1" || w === "A") return "I";
    if (w === "2" || w === "B") return "E";
    return w;
  };

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => {
          const w = winVal(res);
          return (
            <div
              key={index}
              className={`result-circle ${w === "1" || w === "A" ? "yes" : w === "2" || w === "B" ? "no" : ""}`}
              onClick={() => handleResultClick(res, index)}
              style={{ cursor: "pointer" }}
            >
              {resultLabel(res)}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Super Over 2 Result"
          roundId={detailResult?.rid ?? selectedResult?.mid ?? 'N/A'}
          matchTime={detailResult?.mtime ?? 'N/A'}
          loading={loading}
        >
          <CasinoResultBodySuperOver2 detailResult={detailResult} />
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultSuperOver2;
