import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import CasinoResultBodyByGameType from '../../../casinoComponents/casinoResultModal/CasinoResultBodyByGameType';
import "../resultTeen20c/Result.css";

/**
 * Last result circles for Teen33 (Instant Teenpatti 3.0): A/B circles.
 * win=1 → A, win=2 → B.
 * Modal uses CasinoResultBodyTeen33 via CasinoResultBodyByGameType.
 */
const ResultTeen33 = ({
  data = [],
  gameData = {},
  gameType = 'teen33',
}) => {
  const apiType = (gameType || 'teen33').toLowerCase().trim();
  const [showModal, setShowModal] = useState(false);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          setLastResults(response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
          })));
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };
    fetchLastResults();
    const interval = setInterval(fetchLastResults, 5000);
    return () => clearInterval(interval);
  }, [apiType]);

  const handleResultClick = async (result, index) => {
    setLoading(true);

    let results = lastResults;
    if (results.length === 0) {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          results = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
          }));
          setLastResults(results);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }

    const mid = results[index]?.mid;
    if (mid) {
      try {
        const response = await getDetailResults(apiType, mid.toString());
        const t1 = response?.data?.data?.t1 ?? response?.data?.t1;
        if (t1) setDetailResult(t1);
      } catch (error) {
        console.error('Error fetching detail results:', error);
      }
    }

    setLoading(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDetailResult(null);
  };

  const allResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [...data, ...(gameData?.lrs || []), ...(gameData?.data?.lrs || [])];

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className={`result-circle ${res === "A" ? "yes" : "no"}`}
            onClick={() => handleResultClick(res, index)}
            style={{ cursor: 'pointer' }}
          >
            {res}
          </div>
        ))}
      </div>

      {showModal && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title={detailResult?.ename || "Instant Teenpatti 3.0"}
          roundId={detailResult?.rid || "N/A"}
          matchTime={detailResult?.mtime || "N/A"}
          loading={loading}
        >
          <CasinoResultBodyByGameType gameType={apiType} detailResult={detailResult} />
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTeen33;
