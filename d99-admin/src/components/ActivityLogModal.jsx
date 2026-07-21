import React from 'react';
import { Modal } from 'react-bootstrap';
import ActivityLog from './ActivityLog';

const ActivityLogModal = ({ show, onHide, userData }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName="modal-xl modal-dialog-scrollable" // Large modal for table
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Activity Log - {userData?.username || userData?.userName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {userData && (
          <ActivityLog
            userId={userData.user_id || userData.staff_id}
            userType={userData.user_type}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ActivityLogModal;
