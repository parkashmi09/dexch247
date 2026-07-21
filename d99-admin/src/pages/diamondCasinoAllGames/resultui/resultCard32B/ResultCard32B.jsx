import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "./Result.css";
import { FaTrophy } from 'react-icons/fa';

// Helper function to map card string to image path
const getCardImage = (cardCode) => {
  if (!cardCode) return null;

  try {
    if (cardCode.length < 3) {
      return null;
    }

    // Use card-results folder with full card code (e.g., "6SS.jpg", "JCC.jpg")
    // Format: rank + suit (DD, SS, CC, HH)
    return `/assets/img/card-results/${cardCode}.jpg`;
  } catch (e) {
    return null;
  }
};

// Helper function to calculate card score (for 32 Cards game)
const calculateCardScore = (cardCode) => {
  if (!cardCode) return 0;

  // Extract rank from card code (e.g., "6SS" -> "6", "JCC" -> "J", "QCC" -> "Q", "10CC" -> "10")
  const rank = cardCode.replace(/[^0-9JQKA]/g, '');

  // Map face cards and ace
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  if (rank === 'A') return 1;

  // Number cards
  const num = parseInt(rank, 10);
  return isNaN(num) ? 0 : num;
};

// Helper function to parse card string and split into 4 players (Player 8, 9, 10, 11)
const parseCards = (cardString) => {
  if (!cardString) return { player8: [], player9: [], player10: [], player11: [] };

  const cards = cardString.split(',');
  // First 4 cards are for Player 8, 9, 10, 11
  const player8Card = cards[0] ? getCardImage(cards[0].trim()) : null;
  const player9Card = cards[1] ? getCardImage(cards[1].trim()) : null;
  const player10Card = cards[2] ? getCardImage(cards[2].trim()) : null;
  const player11Card = cards[3] ? getCardImage(cards[3].trim()) : null;

  // Calculate scores
  const player8Score = cards[0] ? calculateCardScore(cards[0].trim()) : 0;
  const player9Score = cards[1] ? calculateCardScore(cards[1].trim()) : 0;
  const player10Score = cards[2] ? calculateCardScore(cards[2].trim()) : 0;
  const player11Score = cards[3] ? calculateCardScore(cards[3].trim()) : 0;

  return {
    player8: { card: player8Card, score: player8Score },
    player9: { card: player9Card, score: player9Score },
    player10: { card: player10Card, score: player10Score },
    player11: { card: player11Card, score: player11Score },
  };
};

// Helper function to map win value to player number
const getPlayerNumber = (win) => {
  const winMap = {
    "1": "8",
    "2": "9",
    "3": "10",
    "4": "11"
  };
  return winMap[win] || win;
};

// Helper function to parse rdesc for Card32B: "Player 9#8 : Odd  |  9 : Odd~10 : Odd  |  11 : Even#Black#8-9#5"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};

  const parts = rdesc.split('#');
  const winner = parts[0] || "";

  // Part 2: Odd/Even - "8 : Odd  |  9 : Odd~10 : Odd  |  11 : Even"
  // Note: Uses ~ as separator between player groups
  const oddEvenPart = parts[1] || "";
  // Split by ~ first, then by | to get individual player odd/even
  const oddEvenGroups = oddEvenPart.split('~');
  const oddEvenDetails = [];
  oddEvenGroups.forEach(group => {
    const matches = group.match(/(\d+)\s*:\s*(\w+)/g);
    if (matches) {
      matches.forEach(match => {
        const playerMatch = match.match(/(\d+)\s*:\s*(\w+)/);
        if (playerMatch) {
          oddEvenDetails.push(`${playerMatch[1]} : ${playerMatch[2]}`);
        }
      });
    }
  });
  const oddEven = oddEvenDetails.join(' | ');

  // Part 3: Black/Red
  const blackRed = parts[2] || "";

  // Part 4: Total
  const total = parts[3] || "";

  // Part 5: Single
  const single = parts[4] || "";

  return {
    winner,
    oddEven,
    blackRed,
    total,
    single,
  };
};

const ResultCard32B = ({
  data = [],
  gameData = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch last results on mount
  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('card32eu');
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

  const handleResultClick = async (resultItem, index) => {
    setSelectedResult(resultItem);
    setLoading(true);

    const mid = resultItem?.mid;

    if (mid) {
      try {
        const response = await getDetailResults('card32eu', mid.toString());
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

  // Format modal data based on selected result
  const getModalData = () => {
    if (!selectedResult || !detailResult) return null;

    const cards = parseCards(detailResult.card);
    const rdescData = parseRdesc(detailResult.rdesc);
    const winner = detailResult.winnat || rdescData.winner || `Player ${getPlayerNumber(detailResult.win)}`;
    const winValue = detailResult.win;

    // Determine which player is the winner
    const isPlayer8Winner = winValue === "1";
    const isPlayer9Winner = winValue === "2";
    const isPlayer10Winner = winValue === "3";
    const isPlayer11Winner = winValue === "4";

    return {
      roundId: detailResult.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: detailResult.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      players: {
        player8: {
          card: cards.player8.card,
          score: cards.player8.score,
          isWinner: isPlayer8Winner,
        },
        player9: {
          card: cards.player9.card,
          score: cards.player9.score,
          isWinner: isPlayer9Winner,
        },
        player10: {
          card: cards.player10.card,
          score: cards.player10.score,
          isWinner: isPlayer10Winner,
        },
        player11: {
          card: cards.player11.card,
          score: cards.player11.score,
          isWinner: isPlayer11Winner,
        },
      },
      resultDetails: {
        winner: winner,
        oddEven: rdescData.oddEven || "",
        blackRed: rdescData.blackRed || "",
        total: rdescData.total || "",
        single: rdescData.single || "",
      },
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0
    ? lastResults
    : data.map((res, idx) => ({ win: res, mid: null }));

  return (
    <>
      <div className="result-row card32 casino-last-results">
        {allResults.map((resultItem, index) => {
          const win = resultItem.win;
          const playerNumber = getPlayerNumber(win);
          return (
            <div
              key={index}
              className={`result-circle result-player-${playerNumber}`}
              onClick={() => resultItem.mid && handleResultClick(resultItem, index)}
              style={{ cursor: resultItem.mid ? 'pointer' : 'default' }}
            >
              {playerNumber}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="32 Cards B Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Players Section */}
          <div className="row mt-2">
            {/* Player 8 */}
            <div className="col-md-3 text-center">
              <h4 className="result-title">Player 8 - <span className="text-warning">{modalData.players.player8.score}</span></h4>
              <div className="casino-result-cards">
                {modalData.players.player8.card && (
                  <img
                    src={modalData.players.player8.card}
                    alt="Player 8 Card"
                    className="card-image"
                    onError={(e) => {
                      const cardName = modalData.players.player8.card.split('/').pop();
                      const fallbackPath = `/assets/img/tablecard/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
                {modalData.players.player8.isWinner && (
                  <div className="casino-winner-icon">
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
              </div>
            </div>

            {/* Player 9 */}
            <div className="col-md-3 text-center">
              <h4 className="result-title">Player 9 - <span className="text-warning">{modalData.players.player9.score}</span></h4>
              <div className="casino-result-cards">
                {modalData.players.player9.card && (
                  <img
                    src={modalData.players.player9.card}
                    alt="Player 9 Card"
                    className="card-image"
                    onError={(e) => {
                      const cardName = modalData.players.player9.card.split('/').pop();
                      const fallbackPath = `/assets/img/tablecard/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
                {modalData.players.player9.isWinner && (
                  <div className="casino-winner-icon">
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
              </div>
            </div>

            {/* Player 10 */}
            <div className="col-md-3 text-center">
              <h4 className="result-title">Player 10 - <span className="text-warning">{modalData.players.player10.score}</span></h4>
              <div className="casino-result-cards">
                {modalData.players.player10.card && (
                  <img
                    src={modalData.players.player10.card}
                    alt="Player 10 Card"
                    className="card-image"
                    onError={(e) => {
                      const cardName = modalData.players.player10.card.split('/').pop();
                      const fallbackPath = `/assets/img/tablecard/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
                {modalData.players.player10.isWinner && (
                  <div className="casino-winner-icon">
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
              </div>
            </div>

            {/* Player 11 */}
            <div className="col-md-3 text-center">
              <h4 className="result-title">Player 11 - <span className="text-warning">{modalData.players.player11.score}</span></h4>
              <div className="casino-result-cards">
                {modalData.players.player11.card && (
                  <img
                    src={modalData.players.player11.card}
                    alt="Player 11 Card"
                    className="card-image"
                    onError={(e) => {
                      const cardName = modalData.players.player11.card.split('/').pop();
                      const fallbackPath = `/assets/img/tablecard/${cardName}`;
                      if (e.target.src !== fallbackPath) {
                        e.target.src = fallbackPath;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
                {modalData.players.player11.isWinner && (
                  <div className="casino-winner-icon">
                    <FaTrophy color="#4caf50" size={32} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Details */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-8">
              <div className="casino-result-desc">
                {modalData.resultDetails.winner && (
                  <div className="casino-result-desc-item">
                    <div>Winner</div>
                    <div>{modalData.resultDetails.winner}</div>
                  </div>
                )}
                {modalData.resultDetails.oddEven && (
                  <div className="casino-result-desc-item">
                    <div>Odd/Even</div>
                    <div>{modalData.resultDetails.oddEven}</div>
                  </div>
                )}
                {modalData.resultDetails.blackRed && (
                  <div className="casino-result-desc-item">
                    <div>Black/Red</div>
                    <div>{modalData.resultDetails.blackRed}</div>
                  </div>
                )}
                {modalData.resultDetails.total && (
                  <div className="casino-result-desc-item">
                    <div>Total</div>
                    <div>{modalData.resultDetails.total}</div>
                  </div>
                )}
                {modalData.resultDetails.single && (
                  <div className="casino-result-desc-item">
                    <div>Single</div>
                    <div>{modalData.resultDetails.single}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultCard32B;
