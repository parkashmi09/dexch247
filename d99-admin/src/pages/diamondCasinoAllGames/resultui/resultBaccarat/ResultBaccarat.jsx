import { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "./Result.css";

// Card image URL from the live site
const getCardImageUrl = (cardCode) => {
  if (!cardCode || cardCode === "1" || cardCode.length < 2) return null;
  return `https://versionobj.ecoassetsservice.com/v93/static/front/img/cards/${cardCode}.jpg`;
};

// Parse card string: first 3 = Player, last 3 = Banker (skip "1" placeholders)
const parseCards = (cardString) => {
  if (!cardString) return { player: [], banker: [] };
  const cards = cardString.split(',');
  const playerCards = cards.slice(0, 3).filter(c => c.trim() !== "1").map(c => getCardImageUrl(c.trim())).filter(Boolean);
  const bankerCards = cards.slice(3, 6).filter(c => c.trim() !== "1").map(c => getCardImageUrl(c.trim())).filter(Boolean);
  return { player: playerCards, banker: bankerCards };
};

// Parse rdesc: "Player#-#No#No#Big" → { winner, winnerPair, perfect, either, bigSmall }
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  return {
    winner: parts[0] || "",
    winnerPair: parts[1] || "-",
    perfect: parts[2] || "No",
    either: parts[3] || "No",
    bigSmall: parts[4] || ""
  };
};

const ResultBaccarat = ({
  data = [],
  gameData = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('baccarat');
        if (response?.success && response?.data?.data?.res) {
          setLastResults(response.data.data.res);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };

    fetchLastResults();
    const interval = setInterval(fetchLastResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResultClick = async (resultItem) => {
    setSelectedResult(resultItem);
    setLoading(true);

    const mid = resultItem?.mid;
    if (mid) {
      try {
        const response = await getDetailResults('baccarat', mid.toString());
        if (response?.success && response?.data?.data?.t1) {
          setDetailResult(response.data.data.t1);
        }
      } catch (error) {
        console.error('Error fetching detail results:', error);
      }
    }

    setLoading(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setDetailResult(null);
  };

  const getModalData = () => {
    if (!selectedResult || !detailResult) return null;

    const cards = parseCards(detailResult.card);
    const rdescData = parseRdesc(detailResult.rdesc);
    const winner = detailResult.winnat || "";
    const isPlayerWinner = detailResult.win === "1" || winner === "Player";
    const isBankerWinner = detailResult.win === "2" || winner === "Banker";

    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      player: { cards: cards.player, isWinner: isPlayerWinner },
      banker: { cards: cards.banker, isWinner: isBankerWinner },
      rdescData,
    };
  };

  const modalData = getModalData();

  const allResults = lastResults.length > 0
    ? lastResults
    : data.map((res) => ({ win: res === "A" ? "1" : "2", mid: null }));

  return (
    <>
      <div className="casino-video-last-results">
        {allResults.map((resultItem, index) => {
          const win = resultItem.win;
          const isPlayer = win === "1" || win === 1;
          return (
            <span
              key={index}
              className={isPlayer ? "resulta" : "resultb"}
              onClick={() => resultItem.mid && handleResultClick(resultItem)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {isPlayer ? "P" : "B"}
            </span>
          );
        })}
      </div>

      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="Baccarat"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          <div className="row mt-2">
            <div className="col-md-6 text-center">
              <h4 className="result-title">Player</h4>
              <div className="casino-result-cards">
                {modalData.player?.isWinner && (
                  <div className="casino-winner-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                )}
                {modalData.player?.cards?.map((card, index) => (
                  <img key={index} src={card} alt={`Player Card ${index + 1}`} />
                ))}
              </div>
            </div>
            <div className="col-md-6 text-center">
              <h4 className="result-title">Banker</h4>
              <div className="casino-result-cards">
                {modalData.banker?.isWinner && (
                  <div className="casino-winner-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                )}
                {modalData.banker?.cards?.map((card, index) => (
                  <img key={index} src={card} alt={`Banker Card ${index + 1}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="row mt-2 justify-content-center">
            <div className="col-md-6">
              <div className="casino-result-desc">
                <div className="casino-result-desc-item">
                  <div>Winner</div>
                  <div>{modalData.rdescData.winner || '-'}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Winner Pair</div>
                  <div>{modalData.rdescData.winnerPair || '-'}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Perfect</div>
                  <div>{modalData.rdescData.perfect || 'No'}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Either</div>
                  <div>{modalData.rdescData.either || 'No'}</div>
                </div>
                <div className="casino-result-desc-item">
                  <div>Big/Small</div>
                  <div>{modalData.rdescData.bigSmall || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultBaccarat;
