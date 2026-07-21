import React from 'react';
import styles from './Teen62.module.css';
import { getCardImage, CARD_BACK } from '../../cardAssets';

const Teen62Visual = ({ data }) => {
    // Data format: "5HH,ASS,..." — cards from public/img/cards via cardAssets
    const cardString = data || "";
    const cardTokens = cardString.split(",").map(t => t.trim());

    // TeenPatti 62 Logic:
    // Player A: Indices 0, 2, 4
    // Player B: Indices 1, 3, 5
    
    const playerACards = [0, 2, 4].map(i => {
        const token = cardTokens[i];
        return getCardImage(token);
    });

    const playerBCards = [1, 3, 5].map(i => {
        const token = cardTokens[i];
        return getCardImage(token);
    });

    return (
        <div className={`casino-video-cards ${styles.teen62Container}`}>
            <div className={styles.playerSection}>
                <div className={styles.playerName}>Player A</div>
                <div className={styles.playerCards}>
                    {playerACards.map((card, index) => (
                         <img 
                         key={`${index}-${card}`} 
                         src={card} 
                         alt={`Player A card ${index + 1}`}
                         className={styles.cardImage}
                         onError={(e) => { e.target.src = CARD_BACK; }}
                       />
                    ))}
                </div>
            </div>
             <div className={styles.playerSection}>
                <div className={styles.playerName}>Player B</div>
                <div className={styles.playerCards}>
                    {playerBCards.map((card, index) => (
                         <img 
                         key={`${index}-${card}`} 
                         src={card} 
                         alt={`Player B card ${index + 1}`}
                         className={styles.cardImage}
                         onError={(e) => { e.target.src = CARD_BACK; }}
                       />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Teen62Visual;
