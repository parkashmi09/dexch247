import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import CasinoResultBodyByGameType from '../../../casinoComponents/casinoResultModal/CasinoResultBodyByGameType';
import "./Result.css";


const ResultQueen = ({
  data = [],
  gameType = 'queen',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleResultClick = async (resultItem) => {
    const mid = resultItem?.mid;
    if (!mid) return;
    setSelectedResult(resultItem);
    setDetailResult(null);
    setModalLoading(true);
    setShowModal(true);
    try {
      const response = await getDetailResults(gameType, mid.toString());
      const t1 = response?.data?.data?.t1 ?? response?.data?.t1;
      if (t1) setDetailResult(t1);
    } catch (error) {
      console.error('Error fetching detail results:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setDetailResult(null);
  };

  const allResults = lastResults.length > 0
    ? lastResults
    : data.map((res) => ({ win: res?.win ?? res, mid: res?.mid ?? null }));

  const modalTitle = detailResult?.ename || 'Queen Result';
  const roundId = detailResult?.rid || selectedResult?.mid || 'N/A';
  const matchTime = detailResult?.mtime || 'N/A';

  return (
    <>
      <div className="casino-video-last-results">
        {allResults.map((resultItem, index) => {
          const label = String(resultItem.win ?? '');
          return (
            <span
              key={index}
              className="resultb"
              onClick={() => resultItem.mid && handleResultClick(resultItem)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <ResultModalLayout
        show={showModal}
        onHide={handleCloseModal}
        title={modalTitle}
        roundId={roundId}
        matchTime={matchTime}
        loading={modalLoading}
      >
        <CasinoResultBodyByGameType gameType={gameType} detailResult={detailResult} />
      </ResultModalLayout>
    </>
  );
};

export default ResultQueen;
