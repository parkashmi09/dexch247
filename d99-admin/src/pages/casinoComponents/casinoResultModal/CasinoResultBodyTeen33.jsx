import React from 'react';
import { getCardImage } from '../resultVisuals/cardAssets';

/**
 * Result modal body for Teen33 (Instant Teenpatti 3.0).
 * Cards: 6 total — 1-day ordering: Player A=[0,2,4], Player B=[1,3,5].
 * rdesc: "Player B" (just winner name).
 * Layout: col-lg-7 (cards) + col-lg-5 (description) matching reference.
 */
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',');
  const playerA = [0, 2, 4].map((i) => cards[i]?.trim()).filter(Boolean).map((t) => getCardImage(t));
  const playerB = [1, 3, 5].map((i) => cards[i]?.trim()).filter(Boolean).map((t) => getCardImage(t));
  return { playerA, playerB };
};

const CasinoResultBodyTeen33 = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const cards = parseCards(detailResult.card);
  const winValue = String(detailResult.win || '');
  const winner = detailResult.winnat || (winValue === '1' ? 'Player A' : winValue === '2' ? 'Player B' : '');
  const isAWinner = winValue === '1';
  const isBWinner = winValue === '2';

  return (
    <>
      <div className="col-12 col-lg-7">
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
      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CasinoResultBodyTeen33;
