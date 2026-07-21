import React from 'react';
import { getCardImage } from '../resultVisuals/cardAssets';

const SUITS = [
  { key: 'SS', icon: 'spade',   label: 'Spade',   winValue: '1', kingToken: 'KSS' },
  { key: 'HH', icon: 'heart',   label: 'Heart',   winValue: '2', kingToken: 'KHH' },
  { key: 'CC', icon: 'club',    label: 'Club',    winValue: '3', kingToken: 'KCC' },
  { key: 'DD', icon: 'diamond', label: 'Diamond', winValue: '4', kingToken: 'KDD' },
];

// Group comma-separated card tokens by suit suffix; filter out placeholder "1" tokens
const parseCardsBySuit = (cardString) => {
  const groups = { SS: [], HH: [], CC: [], DD: [] };
  if (!cardString) return groups;
  const tokens = cardString.split(',').map((t) => t.trim()).filter(Boolean);
  for (const token of tokens) {
    if (token === '0' || token === '1') continue; // placeholder / card back
    if (token.length >= 2) {
      const suffix = token.slice(-2).toUpperCase();
      if (suffix in groups) groups[suffix].push(token);
    }
  }
  return groups;
};

// Derive the winning King token from winnat ("K Heart" → "KHH", etc.)
const getWinningKingToken = (winValue, winnat) => {
  // Try by win value first
  const byValue = SUITS.find((s) => s.winValue === String(winValue));
  if (byValue) return byValue.kingToken;
  // Fallback: match suit name in winnat
  const wn = (winnat || '').toLowerCase();
  if (wn.includes('spade'))   return 'KSS';
  if (wn.includes('heart'))   return 'KHH';
  if (wn.includes('club'))    return 'KCC';
  if (wn.includes('diamond')) return 'KDD';
  return null;
};

// Determine winning suit key from win value or winnat
const getWinningSuitKey = (winValue, winnat) => {
  const byValue = SUITS.find((s) => s.winValue === String(winValue));
  if (byValue) return byValue.key;
  const wn = (winnat || '').toLowerCase();
  if (wn.includes('spade'))   return 'SS';
  if (wn.includes('heart'))   return 'HH';
  if (wn.includes('club'))    return 'CC';
  if (wn.includes('diamond')) return 'DD';
  return null;
};

// rdesc: "K Heart#79#13" → Winner#Points#Cards
const parseRdesc = (rdesc) => {
  if (!rdesc) return { winner: '', points: '', cards: '' };
  const parts = rdesc.split('#');
  return { winner: parts[0] || '', points: parts[1] || '', cards: parts[2] || '' };
};

/**
 * Result modal body for Race 20 / Race to 17 / Race to 2nd (race20, race17, vrace17, race2).
 * Shows 4 suit rows (spade, heart, club, diamond) with dealt cards.
 * Winning suit: King card appended at end with k-image + winner overlay + WINNER text.
 * detailResult = API t1: { rid, mtime, ename, rdesc, card, winnat, win }.
 * win: "1"=Spade "2"=Heart "3"=Club "4"=Diamond.
 * Suit icons: public/img/cardIcons/ — Card images: public/img/cards/.
 */
const CasinoResultBodyRace17 = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const { card, win, winnat, rdesc: rdescRaw } = detailResult;
  const cardsBySuit = parseCardsBySuit(card);
  const winningSuitKey = getWinningSuitKey(win, winnat);
  const winningKingToken = getWinningKingToken(win, winnat);
  const rdesc = parseRdesc(rdescRaw);
  const winner = winnat || rdesc.winner || '';
  const BASE = import.meta.env.BASE_URL;

  // Append the winning King card to the winning suit's cards
  if (winningSuitKey && winningKingToken) {
    cardsBySuit[winningSuitKey] = [...cardsBySuit[winningSuitKey], winningKingToken];
  }

  const descItems = [
    { label: 'Winner', value: winner },
    { label: 'Points', value: rdesc.points },
    { label: 'Cards',  value: rdesc.cards },
  ].filter((item) => item.value != null && String(item.value).trim() !== '');

  return (
    <div className="row row5">
      <div className="col-12 col-lg-12">
        <div className="race-result-box">
          {SUITS.map((suit) => {
            const cards = cardsBySuit[suit.key] || [];
            const isWinner = suit.key === winningSuitKey;
            return (
              <div key={suit.key} className="pr mb-1">
                <span className="result-image icons">
                  <img src={`${BASE}img/cardIcons/${suit.icon}.png`} alt={suit.label} />
                </span>
                {cards.map((token, idx) => {
                  const isLast = idx === cards.length - 1;
                  return (
                    <span key={idx} className={`result-image${isWinner && isLast ? ' k-image' : ''}`}>
                      <img src={getCardImage(token)} alt={token} />
                    </span>
                  );
                })}
                {isWinner && (
                  <div className="casino-result-cards-item">
                    <img src={`${BASE}img/winner.png`} className="winner-icon" alt="winner" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="video-winner-text">
            {'WINNER'.split('').map((ch, i) => <div key={i}>{ch}</div>)}
          </div>
        </div>
      </div>
      {descItems.length > 0 && (
        <div className="col-12 col-lg-12">
          <div className="casino-result-desc">
            {descItems.map((item, idx) => (
              <div key={idx} className="casino-result-desc-item">
                <div>{item.label}</div>
                <div>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoResultBodyRace17;
