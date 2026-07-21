import React from 'react';
import { getCardImage } from '../resultVisuals/cardAssets';

/**
 * Result modal body for Teenpatti Test: Tiger / Lion / Dragon (3 players, 3 cards each).
 * Cards: 9 total — Tiger=[0,1,2], Lion=[3,4,5], Dragon=[6,7,8].
 * rdesc: "Winner#Others" e.g. "Tiger#T : Pair" → Winner=Tiger, Others=T : Pair | L : Straight
 *
 * Rendered inside ResultModalLayout which provides casino-result-round + row row5 wrapper.
 */
const PLAYERS = [
  { name: 'Tiger', indices: [0, 1, 2], winValue: '1' },
  { name: 'Lion', indices: [3, 4, 5], winValue: '2' },
  { name: 'Dragon', indices: [6, 7, 8], winValue: '3' },
];

const parseCards = (cardString) => {
  if (!cardString) return [];
  return cardString.split(',').map(t => t.trim());
};

const parseRdesc = (rdesc) => {
  if (!rdesc) return { winner: '', others: '' };
  const parts = rdesc.split('#');
  return {
    winner: parts[0] || '',
    others: parts.slice(1).join(' | ') || '',
  };
};

const CasinoResultBodyTeenPattiTest = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const allCards = parseCards(detailResult.card);
  const rdesc = parseRdesc(detailResult.rdesc);
  const winValue = String(detailResult.win || '');

  return (
    <>
      {PLAYERS.map((player) => {
        const isWinner = winValue === player.winValue;
        const playerCards = player.indices.map(i => allCards[i]).filter(Boolean);

        return (
          <div key={player.name} className="col-12 col-lg-3">
            <div className="casino-result-cards">
              {isWinner && (
                <div className="casino-result-cards-item">
                  <img src="/img/winner.png" alt="winner" className="winner-icon" />
                </div>
              )}
              <div className="d-inline-block">
                <h4 className="text-center">{player.name}</h4>
                {playerCards.map((token, idx) => (
                  <div key={idx} className="casino-result-cards-item">
                    <img src={getCardImage(token)} alt={`${player.name} Card ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{rdesc.winner}</div>
          </div>
          {rdesc.others && (
            <div className="casino-result-desc-item">
              <div>Others</div>
              <div>{rdesc.others}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CasinoResultBodyTeenPattiTest;
