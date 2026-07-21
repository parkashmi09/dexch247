import React, { useState, useEffect } from 'react';
import styles from './ViewMoreModal.module.css';
import { getCasinoAllBets } from '../../apiservices/CasionApi';
import BetViewMoreTable from './TableUi';

/**
 * View More modal – full list of casino bets (all-downline).
 * Fetches via getCasinoAllBets(gameName) when opened. Table: No, UserName, Nation, Amount, User Rate, Place Date, IP, Browser Details.
 * Reference: lord-d99 lord-admin ViewMoreModal.
 */
const ViewMoreModal = ({
  show,
  onHide,
  title = 'View More',
  sectionKey = '',
}) => {
  const [internalData, setInternalData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !sectionKey) return;
    let cancelled = false;
    setLoading(true);
    getCasinoAllBets(sectionKey)
      .then((res) => {
        if (cancelled) return;
        const list = res?.success && Array.isArray(res?.data) ? res.data : [];
        setInternalData(list);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error fetching ViewMoreModal data:', err);
          setInternalData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [show, sectionKey]);

  if (!show) return null;

  return (
    <div className={`modal show d-block ${styles.modalOverlay}`} tabIndex="-1" role="dialog">
      <div className={`modal-dialog ${styles.modalDialogCustom}`} role="document">
        <div className={`modal-content ${styles.modalContentWrapper}`}>
          <header className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>{title}</h5>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onHide}
              aria-label="Close"
            >
              ×
            </button>
          </header>
          <div className={styles.modalBody}>
            {loading ? (
              <div className="text-center p-4">Loading...</div>
            ) : (
              <div className={styles.modalTableWrap}>
                <BetViewMoreTable data={internalData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMoreModal;
