import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import CasinoResultBodyByGameType from '../../../casinoComponents/casinoResultModal/CasinoResultBodyByGameType';
import "../resultTeen20c/Result.css";

const ResultTeen20 = ({ gameType, data = [], gameData = {}, playerA = {}, playerB = {} }) => {
  const apiType = (gameType || "teen20").toLowerCase().trim();
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
          }));
          setLastResults(mapped);
        }
      } catch (e) {
        console.error('Error fetching last results:', e);
      }
    };
    fetchLastResults();
    const interval = setInterval(fetchLastResults, 5000);
    return () => clearInterval(interval);
  }, [apiType]);

  const handleResultClick = async (result, index) => {
    setSelectedResult(result);
    setLoading(true);

    if (lastResults.length === 0) {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          const mapped = response.data.data.res.map(item => ({
            mid: item.mid,
            win: item.win === "1" ? "A" : item.win === "2" ? "B" : item.win
          }));
          setLastResults(mapped);
        }
      } catch (e) {
        console.error('Error fetching last results:', e);
      }
    }

    let mid = null;
    if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      mid = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid;
    }

    if (mid) {
      try {
        const response = await getDetailResults(apiType, mid.toString());
        if (response?.data?.data?.t1) {
          setDetailResult(response.data.data.t1);
        }
      } catch (e) {
        console.error('Error fetching detail results:', e);
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
          title={detailResult?.ename || "20-20 Teenpatti"}
          roundId={detailResult?.rid || gameData?.data?.data?.mid || gameData?.data?.mid || "—"}
          matchTime={detailResult?.mtime || gameData?.data?.data?.mt || "N/A"}
          loading={loading}
        >
          <CasinoResultBodyByGameType gameType={apiType} detailResult={detailResult} />
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTeen20;
