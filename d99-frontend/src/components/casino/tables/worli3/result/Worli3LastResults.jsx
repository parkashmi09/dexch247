import { useState } from "react";
import { getDetailResults } from "../../../../../apiservices/CasionApi.js";
import ResultModal from "./ResultModal.jsx";

export default function Worli3LastResults({ results = [], gameId }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleResultClick(result) {
    setSelectedMarket(result.win || result.label || "");
    setDetailData(null);
    setShowModal(true);

    if (result.mid && gameId) {
      setLoading(true);
      try {
        const res = await getDetailResults(gameId, result.mid);
        if (res) setDetailData(res);
      } catch {
        // ignore
      }
      setLoading(false);
    }
  }

  return (
    <>
      <div className="casino-last-result-title">
        <span>Last Result</span>
        <span>
          {gameId && <a href={`/casino-results/${gameId}`}>View All</a>}
        </span>
      </div>
      <div className="casino-last-results matka-result">
        {results.map((result, idx) => (
          <span
            key={idx}
            className="result result-b"
            style={{ cursor: "pointer" }}
            onClick={() => handleResultClick(result)}
          >
            {result.label}
          </span>
        ))}
      </div>

      <ResultModal
        show={showModal}
        onHide={() => setShowModal(false)}
        marketName={selectedMarket}
        detailData={detailData}
        loading={loading}
      />
    </>
  );
}
