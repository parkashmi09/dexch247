import { Modal } from "react-bootstrap";
import CasinoVideoCards from "../casinoVideoCards/index.jsx";
import useInactivity from "../../../hooks/useInactivity.js";

/**
 * Reusable casino video section with inactivity detection.
 */
export default function CasinoVideoBox({ src, gameName, gameType, cardString, clock, tableData }) {
  const [isDisconnected, reconnect] = useInactivity();

  return (
    <div className="casino-video">
      {/* Desktop inactivity overlay */}
      {isDisconnected && (
        <div className="disconnected-box d-none d-xl-flex">
          <div className="disconnected-message">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <b>Disconnection due to inactivity</b>
            </div>
            <div className="mt-3 text-center">
              Are you there? You have been disconnected. Please go back to home or start playing again
            </div>
            <div className="disconnected-buttons mt-3">
              <button type="button" className="btn btn-outline-primary" onClick={reconnect}>Reconnect</button>
              <a className="btn btn-outline-danger" href="/home">Home</a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile inactivity modal */}
      <Modal show={isDisconnected} centered dialogClassName="d-xl-none">
        <Modal.Body className="p-0">
          <div className="disconnected-message">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <b>Disconnection due to inactivity</b>
            </div>
            <div className="mt-3 text-center">
              Are you there? You have been disconnected. Please go back to home or start playing again
            </div>
            <div className="disconnected-buttons mt-3">
              <button type="button" className="btn btn-outline-primary" onClick={reconnect}>Reconnect</button>
              <a className="btn btn-outline-danger" href="/home"><span>Home</span></a>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <div className="video-box-container">
        <div className="casino-video-box">
          {src && !isDisconnected ? (
            <iframe src={src} title={gameName || "Casino Game"} allowFullScreen allow="autoplay" />
          ) : (
            !isDisconnected && (
              <div className="d-flex justify-content-center align-items-center h-100 text-white">
                Loading stream...
              </div>
            )
          )}
        </div>
      </div>
      {gameType && <CasinoVideoCards gameType={gameType} cardString={cardString} tableData={tableData} />}
      {clock || <div className="clock"></div>}
    </div>
  );
}
