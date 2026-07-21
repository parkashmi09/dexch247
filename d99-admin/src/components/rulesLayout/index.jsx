import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from './RulesLayout.module.css';

const RulesLayout = ({
  show,
  onHide,
  title,
  children,
  loading = false,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName={`modal-xl ${styles.modalDialogCustom}`}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          {title} Rules
        </Modal.Title>
        <button
          type="button"
          style={{ fontSize: '1rem', filter: 'brightness(0) invert(1)' }}
          className="btn-close"
          onClick={onHide}
          aria-label="Close"
        ></button>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <div className="casino-rules-modal">
            {/* Children content */}
            {children}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RulesLayout;
