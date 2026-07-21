import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import CasinoResultBodyByGameType from '../../../casinoComponents/casinoResultModal/CasinoResultBodyByGameType';
import '../resultTeen20c/Result.css';

const ResultTeenUnique = ({
  data = [],
  gameData = {},
  gameType = 'teenunique',
  playerA = {},
  playerB = {},
}) => {
  const apiType = (gameType || 'teenunique').toLowerCase().trim();
  const [showModal, setShowModal] = useState(false);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          const mappedResults = response.data.data.res.map((item) => ({
            mid: item.mid,
            win: item.win === '1' ? 'A' : item.win === '2' ? 'B' : item.win,
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };
    fetchLastResults();
  }, [apiType]);

  const handleResultClick = async (result, index) => {
    setLoading(true);
    if (lastResults.length === 0) {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          const mappedResults = response.data.data.res.map((item) => ({
            mid: item.mid,
            win: item.win === '1' ? 'A' : item.win === '2' ? 'B' : item.win,
          }));
          setLastResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }

    let mid = null;
    if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else {
      mid = gameData?.data?.data?.mid || gameData?.data?.mid || gameData?.mid;
    }

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

  const allResults =
    lastResults.length > 0
      ? lastResults.map((r) => r.win)
      : [...(data || []), ...(gameData?.lrs || []), ...(gameData?.data?.lrs || [])].map((r) =>
          r?.win === '1' || r?.win === 1 ? 'A' : r?.win === '2' || r?.win === 2 ? 'B' : r?.win ?? r
        );

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => (
          <div
            key={index}
            className={`result-circle ${res === 'A' ? 'yes' : 'no'}`}
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
          title={detailResult?.ename || 'Unique Teenpatti'}
          roundId={detailResult?.rid || gameData?.data?.data?.mid || gameData?.data?.mid || 'N/A'}
          matchTime={detailResult?.mtime || gameData?.data?.data?.mt || 'N/A'}
          loading={loading}
        >
          <CasinoResultBodyByGameType gameType={apiType} detailResult={detailResult} />
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultTeenUnique;
