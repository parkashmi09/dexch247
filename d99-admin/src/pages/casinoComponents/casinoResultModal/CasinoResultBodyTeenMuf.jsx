import React from 'react';
import { getCardImage } from '../resultVisuals/cardAssets';

/**
 * Result modal body for Teenpatti Muflis.
 * Cards: 6 total — 1-day ordering: Player A=[0,2,4], Player B=[1,3,5].
 * rdesc: "Player B#-#Player B (A : 1  |  B : 0)"
 *   parts[0] = Winner, parts[1] = Top 9, parts[2] = M Baccarat
 * Layout: col-lg-8 (cards) + col-lg-4 (description with Winner / Top 9 / M Baccarat).
 */
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',');
  const playerA = [0, 2, 4].map((i) => cards[i]?.trim()).filter(Boolean).map((t) => getCardImage(t));
  const playerB = [1, 3, 5].map((i) => cards[i]?.trim()).filter(Boolean).map((t) => getCardImage(t));
  return { playerA, playerB };
};

const CasinoResultBodyTeenMuf = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const cards = parseCards(detailResult.card);
  const winValue = String(detailResult.win || '');
  const isAWinner = winValue === '1';
  const isBWinner = winValue === '2';

  // Parse rdesc: "Player B#-#Player B (A : 1  |  B : 0)"
  const rdescParts = (detailResult.rdesc || '').split('#');
  const winnerDesc = rdescParts[0] || '-';
  const top9Desc = rdescParts[1] || '-';
  const mBaccaratDesc = rdescParts[2] || '-';

  return (
    <>
      <div className="col-12 col-lg-8">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <h4>Player A</h4>
            <div className="casino-result-cards">
              {isAWinner && (
                <div className="casino-result-cards-item">
                  <img src="/img/winner.png" alt="winner" className="winner-icon" />
                </div>
              )}
              {cards.playerA.map((card, idx) => (
                <div key={idx} className="casino-result-cards-item">
                  <img src={card} alt={`Player A Card ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="casino-result-content-diveder"></div>
          <div className="casino-result-content-item text-center">
            <h4>Player B</h4>
            <div className="casino-result-cards">
              {isBWinner && (
                <div className="casino-result-cards-item">
                  <img src="/img/winner.png" alt="winner" className="winner-icon" />
                </div>
              )}
              {cards.playerB.map((card, idx) => (
                <div key={idx} className="casino-result-cards-item">
                  <img src={card} alt={`Player B Card ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winnerDesc}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Top 9</div>
            <div>{top9Desc}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>M Baccarat</div>
            <div>{mBaccaratDesc}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CasinoResultBodyTeenMuf;
