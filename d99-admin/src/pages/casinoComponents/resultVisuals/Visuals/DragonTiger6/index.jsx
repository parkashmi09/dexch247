import React from 'react';
import styles from './DragonTiger6.module.css';
import { getCardImage } from '../../cardAssets';

/**
 * Dragon Tiger 6. Data = comma-separated card string. Dragon = indices 0,1,2; Tiger = 3,4,5. Cards from cardAssets.
 */
const DragonTiger6Visual = ({ data }) => {
    const cardString = data || "";
    const cardTokens = cardString.split(",").map(t => t.trim());

    const dragonCards = [0, 1, 2].map(i => getCardImage(cardTokens[i]));
    const tigerCards = [3, 4, 5].map(i => getCardImage(cardTokens[i]));

    return (
        <div className={`casino-video-cards ${styles.dt6Container}`}>
            <div className={styles.playerSection}>
                <span className={styles.playerName}>Dragon</span>
                <div className={styles.playerCards}>
                    {dragonCards.map((card, index) => (
                        <img
                            key={`dragon-${index}-${card}`}
                            src={card}
                            alt={`Dragon card ${index + 1}`}
                            className={styles.cardImage}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.playerSection}>
                <span className={styles.playerName}>Tiger</span>
                <div className={styles.playerCards}>
                    {tigerCards.map((card, index) => (
                        <img
                            key={`tiger-${index}-${card}`}
                            src={card}
                            alt={`Tiger card ${index + 1}`}
                            className={styles.cardImage}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DragonTiger6Visual;
