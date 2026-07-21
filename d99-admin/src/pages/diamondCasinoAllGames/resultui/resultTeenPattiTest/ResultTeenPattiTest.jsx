import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import CasinoResultBodyByGameType from '../../../casinoComponents/casinoResultModal/CasinoResultBodyByGameType';
import "../resultTeen20c/Result.css";

/**
 * Last result circles for Teenpatti Test: T (Tiger), L (Lion), D (Dragon).
 * win=1 → T (resulta), win=2 → L (resultb), win=3 → D (resultc)
 */
const WIN_MAP = {
  "1": { label: "T", className: "resulta" },
  "2": { label: "L", className: "resultb" },
  "3": { label: "D", className: "resultc" },
};

const ResultTeenPattiTest = ({
  data = [],
  gameData = {},
  gameType = 'teenpattitest',
}) => {
  const apiType = (gameType || 'teenpattitest').toLowerCase().trim();
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
          setLastResults(response.data.data.res.map(item => ({
            mid: item.mid,
            win: String(item.win),
          })));
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };
    fetchLastResults();
  }, [apiType]);

  const handleResultClick = async (result, index) => {
    setSelectedResult(result);
    setLoading(true);

    let results = lastResults;
    if (results.length === 0) {
      try {
        const response = await getLastResults(apiType);
        if (response?.data?.data?.res) {
          results = response.data.data.res.map(item => ({
            mid: item.mid,
            win: String(item.win),
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
    setSelectedResult(null);
    setDetailResult(null);
  };

  const displayResults = lastResults.length > 0
    ? lastResults.map(r => r.win)
    : [];

  return (
    <>
      <div className="casino-video-last-results">
        {displayResults.map((win, index) => {
          const mapped = WIN_MAP[win] || { label: win, className: "" };
          return (
            <span
              key={index}
              className={mapped.className}
              onClick={() => handleResultClick(win, index)}
              style={{ cursor: 'pointer' }}
            >
              {mapped.label}
            </span>
          );
        })}
      </div>

      {showModal && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title={detailResult?.ename || "Teenpatti Test"}
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

export default ResultTeenPattiTest;
