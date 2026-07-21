import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getCardImage } from '../resultVisuals/cardAssets';

// 1-day Teenpatti: cards A=[0,2,4] B=[1,3,5]
const parseCards = (cardString) => {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',');
  const playerA = [0, 2, 4].map((i) => cards[i]?.trim()).filter(Boolean).map((t) => getCardImage(t));
  const playerB = [1, 3, 5].map((i) => cards[i]?.trim()).filter(Boolean).map((t) => getCardImage(t));
  return { playerA, playerB };
};

// Winner#Suits#Odd/Even#Consecutive
const parseRdesc = (rdesc) => {
  if (!rdesc) return {};
  const [winner, , oddEven, consecutive] = rdesc.split('#');
  return { winner: winner || '', oddEven: oddEven || '', consecutive: consecutive || '' };
};

/**
 * Result modal body for 1-day Teenpatti (teen, pteen, etc.).
 * detailResult = API t1: { rid, mtime, ename, rdesc, card, winnat, win }.
 */
const CasinoResultBodyTeen = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const cards = parseCards(detailResult.card);
  const rdesc = parseRdesc(detailResult.rdesc);
  const winValue = detailResult.win;
  const winner = detailResult.winnat || (winValue === '1' ? 'Player A' : winValue === '2' ? 'Player B' : '');
  const isAWinner = winValue === '1';
  const isBWinner = winValue === '2';

  const descItems = [
    { label: 'Winner', value: winner },
    { label: 'Odd/Even', value: rdesc.oddEven },
    { label: 'Consecutive', value: rdesc.consecutive },
  ].filter((item) => item.value != null && String(item.value).trim() !== '');

  return (
    <>
      <div className="col-12 col-lg-8">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isAWinner && (
                <div className="casino-result-cards-item">
                  <FaTrophy color="#4caf50" size={28} className="winner-icon" />
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
                  <FaTrophy color="#4caf50" size={28} className="winner-icon" />
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

export default CasinoResultBodyTeen;
