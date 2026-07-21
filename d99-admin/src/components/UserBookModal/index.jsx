import React, { useState, useEffect, useMemo } from 'react';
import styles from './UserBookModal.module.css';
import { getMarketUserBook } from '../../services/api';

const UserBookModal = ({ show, onHide, matchId, marketName, initialRunners = [] }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && matchId) {
      fetchData();
    }
  }, [show, matchId, marketName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine API marketType from marketName
      let apiType = 'match_odds';
      const nameLower = (marketName || '').toLowerCase();
      
      if (nameLower.includes('bookmaker')) {
          apiType = 'bookmaker';
      } else if (nameLower.includes('fancy') || nameLower.includes('session')) {
          apiType = 'session';
      } else if (nameLower.includes('match odds') || nameLower.includes('winner')) {
          apiType = 'match_odds';
      }

      const response = await getMarketUserBook(matchId, apiType);
      
      if (response && response.success) {
        setData(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch user book');
      }
    } catch (err) {
      console.error('Error fetching user book:', err);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0.00";
    return Number(num).toFixed(2);
  };

  const getNumberClass = (num) => {
    const val = Number(num);
    if (val > 0) return styles.positive;
    if (val < 0) return styles.negative;
    return styles.zero;
  };

  // Determine columns from data + initialRunners
  const columns = useMemo(() => {
    const dataRunners = data.flatMap(r => Object.keys(r.runners || {}));
    return Array.from(new Set([...initialRunners, ...dataRunners]));
  }, [data, initialRunners]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalDialogCustom}>
        <div className={styles.userBookModalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>User Book</h5>
            <button className={styles.closeButton} onClick={onHide}>&times;</button>
          </div>
          
          <div className={styles.modalBody}>
            {error && <div className={styles.errorContainer}>{error}</div>}
            
            <div className={styles.tableContainer}>
              {loading ? (
                <div className={styles.loadingContainer}>Loading...</div>
              ) : (
                <table className={styles.userBookTable}>
                  <thead>
                    <tr>
                      <th>User Name</th>
                      {columns.map((runner, idx) => (
                        <th key={idx}>{runner}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? data.map((row, idx) => (
                      <tr key={row.userId || idx}>
                        <td>{row.username}</td>
                        {columns.map((runner, cIdx) => {
                          const amount = row.runners[runner] || 0;
                          return (
                            <td key={cIdx} className={getNumberClass(amount)}>
                              {formatNumber(amount)}
                            </td>
                          );
                        })}
                      </tr>
                    )) : !loading && (
                      <tr>
                        <td colSpan={columns.length + 1} className={styles.noRecords}>
                          No Record Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookModal;
