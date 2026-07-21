import React from 'react';
import { getCardImage } from '../resultVisuals/cardAssets';

const WINNER_ICON = '/img/winner.png';

// 20-20: A=first 3, B=next 3
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',').map((c) => c.trim());
  return {
    playerA: cards.slice(0, 3).map((t) => getCardImage(t)),
    playerB: cards.slice(3, 6).map((t) => getCardImage(t)),
  };
};

// Winner#3 Baccarat#(score)#Total#Pair Plus#Red Black; part1 may have "~"
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const parts = rdesc.split('#').map((p) => p.trim());
  let baccarat = parts[1] || '';
  let score = parts[2] || '';
  if (baccarat.includes('~')) {
    const [b, s] = baccarat.split('~').map((x) => x.trim());
    baccarat = b || baccarat;
    score = s || score;
  }
  return {
    winner: parts[0] || '',
    baccarat,
    score,
    total: parts[3] || '',
    pairPlus: parts[4] || '',
    redBlack: parts[5] || '',
  };
};

/**
 * Result modal body for 20-20 Teenpatti (teen20, pteen20).
 * detailResult = API t1: { rid, mtime, ename, rdesc, card, winnat, win }.
 */
const CasinoResultBodyTeen20 = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const cards = parseCards(detailResult.card);
  const rdesc = parseRdesc(detailResult.rdesc);
  const winValue = detailResult.win;
  const winner = detailResult.winnat || rdesc.winner || (winValue === '1' ? 'Player A' : winValue === '2' ? 'Player B' : '');
  const isAWinner = winValue === '1';
  const isBWinner = winValue === '2';

  const descItems = [
    { label: 'Winner', value: winner },
    { label: '3 Baccarat', value: rdesc.baccarat },
    { label: '', value: rdesc.score },
    { label: 'Total', value: rdesc.total },
    { label: 'Pair Plus', value: rdesc.pairPlus },
    { label: 'Red Black', value: rdesc.redBlack },
  ].filter((item) => item.value != null && String(item.value).trim() !== '');

  return (
    <>
      <div className="col-12 col-lg-8">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isAWinner && (
                <div className="casino-result-cards-item">
                  <img src={WINNER_ICON} alt="" className="winner-icon" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player A</h4>
                {cards.playerA.map((card, idx) => (
                  card && (
                    <div key={idx} className="casino-result-cards-item">
                      <img src={card} alt={`Player A Card ${idx + 1}`} />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          <div className="casino-result-content-diveder" />
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isBWinner && (
                <div className="casino-result-cards-item">
                  <img src={WINNER_ICON} alt="" className="winner-icon" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player B</h4>
                {cards.playerB.map((card, idx) => (
                  card && (
                    <div key={idx} className="casino-result-cards-item">
                      <img src={card} alt={`Player B Card ${idx + 1}`} />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="casino-result-desc">
          {descItems.map((item, idx) => (
            <div key={idx} className="casino-result-desc-item">
              <div>{item.label}</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CasinoResultBodyTeen20;
