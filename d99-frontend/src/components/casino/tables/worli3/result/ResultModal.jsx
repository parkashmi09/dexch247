import { Modal } from "react-bootstrap";
import ResultCalendar from "./ResultCalendar.jsx";

export default function ResultModal({ show, onHide, marketName, detailData, loading }) {
  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Result - {marketName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <ResultCalendar detailData={detailData} />
        )}
      </Modal.Body>
    </Modal>
  );
}
