import React from 'react';
import { getCardImage, getCardValue } from '../resultVisuals/cardAssets';

// Parse card string into 4 groups of 4 cards each (Total 0–3).
// API card: "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" — indices 0-3=Total0, 4-7=Total1, 8-11=Total2, 12-15=Total3.
const parseQueenGroups = (cardString) => {
  const groups = [[], [], [], []];
  if (!cardString) return groups;
  const tokens = cardString.split(',').map((t) => t.trim());
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const token = tokens[i * 4 + j];
      if (token != null && token !== '') groups[i].push(token);
    }
  }
  return groups;
};

/**
 * Result modal body for Queen Top Open Teenpatti (queen).
 * Layout: row row5, one col-12 col-lg-12 per group; h4 "Total N - badge"; card images; Winner label.
 * detailResult = API t1 or data: { card, win, winnat, sub }.
 * sub[].nat = "Total 0", "Total 1", ...; win = 1-based (1=Total0, 2=Total1, 3=Total2, 4=Total3).
 */
const CasinoResultBodyQueen = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const { card, win, sub = [] } = detailResult;
  const groups = parseQueenGroups(card);
  const winGroupIdx = win != null ? parseInt(win, 10) - 1 : -1;

  const labels = [
    sub[0]?.nat ?? 'Total 0',
    sub[1]?.nat ?? 'Total 1',
    sub[2]?.nat ?? 'Total 2',
    sub[3]?.nat ?? 'Total 3',
  ];

  return (
    <div className="row row5">
      {groups.map((cards, idx) => {
        const total = cards.reduce((sum, token) => sum + getCardValue(token), 0);
        const isWinner = idx === winGroupIdx;
        return (
          <div key={idx} className="col-12 col-lg-12">
            <div className="casino-result-cards">
              <h4 className="text-center">
                {labels[idx]} -
                <span className="badge badge-success font14">{total}</span>
              </h4>
              {cards.map((token, i) => (
                <div key={i} className="casino-result-cards-item">
                  <img src={getCardImage(token)} alt={token || 'card'} />
                </div>
              ))}
              {isWinner && (
                <div className="casino-result-cards-item d-block mt-3">
                  <span className="winner-label">Winner</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CasinoResultBodyQueen;
