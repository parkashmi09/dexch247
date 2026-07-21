import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getUserExposure } from "../../apiservices/CasionApi";
import "./ExposureModal.css";

export default function ExposureModal({ show, onHide, userId, openBetsData = [] }) {
  const [exposureData, setExposureData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && userId) {
      fetchExposureData();
    } else {
      setExposureData([]);
      setError(null);
    }
  }, [show, userId]);

  const fetchExposureData = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getUserExposure(userId);
      if (response?.success && response.data) {
        setExposureData(response.data);
      } else {
        setExposureData([]);
      }
    } catch (err) {
      console.error("Error fetching exposure data:", err);
      setError("Failed to load exposure data");
      setExposureData([]);
    } finally {
      setLoading(false);
    }
  };

  // Merge API exposure data with open bets passed from header
  const rows = exposureData.length > 0 ? exposureData : openBetsData.map((bet) => ({
    event_type: bet.event_type || bet.game_type || bet.sport_name || "Cricket",
    event_name: bet.event_name || bet.match_name || bet.team_name || "--",
    match_name: bet.match_name || bet.market_name || bet.gtype || "--",
    trade: bet.trade ?? bet.bet_count ?? 1,
    match_id: bet.match_id || bet.gmid,
    sport_id: bet.sport_id || bet.sid || 4,
    exposure: bet.exposure,
    details: bet.details,
  }));

  return (
    <Modal show={show} onHide={onHide} size="xl" className="exposure-modal">
      <Modal.Header className="exposure-modal-header">
        <Modal.Title>My Market</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onHide}
          aria-label="Close"
        />
      </Modal.Header>
      <Modal.Body className="exposure-modal-body">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : error ? (
          <div className="text-center p-4 text-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table exposure-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Event Name</th>
                  <th>Match Name</th>
                  <th>Trade</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No active exposure found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.event_type}</td>
                      <td>
                        {row.match_id ? (
                          <Link
                            to={`/game-details/${row.sport_id || 4}/${row.match_id}`}
                            onClick={onHide}
                          >
                            {row.event_name}
                          </Link>
                        ) : (
                          row.event_name
                        )}
                      </td>
                      <td>{row.match_name}</td>
                      <td>{row.trade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
