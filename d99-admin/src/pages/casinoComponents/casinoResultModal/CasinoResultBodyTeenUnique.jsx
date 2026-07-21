import React from 'react';
import { getCardImage } from '../resultVisuals/cardAssets';

/**
 * Result modal body for Unique Teenpatti: 6 cards with s1–s6 icons.
 * Structure matches reference: .row.row5.teenunique > .casino-result-content > .casino-result-cards.unique-teen20-box > 6x .unique-teen20-card.casino-result-cards-item (icon + card img).
 * detailResult = API t1: { rid, mtime, ename, card }.
 * Icon path uses BASE_URL so it works when app is served from a subpath (e.g. /admin/).
 */
const getSuitIconUrl = (index) => `${import.meta.env.BASE_URL}img/s${index + 1}-icon.png`;

const CasinoResultBodyTeenUnique = ({ detailResult }) => {
  if (!detailResult) return <div className="text-center py-4">No detail available for this round.</div>;

  const cardString = detailResult.card || '';
  const tokens = cardString.split(',').map((c) => c.trim()).filter(Boolean);
  const cards = Array.from({ length: 6 }, (_, i) => tokens[i] || '1');

  return (
    <div className="row row5 teenunique">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center w-100">
            <div className="casino-result-cards unique-teen20-box">
              {cards.map((token, i) => (
                <div key={i} className="unique-teen20-card casino-result-cards-item">
                  <img src={getSuitIconUrl(i)} alt="" />
                  <img src={getCardImage(token)} alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoResultBodyTeenUnique;
