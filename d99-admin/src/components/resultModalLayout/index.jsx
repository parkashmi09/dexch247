import React from 'react';
import { Modal } from 'react-bootstrap';
import '../../styles/deposit-modal.css';
import styles from './ResultModalLayout.module.css';
import './CasinoResultModal.css';

/**
 * Common casino result modal layout – 80% width, same layout/bg/header/close as BetLockModal.
 * Uses deposit-modal.css for header, close button, and body styling (no black/dark bg).
 */
const ResultModalLayout = ({
  show,
  onHide,
  title,
  roundId,
  matchTime,
  children,
  loading = false,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName={`modal-dialog-scrollable casino-result-modal-dialog-80 ${styles.modalDialogCustom}`}
    >
      <Modal.Header>
        <Modal.Title>
          {title} Result
        </Modal.Title>
        <button
          type="button"
          className="close text-white"
          onClick={onHide}
          aria-label="Close"
        >
          ×
        </button>
      </Modal.Header>
      <Modal.Body className={styles.modalBodyScroll}>
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <div className="casino-result-modal">
            <div className="casino-result-round">
              <div>Round-ID: {roundId || "N/A"}</div>
              <div>Match Time: <span>{matchTime || "N/A"}</span></div>
            </div>
            <div className="row row5">
              {children}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ResultModalLayout;
