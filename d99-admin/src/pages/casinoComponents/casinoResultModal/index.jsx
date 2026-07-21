import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaTrophy } from 'react-icons/fa';
import styles from './CasinoResultModal.module.css';

/**
 * Shared casino result modal: round info, Player A/B cards, and dynamic result description.
 * resultDetails: array of { label, value } (dynamic for any game type) or legacy object
 *   { winner, baccarat3, baccaratScore, total, pairPlus, redBlack }.
 */
const CasinoResultModal = ({
  show,
  onHide,
  title = "Game Result",
  roundId,
  matchTime,
  playerA,
  playerB,
  resultDetails = {},
  loading = false,
}) => {
  const isArrayDetails = Array.isArray(resultDetails);
  const descItems = isArrayDetails
    ? resultDetails
    : (() => {
        const { winner = "", baccarat3 = "", baccaratScore = "", total = "", pairPlus = "", redBlack = "" } = resultDetails;
        const list = [
          winner && { label: "Winner", value: winner },
          baccarat3 && { label: "3 Baccarat", value: baccarat3 },
          baccaratScore && { label: "", value: baccaratScore },
          total && { label: "Total", value: total },
          pairPlus !== undefined && { label: "Pair Plus", value: pairPlus || "" },
          redBlack && { label: "Red Black", value: redBlack },
        ].filter(Boolean);
        return list;
      })();

  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName={`modal-xl ${styles.modalDialogCustom}`}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          {title}
        </Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onHide}
          aria-label="Close"
        ></button>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : !playerA && !playerB ? (
          <div className="text-center py-4">No detail available for this round.</div>
        ) : (
          <div className={styles.casinoResultModal}>
            <div className={styles.casinoResultRoundId}>
              <span>
                <b>Round Id: </b>
                {roundId || "N/A"}
              </span>
              <span>
                <b>Match Time: </b>
                {matchTime || "N/A"}
              </span>
            </div>

            <div className="row mt-2">
              <div className="col-md-6 text-center">
                <h4 className={styles.resultTitle}>Player A</h4>
                <div className={styles.casinoResultCards}>
                  {playerA?.isWinner && (
                    <div className={styles.casinoWinnerIcon}>
                      <FaTrophy />
                    </div>
                  )}
                  {playerA?.cards?.map((card, index) => (
                    <img
                      key={index}
                      src={card}
                      alt={`Player A Card ${index + 1}`}
                      className={styles.cardImage}
                    />
                  ))}
                </div>
              </div>
              <div className="col-md-6 text-center">
                <h4 className={styles.resultTitle}>Player B</h4>
                <div className={styles.casinoResultCards}>
                  {playerB?.isWinner && (
                    <div className={styles.casinoWinnerIcon}>
                      <FaTrophy />
                    </div>
                  )}
                  {playerB?.cards?.map((card, index) => (
                    <img
                      key={index}
                      src={card}
                      alt={`Player B Card ${index + 1}`}
                      className={styles.cardImage}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="row mt-2 justify-content-center">
              <div className="col-md-6">
                <div className={styles.casinoResultDesc}>
                  {descItems.map((item, idx) => (
                    <div key={idx} className={styles.casinoResultDescItem}>
                      <div>{item.label}</div>
                      <div>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CasinoResultModal;
export { default as CasinoResultBodyByGameType } from './CasinoResultBodyByGameType';
export { default as CasinoResultBodyTeen } from './CasinoResultBodyTeen';
export { default as CasinoResultBodyTeen20 } from './CasinoResultBodyTeen20';
export { default as CasinoResultBodyTeenUnique } from './CasinoResultBodyTeenUnique';
